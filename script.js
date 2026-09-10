/* =========================================================
   REBOOT
========================================================= */


/* =========================================================
   DOM
========================================================= */

const game =
  document.getElementById("game");

const player =
  document.getElementById("player");

const dialogue =
  document.getElementById("dialogue");

const dialogueTitle =
  document.getElementById("dialogue-title");

const dialogueText =
  document.getElementById("dialogue-text");

const dialogueClose =
  document.getElementById("dialogue-close");

const interactionPrompt =
  document.getElementById("interaction-prompt");

const hudTitle =
  document.getElementById("hud-title");

const hudObjective =
  document.getElementById("hud-objective");

const hudProgress =
  document.getElementById("hud-progress");

const ending =
  document.getElementById("ending");

const endingText =
  document.getElementById("ending-text");


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

  intro:
    document.getElementById("room-intro"),

  hub:
    document.getElementById("room-hub"),

  sensor:
    document.getElementById("room-sensor"),

  power:
    document.getElementById("room-power"),

  control:
    document.getElementById("room-control")

};


/* =========================================================
   STATE
========================================================= */

const state = {

  room: "intro",

  x: 110,

  y:
    Math.round(
      window.innerHeight * 0.5
    ),

  solved: {

    sensor: false,

    power: false,

    control: false

  },

  evidence: {

    sensor:
      new Set(),

    power:
      new Set(),

    control:
      new Set()

  },

  sensorAdjusting:
    false,

  sensorAngle:
    0,

  selectedWire:
    null,

  wires: {

    LOW:
      null,

    HIGH:
      null,

    GND:
      null

  },

  sequence:
    []

};


/* =========================================================
   INPUT
========================================================= */

const keys = {};

let spaceDown =
  false;


/* =========================================================
   HUD DATA
========================================================= */

const hudData = {

  intro: {

    title:
      "BOOT SEQUENCE",

    objective:
      "오른쪽의 ENTRY로 이동하세요."

  },


  hub: {

    title:
      "ARCHIVE",

    objective:
      "세 개의 유지보수 구역을 복구하세요."

  },


  sensor: {

    title:
      "SENSOR BAY",

    objective:
      "센서 값이 변하는 위치를 찾아 원인을 확인하세요."

  },


  power: {

    title:
      "POWER BAY",

    objective:
      "각 장치의 요구 조건에 맞게 배선을 연결하세요."

  },


  control: {

    title:
      "CONTROL CHAMBER",

    objective:
      "장치 사이의 조건을 조사하고 작동 순서를 복구하세요."

  }

};


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

  const data =
    hudData[state.room];


  hudTitle.textContent =
    data.title;


  hudObjective.textContent =
    data.objective;


  const count =
    Number(state.solved.sensor) +
    Number(state.solved.power) +
    Number(state.solved.control);


  hudProgress.textContent =
    `복구 ${count} / 3`;

}


/* =========================================================
   ROOM SWITCH
========================================================= */

function switchRoom(
  name
) {

  if (!rooms[name]) {
    return;
  }


  Object.values(
    rooms
  ).forEach(
    room => {

      room.classList.remove(
        "active"
      );

    }
  );


  rooms[name]
    .classList.add(
      "active"
    );


  state.room =
    name;


  state.sensorAdjusting =
    false;


  document
    .getElementById(
      "wiring-modal"
    )
    .classList.add(
      "hidden"
    );


  updateHUD();

  updatePlayer();

  updatePrompt();

}


/* =========================================================
   PLAYER
========================================================= */

function updatePlayer() {

  player.style.left =
    `${Math.round(state.x)}px`;

  player.style.top =
    `${Math.round(state.y)}px`;

}


/* =========================================================
   LIMIT PLAYER
========================================================= */

function limitPlayer() {

  state.x =
    Math.max(
      30,
      Math.min(
        window.innerWidth - 60,
        state.x
      )
    );


  state.y =
    Math.max(
      95,
      Math.min(
        window.innerHeight - 55,
        state.y
      )
    );

}


/* =========================================================
   MOVEMENT
========================================================= */

function movePlayer() {

  if (
    !dialogue.classList.contains(
      "hidden"
    )
  ) {

    return;

  }


  if (
    !ending.classList.contains(
      "hidden"
    )
  ) {

    return;

  }


  if (
    state.sensorAdjusting
  ) {

    return;

  }


  let dx =
    0;

  let dy =
    0;


  if (
    keys["w"] ||
    keys["arrowup"]
  ) {

    dy -= 4;

  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    dy += 4;

  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    dx -= 4;

  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    dx += 4;

  }


  if (
    dx === 0 &&
    dy === 0
  ) {

    return;

  }


  state.x +=
    dx;


  state.y +=
    dy;


  limitPlayer();


  updatePlayer();

  updatePrompt();


  /*
     시작 공간에서 오른쪽으로 이동하면
     ARCHIVE 진입
  */

  if (
    state.room === "intro" &&
    state.x >
      window.innerWidth * 0.74
  ) {

    enterHub();

  }


  updateSensorValue();

}


/* =========================================================
   SENSOR DYNAMIC VALUE
========================================================= */

function updateSensorValue() {

  if (
    state.room !== "sensor"
  ) {

    return;

  }


  const display =
    document.getElementById(
      "sensor-b-reading"
    );


  /*
     장애물 근처에 접근하면
     센서 B의 값이 변함
  */

  const obstacleX =
    window.innerWidth * 0.31
    + 65;


  const obstacleY =
    window.innerHeight * 0.27
    + 50;


  const distance =
    Math.hypot(
      state.x - obstacleX,
      state.y - obstacleY
    );


  if (
    distance < 175
  ) {

    display.textContent =
      "126 cm";

  }

  else {

    display.textContent =
      "84 cm";

  }

}


/* =========================================================
   ENTER HUB
========================================================= */

function enterHub() {

  if (
    state.room !== "intro"
  ) {

    return;

  }


  switchRoom(
    "hub"
  );


  state.x =
    120;

  state.y =
    Math.round(
      window.innerHeight * 0.52
    );


  updatePlayer();


  showDialogue(

    "ARCHIVE",

    "유지보수 노드 04에 접속했습니다.\n\n" +

    "자동 복구 절차가 중단되었습니다.\n\n" +

    "센서, 전력, 제어 시스템의 상태를\n" +

    "현장에서 직접 확인해야 합니다.\n\n" +

    "세 시스템을 복구하면 출구 잠금이 해제됩니다."

  );

}


/* =========================================================
   DIALOGUE
========================================================= */

function showDialogue(
  title,
  text
) {

  dialogueTitle.textContent =
    title;


  dialogueText.textContent =
    text;


  dialogue.classList.remove(
    "hidden"
  );


  interactionPrompt.classList.remove(
    "visible"
  );

}


function closeDialogue() {

  dialogue.classList.add(
    "hidden"
  );


  updatePrompt();

}


dialogueClose.addEventListener(
  "click",
  closeDialogue
);


dialogue.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      dialogue
    ) {

      closeDialogue();

    }

  }
);


/* =========================================================
   INTERACTABLE
========================================================= */

function getInteractables() {

  const room =
    rooms[state.room];


  if (!room) {
    return [];
  }


  return [
    ...room.querySelectorAll(
      ".interactable"
    )
  ];

}


/* =========================================================
   DISTANCE
========================================================= */

function getDistance(
  element
) {

  const rect =
    element.getBoundingClientRect();


  const centerX =
    rect.left +
    rect.width / 2;


  const centerY =
    rect.top +
    rect.height / 2;


  return Math.hypot(

    state.x + 16 -
      centerX,

    state.y + 20 -
      centerY

  );

}


/* =========================================================
   NEAREST OBJECT
========================================================= */

function getNearest() {

  const objects =
    getInteractables();


  let nearest =
    null;

  let nearestDistance =
    Infinity;


  objects.forEach(
    object => {

      if (
        object.classList.contains(
          "disabled"
        )
      ) {

        return;

      }


      const distance =
        getDistance(
          object
        );


      if (
        distance <
        nearestDistance
      ) {

        nearest =
          object;

        nearestDistance =
          distance;

      }

    }
  );


  if (
    nearestDistance <= 110
  ) {

    return nearest;

  }


  return null;

}


/* =========================================================
   PROMPT
========================================================= */

function updatePrompt() {

  if (
    !dialogue.classList.contains(
      "hidden"
    )
  ) {

    interactionPrompt
      .classList
      .remove(
        "visible"
      );

    return;

  }


  if (
    !ending.classList.contains(
      "hidden"
    )
  ) {

    interactionPrompt
      .classList
      .remove(
        "visible"
      );

    return;

  }


  const target =
    getNearest();


  if (!target) {

    interactionPrompt
      .classList
      .remove(
        "visible"
      );

    return;

  }


  interactionPrompt.textContent =
    `SPACE  ${
      target.dataset.label ||
      "조사"
    }`;


  interactionPrompt
    .classList
    .add(
      "visible"
    );

}


/* =========================================================
   INTERACT
========================================================= */

function interact() {

  if (
    !dialogue.classList.contains(
      "hidden"
    )
  ) {

    return;

  }


  const target =
    getNearest();


  if (!target) {
    return;
  }


  const action =
    target.dataset.action;


  if (
    actions[action]
  ) {

    actions[action](
      target
    );

  }

}


/* =========================================================
   ACTIONS
========================================================= */

const actions = {


  /* =====================================================
     HUB
  ====================================================== */

  openSensor: () => {

    openPuzzle(
      "sensor"
    );

  },


  openPower: () => {

    openPuzzle(
      "power"
    );

  },


  openControl: () => {

    openPuzzle(
      "control"
    );

  },


  exit: () => {

    if (
      state.solved.sensor &&
      state.solved.power &&
      state.solved.control
    ) {

      finishGame();

    }

  },


  /* =====================================================
     SENSOR
  ====================================================== */

  inspectSensorA: () => {

    state.evidence.sensor
      .add("A");


    showDialogue(

      "SENSOR A",

      "현재 측정 : 84 cm\n\n" +

      "기준 범위 : 80 ~ 88 cm\n\n" +

      "정상 범위입니다."

    );

  },


  inspectSensorB: () => {

    state.evidence.sensor
      .add("B");


    showDialogue(

      "SENSOR B",

      "평상시 측정 : 84 cm\n\n" +

      "특정 위치 접근 시 : 126 cm\n\n" +

      "센서 자체의 오류 기록은 없습니다.\n\n" +

      "주변의 측정 환경을 조사할 필요가 있습니다."

    );

  },


  inspectSensorC: () => {

    state.evidence.sensor
      .add("C");


    showDialogue(

      "SENSOR C",

      "현재 측정 : 83 cm\n\n" +

      "기준 범위 : 80 ~ 88 cm\n\n" +

      "정상 범위입니다."

    );

  },


  inspectSensorReference: () => {

    state.evidence.sensor
      .add("REFERENCE");


    showDialogue(

      "기준 측정 기록",

      "세 센서는 같은 기준 벽을 측정합니다.\n\n" +

      "기준면은 움직이지 않았습니다.\n\n" +

      "한 센서의 값만 특정 위치에서 변한다면\n" +

      "주변 환경의 영향을 의심해야 합니다."

    );

  },


  sensorPanel: () => {

    const ready =

      state.evidence.sensor.has("A") &&

      state.evidence.sensor.has("B") &&

      state.evidence.sensor.has("C") &&

      state.evidence.sensor.has("REFERENCE");


    if (!ready) {

      showDialogue(

        "조정 패널 잠김",

        "센서 A, B, C와\n" +
        "기준 측정 기록을 모두 조사하세요."

      );

      return;

    }


    state.sensorAdjusting =
      true;


    showDialogue(

      "센서 조정 패널",

      "센서 B 주변에서 값이 변하는 원인을 찾았습니다.\n\n" +

      "대화창을 닫은 뒤\n" +

      "A / D 키로 센서 방향을 조정하세요.\n\n" +

      "기준 방향은 0°입니다.\n\n" +

      "맞는 방향에서 SPACE를 누르세요."

    );

  },


  sensorReturn: () => {

    if (
      state.sensorAngle !== 0
    ) {

      showDialogue(

        "복귀 불가",

        "센서가 아직 기준 방향과 일치하지 않습니다."

      );

      return;

    }


    state.solved.sensor =
      true;


    clearFile(
      "sensor"
    );

  },


  /* =====================================================
     POWER
  ====================================================== */

  inspectLink: () => {

    state.evidence.power
      .add("LINK");


    showDialogue(

      "LINK",

      "요구 전력 : LOW\n\n" +

      "낮은 전력만 연결해야 합니다."

    );

  },


  inspectDrive: () => {

    state.evidence.power
      .add("DRIVE");


    showDialogue(

      "DRIVE",

      "요구 전력 : HIGH\n\n" +

      "출구 구동 장치입니다.\n" +

      "높은 전력이 필요합니다."

    );

  },


  inspectCore: () => {

    state.evidence.power
      .add("CORE");


    showDialogue(

      "CORE",

      "기준점 : GND\n\n" +

      "공통 접지 기준이 필요합니다."

    );

  },


  openWiring: () => {

    const ready =

      state.evidence.power.has("LINK") &&

      state.evidence.power.has("DRIVE") &&

      state.evidence.power.has("CORE");


    if (!ready) {

      showDialogue(

        "배선 패널 잠김",

        "LINK, DRIVE, CORE의 요구 조건을\n" +
        "먼저 확인하세요."

      );

      return;

    }


    document
      .getElementById(
        "wiring-modal"
      )
      .classList
      .remove(
        "hidden"
      );

  },


  powerReturn: () => {

    if (
      !checkPower()
    ) {

      return;

    }


    state.solved.power =
      true;


    clearFile(
      "power"
    );

  },


  /* =====================================================
     CONTROL
  ====================================================== */

  inspectPressure: () => {

    state.evidence.control
      .add("PRESSURE");


    showDialogue(

      "PRESSURE",

      "현재 상태 : 낮음\n\n" +

      "압력이 먼저 안정되어야\n" +

      "다음 단계로 넘어갈 수 있습니다."

    );

  },


  inspectLock: () => {

    state.evidence.control
      .add("LOCK");


    showDialogue(

      "SAFETY LOCK",

      "현재 상태 : 잠김\n\n" +

      "모터가 작동하기 전에\n" +

      "먼저 해제되어야 합니다."

    );

  },


  inspectMotor: () => {

    state.evidence.control
      .add("MOTOR");


    showDialogue(

      "DRIVE MOTOR",

      "현재 상태 : 대기\n\n" +

      "다른 두 조건이 충족된 뒤\n" +

      "작동하도록 설계되었습니다."

    );

  },


  inspectLogicNote: () => {

    state.evidence.control
      .add("NOTE");


    showDialogue(

      "MAINTENANCE LOG",

      "압력이 안정된 뒤 잠금이 해제된다.\n\n" +

      "잠금이 해제된 뒤 모터가 작동한다.\n\n" +

      "따라서 앞 단계가 뒤 단계의 조건이 됩니다."

    );

  },


  controlReturn: () => {

    if (
      !checkSequence()
    ) {

      return;

    }


    state.solved.control =
      true;


    clearFile(
      "control"
    );

  }

};


/* =========================================================
   OPEN PUZZLE
========================================================= */

function openPuzzle(
  type
) {

  if (
    state.solved[type]
  ) {

    showDialogue(

      "복구된 기록",

      "이 기록은 이미 복구되었습니다.\n\n" +

      "원래 파일 대신 종이 조각이 남아 있습니다."

    );

    return;

  }


  switchRoom(
    type
  );


  state.x =
    100;

  state.y =
    window.innerHeight - 125;


  updatePlayer();


  const intro = {

    sensor:

      "SENSOR BAY에 들어왔습니다.\n\n" +

      "세 센서의 값을 직접 확인하세요.\n\n" +

      "특히 값이 달라지는 위치를 찾아\n" +

      "그 원인이 무엇인지 판단해야 합니다.",


    power:

      "POWER BAY에 들어왔습니다.\n\n" +

      "각 모듈은 서로 다른 전원 조건을 사용합니다.\n\n" +

      "장치를 조사한 뒤 배전반에서\n" +

      "올바른 연결을 만들어야 합니다.",


    control:

      "CONTROL CHAMBER에 들어왔습니다.\n\n" +

      "장치들의 상태를 조사하고\n" +

      "서로의 조건을 연결하세요.\n\n" +

      "그 결과로 작동 순서를 복구해야 합니다."

  };


  showDialogue(

    type.toUpperCase(),

    intro[type]

  );

}


/* =========================================================
   SENSOR ANGLE MINI GAME
========================================================= */

function updateSensorAngle() {

  state.sensorAngle =
    Math.max(
      -45,
      Math.min(
        45,
        state.sensorAngle
      )
    );


  document
    .getElementById(
      "sensor-angle-display"
    )
    .textContent =
    `방향 ${state.sensorAngle}°`;


  const pointer =
    document.getElementById(
      "dial-pointer"
    );


  pointer.style.transform =
    `rotate(${state.sensorAngle}deg)`;

}


/* =========================================================
   SENSOR KEY CONTROL
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      state.room !== "sensor" ||
      !state.sensorAdjusting ||
      !dialogue.classList.contains(
        "hidden"
      )
    ) {

      return;

    }


    const key =
      event.key.toLowerCase();


    if (
      key === "a"
    ) {

      state.sensorAngle -= 5;

      updateSensorAngle();

    }


    if (
      key === "d"
    ) {

      state.sensorAngle += 5;

      updateSensorAngle();

    }

  }
);


/* =========================================================
   POWER WIRING
========================================================= */

document.addEventListener(
  "click",
  event => {

    if (
      state.room !== "power"
    ) {

      return;

    }


    const source =
      event.target.closest(
        ".source-node"
      );


    const target =
      event.target.closest(
        ".target-node"
      );


    if (
      source
    ) {

      state.selectedWire =
        source.dataset.wire;


      document
        .querySelectorAll(
          ".source-node"
        )
        .forEach(
          node =>
            node.classList.remove(
              "selected"
            )
        );


      source.classList.add(
        "selected"
      );


      document
        .getElementById(
          "wire-status"
        )
        .textContent =
        `${state.selectedWire} 전원선을 선택했습니다. 장치를 선택하세요.`;

    }


    if (
      target
    ) {

      if (
        !state.selectedWire
      ) {

        document
          .getElementById(
            "wire-status"
          )
          .textContent =
          "먼저 왼쪽의 전원선을 선택하세요.";

        return;

      }


      state.wires[
        state.selectedWire
      ] =
        target.dataset.target;


      state.selectedWire =
        null;


      document
        .querySelectorAll(
          ".source-node"
        )
        .forEach(
          node =>
            node.classList.remove(
              "selected"
            )
        );


      document
        .querySelectorAll(
          ".target-node"
        )
        .forEach(
          node =>
            node.classList.remove(
              "connected"
            )
        );


      target.classList.add(
        "connected"
      );


      const connected =
        Object.entries(
          state.wires
        )
        .filter(
          ([,value]) =>
            value !== null
        )
        .map(
          ([key,value]) =>
            `${key} → ${value}`
        )
        .join(
          " / "
        );


      document
        .getElementById(
          "wire-status"
        )
        .textContent =
        connected || "연결할 전원선을 선택하세요.";

    }

  }
);


/* =========================================================
   POWER CHECK
========================================================= */

function checkPower() {

  return (

    state.wires.LOW ===
    "LINK"

    &&

    state.wires.HIGH ===
    "DRIVE"

    &&

    state.wires.GND ===
    "CORE"

  );

}


document
  .getElementById(
    "wire-check"
  )
  .addEventListener(
    "click",
    () => {

      if (
        checkPower()
      ) {

        document
          .getElementById(
            "wiring-modal"
          )
          .classList
          .add(
            "hidden"
          );


        document
          .getElementById(
            "power-return"
          )
          .classList
          .remove(
            "disabled"
          );


        showDialogue(

          "POWER RECOVERED",

          "LOW → LINK\n" +

          "HIGH → DRIVE\n" +

          "GND → CORE\n\n" +

          "모든 배선 연결이 정상입니다.\n\n" +

          "RETURN이 해제되었습니다."

        );

      }

      else {

        document
          .getElementById(
            "wire-status"
          )
          .textContent =
          "연결 오류입니다. 각 장치의 요구 조건을 다시 확인하세요.";

      }

    }
  );


document
  .getElementById(
    "wire-close"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "wiring-modal"
        )
        .classList
        .add(
          "hidden"
        );

    }
  );


/* =========================================================
   CONTROL SEQUENCE
========================================================= */

document
  .querySelectorAll(
    ".sequence-button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          if (
            state.sequence.length >= 3
          ) {

            return;

          }


          state.sequence.push(
            button.dataset.sequence
          );


          button.classList.add(
            "selected"
          );


          updateSequence();

        }
      );

    }
  );


function updateSequence() {

  const names = {

    PRESSURE:
      "압력 안정",

    LOCK:
      "잠금 해제",

    MOTOR:
      "모터 작동"

  };


  const result =
    state.sequence.map(
      value =>
        names[value]
    );


  while (
    result.length < 3
  ) {

    result.push(
      "_"
    );

  }


  document
    .getElementById(
      "sequence-display"
    )
    .textContent =
    result.join(
      " → "
    );

}


/* =========================================================
   RESET SEQUENCE
========================================================= */

document
  .getElementById(
    "sequence-reset"
  )
  .addEventListener(
    "click",
    () => {

      state.sequence =
        [];


      document
        .querySelectorAll(
          ".sequence-button"
        )
        .forEach(
          button =>
            button.classList.remove(
              "selected"
            )
        );


      updateSequence();

    }
  );


/* =========================================================
   CHECK SEQUENCE
========================================================= */

function checkSequence() {

  const inspected =

    state.evidence.control.has(
      "PRESSURE"
    )

    &&

    state.evidence.control.has(
      "LOCK"
    )

    &&

    state.evidence.control.has(
      "MOTOR"
    )

    &&

    state.evidence.control.has(
      "NOTE"
    );


  if (!inspected) {

    showDialogue(

      "제어 순서 잠김",

      "PRESSURE, SAFETY LOCK, DRIVE MOTOR와\n" +
      "유지보수 기록을 모두 조사하세요."

    );

    return false;

  }


  const correct =

    state.sequence.length === 3

    &&

    state.sequence[0] ===
      "PRESSURE"

    &&

    state.sequence[1] ===
      "LOCK"

    &&

    state.sequence[2] ===
      "MOTOR";


  if (!correct) {

    showDialogue(

      "순서 오류",

      "장치 사이의 조건과 맞지 않는 순서입니다.\n\n" +

      "어떤 조건이 먼저 만족되어야 하는지\n" +

      "다시 생각해 보세요."

    );

    return false;

  }


  document
    .getElementById(
      "control-return"
    )
    .classList
    .remove(
      "disabled"
    );


  showDialogue(

    "CONTROL RECOVERED",

    "압력 안정 → 잠금 해제 → 모터 작동\n\n" +

    "제어 순서가 정상적으로 복구되었습니다.\n\n" +

    "RETURN이 해제되었습니다."

  );


  return true;

}


/* =========================================================
   CLEAR FILE
========================================================= */

function clearFile(
  type
) {

  const idMap = {

    sensor:
      "record-sensor",

    power:
      "record-power",

    control:
      "record-control"

  };


  const file =
    document.getElementById(
      idMap[type]
    );


  if (!file) {
    return;
  }


  file.classList.add(
    "disabled"
  );


  file.dataset.action =
    "";


  file.innerHTML =
    "";


  const note = {

    sensor:
      [
        "센서 메모",
        "값보다\n환경을 확인"
      ],

    power:
      [
        "전력 메모",
        "전압과\n경로를 확인"
      ],

    control:
      [
        "제어 메모",
        "조건의\n순서를 확인"
      ]

  };


  file.innerHTML = `

    <div class="paper-fragment">

      <small>
        ${note[type][0]}
      </small>

      <strong>
        ${note[type][1]
          .replace(
            "\n",
            "<br>"
          )}
      </strong>

    </div>

  `;


  switchRoom(
    "hub"
  );


  state.x =
    180;

  state.y =
    380;


  updatePlayer();


  updateHUD();

  updateExit();


  showDialogue(

    "복구 완료",

    `${type.toUpperCase()} 시스템이 복구되었습니다.\n\n` +

    "기록은 사라지고 종이 조각 하나가 남았습니다."

  );

}


/* =========================================================
   EXIT
========================================================= */

function updateExit() {

  const exit =
    document.getElementById(
      "exit"
    );


  const complete =

    state.solved.sensor &&

    state.solved.power &&

    state.solved.control;


  if (
    complete
  ) {

    exit.classList.add(
      "revealed"
    );


    exit.classList.remove(
      "disabled"
    );


    exit.dataset.label =
      "출구 열기";

  }


}


/* =========================================================
   ENDING
========================================================= */

function finishGame() {

  endingText.innerHTML =

    "세 개의 유지보수 시스템이 모두 정상 상태로 돌아왔습니다." +

    "<br><br>" +

    "센서는 환경을 측정하고," +

    "<br>" +

    "전력 시스템은 필요한 장치에 전원을 공급하며," +

    "<br>" +

    "제어 시스템은 장치의 순서를 조정합니다." +

    "<br><br>" +

    "<b>MAINTENANCE LOCK : RELEASED</b>" +

    "<br><br>" +

    "출구가 열렸습니다.";


  ending.classList.remove(
    "hidden"
  );


  interactionPrompt
    .classList
    .remove(
      "visible"
    );

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();


    if (
      [
        "w",
        "a",
        "s",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright"
      ].includes(
        key
      )
    ) {

      event.preventDefault();

    }


    keys[key] =
      true;


    if (
      event.code ===
      "Space"
    ) {

      event.preventDefault();


      if (
        !spaceDown
      ) {

        if (
          !dialogue.classList.contains(
            "hidden"
          )
        ) {

          closeDialogue();

        }

        else {

          interact();

        }

      }


      spaceDown =
        true;

    }


    if (
      event.code ===
      "Escape"
    ) {

      closeDialogue();


      document
        .getElementById(
          "wiring-modal"
        )
        .classList
        .add(
          "hidden"
        );

    }

  }
);


/* =========================================================
   KEYUP
========================================================= */

document.addEventListener(
  "keyup",
  event => {

    keys[
      event.key.toLowerCase()
    ] =
      false;


    if (
      event.code ===
      "Space"
    ) {

      spaceDown =
        false;

    }

  }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    limitPlayer();

    updatePlayer();

    updatePrompt();

    updateSensorValue();

  }
);


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

  movePlayer();

  requestAnimationFrame(
    gameLoop
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

switchRoom(
  "intro"
);


state.x =
  110;

state.y =
  Math.round(
    window.innerHeight * 0.5
  );


updatePlayer();

updateHUD();

updateExit();

updatePrompt();

gameLoop();
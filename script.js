/* =========================================================
   REBOOT
   유지보수 탈출 게임
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
  document.getElementById(
    "interaction-prompt"
  );

const chapter =
  document.getElementById("chapter");

const objective =
  document.getElementById("objective");

const progress =
  document.getElementById("progress");

const ending =
  document.getElementById("ending");

const endingText =
  document.getElementById("ending-text");


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

  intro:
    document.getElementById(
      "room-intro"
    ),

  system:
    document.getElementById(
      "room-system"
    ),

  sensor:
    document.getElementById(
      "room-sensor"
    ),

  power:
    document.getElementById(
      "room-power"
    ),

  control:
    document.getElementById(
      "room-control"
    )

};


/* =========================================================
   STATE
========================================================= */

const state = {

  room:
    "intro",

  x:
    100,

  y:
    Math.round(
      window.innerHeight / 2
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

  /* SENSOR */

  sensorAngle:
    0,

  sensorAdjusting:
    false,

  /* POWER */

  selectedWire:
    null,

  wires: {

    "12V":
      null,

    "24V":
      null,

    "GND":
      null

  },

  /* CONTROL */

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
   ROOM SIZE
========================================================= */

function getRoomSize() {

  return {

    width:
      window.innerWidth,

    height:
      window.innerHeight

  };

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

  const data = {

    intro: {

      chapter:
        "BOOT SEQUENCE",

      objective:
        "오른쪽의 SYSTEM으로 이동하세요."

    },

    system: {

      chapter:
        "MAINTENANCE ARCHIVE",

      objective:
        "세 개의 유지보수 기록을 복구하세요."

    },

    sensor: {

      chapter:
        "SENSOR BAY",

      objective:
        "이상한 거리 센서를 찾아 방향을 바로잡으세요."

    },

    power: {

      chapter:
        "POWER BAY",

      objective:
        "각 장치에 맞는 전원선을 연결하세요."

    },

    control: {

      chapter:
        "CONTROL CHAMBER",

      objective:
        "장치의 조건을 조사하고 작동 순서를 복구하세요."

    }

  };


  const current =
    data[state.room];


  chapter.textContent =
    current.chapter;


  objective.textContent =
    current.objective;


  const count =
    Number(state.solved.sensor) +
    Number(state.solved.power) +
    Number(state.solved.control);


  progress.textContent =
    `복구 ${count} / 3`;

}


/* =========================================================
   ROOM SWITCH
========================================================= */

function switchRoom(roomName) {

  if (!rooms[roomName]) {
    return;
  }


  Object.values(rooms).forEach(
    room => {

      room.classList.remove(
        "active"
      );

    }
  );


  rooms[roomName].classList.add(
    "active"
  );


  state.room =
    roomName;


  state.sensorAdjusting =
    false;


  const mini =
    document.getElementById(
      "power-mini"
    );


  if (mini) {
    mini.classList.remove(
      "visible"
    );
  }


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
   PLAYER LIMIT
========================================================= */

function limitPlayer() {

  const room =
    getRoomSize();


  const maxX =
    room.width - 55;

  const maxY =
    room.height - 65;


  state.x =
    Math.max(
      25,
      Math.min(
        maxX,
        state.x
      )
    );


  state.y =
    Math.max(
      80,
      Math.min(
        maxY,
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


  let dx = 0;

  let dy = 0;


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
    dx !== 0 ||
    dy !== 0
  ) {

    state.x += dx;

    state.y += dy;

    limitPlayer();

    updatePlayer();

    updatePrompt();

  }


  /* ----------------------------------------
     INTRO → SYSTEM
  ----------------------------------------- */

  if (
    state.room === "intro" &&
    state.x >
      window.innerWidth * 0.72
  ) {

    enterSystem();

  }

}


/* =========================================================
   INTRO → SYSTEM
========================================================= */

function enterSystem() {

  if (
    state.room !== "intro"
  ) {
    return;
  }


  switchRoom(
    "system"
  );


  state.x =
    120;

  state.y =
    Math.round(
      window.innerHeight * 0.5
    );


  updatePlayer();


  showDialogue(

    "SYSTEM",

    "유지보수 노드 04에 접속했습니다.\n\n" +

    "이 시설은 자동화 시스템의 상태를 확인하기 위한\n" +

    "유지보수 시뮬레이션 시설입니다.\n\n" +

    "현재 자동 복구 절차가 정지되어 있습니다.\n\n" +

    "세 개의 시스템을 직접 검증해야\n" +

    "유지보수 잠금을 해제할 수 있습니다."

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
   OBJECT CENTER
========================================================= */

function getObjectCenter(
  element
) {

  const rect =
    element.getBoundingClientRect();


  return {

    x:
      rect.left +
      rect.width / 2,

    y:
      rect.top +
      rect.height / 2

  };

}


/* =========================================================
   DISTANCE
========================================================= */

function getDistance(
  element
) {

  const center =
    getObjectCenter(
      element
    );


  const px =
    state.x + 16;

  const py =
    state.y + 20;


  return Math.hypot(

    px - center.x,

    py - center.y

  );

}


/* =========================================================
   NEAREST
========================================================= */

function getNearestInteractable() {

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

    interactionPrompt.classList.remove(
      "visible"
    );

    return;

  }


  const target =
    getNearestInteractable();


  if (!target) {

    interactionPrompt.classList.remove(
      "visible"
    );

    return;

  }


  interactionPrompt.textContent =
    `SPACE  ${
      target.dataset.label ||
      "조사"
    }`;


  interactionPrompt.classList.add(
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
    getNearestInteractable();


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


  /* -----------------------------------------
     ARCHIVE
  ----------------------------------------- */

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

    const complete =
      state.solved.sensor &&
      state.solved.power &&
      state.solved.control;


    if (
      complete
    ) {

      finishGame();

    }

  },


  /* -----------------------------------------
     SENSOR
  ----------------------------------------- */

  sensorA: () => {

    state.evidence.sensor.add(
      "A"
    );


    showDialogue(

      "SENSOR A",

      "측정값 : 82 cm\n" +

      "기준 범위 : 80 ~ 84 cm\n\n" +

      "센서가 기준 측정면을 정확하게 바라보고 있습니다.\n\n" +

      "상태 : 정상"

    );

  },


  sensorB: () => {

    state.evidence.sensor.add(
      "B"
    );


    showDialogue(

      "SENSOR B",

      "측정값 : 103 cm\n" +

      "기준 범위 : 80 ~ 84 cm\n\n" +

      "다른 센서와 비교해 큰 차이가 발생하고 있습니다.\n\n" +

      "측정면 자체에는 이상이 없다는 기록이 있습니다.\n\n" +

      "센서의 방향을 확인해야 합니다."

    );

  },


  sensorC: () => {

    state.evidence.sensor.add(
      "C"
    );


    showDialogue(

      "SENSOR C",

      "측정값 : 81 cm\n" +

      "기준 범위 : 80 ~ 84 cm\n\n" +

      "센서가 기준 측정면을 정확하게 바라보고 있습니다.\n\n" +

      "상태 : 정상"

    );

  },


  sensorReference: () => {

    state.evidence.sensor.add(
      "REFERENCE"
    );


    showDialogue(

      "기준 측정면",

      "세 센서는 같은 고정된 벽을 측정해야 합니다.\n\n" +

      "벽은 움직이지 않았습니다.\n" +

      "측정 환경도 변경되지 않았습니다.\n\n" +

      "따라서 B의 값이 다른 원인은\n" +

      "센서의 방향 또는 시야에 있을 가능성이 높습니다."

    );

  },


  sensorConsole: () => {

    const ready =
      state.evidence.sensor.has("A") &&
      state.evidence.sensor.has("B") &&
      state.evidence.sensor.has("C") &&
      state.evidence.sensor.has("REFERENCE");


    if (!ready) {

      showDialogue(

        "조정기 잠김",

        "센서 A, B, C와 기준 측정면을\n" +
        "모두 조사해야 합니다."

      );

      return;

    }


    state.sensorAdjusting =
      true;


    showDialogue(

      "센서 조정기",

      "센서 B의 방향을 다시 맞춰야 합니다.\n\n" +

      "대화창을 닫은 뒤 A / D 키로 각도를 조정하세요.\n\n" +

      "기준 방향은 0°입니다.\n" +

      "올바른 방향을 찾으면 센서가 정상 상태로 돌아옵니다."

    );

  },


  sensorReturn: () => {

    if (
      state.sensorAngle !== 0
    ) {
      return;
    }


    state.solved.sensor =
      true;


    clearFile(
      "sensor"
    );


    switchRoom(
      "system"
    );


    state.x =
      170;

    state.y =
      360;


    updatePlayer();


    showDialogue(

      "SENSOR RECOVERED",

      "센서 B의 방향을 바로잡았습니다.\n\n" +

      "세 센서의 측정값이 정상 범위로 돌아왔습니다.\n\n" +

      "첫 번째 유지보수 기록이 복구되었습니다."

    );

  },


  /* -----------------------------------------
     POWER
  ----------------------------------------- */

  powerSensor: () => {

    state.evidence.power.add(
      "SENSOR"
    );


    showDialogue(

      "SENSOR POWER",

      "센서 입력 전압 : 12V\n\n" +

      "12V 전원이 필요합니다.\n" +

      "24V를 연결하면 센서가 손상될 수 있습니다."

    );

  },


  powerMotor: () => {

    state.evidence.power.add(
      "MOTOR"
    );


    showDialogue(

      "MOTOR POWER",

      "모터 입력 전압 : 24V\n\n" +

      "24V 전원이 필요합니다.\n\n" +

      "출구 구동 장치이므로 충분한 전압이 필요합니다."

    );

  },


  powerControl: () => {

    state.evidence.power.add(
      "CONTROL"
    );


    showDialogue(

      "CONTROL POWER",

      "제어기의 기준점 : GND\n\n" +

      "전압 공급보다 먼저\n" +

      "공통 접지 기준이 필요합니다."

    );

  },


  powerPanel: () => {

    const ready =
      state.evidence.power.has("SENSOR") &&
      state.evidence.power.has("MOTOR") &&
      state.evidence.power.has("CONTROL");


    if (!ready) {

      showDialogue(

        "배선 패널",

        "센서, 모터, 제어기의 전원 규격을\n" +
        "먼저 확인해야 합니다."

      );

      return;

    }


    document
      .getElementById(
        "power-mini"
      )
      .classList.add(
        "visible"
      );


    updatePrompt();

  },


  powerReturn: () => {

    if (
      !checkPowerSolved()
    ) {

      return;

    }


    state.solved.power =
      true;


    clearFile(
      "power"
    );


    switchRoom(
      "system"
    );


    state.x =
      170;

    state.y =
      360;


    updatePlayer();


    showDialogue(

      "POWER RECOVERED",

      "12V는 SENSOR로,\n" +

      "24V는 MOTOR로,\n" +

      "GND는 CONTROL로 연결되었습니다.\n\n" +

      "두 번째 유지보수 기록이 복구되었습니다."

    );

  },


  /* -----------------------------------------
     CONTROL
  ----------------------------------------- */

  controlPressure: () => {

    state.evidence.control.add(
      "PRESSURE"
    );


    showDialogue(

      "PRESSURE SENSOR",

      "현재 압력 : 낮음\n\n" +

      "유지보수 기록에는\n" +

      "압력이 안정된 뒤 브레이크가 해제된다고 적혀 있습니다."

    );

  },


  controlBrake: () => {

    state.evidence.control.add(
      "BRAKE"
    );


    showDialogue(

      "BRAKE",

      "현재 상태 : 잠김\n\n" +

      "모터를 작동하기 전에\n" +

      "브레이크가 먼저 해제되어야 합니다."

    );

  },


  controlMotor: () => {

    state.evidence.control.add(
      "MOTOR"
    );


    showDialogue(

      "MOTOR",

      "현재 상태 : 대기\n\n" +

      "모터는 제어 순서의 마지막 단계에서\n" +

      "작동하도록 설계되어 있습니다."

    );

  },


  controlNote: () => {

    state.evidence.control.add(
      "NOTE"
    );


    showDialogue(

      "MAINTENANCE LOG",

      "압력이 안정된 뒤\n" +

      "브레이크가 해제된다.\n\n" +

      "브레이크가 해제된 뒤\n" +

      "모터가 작동한다.\n\n" +

      "장치 사이의 조건을 연결하면\n" +

      "전체 순서를 알아낼 수 있습니다."

    );

  },


  controlReturn: () => {

    if (
      state.sequence.length !== 3
    ) {

      return;

    }


    state.solved.control =
      true;


    clearFile(
      "control"
    );


    switchRoom(
      "system"
    );


    state.x =
      170;

    state.y =
      360;


    updatePlayer();


    showDialogue(

      "CONTROL RECOVERED",

      "압력 안정 → 브레이크 해제 → 모터 작동\n\n" +

      "세 장치의 제어 순서가 복구되었습니다.\n\n" +

      "세 번째 유지보수 기록이 복구되었습니다."

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

      "원래 기록 대신 종이 조각이 남아 있습니다."

    );

    return;

  }


  switchRoom(
    type
  );


  state.x =
    100;

  state.y =
    window.innerHeight -
    120;


  updatePlayer();


  if (
    type === "sensor"
  ) {

    showDialogue(

      "SENSOR BAY",

      "센서실입니다.\n\n" +

      "세 개의 센서가 서로 다른 값을 기록하고 있습니다.\n\n" +

      "방을 돌아다니며 모든 센서와 기준 측정면을 조사하세요.\n\n" +

      "그 다음 이상 센서를 정상 방향으로 맞춰야 합니다."

    );

  }


  if (
    type === "power"
  ) {

    showDialogue(

      "POWER BAY",

      "전력 분배실입니다.\n\n" +

      "센서, 모터, 제어기는 서로 다른 전원 조건을 사용합니다.\n\n" +

      "장치를 직접 조사한 뒤 배선판에서 올바른 연결을 만들어야 합니다."

    );

  }


  if (
    type === "control"
  ) {

    showDialogue(

      "CONTROL CHAMBER",

      "제어 시스템실입니다.\n\n" +

      "세 장치 사이에는 작동 조건이 연결되어 있습니다.\n\n" +

      "주변 장치와 유지보수 기록을 조사하고\n" +

      "가장 먼저 작동해야 하는 장치부터 순서를 만들어야 합니다."

    );

  }

}


/* =========================================================
   SENSOR ANGLE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      state.room !== "sensor"
    ) {

      return;

    }


    if (
      !state.sensorAdjusting
    ) {

      return;

    }


    if (
      !dialogue.classList.contains(
        "hidden"
      )
    ) {

      return;

    }


    if (
      event.key.toLowerCase() === "a"
    ) {

      state.sensorAngle -= 5;

      state.sensorAngle =
        Math.max(
          -45,
          state.sensorAngle
        );

      updateSensorAngle();

    }


    if (
      event.key.toLowerCase() === "d"
    ) {

      state.sensorAngle += 5;

      state.sensorAngle =
        Math.min(
          45,
          state.sensorAngle
        );

      updateSensorAngle();

    }


    if (
      event.code === "Space"
    ) {

      if (
        state.sensorAngle === 0
      ) {

        completeSensor();

      }

      else {

        showDialogue(

          "조정 실패",

          "센서의 방향이 기준면과 일치하지 않습니다.\n\n" +

          "현재 방향을 다시 확인하세요."

        );

      }

    }

  }
);


/* =========================================================
   UPDATE SENSOR
========================================================= */

function updateSensorAngle() {

  const display =
    document.getElementById(
      "sensor-angle-display"
    );

  const marker =
    document.getElementById(
      "angle-marker"
    );


  display.textContent =
    `방향 : ${state.sensorAngle}°`;


  const position =
    50 +
    (
      state.sensorAngle /
      45
    ) *
    40;


  marker.style.left =
    `${position}%`;

}


/* =========================================================
   COMPLETE SENSOR
========================================================= */

function completeSensor() {

  state.sensorAdjusting =
    false;


  const returnDoor =
    document.getElementById(
      "sensor-return"
    );


  returnDoor.classList.remove(
    "disabled"
  );


  document
    .getElementById(
      "sensor-console"
    )
    .dataset.label =
    "정상 방향 확인";


  showDialogue(

    "SENSOR CALIBRATED",

    "센서 B의 방향이 정상 위치인 0°로 돌아왔습니다.\n\n" +

    "측정값도 정상 범위로 복구됩니다.\n\n" +

    "이제 RETURN을 조사해 중앙 기록실로 돌아갈 수 있습니다."

  );

}


/* =========================================================
   POWER MINI GAME
========================================================= */

const sourceNodes =
  document.querySelectorAll(
    ".source-node"
  );

const targetNodes =
  document.querySelectorAll(
    ".target-node"
  );


sourceNodes.forEach(
  node => {

    node.addEventListener(
      "click",
      () => {

        state.selectedWire =
          node.dataset.wire;


        sourceNodes.forEach(
          n =>
            n.classList.remove(
              "selected"
            )
        );


        node.classList.add(
          "selected"
        );


        document.getElementById(
          "wire-status"
        ).textContent =

          `${state.selectedWire} 전원선을 선택했습니다. 연결할 장치를 선택하세요.`;

      }
    );

  }
);


targetNodes.forEach(
  node => {

    node.addEventListener(
      "click",
      () => {

        if (
          !state.selectedWire
        ) {

          document.getElementById(
            "wire-status"
          ).textContent =

            "먼저 왼쪽에서 전원선을 선택하세요.";

          return;

        }


        const target =
          node.dataset.target;


        state.wires[
          state.selectedWire
        ] =
          target;


        drawWires();


        document.getElementById(
          "wire-status"
        ).textContent =

          `${state.selectedWire} → ${target.toUpperCase()} 연결`;

        state.selectedWire =
          null;


        sourceNodes.forEach(
          n =>
            n.classList.remove(
              "selected"
            )
        );

      }
    );

  }
);


/* =========================================================
   DRAW WIRES
========================================================= */

function drawWires() {

  const group =
    document.getElementById(
      "wire-lines"
    );


  group.innerHTML =
    "";


  const panel =
    document.getElementById(
      "power-mini"
    );


  const panelRect =
    panel.getBoundingClientRect();


  Object.entries(
    state.wires
  ).forEach(
    ([source, target]) => {

      if (!target) {
        return;
      }


      const sourceElement =
        document.querySelector(
          `.source-node[data-wire="${source}"]`
        );


      const targetElement =
        document.querySelector(
          `.target-node[data-target="${target}"]`
        );


      if (
        !sourceElement ||
        !targetElement
      ) {

        return;

      }


      const s =
        sourceElement.getBoundingClientRect();


      const t =
        targetElement.getBoundingClientRect();


      const x1 =
        s.left +
        s.width -
        panelRect.left;


      const y1 =
        s.top +
        s.height / 2 -
        panelRect.top;


      const x2 =
        t.left -
        panelRect.left;


      const y2 =
        t.top +
        t.height / 2 -
        panelRect.top;


      const line =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );


      line.setAttribute(
        "x1",
        x1
      );


      line.setAttribute(
        "y1",
        y1
      );


      line.setAttribute(
        "x2",
        x2
      );


      line.setAttribute(
        "y2",
        y2
      );


      line.classList.add(
        "wire-line"
      );


      group.appendChild(
        line
      );

    }
  );

}


/* =========================================================
   CHECK POWER
========================================================= */

document
  .getElementById(
    "wire-check"
  )
  .addEventListener(
    "click",
    () => {

      const solvedPower =
        checkPowerSolved();


      if (
        solvedPower
      ) {

        document
          .getElementById(
            "power-mini"
          )
          .classList.remove(
            "visible"
          );


        document
          .getElementById(
            "power-return"
          )
          .classList.remove(
            "disabled"
          );


        showDialogue(

          "POWER ROUTE COMPLETE",

          "12V → SENSOR\n" +

          "24V → MOTOR\n" +

          "GND → CONTROL\n\n" +

          "모든 장치가 필요한 전원 규격에 맞게 연결되었습니다.\n\n" +

          "RETURN이 해제되었습니다."

        );

      }

      else {

        document
          .getElementById(
            "wire-status"
          )
          .textContent =

          "전원 연결이 올바르지 않습니다. 장치의 요구 전압을 다시 확인하세요.";

      }

    }
  );


/* =========================================================
   POWER CHECK
========================================================= */

function checkPowerSolved() {

  return (

    state.wires["12V"] ===
    "sensor"

    &&

    state.wires["24V"] ===
    "motor"

    &&

    state.wires["GND"] ===
    "control"

  );

}


/* =========================================================
   POWER CLOSE
========================================================= */

document
  .getElementById(
    "wire-close"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "power-mini"
        )
        .classList.remove(
          "visible"
        );

    }
  );


/* =========================================================
   CONTROL SEQUENCE
========================================================= */

const sequenceButtons =
  document.querySelectorAll(
    ".sequence-button"
  );


sequenceButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        if (
          state.sequence.length >= 3
        ) {

          return;

        }


        const value =
          button.dataset.sequence;


        state.sequence.push(
          value
        );


        updateSequence();

      }
    );

  }
);


/* =========================================================
   UPDATE SEQUENCE
========================================================= */

function updateSequence() {

  const display =
    document.getElementById(
      "sequence-display"
    );


  const names = {

    pressure:
      "압력 안정",

    brake:
      "브레이크 해제",

    motor:
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

    result.push("_");

  }


  display.textContent =
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

      updateSequence();

    }
  );


/* =========================================================
   CHECK SEQUENCE
========================================================= */

document
  .getElementById(
    "sequence-check"
  )
  .addEventListener(
    "click",
    () => {

      const investigated =
        state.evidence.control.has(
          "PRESSURE"
        )
        &&
        state.evidence.control.has(
          "BRAKE"
        )
        &&
        state.evidence.control.has(
          "MOTOR"
        )
        &&
        state.evidence.control.has(
          "NOTE"
        );


      if (!investigated) {

        showDialogue(

          "제어 순서 잠김",

          "압력, 브레이크, 모터와\n" +
          "유지보수 기록을 모두 조사해야 합니다."

        );

        return;

      }


      const correct =
        state.sequence.length === 3 &&

        state.sequence[0] ===
          "pressure" &&

        state.sequence[1] ===
          "brake" &&

        state.sequence[2] ===
          "motor";


      if (!correct) {

        showDialogue(

          "순서 오류",

          "장치 사이의 조건과 맞지 않는 순서입니다.\n\n" +

          "어떤 장치가 먼저 안정되어야 하는지\n" +

          "다시 생각해 보세요."

        );

        return;

      }


      document
        .getElementById(
          "control-return"
        )
        .classList.remove(
          "disabled"
        );


      showDialogue(

        "CONTROL SEQUENCE COMPLETE",

        "압력 안정 → 브레이크 해제 → 모터 작동\n\n" +

        "모든 조건이 올바른 순서로 연결되었습니다.\n\n" +

        "RETURN이 해제되었습니다."

      );

    }
  );


/* =========================================================
   CLEAR FILE
========================================================= */

function clearFile(
  type
) {

  const file =
    document.querySelector(
      `.record[data-file="${type}"]`
    );


  if (!file) {
    return;
  }


  file.classList.add(
    "cleared"
  );


  file.classList.add(
    "disabled"
  );


  file.dataset.action =
    "";


  file.dataset.label =
    "";


  const text = {

    sensor:
      "센서 방향\n정상화",

    power:
      "전원 경로\n복구 완료",

    control:
      "제어 순서\n복구 완료"

  };


  file.innerHTML = `

    <div class="paper-fragment">

      <div class="paper-small">
        남겨진 메모
      </div>

      <div class="paper-main">
        ${text[type]
          .replace(
            "\n",
            "<br>"
          )}
      </div>

    </div>

  `;


  updateExit();

}


/* =========================================================
   EXIT
========================================================= */

function updateExit() {

  const exit =
    document.getElementById(
      "hidden-exit"
    );


  const complete =
    state.solved.sensor &&
    state.solved.power &&
    state.solved.control;


  if (
    complete
  ) {

    exit.classList.remove(
      "disabled"
    );

    exit.classList.add(
      "revealed"
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

    "센서는 환경을 정확하게 측정하고," +

    "<br>" +

    "전력 시스템은 필요한 장치에만 전원을 공급하며," +

    "<br>" +

    "제어 시스템은 장치의 순서를 안정적으로 조정합니다." +

    "<br><br>" +

    "<strong>" +

    "그리고 이제야 이 시설의 진짜 목적이 드러납니다." +

    "</strong>" +

    "<br><br>" +

    "이 시설은 고장난 것이 아니었습니다." +

    "<br>" +

    "유지보수 절차가 완료되었는지 확인하기 위해" +

    "<br>" +

    "출구 자체가 잠겨 있었던 것입니다." +

    "<br><br>" +

    "검증 완료.";


  ending.classList.remove(
    "hidden"
  );


  interactionPrompt.classList.remove(
    "visible"
  );

}


/* =========================================================
   KEY DOWN
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
      ].includes(key)
    ) {

      event.preventDefault();

    }


    keys[key] =
      true;


    if (
      event.code === "Space"
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
      event.code === "Escape"
    ) {

      closeDialogue();

    }

  }
);


/* =========================================================
   KEY UP
========================================================= */

document.addEventListener(
  "keyup",
  event => {

    const key =
      event.key.toLowerCase();


    keys[key] =
      false;


    if (
      event.code === "Space"
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

    drawWires();

  }
);


/* =========================================================
   LOOP
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
  100;

state.y =
  Math.round(
    window.innerHeight * 0.5
  );


updatePlayer();

updateHUD();

updateExit();

updatePrompt();


gameLoop();
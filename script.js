/* =========================================================
   REBOOT
   유지보수 탈출 게임
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const game = document.getElementById("game");
const player = document.getElementById("player");

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

const ending =
  document.getElementById("ending");

const endingText =
  document.getElementById("ending-text");

const chapter =
  document.getElementById("chapter");

const objective =
  document.getElementById("objective");

const progress =
  document.getElementById("progress");


/* =========================================================
   ROOMS
   ========================================================= */

const rooms = {

  intro:
    document.getElementById("room-intro"),

  system:
    document.getElementById("room-system"),

  sensor:
    document.getElementById("room-sensor"),

  power:
    document.getElementById("room-power"),

  control:
    document.getElementById("room-control")

};


/* =========================================================
   GAME STATE
   ========================================================= */

let currentRoom =
  "intro";

let playerX =
  120;

let playerY =
  Math.round(
    window.innerHeight * 0.5
  );

const SPEED =
  4;


/* =========================================================
   KEYBOARD
   ========================================================= */

const keys = {};

let spaceDown =
  false;


/* =========================================================
   CLEAR STATE
   ========================================================= */

const solved = {

  sensor: false,

  power: false,

  control: false

};


/* =========================================================
   EVIDENCE
   ========================================================= */

const evidence = {

  sensor:
    new Set(),

  power:
    new Set(),

  control:
    new Set()

};


/* =========================================================
   MINI GAME STATE
   ========================================================= */

/* 센서 */
let sensorRotation =
  0;

let sensorCorrect =
  false;


/* 전력 */
let powerConnections =
  {};


/* 제어 */
let sequence =
  [];


/* =========================================================
   ROOM SIZE
   ========================================================= */

const ROOM_WIDTH = {

  intro: 2300,

  system: window.innerWidth,

  sensor: window.innerWidth,

  power: window.innerWidth,

  control: window.innerWidth

};

const ROOM_HEIGHT =
  700;


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

  const info = {

    intro: {
      chapter: "부팅 과정",
      objective:
        "오른쪽의 SYSTEM으로 이동하세요."
    },

    system: {
      chapter: "중앙 유지보수 기록",
      objective:
        "세 개의 손상된 기록을 복구하세요."
    },

    sensor: {
      chapter: "FILE 01 // 센서",
      objective:
        "이상한 거리 센서를 찾아 올바르게 조정하세요."
    },

    power: {
      chapter: "FILE 02 // 전력",
      objective:
        "장치에 맞는 배선을 직접 연결하세요."
    },

    control: {
      chapter: "FILE 03 // 제어",
      objective:
        "단서를 조사하고 제어 순서를 완성하세요."
    }

  };


  const current =
    info[currentRoom];


  chapter.textContent =
    current.chapter;

  objective.textContent =
    current.objective;


  const count =
    Number(solved.sensor) +
    Number(solved.power) +
    Number(solved.control);


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


  Object.values(rooms)
    .forEach(room => {

      room.classList.remove(
        "active"
      );

    });


  rooms[roomName]
    .classList.add(
      "active"
    );


  currentRoom =
    roomName;


  const introWorld =
    document.getElementById(
      "intro-world"
    );


  if (introWorld) {

    introWorld.style.transform =
      "translateX(0)";

  }


  player.style.transform =
    "translateX(0)";


  updateHUD();

  updatePlayer();

  updatePrompt();

}


/* =========================================================
   PLAYER
   ========================================================= */

function updatePlayer() {

  player.style.left =
    `${Math.round(playerX)}px`;

  player.style.top =
    `${Math.round(playerY)}px`;

}


/* =========================================================
   INTRO CAMERA
   ========================================================= */

function updateIntroCamera() {

  if (
    currentRoom !== "intro"
  ) {
    return;
  }


  const world =
    document.getElementById(
      "intro-world"
    );


  if (!world) {
    return;
  }


  const width =
    game.clientWidth;


  const maxCamera =
    Math.max(
      0,
      ROOM_WIDTH.intro - width
    );


  let cameraX =
    playerX -
    width * 0.35;


  cameraX =
    Math.max(
      0,
      Math.min(
        maxCamera,
        cameraX
      )
    );


  world.style.transform =
    `translateX(${-cameraX}px)`;


  player.style.left =
    `${Math.round(
      playerX - cameraX
    )}px`;

  player.style.top =
    `${Math.round(
      playerY
    )}px`;

}


/* =========================================================
   PLAYER LIMIT
   ========================================================= */

function limitPlayer() {

  let maxX;


  if (
    currentRoom === "intro"
  ) {

    maxX =
      ROOM_WIDTH.intro -
      40;

  }

  else {

    maxX =
      window.innerWidth -
      45;

  }


  const maxY =
    Math.min(
      window.innerHeight - 50,
      ROOM_HEIGHT - 35
    );


  playerX =
    Math.max(
      25,
      Math.min(
        maxX,
        playerX
      )
    );


  playerY =
    Math.max(
      70,
      Math.min(
        maxY,
        playerY
      )
    );

}


/* =========================================================
   MOVEMENT
   ========================================================= */

function movePlayer() {

  if (
    dialogue.classList.contains(
      "visible"
    )
  ) {
    return;
  }


  if (
    ending.classList.contains(
      "visible"
    )
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

    dy -= SPEED;

  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    dy += SPEED;

  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    dx -= SPEED;

  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    dx += SPEED;

  }


  playerX += dx;

  playerY += dy;


  limitPlayer();


  if (
    currentRoom === "intro"
  ) {

    updateIntroCamera();

  }

  else {

    updatePlayer();

  }


  updatePrompt();


  /* -------------------------------------
     SYSTEM 진입
  ------------------------------------- */

  if (
    currentRoom === "intro" &&
    playerX > 1850
  ) {

    enterSystem();

  }

}


/* =========================================================
   INTRO → SYSTEM
   ========================================================= */

function enterSystem() {

  switchRoom(
    "system"
  );


  playerX =
    130;

  playerY =
    360;


  updatePlayer();


  showDialogue(

    "SYSTEM 접속 완료",

    "시설의 유지보수 구역에 들어왔습니다.\n\n" +

    "자동 복구 절차가 중단되어 있습니다.\n" +

    "중앙 기록에는 세 개의 손상된 시스템이 남아 있습니다.\n\n" +

    "센서 → 전력 → 제어\n\n" +

    "세 시스템을 직접 복구하면\n" +

    "출구 잠금이 해제될 가능성이 있습니다."

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

  dialogue.classList.add(
    "visible"
  );

  interactionPrompt.classList.remove(
    "visible"
  );

}


function closeDialogue() {

  dialogue.classList.remove(
    "visible"
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

  if (
    !rooms[currentRoom]
  ) {
    return [];
  }


  return [
    ...rooms[currentRoom]
      .querySelectorAll(
        ".interactable"
      )
  ];

}


/* =========================================================
   OBJECT CENTER
   ========================================================= */

function getCenter(
  element
) {

  const rect =
    element.getBoundingClientRect();

  const gameRect =
    game.getBoundingClientRect();


  return {

    x:
      rect.left -
      gameRect.left +
      rect.width / 2,

    y:
      rect.top -
      gameRect.top +
      rect.height / 2

  };

}


/* =========================================================
   DISTANCE
   ========================================================= */

function distanceTo(
  element
) {

  const center =
    getCenter(
      element
    );


  const px =
    playerX + 16;

  const py =
    playerY + 19;


  return Math.hypot(
    px - center.x,
    py - center.y
  );

}


/* =========================================================
   NEAREST
   ========================================================= */

function nearestInteractable() {

  const objects =
    getInteractables();


  let nearest =
    null;

  let nearestDistance =
    Infinity;


  for (
    const object of objects
  ) {

    if (
      object.classList.contains(
        "disabled"
      )
    ) {
      continue;
    }


    const distance =
      distanceTo(
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
    dialogue.classList.contains(
      "visible"
    )
  ) {

    interactionPrompt.classList.remove(
      "visible"
    );

    return;

  }


  const target =
    nearestInteractable();


  if (!target) {

    interactionPrompt.classList.remove(
      "visible"
    );

    return;

  }


  interactionPrompt.textContent =
    `SPACE  ${
      target.dataset.label ||
      "상호작용"
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
    dialogue.classList.contains(
      "visible"
    )
  ) {
    return;
  }


  const target =
    nearestInteractable();


  if (!target) {
    return;
  }


  const actionName =
    target.dataset.action;


  if (
    actions[actionName]
  ) {

    actions[actionName](
      target
    );

  }

}


/* =========================================================
   ACTIONS
   ========================================================= */

const actions = {


  /* =====================================
     FILE
  ====================================== */

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


  /* =====================================
     SENSOR
  ====================================== */

  sensorA: () => {

    evidence.sensor.add(
      "A"
    );


    showDialogue(

      "센서 A",

      "센서 A는 기준 벽을 정확하게 바라보고 있습니다.\n\n" +

      "현재 측정값 : 82 cm\n" +

      "기준 범위 : 80 ~ 84 cm\n\n" +

      "상태 : 정상"

    );

  },


  sensorB: () => {

    evidence.sensor.add(
      "B"
    );


    showDialogue(

      "센서 B",

      "센서 B의 측정값입니다.\n\n" +

      "현재 측정값 : 103 cm\n" +

      "기준 범위 : 80 ~ 84 cm\n\n" +

      "센서 자체에는 오류 기록이 없습니다.\n\n" +

      "상태 : 비정상"

    );

  },


  sensorC: () => {

    evidence.sensor.add(
      "C"
    );


    showDialogue(

      "센서 C",

      "센서 C는 기준 벽을 바라보고 있습니다.\n\n" +

      "현재 측정값 : 81 cm\n" +

      "기준 범위 : 80 ~ 84 cm\n\n" +

      "상태 : 정상"

    );

  },


  sensorReference: () => {

    evidence.sensor.add(
      "reference"
    );


    showDialogue(

      "기준 표지판",

      "세 센서는 모두 같은 기준면을 측정해야 합니다.\n\n" +

      "기준 벽은 움직이지 않았습니다.\n\n" +

      "따라서 하나만 값이 다르다면\n" +

      "센서의 위치 또는 방향을 확인해야 합니다."

    );

  },


  sensorConsole: () => {

    if (
      !(
        evidence.sensor.has("A") &&
        evidence.sensor.has("B") &&
        evidence.sensor.has("C") &&
        evidence.sensor.has("reference")
      )
    ) {

      showDialogue(

        "조정기 잠김",

        "센서 A, B, C와 기준 표지판을\n" +
        "모두 조사해야 합니다."

      );

      return;

    }


    showDialogue(

      "센서 조정기",

      "센서 B의 방향이 오른쪽으로 틀어져 있습니다.\n\n" +

      "다이얼을 돌려 기준 벽을 다시 바라보게 해야 합니다."

    );


    startSensorMiniGame();

  },


  sensorReturn: () => {

    returnToSystem(
      "sensor"
    );

  },


  /* =====================================
     POWER
  ====================================== */

  powerSensor: () => {

    evidence.power.add(
      "sensor"
    );


    showDialogue(

      "센서 단자",

      "센서 입력 전압 : 12V\n\n" +

      "12V 전원만 연결해야 합니다.\n" +

      "24V를 연결하면 센서가 손상될 수 있습니다."

    );

  },


  powerMotor: () => {

    evidence.power.add(
      "motor"
    );


    showDialogue(

      "모터 단자",

      "모터 입력 전압 : 24V\n\n" +

      "24V 전원이 필요합니다."

    );

  },


  powerControl: () => {

    evidence.power.add(
      "control"
    );


    showDialogue(

      "제어기 단자",

      "제어기는 전원 장치의 기준점을 공유해야 합니다.\n\n" +

      "공통 접지 : GND"

    );

  },


  powerStart: () => {

    if (
      !(
        evidence.power.has("sensor") &&
        evidence.power.has("motor") &&
        evidence.power.has("control")
      )
    ) {

      showDialogue(

        "전력 검사기 잠김",

        "센서, 모터, 제어기의 단자를\n" +
        "모두 조사해야 합니다."

      );

      return;

    }


    checkPowerConnections();

  },


  powerReturn: () => {

    returnToSystem(
      "power"
    );

  },


  /* =====================================
     CONTROL
  ====================================== */

  controlPressure: () => {

    evidence.control.add(
      "pressure"
    );


    showDialogue(

      "압력 센서",

      "현재 상태 : 낮음\n\n" +

      "유지보수 기록에 따르면\n" +

      "브레이크 해제 전에 압력이 안정되어야 합니다."

    );

  },


  controlBrake: () => {

    evidence.control.add(
      "brake"
    );


    showDialogue(

      "브레이크",

      "현재 상태 : 잠김\n\n" +

      "모터가 작동하기 전에\n" +

      "브레이크가 해제되어 있어야 합니다."

    );

  },


  controlMotor: () => {

    evidence.control.add(
      "motor"
    );


    showDialogue(

      "구동 모터",

      "현재 상태 : 대기\n\n" +

      "제어 순서의 마지막 단계에서\n" +

      "모터가 작동합니다."

    );

  },


  controlNote: () => {

    evidence.control.add(
      "note"
    );


    showDialogue(

      "유지보수 기록",

      "압력이 안정된 뒤 브레이크가 해제된다.\n\n" +

      "브레이크가 해제된 뒤 모터를 작동한다.\n\n" +

      "순서는 장치 사이의 조건 관계로 판단할 수 있습니다."

    );

  },


  controlReturn: () => {

    returnToSystem(
      "control"
    );

  },


  exit: () => {

    if (
      solved.sensor &&
      solved.power &&
      solved.control
    ) {

      finishGame();

    }

  }

};


/* =========================================================
   OPEN PUZZLE
   ========================================================= */

function openPuzzle(
  type
) {

  if (
    solved[type]
  ) {

    showDialogue(

      "복구된 기록",

      "이 기록은 이미 복구되었습니다.\n\n" +

      "원래 파일 대신 종이 조각만 남아 있습니다."

    );

    return;

  }


  switchRoom(
    type
  );


  playerX =
    100;

  playerY =
    560;


  updatePlayer();


  const introText = {

    sensor:

      "센서실입니다.\n\n" +

      "세 개의 거리 센서 중 하나가 이상한 값을 내고 있습니다.\n\n" +

      "직접 돌아다니며 세 센서와 기준 표지판을 조사하세요.\n\n" +

      "이상 센서를 찾은 뒤 조정기를 사용해야 합니다.",


    power:

      "전력실입니다.\n\n" +

      "센서, 모터, 제어기에 전원을 공급해야 합니다.\n\n" +

      "각 장치가 요구하는 전압을 확인하고\n" +

      "배선 패널에서 올바르게 연결하세요.",


    control:

      "제어실입니다.\n\n" +

      "압력, 브레이크, 모터 사이에는 작동 순서가 있습니다.\n\n" +

      "주변 장치와 유지보수 기록을 조사한 뒤\n" +

      "제어 순서를 직접 입력하세요."

  };


  showDialogue(

    `FILE ${type.toUpperCase()}`,

    introText[type]

  );

}


/* =========================================================
   SENSOR MINI GAME
========================================================= */

function startSensorMiniGame() {

  const dial =
    document.querySelector(
      ".dial"
    );


  let currentAngle =
    sensorRotation;


  function rotateDial(
    event
  ) {

    if (
      event.code === "ArrowLeft"
    ) {

      currentAngle -= 15;

      event.preventDefault();

    }


    if (
      event.code === "ArrowRight"
    ) {

      currentAngle += 15;

      event.preventDefault();

    }


    dial.style.transform =
      `rotate(${currentAngle}deg)`;


    sensorRotation =
      currentAngle;


    /*
       정답 범위
       약 -45도
    */

    if (
      currentAngle >= -55 &&
      currentAngle <= -35
    ) {

      sensorCorrect =
        true;

    }

    else {

      sensorCorrect =
        false;

    }


    const display =
      document.getElementById(
        "sensor-console-status"
      );


    if (sensorCorrect) {

      display.textContent =
        "정상 방향";

    }

    else {

      display.textContent =
        "방향 조정 필요";

    }


    if (
      sensorCorrect
    ) {

      const returnDoor =
        document.getElementById(
          "sensor-return"
        );


      returnDoor.classList.remove(
        "disabled"
      );


      showDialogue(

        "센서 방향 조정 완료",

        "센서 B가 기준 벽을 다시 바라보고 있습니다.\n\n" +

        "측정값이 정상 범위로 돌아왔습니다.\n\n" +

        "센서 복구 완료."

      );


      document.removeEventListener(
        "keydown",
        rotateDial
      );

    }

  }


  document.addEventListener(
    "keydown",
    rotateDial
  );

}


/* =========================================================
   POWER MINI GAME
========================================================= */

const powerNodeRequirements = {

  1: "12V",
  2: "24V",
  3: "GND"

};


document.addEventListener(
  "click",
  event => {

    const node =
      event.target.closest(
        ".wire-node"
      );


    if (!node) {
      return;
    }


    if (
      currentRoom !== "power"
    ) {
      return;
    }


    const number =
      node.dataset.node;


    powerConnections[number] =
      powerNodeRequirements[number];


    document
      .querySelectorAll(
        ".wire-node"
      )
      .forEach(
        element => {

          element.classList.remove(
            "selected"
          );

        }
      );


    node.classList.add(
      "selected"
    );


    const status =
      document.getElementById(
        "power-status"
      );


    status.textContent =
      `배선 ${number} : ${powerNodeRequirements[number]} 연결`;

  }
);


/* =========================================================
   POWER CHECK
========================================================= */

function checkPowerConnections() {

  const correct =
    powerConnections["1"] === "12V" &&
    powerConnections["2"] === "24V" &&
    powerConnections["3"] === "GND";


  if (!correct) {

    showDialogue(

      "배선 오류",

      "전압 또는 접지 연결이 올바르지 않습니다.\n\n" +

      "각 장치가 요구하는 전원 규격과\n" +

      "배전판의 연결을 다시 확인하세요."

    );

    return;

  }


  showDialogue(

    "배선 연결 완료",

    "12V → 센서\n" +

    "24V → 모터\n" +

    "GND → 제어기\n\n" +

    "모든 전원 연결이 정상입니다.\n\n" +

    "전력 시스템 복구 완료."

  );


  document
    .getElementById(
      "power-return"
    )
    .classList.remove(
      "disabled"
    );

}


/* =========================================================
   CONTROL SEQUENCE
========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".sequence-button"
      );


    if (!button) {
      return;
    }


    if (
      currentRoom !== "control"
    ) {
      return;
    }


    const value =
      button.dataset.sequence;


    if (
      sequence.length >= 3
    ) {
      return;
    }


    sequence.push(
      value
    );


    updateSequenceDisplay();

  }
);


/* =========================================================
   SEQUENCE DISPLAY
========================================================= */

function updateSequenceDisplay() {

  const display =
    document.getElementById(
      "sequence-display"
    );


  const names = {

    pressure: "압력 안정",

    brake: "브레이크 해제",

    motor: "모터 작동"

  };


  const result =
    sequence.map(
      item => names[item]
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
   SEQUENCE RESET
========================================================= */

document
  .getElementById(
    "sequence-reset"
  )
  .addEventListener(
    "click",
    () => {

      sequence =
        [];

      updateSequenceDisplay();

    }
  );


/* =========================================================
   SEQUENCE CHECK
========================================================= */

document
  .getElementById(
    "sequence-check"
  )
  .addEventListener(
    "click",
    () => {

      if (
        !(
          evidence.control.has("pressure") &&
          evidence.control.has("brake") &&
          evidence.control.has("motor") &&
          evidence.control.has("note")
        )
      ) {

        showDialogue(

          "제어 순서 잠김",

          "주변 장치와 유지보수 기록을\n" +
          "먼저 조사해야 합니다."

        );

        return;

      }


      const answer = [

        "pressure",

        "brake",

        "motor"

      ];


      const correct =
        sequence.length === 3 &&
        sequence.every(
          (value, index) =>
            value === answer[index]
        );


      if (!correct) {

        showDialogue(

          "순서 오류",

          "장치 사이의 조건 관계와\n" +
          "맞지 않는 순서입니다.\n\n" +

          "압력 → 브레이크 → 모터\n" +

          "각 단계가 왜 필요한지 다시 조사해 보세요."

        );

        return;

      }


      showDialogue(

        "제어 순서 복구 완료",

        "압력 안정 → 브레이크 해제 → 모터 작동\n\n" +

        "제어 시스템이 정상 순서를 복구했습니다."

      );


      document
        .getElementById(
          "control-return"
        )
        .classList.remove(
          "disabled"
        );

    }
  );


/* =========================================================
   RETURN TO SYSTEM
========================================================= */

function returnToSystem(
  type
) {

  const ready = {

    sensor:
      sensorCorrect,

    power:
      powerConnections["1"] === "12V" &&
      powerConnections["2"] === "24V" &&
      powerConnections["3"] === "GND",

    control:
      sequence.length === 3 &&
      sequence[0] === "pressure" &&
      sequence[1] === "brake" &&
      sequence[2] === "motor"

  };


  if (
    !ready[type]
  ) {

    return;

  }


  solved[type] =
    true;


  convertFile(
    type
  );


  switchRoom(
    "system"
  );


  playerX =
    170;

  playerY =
    360;


  updatePlayer();


  updateHUD();

  updateExit();


  const message = {

    sensor:

      "센서 시스템 복구 완료.\n\n" +

      "이상 센서의 방향을 찾아 정상 위치로 조정했습니다.",

    power:

      "전력 시스템 복구 완료.\n\n" +

      "각 장치의 요구 전압에 맞춰 배선을 연결했습니다.",

    control:

      "제어 시스템 복구 완료.\n\n" +

      "장치 사이의 조건을 분석하여 올바른 작동 순서를 복구했습니다."

  };


  showDialogue(

    "복구 완료",

    message[type] +

    "\n\n" +

    "원래 파일 대신 종이 조각이 남았습니다."

  );

}


/* =========================================================
   FILE → PAPER
========================================================= */

function convertFile(
  type
) {

  const file =
    rooms.system.querySelector(
      `[data-file="${type}"]`
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


  file.innerHTML =
    "";


  const paper =
    document.createElement(
      "div"
    );


  paper.className =
    "paper-fragment";


  const data = {

    sensor:
      [
        "남겨진 메모",
        "이상값보다\n센서의 방향을 확인할 것"
      ],

    power:
      [
        "남겨진 메모",
        "전압을 맞추고\n배선 순서를 확인할 것"
      ],

    control:
      [
        "남겨진 메모",
        "장치보다\n조건의 순서를 볼 것"
      ]

  };


  paper.innerHTML =

    `<div style="font-size:8px;opacity:.55;">
      ${data[type][0]}
     </div>` +

    `<div style="
      margin-top:10px;
      font-size:10px;
      line-height:1.5;
    ">
      ${data[type][1]
        .replace(
          "\n",
          "<br>"
        )}
     </div>`;


  file.appendChild(
    paper
  );

}


/* =========================================================
   EXIT
========================================================= */

function updateExit() {

  const exit =
    document.getElementById(
      "hidden-exit"
    );


  if (
    solved.sensor &&
    solved.power &&
    solved.control
  ) {

    exit.classList.remove(
      "disabled"
    );

    exit.classList.add(
      "revealed"
    );

    exit.dataset.label =
      "출구 열기";

    return;

  }


  exit.classList.add(
    "disabled"
  );

}


/* =========================================================
   ENDING
========================================================= */

function finishGame() {

  endingText.innerHTML =

    "세 개의 시스템이 다시 하나의 제어 흐름으로 연결되었습니다." +

    "<br><br>" +

    "센서가 환경을 측정하고," +

    "<br>" +

    "전력이 장치를 움직이며," +

    "<br>" +

    "제어 시스템이 그 순서를 조정합니다." +

    "<br><br>" +

    "<b>MAINTENANCE LOCK : RELEASED</b>" +

    "<br><br>" +

    "시설의 출구가 열렸습니다.";


  ending.classList.add(
    "visible"
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
          dialogue.classList.contains(
            "visible"
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

    ROOM_WIDTH.system =
      window.innerWidth;

    ROOM_WIDTH.sensor =
      window.innerWidth;

    ROOM_WIDTH.power =
      window.innerWidth;

    ROOM_WIDTH.control =
      window.innerWidth;


    limitPlayer();


    if (
      currentRoom === "intro"
    ) {

      updateIntroCamera();

    }

    else {

      updatePlayer();

    }

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
   INIT
========================================================= */

switchRoom(
  "intro"
);


playerX =
  120;

playerY =
  Math.round(
    window.innerHeight * 0.5
  );


updatePlayer();

updateHUD();

updateExit();

updateIntroCamera();

updatePrompt();

gameLoop();
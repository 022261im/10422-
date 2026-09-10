/* =========================================
   REBOOT
   Main Game Script
========================================= */


/* =========================================
   DOM
========================================= */

const game = document.getElementById("game");
const player = document.getElementById("player");

const promptBox =
  document.getElementById("interaction-prompt");

const dialogue =
  document.getElementById("dialogue");

const dialogueTitle =
  document.getElementById("dialogue-title");

const dialogueText =
  document.getElementById("dialogue-text");

const dialogueClose =
  document.getElementById("dialogue-close");

const ending =
  document.getElementById("ending");

const endingText =
  document.getElementById("ending-text");

const chapter =
  document.getElementById("chapter");

const objective =
  document.getElementById("objective");

const status =
  document.getElementById("status");


/* =========================================
   ROOMS
========================================= */

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


/* =========================================
   GAME STATE
========================================= */

const state = {

  room: "intro",

  x: 100,

  y:
    Math.round(window.innerHeight * 0.5),

  speed: 4,

  solved: {

    sensor: false,

    power: false,

    control: false

  },

  evidence: {

    sensor: new Set(),

    power: new Set(),

    control: new Set()

  },

  puzzleUnlocked: {

    sensor: false,

    power: false,

    control: false

  }

};


/* =========================================
   CONSTANTS
========================================= */

const ROOM_WIDTH = {

  intro: 2200,

  system: 1400,

  sensor: 1300,

  power: 1300,

  control: 1300

};

const ROOM_HEIGHT = 700;


/* =========================================
   KEY INPUT
========================================= */

const keys = new Set();

let spacePressed = false;


/* =========================================
   HUD UPDATE
========================================= */

function updateHUD() {

  const labels = {

    intro: [
      "BOOT SEQUENCE",
      "Reach the system terminal."
    ],

    system: [
      "ARCHIVE NODE",
      "Recover the three corrupted maintenance files."
    ],

    sensor: [
      "FILE 01 // SENSOR",
      "Find the common measurement error."
    ],

    power: [
      "FILE 02 // POWER",
      "Infer the safe path through the power system."
    ],

    control: [
      "FILE 03 // CONTROL",
      "Identify the stable controller settings."
    ]

  };


  const info =
    labels[state.room];


  chapter.textContent =
    info[0];


  objective.textContent =
    info[1];


  const recovered =
    Object.values(state.solved)
      .filter(Boolean)
      .length;


  status.textContent =
    `${recovered}/3 RECOVERED`;

}


/* =========================================
   CHANGE ROOM
========================================= */

function setRoom(name) {

  Object.values(rooms)
    .forEach(room => {

      room.classList.remove("active");

    });


  if (!rooms[name]) {
    return;
  }


  rooms[name]
    .classList.add("active");


  state.room = name;


  player.style.transform =
    "translateX(0)";


  updateHUD();

  updatePrompt();

}


/* =========================================
   PLAYER POSITION
========================================= */

function updatePlayer() {

  player.style.left =
    `${Math.round(state.x)}px`;


  player.style.top =
    `${Math.round(state.y)}px`;

}


/* =========================================
   PLAYER BOUNDARY
========================================= */

function clampPlayer() {

  const maxX =
    Math.max(
      30,
      ROOM_WIDTH[state.room] - 60
    );


  const maxY =
    ROOM_HEIGHT - 60;


  state.x =
    Math.max(
      20,
      Math.min(maxX, state.x)
    );


  state.y =
    Math.max(
      80,
      Math.min(maxY, state.y)
    );

}


/* =========================================
   INTRO CAMERA
========================================= */

function updateIntroCamera() {

  if (state.room !== "intro") {
    return;
  }


  const room =
    rooms.intro;


  const space =
    room.querySelector(".intro-space");


  if (!space) {
    return;
  }


  const viewportWidth =
    game.clientWidth;


  const maximumShift =
    Math.max(
      0,
      ROOM_WIDTH.intro - viewportWidth
    );


  const shift =
    Math.max(
      0,
      Math.min(
        maximumShift,
        state.x -
          viewportWidth * 0.35
      )
    );


  space.style.transform =
    `translateX(${-shift}px)`;


  player.style.transform =
    `translateX(${shift}px)`;

}


/* =========================================
   DIALOGUE
========================================= */

function showDialogue(title, text) {

  dialogueTitle.textContent =
    title;


  dialogueText.textContent =
    text;


  dialogue.classList.add(
    "visible"
  );


  updatePrompt();

}


function hideDialogue() {

  dialogue.classList.remove(
    "visible"
  );


  updatePrompt();

}


dialogueClose.addEventListener(
  "click",
  hideDialogue
);


dialogue.addEventListener(
  "click",
  event => {

    if (
      event.target === dialogue
    ) {

      hideDialogue();

    }

  }
);


/* =========================================
   INTERACTABLES
========================================= */

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


/* =========================================
   DISTANCE
========================================= */

function getDistance(element) {

  const elementRect =
    element.getBoundingClientRect();


  const gameRect =
    game.getBoundingClientRect();


  const objectX =
    elementRect.left -
    gameRect.left +
    elementRect.width / 2;


  const objectY =
    elementRect.top -
    gameRect.top +
    elementRect.height / 2;


  const playerX =
    state.x + 15;


  const playerY =
    state.y + 17;


  return Math.hypot(
    playerX - objectX,
    playerY - objectY
  );

}


/* =========================================
   NEAREST OBJECT
========================================= */

function getNearestInteractable() {

  const objects =
    getInteractables();


  let nearest = null;

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
      getDistance(object);


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
    nearestDistance <= 100
  ) {

    return nearest;

  }


  return null;

}


/* =========================================
   PROMPT
========================================= */

function updatePrompt() {

  if (
    dialogue.classList.contains(
      "visible"
    )
  ) {

    promptBox.classList.remove(
      "visible"
    );

    return;

  }


  if (
    ending.classList.contains(
      "visible"
    )
  ) {

    promptBox.classList.remove(
      "visible"
    );

    return;

  }


  const target =
    getNearestInteractable();


  if (!target) {

    promptBox.classList.remove(
      "visible"
    );

    return;

  }


  promptBox.textContent =
    `SPACE  ${
      target.dataset.label ||
      "INTERACT"
    }`;


  promptBox.classList.add(
    "visible"
  );

}


/* =========================================
   ACTIONS
========================================= */

const actions = {


  /* ---------------------------
     SYSTEM FILES
  --------------------------- */

  openSensor: () => {

    openPuzzle("sensor");

  },


  openPower: () => {

    openPuzzle("power");

  },


  openControl: () => {

    openPuzzle("control");

  },


  /* ---------------------------
     EXIT
  --------------------------- */

  exit: () => {

    finishGame();

  },


  /* ---------------------------
     SENSOR
  --------------------------- */

  sensorA: element => {

    inspect(
      "sensor",
      "a",
      element.dataset.text
    );

  },


  sensorB: element => {

    inspect(
      "sensor",
      "b",
      element.dataset.text
    );

  },


  sensorC: element => {

    inspect(
      "sensor",
      "c",
      element.dataset.text
    );

  },


  sensorConsole: () => {

    solveSensor();

  },


  sensorReturn: () => {

    returnToSystem(
      "sensor"
    );

  },


  /* ---------------------------
     POWER
  --------------------------- */

  powerSensor: element => {

    inspect(
      "power",
      "sensor",
      element.dataset.text
    );

  },


  powerMotor: element => {

    inspect(
      "power",
      "motor",
      element.dataset.text
    );

  },


  powerCooling: element => {

    inspect(
      "power",
      "cooling",
      element.dataset.text
    );

  },


  powerConsole: () => {

    solvePower();

  },


  powerReturn: () => {

    returnToSystem(
      "power"
    );

  },


  /* ---------------------------
     CONTROL
  --------------------------- */

  controlA: element => {

    inspect(
      "control",
      "a",
      element.dataset.text
    );

  },


  controlB: element => {

    inspect(
      "control",
      "b",
      element.dataset.text
    );

  },


  controlC: element => {

    inspect(
      "control",
      "c",
      element.dataset.text
    );

  },


  controlConsole: () => {

    solveControl();

  },


  controlReturn: () => {

    returnToSystem(
      "control"
    );

  }

};


/* =========================================
   INTERACTION
========================================= */

function interact() {

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


  const target =
    getNearestInteractable();


  if (!target) {

    return;

  }


  const action =
    actions[target.dataset.action];


  if (
    typeof action ===
    "function"
  ) {

    action(target);

  }

}


/* =========================================
   OPEN PUZZLE
========================================= */

function openPuzzle(type) {

  if (
    state.solved[type]
  ) {

    showDialogue(
      "RECOVERED FILE",

      "이 기록은 이미 복구되었다.\n\n" +
      "원래 파일 대신 종이 조각만 남아 있다."
    );

    return;

  }


  setRoom(type);


  state.x = 100;

  state.y =
    ROOM_HEIGHT - 110;


  updatePlayer();


  if (
    type === "sensor"
  ) {

    showDialogue(

      "FILE 01 // SENSOR",

      "세 개의 기준점이 살아 있다.\n\n" +

      "각 지점의 기준값과 측정값을 비교해라.\n\n" +

      "세 기록을 모두 조사한 뒤\n" +

      "공통 오차를 찾아 보정해야 한다."

    );

  }


  if (
    type === "power"
  ) {

    showDialogue(

      "FILE 02 // POWER",

      "메인 버스의 한계는 70%다.\n\n" +

      "모든 장치에 전력을 공급하는 것이\n" +

      "반드시 정답은 아니다.\n\n" +

      "각 부품의 역할과 작동 조건을 조사해라."

    );

  }


  if (
    type === "control"
  ) {

    showDialogue(

      "FILE 03 // CONTROL",

      "세 개의 제어 응답 기록이 남아 있다.\n\n" +

      "속도만 빠른 응답이 좋은 것은 아니다.\n\n" +

      "반응 속도와 안정성을 함께 비교해라."

    );

  }

}


/* =========================================
   INSPECT CLUE
========================================= */

function inspect(
  type,
  clue,
  text
) {

  state.evidence[type]
    .add(clue);


  showDialogue(

    `EVIDENCE // ${
      clue.toUpperCase()
    }`,

    text

  );

}


/* =========================================
   SENSOR PUZZLE
========================================= */

function solveSensor() {

  const required = [
    "a",
    "b",
    "c"
  ];


  const complete =
    required.every(
      clue =>
        state.evidence.sensor
          .has(clue)
    );


  if (!complete) {

    showDialogue(

      "CONSOLE LOCKED",

      "A, B, C 세 측정 지점을\n" +
      "모두 조사해야 한다."

    );

    return;

  }


  const answer =
    window.prompt(

      "세 측정값에 공통으로 적용할 보정값을 입력하세요.\n\n" +
      "단위 : cm\n" +
      "예 : -7"

    );


  if (
    answer === null
  ) {

    return;

  }


  if (
    Number(answer) === -7
  ) {

    state.puzzleUnlocked.sensor =
      true;


    const returnDoor =
      rooms.sensor.querySelector(
        '[data-action="sensorReturn"]'
      );


    returnDoor.classList.remove(
      "disabled"
    );


    showDialogue(

      "CALIBRATION ACCEPTED",

      "120 → 127\n" +
      "80 → 87\n" +
      "50 → 57\n\n" +

      "세 측정값 모두 +7 cm의\n" +
      "공통 오차를 가진다.\n\n" +

      "보정값 : -7 cm\n\n" +

      "RETURN이 해제되었다."

    );

  }

  else {

    showDialogue(

      "CALIBRATION REJECTED",

      "입력한 값으로는\n" +
      "세 측정값의 공통 오차를\n" +
      "설명할 수 없다."

    );

  }

}


/* =========================================
   POWER PUZZLE
========================================= */

function solvePower() {

  const required = [
    "sensor",
    "motor",
    "cooling"
  ];


  const complete =
    required.every(
      clue =>
        state.evidence.power
          .has(clue)
    );


  if (!complete) {

    showDialogue(

      "CONSOLE LOCKED",

      "SENSOR, MOTOR, COOLING\n" +
      "기록을 먼저 조사해야 한다."

    );

    return;

  }


  const answer =
    window.prompt(

      "출구 개방에 필요한\n" +
      "안전한 전력 경로를 입력하세요.\n\n" +

      "형식 : SENSOR>MOTOR"

    );


  if (
    answer === null
  ) {

    return;

  }


  const normalized =
    answer
      .toLowerCase()
      .replace(/\s/g, "")
      .replace("→", ">");


  if (
    normalized ===
    "sensor>motor"
  ) {

    state.puzzleUnlocked.power =
      true;


    const returnDoor =
      rooms.power.querySelector(
        '[data-action="powerReturn"]'
      );


    returnDoor.classList.remove(
      "disabled"
    );


    showDialogue(

      "POWER ROUTE ACCEPTED",

      "센서는 제어를 위해\n" +
      "먼저 살아 있어야 한다.\n\n" +

      "모터는 실제 출구 구동 장치다.\n\n" +

      "냉각은 연속 운전에서만 필요하며\n" +
      "출구 장치는 짧은 펄스로 동작한다.\n\n" +

      "따라서 필요한 경로는\n\n" +

      "SENSOR → MOTOR\n\n" +

      "RETURN이 해제되었다."

    );

  }

  else {

    showDialogue(

      "POWER ROUTE REJECTED",

      "기록과 맞지 않는 경로다.\n\n" +
      "필요한 장치와 작동 조건을\n" +
      "다시 확인하라."

    );

  }

}


/* =========================================
   CONTROL PUZZLE
========================================= */

function solveControl() {

  const required = [
    "a",
    "b",
    "c"
  ];


  const complete =
    required.every(
      clue =>
        state.evidence.control
          .has(clue)
    );


  if (!complete) {

    showDialogue(

      "CONSOLE LOCKED",

      "TRACE A, B, C 세 기록을\n" +
      "모두 조사해야 한다."

    );

    return;

  }


  const answer =
    window.prompt(

      "안정 응답을 만든 제어값을 입력하세요.\n\n" +
      "형식 : Kp,Kd\n" +
      "예 : 40,60"

    );


  if (
    answer === null
  ) {

    return;

  }


  const normalized =
    answer.replace(
      /\s/g,
      ""
    );


  if (
    normalized ===
    "40,60"
  ) {

    state.puzzleUnlocked.control =
      true;


    const returnDoor =
      rooms.control.querySelector(
        '[data-action="controlReturn"]'
      );


    returnDoor.classList.remove(
      "disabled"
    );


    showDialogue(

      "CONTROLLER ACCEPTED",

      "TRACE A는 너무 공격적이다.\n" +
      "큰 overshoot와 진동이 발생한다.\n\n" +

      "TRACE C는 안정적이지만 너무 느리다.\n\n" +

      "TRACE B가 필요한 조건인\n" +
      "속도와 안정성을 동시에 만족한다.\n\n" +

      "기록에서 B의 게인은\n\n" +

      "Kp = 40\n" +
      "Kd = 60\n\n" +

      "RETURN이 해제되었다."

    );

  }

  else {

    showDialogue(

      "CONTROLLER REJECTED",

      "선택한 값이 안정 응답 기록과\n" +
      "일치하지 않는다."

    );

  }

}


/* =========================================
   RETURN TO SYSTEM
========================================= */

function returnToSystem(type) {

  if (
    !state.puzzleUnlocked[type]
  ) {

    return;

  }


  clearFile(type);


  setRoom("system");


  state.x = 150;

  state.y = 360;


  updatePlayer();


  const messages = {

    sensor:
      "센서 복구 완료.\n\n" +
      "세 기준값에서 동일한 오차를 발견하고\n" +
      "보정값을 적용했다.",

    power:
      "전력 시스템 복구 완료.\n\n" +
      "필요한 장치만 안전한 순서로 연결했다.",

    control:
      "제어 시스템 복구 완료.\n\n" +
      "빠르면서도 안정적인 응답을 선택했다."

  };


  showDialogue(

    "RECOVERY COMPLETE",

    messages[type] +
    "\n\n" +

    "원래 파일 대신\n" +

    "종이 조각 하나가 남아 있다."

  );

}


/* =========================================
   CLEAR FILE
========================================= */

function clearFile(type) {

  state.solved[type] =
    true;


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


  file.innerHTML = "";


  const paper =
    document.createElement(
      "div"
    );


  paper.className =
    "paper-fragment";


  const notes = {

    sensor: [
      "RECOVERED NOTE",
      "OFFSET -7 CM"
    ],

    power: [
      "RECOVERED NOTE",
      "SENSOR > MOTOR"
    ],

    control: [
      "RECOVERED NOTE",
      "KP 40 / KD 60"
    ]

  };


  paper.innerHTML =

    `<span>${notes[type][0]}</span>` +

    `<b>${notes[type][1]}</b>`;


  file.appendChild(
    paper
  );


  updateExit();

}


/* =========================================
   EXIT
========================================= */

function updateExit() {

  const exit =
    document.getElementById(
      "hidden-exit"
    );


  const complete =
    Object.values(
      state.solved
    ).every(Boolean);


  if (complete) {

    exit.classList.add(
      "revealed"
    );

    exit.classList.remove(
      "disabled"
    );

    exit.dataset.label =
      "EXIT";

  }

  else {

    exit.classList.remove(
      "revealed"
    );

    exit.classList.add(
      "disabled"
    );

    exit.dataset.label =
      "LOCKED";

  }

}


/* =========================================
   ENDING
========================================= */

function finishGame() {

  const complete =
    Object.values(
      state.solved
    ).every(Boolean);


  if (!complete) {

    return;

  }


  promptBox.classList.remove(
    "visible"
  );


  endingText.innerHTML =

    "세 개의 복구 기록이 하나의 순서를 만든다." +

    "<br><br>" +

    "<span>" +
    "CALIBRATE → ROUTE → STABILIZE" +
    "</span>" +

    "<br><br>" +

    "센서가 다시 정확한 값을 읽고," +

    "<br>" +

    "전력 시스템이 필요한 동력을 공급하며," +

    "<br>" +

    "제어 시스템이 시설을 안정 상태로 되돌린다." +

    "<br><br>" +

    "<b>유지보수 잠금이 해제되었다.</b>" +

    "<br><br>" +

    "탈출구가 열린다.";


  ending.classList.add(
    "visible"
  );

}


/* =========================================
   KEYBOARD
========================================= */

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


    if (
      event.code === "Space"
    ) {

      event.preventDefault();


      if (
        !spacePressed
      ) {

        interact();

      }


      spacePressed =
        true;

    }


    keys.add(key);


    if (
      event.code === "Escape"
    ) {

      if (
        dialogue.classList.contains(
          "visible"
        )
      ) {

        hideDialogue();

      }

    }

  }
);


/* =========================================
   KEYUP
========================================= */

document.addEventListener(
  "keyup",
  event => {

    keys.delete(
      event.key.toLowerCase()
    );


    if (
      event.code === "Space"
    ) {

      spacePressed =
        false;

    }

  }
);


/* =========================================
   PLAYER MOVEMENT
========================================= */

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


  let dx = 0;

  let dy = 0;


  if (
    keys.has("w") ||
    keys.has("arrowup")
  ) {

    dy -= state.speed;

  }


  if (
    keys.has("s") ||
    keys.has("arrowdown")
  ) {

    dy += state.speed;

  }


  if (
    keys.has("a") ||
    keys.has("arrowleft")
  ) {

    dx -= state.speed;

  }


  if (
    keys.has("d") ||
    keys.has("arrowright")
  ) {

    dx += state.speed;

  }


  if (
    dx === 0 &&
    dy === 0
  ) {

    return;

  }


  state.x += dx;

  state.y += dy;


  clampPlayer();


  updatePlayer();


  if (
    state.room === "intro"
  ) {

    updateIntroCamera();


    if (
      state.x >= 1950
    ) {

      enterSystem();

    }

  }


  updatePrompt();

}


/* =========================================
   INTRO → SYSTEM
========================================= */

function enterSystem() {

  if (
    state.room === "system"
  ) {

    return;

  }


  setRoom("system");


  state.x = 130;

  state.y = 360;


  player.style.transform =
    "translateX(0)";


  updatePlayer();


  showDialogue(

    "SYSTEM ONLINE",

    "유지보수 시뮬레이션에 접속했다.\n\n" +

    "하지만 정상적인 시작 화면이 나타나지 않는다.\n\n" +

    "MAINTENANCE LOCK\n" +

    "상태 : ACTIVE\n\n" +

    "중앙 아카이브에서 세 개의 손상된 기록이 발견되었다.\n\n" +

    "기록을 복구하면 잠금이 해제될 수 있다."

  );

}


/* =========================================
   MAIN LOOP
========================================= */

function gameLoop() {

  movePlayer();

  requestAnimationFrame(
    gameLoop
  );

}


/* =========================================
   INITIALIZATION
========================================= */

setRoom("intro");


state.x = 100;

state.y =
  Math.round(
    window.innerHeight * 0.5
  );


updatePlayer();

updateHUD();

updateExit();

updateIntroCamera();

gameLoop();
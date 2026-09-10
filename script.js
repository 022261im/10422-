/* =========================================================
   REBOOT
   Main Game Script
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const game = document.getElementById("game");
const player = document.getElementById("player");

const dialogue = document.getElementById("dialogue");
const dialogueTitle = document.getElementById("dialogue-title");
const dialogueText = document.getElementById("dialogue-text");
const dialogueClose = document.getElementById("dialogue-close");

const interactionPrompt = document.getElementById("interaction-prompt");

const chapterText = document.getElementById("chapter");
const objectiveText = document.getElementById("objective");
const statusText = document.getElementById("status");

const ending = document.getElementById("ending");
const endingText = document.getElementById("ending-text");


/* =========================================================
   ROOMS
   ========================================================= */

const rooms = {
    intro: document.getElementById("room-intro"),
    system: document.getElementById("room-system"),
    sensor: document.getElementById("room-sensor"),
    power: document.getElementById("room-power"),
    control: document.getElementById("room-control")
};


/* =========================================================
   GAME STATE
   ========================================================= */

let currentRoom = "intro";

let playerX = 120;
let playerY = 300;

const playerWidth = 30;
const playerHeight = 34;

const speed = 4;


/* =========================================================
   KEY STATE
   ========================================================= */

const keys = {};

let spaceDown = false;


/* =========================================================
   PUZZLE STATE
   ========================================================= */

const solved = {
    sensor: false,
    power: false,
    control: false
};


const evidence = {
    sensor: new Set(),
    power: new Set(),
    control: new Set()
};


const unlocked = {
    sensor: false,
    power: false,
    control: false
};


/* =========================================================
   ROOM SIZE
   ========================================================= */

const ROOM_WIDTH = {
    intro: 2200,
    system: 1400,
    sensor: 1300,
    power: 1300,
    control: 1300
};

const ROOM_HEIGHT = 700;


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    const data = {

        intro: {
            chapter: "BOOT SEQUENCE",
            objective: "Reach the system terminal."
        },

        system: {
            chapter: "ARCHIVE NODE",
            objective: "Recover the three corrupted maintenance files."
        },

        sensor: {
            chapter: "FILE 01 // SENSOR",
            objective: "Find the common measurement error."
        },

        power: {
            chapter: "FILE 02 // POWER",
            objective: "Infer the safe power route."
        },

        control: {
            chapter: "FILE 03 // CONTROL",
            objective: "Identify the stable controller."
        }

    };


    const info = data[currentRoom];

    if (!info) return;


    chapterText.textContent =
        info.chapter;


    objectiveText.textContent =
        info.objective;


    const count =
        Number(solved.sensor) +
        Number(solved.power) +
        Number(solved.control);


    statusText.textContent =
        `${count}/3 RECOVERED`;

}


/* =========================================================
   ROOM SWITCH
   ========================================================= */

function switchRoom(roomName) {

    if (!rooms[roomName]) {
        return;
    }


    Object.values(rooms).forEach(room => {

        room.classList.remove("active");

    });


    rooms[roomName].classList.add("active");


    currentRoom = roomName;


    /* 카메라 초기화 */

    const introSpace =
        document.querySelector(".intro-space");

    if (introSpace) {

        introSpace.style.transform =
            "translateX(0)";

    }


    player.style.transform =
        "translateX(0)";


    updateHUD();

    updatePrompt();

}


/* =========================================================
   PLAYER POSITION
   ========================================================= */

function setPlayerPosition(x, y) {

    playerX = x;
    playerY = y;

    updatePlayerPosition();

}


/* =========================================================
   PLAYER POSITION UPDATE
   ========================================================= */

function updatePlayerPosition() {

    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;

}


/* =========================================================
   INTRO CAMERA
   ========================================================= */

function updateIntroCamera() {

    if (currentRoom !== "intro") {
        return;
    }


    const introSpace =
        document.querySelector(".intro-space");


    if (!introSpace) {
        return;
    }


    const viewportWidth =
        game.clientWidth;


    const maximumCamera =
        Math.max(
            0,
            ROOM_WIDTH.intro - viewportWidth
        );


    let cameraX =
        playerX -
        viewportWidth * 0.35;


    cameraX =
        Math.max(
            0,
            Math.min(
                maximumCamera,
                cameraX
            )
        );


    /* 배경 이동 */

    introSpace.style.transform =
        `translateX(${-cameraX}px)`;


    /* 캐릭터 화면 위치 */

    player.style.left =
        `${playerX - cameraX}px`;

    player.style.top =
        `${playerY}px`;

}


/* =========================================================
   PLAYER LIMIT
   ========================================================= */

function limitPlayerPosition() {

    const currentWidth =
        ROOM_WIDTH[currentRoom];


    let maxX;


    /*
       INTRO에서는 실제 공간 전체를 사용
    */

    if (currentRoom === "intro") {

        maxX =
            currentWidth -
            playerWidth -
            20;

    }

    /*
       다른 방에서는 화면 안에서 움직임
    */

    else {

        maxX =
            Math.min(
                currentWidth,
                game.clientWidth
            ) -
            playerWidth -
            20;

    }


    const maxY =
        Math.min(
            ROOM_HEIGHT,
            game.clientHeight
        ) -
        playerHeight -
        30;


    playerX =
        Math.max(
            20,
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
   PLAYER MOVEMENT
   ========================================================= */

function movePlayer() {

    if (
        dialogue.classList.contains("visible")
    ) {
        return;
    }


    if (
        ending.classList.contains("visible")
    ) {
        return;
    }


    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy -= speed;
    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy += speed;
    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx -= speed;
    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx += speed;
    }


    if (
        dx === 0 &&
        dy === 0
    ) {
        return;
    }


    playerX += dx;
    playerY += dy;


    limitPlayerPosition();


    if (currentRoom === "intro") {

        updateIntroCamera();

    }

    else {

        updatePlayerPosition();

    }


    updatePrompt();


    /*
       INTRO → SYSTEM
    */

    if (
        currentRoom === "intro" &&
        playerX >= 1800
    ) {

        enterSystem();

    }

}


/* =========================================================
   ENTER SYSTEM
   ========================================================= */

function enterSystem() {

    if (currentRoom !== "intro") {
        return;
    }


    switchRoom("system");


    setPlayerPosition(
        120,
        360
    );


    showDialogue(
        "SYSTEM ONLINE",

        "유지보수 시뮬레이션에 접속했다.\n\n" +

        "하지만 정상적인 시작 화면 대신\n" +
        "MAINTENANCE LOCK 상태가 활성화되어 있다.\n\n" +

        "중앙 아카이브에서 세 개의 손상된 유지보수 기록이 발견되었다.\n\n" +

        "기록을 복구하면 시스템 잠금을 해제할 수 있을 것 같다."
    );

}


/* =========================================================
   DIALOGUE
   ========================================================= */

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


dialogue.addEventListener(
    "click",
    event => {

        if (
            event.target === dialogue
        ) {

            closeDialogue();

        }

    }
);


/* =========================================================
   INTERACTABLES
   ========================================================= */

function getInteractables() {

    const room =
        rooms[currentRoom];


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
   OBJECT POSITION
   ========================================================= */

function getObjectCenter(element) {

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

function getDistance(element) {

    const object =
        getObjectCenter(element);


    const playerCenter = {

        x:
            playerX +
            playerWidth / 2,

        y:
            playerY +
            playerHeight / 2

    };


    return Math.hypot(

        playerCenter.x -
        object.x,

        playerCenter.y -
        object.y

    );

}


/* =========================================================
   FIND NEAREST
   ========================================================= */

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
        nearestDistance <= 110
    ) {

        return nearest;

    }


    return null;

}


/* =========================================================
   INTERACTION PROMPT
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


    if (
        ending.classList.contains(
            "visible"
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
            "INTERACT"
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


    const actionName =
        target.dataset.action;


    const action =
        actions[actionName];


    if (
        typeof action ===
        "function"
    ) {

        action(target);

    }

}


/* =========================================================
   ACTIONS
   ========================================================= */

const actions = {


    /* -----------------------------------------
       FILES
    ----------------------------------------- */

    openSensor: function () {

        openPuzzle("sensor");

    },


    openPower: function () {

        openPuzzle("power");

    },


    openControl: function () {

        openPuzzle("control");

    },


    /* -----------------------------------------
       EXIT
    ----------------------------------------- */

    exit: function () {

        const complete =
            solved.sensor &&
            solved.power &&
            solved.control;


        if (!complete) {

            return;

        }


        finishGame();

    },


    /* -----------------------------------------
       SENSOR
    ----------------------------------------- */

    sensorA: function (element) {

        inspect(
            "sensor",
            "a",
            element.dataset.text
        );

    },


    sensorB: function (element) {

        inspect(
            "sensor",
            "b",
            element.dataset.text
        );

    },


    sensorC: function (element) {

        inspect(
            "sensor",
            "c",
            element.dataset.text
        );

    },


    sensorConsole: function () {

        solveSensor();

    },


    sensorReturn: function () {

        returnToSystem("sensor");

    },


    /* -----------------------------------------
       POWER
    ----------------------------------------- */

    powerSensor: function (element) {

        inspect(
            "power",
            "sensor",
            element.dataset.text
        );

    },


    powerMotor: function (element) {

        inspect(
            "power",
            "motor",
            element.dataset.text
        );

    },


    powerCooling: function (element) {

        inspect(
            "power",
            "cooling",
            element.dataset.text
        );

    },


    powerConsole: function () {

        solvePower();

    },


    powerReturn: function () {

        returnToSystem("power");

    },


    /* -----------------------------------------
       CONTROL
    ----------------------------------------- */

    controlA: function (element) {

        inspect(
            "control",
            "a",
            element.dataset.text
        );

    },


    controlB: function (element) {

        inspect(
            "control",
            "b",
            element.dataset.text
        );

    },


    controlC: function (element) {

        inspect(
            "control",
            "c",
            element.dataset.text
        );

    },


    controlConsole: function () {

        solveControl();

    },


    controlReturn: function () {

        returnToSystem("control");

    }

};


/* =========================================================
   OPEN PUZZLE
   ========================================================= */

function openPuzzle(type) {

    if (
        solved[type]
    ) {

        showDialogue(

            "RECOVERED FILE",

            "이 기록은 이미 복구되었다.\n\n" +
            "원래 파일 대신 종이 조각만 남아 있다."

        );

        return;

    }


    switchRoom(type);


    setPlayerPosition(
        100,
        530
    );


    const messages = {

        sensor:

            "CALIBRATION CHAMBER에 진입했다.\n\n" +

            "세 개의 측정 지점이 남아 있다.\n\n" +

            "각 기준값과 센서 측정값을 비교해\n" +

            "공통으로 나타나는 오차를 찾아라.",


        power:

            "POWER DISTRIBUTION BAY에 진입했다.\n\n" +

            "메인 버스의 최대 용량은 70%다.\n\n" +

            "각 장치의 역할과 작동 조건을 조사해서\n" +

            "안전한 전력 경로를 찾아라.",


        control:

            "CONTROL LAB에 진입했다.\n\n" +

            "서로 다른 세 개의 응답 기록이 남아 있다.\n\n" +

            "빠르기만 한 제어기는 좋은 제어기가 아니다.\n\n" +

            "속도와 안정성을 함께 판단하라."

    };


    showDialogue(
        `FILE ${type.toUpperCase()}`,
        messages[type]
    );

}


/* =========================================================
   INSPECT
   ========================================================= */

function inspect(
    type,
    clue,
    text
) {

    evidence[type].add(
        clue
    );


    showDialogue(

        `EVIDENCE // ${clue.toUpperCase()}`,

        text ||
        "특별한 정보는 없는 것 같다."

    );

}


/* =========================================================
   SENSOR SOLUTION
   ========================================================= */

function solveSensor() {

    const required = [
        "a",
        "b",
        "c"
    ];


    const complete =
        required.every(
            clue =>
                evidence.sensor.has(
                    clue
                )
        );


    if (!complete) {

        showDialogue(

            "CONSOLE LOCKED",

            "A, B, C 세 지점을\n" +
            "모두 조사해야 한다."

        );

        return;

    }


    const answer =
        window.prompt(

            "센서의 공통 보정값을 입력하세요.\n\n" +
            "단위 : cm"

        );


    if (
        answer === null
    ) {
        return;
    }


    if (
        Number(answer) === -7
    ) {

        unlocked.sensor =
            true;


        const door =
            rooms.sensor.querySelector(
                '[data-action="sensorReturn"]'
            );


        if (door) {

            door.classList.remove(
                "disabled"
            );

            door.dataset.label =
                "RETURN TO ARCHIVE";

        }


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

            "입력값이 세 측정값의\n" +
            "공통 오차와 일치하지 않는다."

        );

    }

}


/* =========================================================
   POWER SOLUTION
   ========================================================= */

function solvePower() {

    const required = [
        "sensor",
        "motor",
        "cooling"
    ];


    const complete =
        required.every(
            clue =>
                evidence.power.has(
                    clue
                )
        );


    if (!complete) {

        showDialogue(

            "CONSOLE LOCKED",

            "SENSOR, MOTOR, COOLING의\n" +
            "기록을 먼저 조사해야 한다."

        );

        return;

    }


    const answer =
        window.prompt(

            "출구 개방을 위한 안전한 전력 경로를 입력하세요.\n\n" +
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

        unlocked.power =
            true;


        const door =
            rooms.power.querySelector(
                '[data-action="powerReturn"]'
            );


        if (door) {

            door.classList.remove(
                "disabled"
            );

            door.dataset.label =
                "RETURN TO ARCHIVE";

        }


        showDialogue(

            "POWER ROUTE ACCEPTED",

            "센서는 제어 신호를 제공한다.\n\n" +

            "모터는 출구를 실제로 구동한다.\n\n" +

            "냉각은 연속 운전에서만 필요하고\n" +

            "출구 장치는 짧은 펄스로 동작한다.\n\n" +

            "따라서 필요한 경로는\n\n" +

            "SENSOR → MOTOR\n\n" +

            "RETURN이 해제되었다."

        );

    }

    else {

        showDialogue(

            "POWER ROUTE REJECTED",

            "기록에 존재하는 작동 조건과\n" +
            "맞지 않는 경로다."

        );

    }

}


/* =========================================================
   CONTROL SOLUTION
   ========================================================= */

function solveControl() {

    const required = [
        "a",
        "b",
        "c"
    ];


    const complete =
        required.every(
            clue =>
                evidence.control.has(
                    clue
                )
        );


    if (!complete) {

        showDialogue(

            "CONSOLE LOCKED",

            "TRACE A, B, C를\n" +
            "모두 조사해야 한다."

        );

        return;

    }


    const answer =
        window.prompt(

            "안정적인 제어 설정값을 입력하세요.\n\n" +
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

        unlocked.control =
            true;


        const door =
            rooms.control.querySelector(
                '[data-action="controlReturn"]'
            );


        if (door) {

            door.classList.remove(
                "disabled"
            );

            door.dataset.label =
                "RETURN TO ARCHIVE";

        }


        showDialogue(

            "CONTROLLER ACCEPTED",

            "TRACE A는 너무 공격적이며\n" +
            "큰 overshoot와 진동이 발생한다.\n\n" +

            "TRACE C는 지나치게 느리다.\n\n" +

            "TRACE B가 속도와 안정성을\n" +
            "동시에 만족한다.\n\n" +

            "기록된 설정값은\n\n" +

            "Kp = 40\n" +
            "Kd = 60\n\n" +

            "RETURN이 해제되었다."

        );

    }

    else {

        showDialogue(

            "CONTROLLER REJECTED",

            "입력한 게인이\n" +
            "안정 응답과 일치하지 않는다."

        );

    }

}


/* =========================================================
   RETURN TO SYSTEM
   ========================================================= */

function returnToSystem(type) {

    if (
        !unlocked[type]
    ) {
        return;
    }


    solved[type] =
        true;


    convertFile(type);


    switchRoom("system");


    setPlayerPosition(
        150,
        360
    );


    const messages = {

        sensor:
            "센서 시스템이 복구되었다.\n\n" +
            "공통 오차를 발견하고 보정값을 적용했다.",

        power:
            "전력 시스템이 복구되었다.\n\n" +
            "필요한 장치만 안전한 경로로 연결했다.",

        control:
            "제어 시스템이 복구되었다.\n\n" +
            "빠르면서도 안정적인 응답을 선택했다."

    };


    showDialogue(

        "RECOVERY COMPLETE",

        messages[type] +

        "\n\n" +

        "파일이 사라지고\n" +
        "종이 조각 하나가 남았다."

    );


    updateHUD();

    updateExit();

}


/* =========================================================
   FILE → PAPER
   ========================================================= */

function convertFile(type) {

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


    file.dataset.label =
        "";


    file.innerHTML =
        "";


    const paper =
        document.createElement(
            "div"
        );


    paper.className =
        "paper-fragment";


    const content = {

        sensor:
            [
                "RECOVERED NOTE",
                "OFFSET -7 CM"
            ],

        power:
            [
                "RECOVERED NOTE",
                "SENSOR > MOTOR"
            ],

        control:
            [
                "RECOVERED NOTE",
                "KP 40 / KD 60"
            ]

    };


    paper.innerHTML =

        `<span>${content[type][0]}</span>` +

        `<b>${content[type][1]}</b>`;


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


    if (!exit) {
        return;
    }


    const complete =
        solved.sensor &&
        solved.power &&
        solved.control;


    if (complete) {

        exit.classList.remove(
            "disabled"
        );

        exit.classList.add(
            "revealed"
        );

        exit.dataset.label =
            "OPEN EXIT";

    }

    else {

        exit.classList.add(
            "disabled"
        );

        exit.classList.remove(
            "revealed"
        );

        exit.dataset.label =
            "LOCKED";

    }

}


/* =========================================================
   ENDING
   ========================================================= */

function finishGame() {

    const complete =
        solved.sensor &&
        solved.power &&
        solved.control;


    if (!complete) {
        return;
    }


    interactionPrompt.classList.remove(
        "visible"
    );


    endingText.innerHTML =

        "세 개의 복구 기록이 하나의 순서를 만들었다." +

        "<br><br>" +

        "<span>" +
        "CALIBRATE → ROUTE → STABILIZE" +
        "</span>" +

        "<br><br>" +

        "센서가 정확한 값을 읽고," +

        "<br>" +

        "전력 시스템이 필요한 동력을 공급하며," +

        "<br>" +

        "제어 시스템이 시설을 안정 상태로 되돌린다." +

        "<br><br>" +

        "<b>MAINTENANCE LOCK : RELEASED</b>" +

        "<br><br>" +

        "출구가 열렸다.";


    ending.classList.add(
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


        /*
           방향키 페이지 스크롤 방지
        */

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright"
            ].includes(key)
        ) {

            event.preventDefault();

        }


        /*
           WASD
        */

        keys[key] =
            true;


        /*
           SPACE
        */

        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (!spaceDown) {

                interact();

            }


            spaceDown =
                true;

        }


        /*
           ESC
        */

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

        limitPlayerPosition();


        if (
            currentRoom === "intro"
        ) {

            updateIntroCamera();

        }

        else {

            updatePlayerPosition();

        }


        updatePrompt();

    }
);


/* =========================================================
   MAIN LOOP
   ========================================================= */

function gameLoop() {

    movePlayer();

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

switchRoom("intro");


setPlayerPosition(
    120,
    Math.round(
        game.clientHeight * 0.5
    )
);


updateHUD();

updateExit();

updateIntroCamera();

updatePrompt();


gameLoop();
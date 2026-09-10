/* =========================================
   REBOOT - GAME SCRIPT
   ========================================= */

const player = document.getElementById("player");
const introArea = document.getElementById("intro-area");
const systemArea = document.getElementById("system-area");

const sensorRoom = document.getElementById("puzzle-sensor");
const powerRoom = document.getElementById("puzzle-power");
const controlRoom = document.getElementById("puzzle-control");
const finalRoom = document.getElementById("puzzle-final");

const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");
const messageClose = document.getElementById("message-close");

const hiddenExit = document.getElementById("hidden-exit");

let currentRoom = "intro";

let playerX = 120;
let playerY = 300;

let keys = {};

let cleared = {
    sensor: false,
    power: false,
    control: false
};


/* =========================================
   플레이어 기본 설정
   ========================================= */

const PLAYER_SPEED = 4;

function updatePlayer() {
    if (!player) return;

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}


/* =========================================
   키보드 입력
   ========================================= */

document.addEventListener("keydown", function (event) {

    keys[event.key.toLowerCase()] = true;

    // SPACE
    if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        interact();
    }
});


document.addEventListener("keyup", function (event) {
    keys[event.key.toLowerCase()] = false;
});


/* =========================================
   게임 루프
   ========================================= */

function gameLoop() {

    if (
        currentRoom === "intro" ||
        currentRoom === "system"
    ) {
        movePlayer();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();


/* =========================================
   플레이어 이동
   ========================================= */

function movePlayer() {

    if (!player) return;

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) {
        dy -= PLAYER_SPEED;
    }

    if (keys["s"] || keys["arrowdown"]) {
        dy += PLAYER_SPEED;
    }

    if (keys["a"] || keys["arrowleft"]) {
        dx -= PLAYER_SPEED;
    }

    if (keys["d"] || keys["arrowright"]) {
        dx += PLAYER_SPEED;
    }

    playerX += dx;
    playerY += dy;

    /* -------------------------------------
       INTRO 범위
       ------------------------------------- */

    if (currentRoom === "intro") {

        playerX = Math.max(30, Math.min(window.innerWidth - 70, playerX));
        playerY = Math.max(50, Math.min(window.innerHeight - 100, playerY));

        updatePlayer();

        checkSystemEntrance();
    }


    /* -------------------------------------
       SYSTEM 방 범위
       ------------------------------------- */

    if (currentRoom === "system") {

        playerX = Math.max(30, Math.min(window.innerWidth - 70, playerX));
        playerY = Math.max(100, Math.min(window.innerHeight - 100, playerY));

        updatePlayer();
    }
}


/* =========================================
   SYSTEM 진입
   ========================================= */

function checkSystemEntrance() {

    // 화면 오른쪽에 도착하면 SYSTEM으로 이동
    if (playerX > window.innerWidth - 140) {
        enterSystem();
    }
}


/* =========================================
   INTRO → SYSTEM
   ========================================= */

function enterSystem() {

    currentRoom = "system";

    if (introArea) {
        introArea.style.display = "none";
    }

    if (systemArea) {
        systemArea.style.display = "block";
    }

    playerX = 100;
    playerY = window.innerHeight / 2;

    updatePlayer();

    updateExit();

    showMessage("SYSTEM", "오래된 시스템 파일이 남아 있다.");
}


/* =========================================
   오브젝트 찾기
   ========================================= */

function getObjects() {

    if (currentRoom !== "system") {
        return [];
    }

    return [
        document.getElementById("file-sensor"),
        document.getElementById("file-power"),
        document.getElementById("file-control"),
        hiddenExit
    ].filter(Boolean);
}


/* =========================================
   가장 가까운 오브젝트
   ========================================= */

function getNearestObject() {

    const objects = getObjects();

    let nearest = null;
    let nearestDistance = Infinity;

    objects.forEach(function (object) {

        const rect = object.getBoundingClientRect();

        const objectX = rect.left + rect.width / 2;
        const objectY = rect.top + rect.height / 2;

        const dx = playerX + 25 - objectX;
        const dy = playerY + 25 - objectY;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = object;
        }
    });

    if (nearestDistance < 100) {
        return nearest;
    }

    return null;
}


/* =========================================
   SPACE 상호작용
   ========================================= */

function interact() {

    /* -------------------------------------
       SYSTEM
       ------------------------------------- */

    if (currentRoom === "system") {

        const object = getNearestObject();

        if (!object) return;

        const fileType = object.dataset.file;

        if (fileType === "sensor") {
            enterPuzzle("sensor");
            return;
        }

        if (fileType === "power") {
            enterPuzzle("power");
            return;
        }

        if (fileType === "control") {
            enterPuzzle("control");
            return;
        }

        if (
            object === hiddenExit &&
            cleared.sensor &&
            cleared.power &&
            cleared.control
        ) {
            enterFinal();
            return;
        }
    }
}


/* =========================================
   퍼즐 방 진입
   ========================================= */

function enterPuzzle(type) {

    currentRoom = type;

    hideAllRooms();

    if (type === "sensor" && sensorRoom) {
        sensorRoom.style.display = "block";
    }

    if (type === "power" && powerRoom) {
        powerRoom.style.display = "block";
    }

    if (type === "control" && controlRoom) {
        controlRoom.style.display = "block";
    }

    resetPuzzle(type);
}


/* =========================================
   모든 방 숨기기
   ========================================= */

function hideAllRooms() {

    if (introArea) introArea.style.display = "none";
    if (systemArea) systemArea.style.display = "none";

    if (sensorRoom) sensorRoom.style.display = "none";
    if (powerRoom) powerRoom.style.display = "none";
    if (controlRoom) controlRoom.style.display = "none";
    if (finalRoom) finalRoom.style.display = "none";
}


/* =========================================
   퍼즐 상태
   ========================================= */

let puzzleState = {

    sensor: {
        inspected: [],
        solved: false
    },

    power: {
        inspected: [],
        solved: false
    },

    control: {
        inspected: [],
        solved: false
    }
};


/* =========================================
   퍼즐 초기화
   ========================================= */

function resetPuzzle(type) {

    if (!puzzleState[type]) return;

    puzzleState[type].inspected = [];

    showMessage(
        "SYSTEM",
        "주변을 조사해서 단서를 찾아라."
    );
}


/* =========================================
   퍼즐 오브젝트 조사
   ========================================= */

document.addEventListener("click", function (event) {

    const target = event.target.closest("[data-clue]");

    if (!target) return;

    const clue = target.dataset.clue;

    const parentRoom = target.closest(
        "#puzzle-sensor, #puzzle-power, #puzzle-control"
    );

    if (!parentRoom) return;

    inspectClue(
        target,
        clue
    );
});


/* =========================================
   단서 조사
   ========================================= */

function inspectClue(object, clue) {

    let type = null;

    if (object.closest("#puzzle-sensor")) {
        type = "sensor";
    }

    if (object.closest("#puzzle-power")) {
        type = "power";
    }

    if (object.closest("#puzzle-control")) {
        type = "control";
    }

    if (!type) return;

    const index = clue;

    if (!puzzleState[type].inspected.includes(index)) {

        puzzleState[type].inspected.push(index);
    }

    const text =
        object.dataset.text ||
        "특별한 정보는 없는 것 같다.";

    showMessage(
        "조사",
        text
    );
}


/* =========================================
   메시지 창
   ========================================= */

function showMessage(title, text) {

    if (!messageBox || !messageText) return;

    messageBox.style.display = "block";

    messageText.innerHTML =
        "<strong>" +
        title +
        "</strong><br><br>" +
        text;
}


function closeMessage() {

    if (!messageBox) return;

    messageBox.style.display = "none";
}


if (messageClose) {
    messageClose.addEventListener(
        "click",
        closeMessage
    );
}


/* =========================================
   SENSOR 퍼즐
   ========================================= */

function solveSensor() {

    if (
        !puzzleState.sensor.inspected.includes("A") ||
        !puzzleState.sensor.inspected.includes("B") ||
        !puzzleState.sensor.inspected.includes("C")
    ) {

        showMessage(
            "SYSTEM",
            "아직 조사하지 않은 측정값이 있다."
        );

        return;
    }

    const answer = prompt(
        "세 측정값에 공통으로 존재하는 오차를 입력하세요."
    );

    if (answer === null) return;

    if (Number(answer) === -7) {

        cleared.sensor = true;

        puzzleState.sensor.solved = true;

        showMessage(
            "CALIBRATION COMPLETE",
            "센서 오차가 보정되었다."
        );

        setTimeout(returnToSystem, 1000);

    } else {

        showMessage(
            "ERROR",
            "보정값이 맞지 않는다."
        );
    }
}


/* =========================================
   POWER 퍼즐
   ========================================= */

function solvePower() {

    if (
        !puzzleState.power.inspected.includes("sensor") ||
        !puzzleState.power.inspected.includes("motor") ||
        !puzzleState.power.inspected.includes("cooling")
    ) {

        showMessage(
            "SYSTEM",
            "전력 시스템의 구성 요소를 모두 조사해야 한다."
        );

        return;
    }

    const answer = prompt(
        "작동에 반드시 필요한 장치를 순서 없이 입력하세요.\n예: sensor,motor"
    );

    if (answer === null) return;

    const cleaned =
        answer
            .toLowerCase()
            .replace(/\s/g, "");

    if (
        cleaned === "sensor,motor" ||
        cleaned === "motor,sensor"
    ) {

        cleared.power = true;

        puzzleState.power.solved = true;

        showMessage(
            "POWER RESTORED",
            "필수 전력 라인이 복구되었다."
        );

        setTimeout(returnToSystem, 1000);

    } else {

        showMessage(
            "ERROR",
            "전력 분배 조건이 맞지 않는다."
        );
    }
}


/* =========================================
   CONTROL 퍼즐
   ========================================= */

function solveControl() {

    if (
        !puzzleState.control.inspected.includes("low") ||
        !puzzleState.control.inspected.includes("medium") ||
        !puzzleState.control.inspected.includes("high")
    ) {

        showMessage(
            "SYSTEM",
            "제어 응답 데이터를 모두 확인해야 한다."
        );

        return;
    }

    const answer = prompt(
        "안정적인 제어 설정값을 입력하세요.\nKp 값만 입력."
    );

    if (answer === null) return;

    if (Number(answer) === 40) {

        cleared.control = true;

        puzzleState.control.solved = true;

        showMessage(
            "CONTROL RESTORED",
            "제어 시스템의 안정성이 회복되었다."
        );

        setTimeout(returnToSystem, 1000);

    } else {

        showMessage(
            "ERROR",
            "제어 계수가 불안정하다."
        );
    }
}


/* =========================================
   퍼즐 방 버튼 연결
   ========================================= */

const sensorSolveButton =
    document.getElementById("sensor-solve");

const powerSolveButton =
    document.getElementById("power-solve");

const controlSolveButton =
    document.getElementById("control-solve");


if (sensorSolveButton) {
    sensorSolveButton.addEventListener(
        "click",
        solveSensor
    );
}

if (powerSolveButton) {
    powerSolveButton.addEventListener(
        "click",
        solvePower
    );
}

if (controlSolveButton) {
    controlSolveButton.addEventListener(
        "click",
        solveControl
    );
}


/* =========================================
   SYSTEM으로 돌아오기
   ========================================= */

function returnToSystem() {

    hideAllRooms();

    currentRoom = "system";

    if (systemArea) {
        systemArea.style.display = "block";
    }

    playerX = 150;
    playerY = window.innerHeight / 2;

    updatePlayer();

    convertClearedFiles();

    updateExit();
}


/* =========================================
   클리어한 파일 → 종이 조각
   ========================================= */

function convertClearedFiles() {

    const files = [

        {
            id: "file-sensor",
            solved: cleared.sensor,
            text: "+7 cm OFFSET\nCALIBRATED"
        },

        {
            id: "file-power",
            solved: cleared.power,
            text: "SENSOR + MOTOR\nPOWER RESTORED"
        },

        {
            id: "file-control",
            solved: cleared.control,
            text: "STABLE RESPONSE\nKp = 40"
        }

    ];


    files.forEach(function (file) {

        const element =
            document.getElementById(file.id);

        if (!element) return;

        if (file.solved) {

            element.classList.add("cleared");

            element.innerHTML =
                "<div class='paper'>" +
                file.text.replace("\n", "<br>") +
                "</div>";

            element.removeAttribute("data-file");
        }
    });
}


/* =========================================
   EXIT 등장
   ========================================= */

function updateExit() {

    if (!hiddenExit) return;

    if (
        cleared.sensor &&
        cleared.power &&
        cleared.control
    ) {

        hiddenExit.style.display = "block";

    } else {

        hiddenExit.style.display = "none";
    }
}


/* =========================================
   FINAL
   ========================================= */

function enterFinal() {

    currentRoom = "final";

    hideAllRooms();

    if (finalRoom) {
        finalRoom.style.display = "block";
    }

    showMessage(
        "SYSTEM",
        "모든 복구 작업이 완료되었다."
    );
}


/* =========================================
   초기 상태
   ========================================= */

hideAllRooms();

if (introArea) {
    introArea.style.display = "block";
}

currentRoom = "intro";

playerX = 100;
playerY = window.innerHeight / 2;

updatePlayer();
/* ===================================
   BASIC SETUP
=================================== */

const game = document.getElementById("game");
const world = document.getElementById("game-world");
const player = document.getElementById("player");

const dialogueText = document.getElementById("dialogue-text");

const distanceValue = document.getElementById("distance-value");
const distanceGauge = document.getElementById("distance-gauge");

const fileObjects = document.querySelectorAll(".file-object");

const keys = {};

const speed = 4;


/* ===================================
   PLAYER POSITION
=================================== */

let playerX = game.clientWidth / 2;
let playerY = game.clientHeight * 0.75;


/* ===================================
   GAME STATE
=================================== */

let gameMode = "main";

let systemMessageCooldown = 0;

let enteredFileSpace = false;


/* ===================================
   KEYBOARD
=================================== */

document.addEventListener("keydown", (event) => {

    const key = event.key.toLowerCase();

    keys[key] = true;


    /* SPACE */

    if (event.code === "Space") {

        event.preventDefault();

        interact();
    }

});


document.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


/* ===================================
   PLAYER MOVEMENT
=================================== */

function updatePlayer() {

    let moving = false;


    if (keys["w"] || keys["arrowup"]) {

        playerY -= speed;

        moving = true;
    }


    if (keys["s"] || keys["arrowdown"]) {

        playerY += speed;

        moving = true;
    }


    if (keys["a"] || keys["arrowleft"]) {

        playerX -= speed;

        moving = true;
    }


    if (keys["d"] || keys["arrowright"]) {

        playerX += speed;

        moving = true;
    }


    /* ===================================
       SCREEN LIMIT
    =================================== */

    const halfWidth = player.offsetWidth / 2;
    const halfHeight = player.offsetHeight / 2;


    playerX = Math.max(
        halfWidth,
        Math.min(
            game.clientWidth - halfWidth,
            playerX
        )
    );


    playerY = Math.max(
        halfHeight,
        Math.min(
            game.clientHeight - halfHeight,
            playerY
        )
    );


    player.style.left = playerX + "px";
    player.style.top = playerY + "px";


    /* ===================================
       WORLD CHECK
    =================================== */

    if (gameMode === "main") {

        checkWrongWay();

        updateDistanceToGate();

        checkSystemGate();
    }


    if (gameMode === "file") {

        updateFileDistance();
    }


    if (moving) {

        updateCooldown();
    }
}


/* ===================================
   WRONG WAY
=================================== */

function checkWrongWay() {

    if (systemMessageCooldown > 0) {
        return;
    }


    /*
        플레이어가 오른쪽 아래나
        너무 바깥쪽으로 이동했을 경우
    */

    if (
        playerX > game.clientWidth * 0.70 &&
        playerY > game.clientHeight * 0.62
    ) {

        showMessage("여긴 아닌 것 같다.");

        systemMessageCooldown = 90;

        return;
    }


    /*
        왼쪽 위로 너무 멀리 갔을 경우
    */

    if (
        playerX < game.clientWidth * 0.12 &&
        playerY < game.clientHeight * 0.25
    ) {

        showMessage("아무것도 없다.");

        systemMessageCooldown = 90;

        return;
    }


    /*
        아래쪽으로 크게 벗어나는 경우
    */

    if (
        playerY > game.clientHeight * 0.90
    ) {

        showMessage("돌아가는 길은 아닌 것 같다.");

        systemMessageCooldown = 90;
    }

}


/* ===================================
   COOLDOWN
=================================== */

function updateCooldown() {

    if (systemMessageCooldown > 0) {

        systemMessageCooldown--;
    }
}


/* ===================================
   DISTANCE TO SYSTEM GATE
=================================== */

function updateDistanceToGate() {

    const gateX = game.clientWidth * 0.64;
    const gateY = game.clientHeight * 0.20;


    const distance = Math.sqrt(
        Math.pow(playerX - gateX, 2) +
        Math.pow(playerY - gateY, 2)
    );


    const roundedDistance = Math.round(distance);


    distanceValue.textContent =
        roundedDistance + "px";


    /*
        거리가 가까울수록
        게이지가 줄어든다.
    */

    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                100 - roundedDistance / 8
            )
        );


    distanceGauge.style.width =
        percentage + "%";
}


/* ===================================
   SYSTEM GATE
=================================== */

function checkSystemGate() {

    const gateX = game.clientWidth * 0.64;
    const gateY = game.clientHeight * 0.20;


    const distance = Math.sqrt(
        Math.pow(playerX - gateX, 2) +
        Math.pow(playerY - gateY, 2)
    );


    if (distance < 55) {

        if (!enteredFileSpace) {

            dialogueText.textContent =
                "SYSTEM에 접근하고 있다...";

        }


        if (distance < 35) {

            enterFileSpace();
        }

    }

}


/* ===================================
   ENTER FILE SPACE
=================================== */

function enterFileSpace() {

    if (enteredFileSpace) {
        return;
    }


    enteredFileSpace = true;

    gameMode = "file";


    game.classList.add("file-mode");


    /*
        새로운 위치에서 시작
    */

    playerX = game.clientWidth * 0.15;
    playerY = game.clientHeight * 0.78;


    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";


    showMessage(
        "SYSTEM에 접속했다. 이곳은... 파일 시스템인가?"
    );
}


/* ===================================
   FILE OBJECT INTERACTION
=================================== */

function interactWithFileObject() {

    let nearestObject = null;

    let nearestDistance = Infinity;


    fileObjects.forEach((object) => {

        const rect =
            object.getBoundingClientRect();


        const objectX =
            rect.left + rect.width / 2;

        const objectY =
            rect.top + rect.height / 2;


        const distance =
            Math.sqrt(
                Math.pow(
                    playerX - objectX,
                    2
                ) +
                Math.pow(
                    playerY - objectY,
                    2
                )
            );


        if (
            distance < nearestDistance
        ) {

            nearestDistance =
                distance;

            nearestObject =
                object;
        }

    });


    if (
        nearestObject &&
        nearestDistance < 120
    ) {

        showMessage(
            nearestObject.dataset.message
        );

    }

    else {

        showMessage(
            "주변에 조사할 수 있는 파일이 없다."
        );

    }
}


/* ===================================
   MAIN INTERACTION
=================================== */

function interact() {

    if (gameMode === "file") {

        interactWithFileObject();

        return;
    }


    const gateX =
        game.clientWidth * 0.64;

    const gateY =
        game.clientHeight * 0.20;


    const gateDistance =
        Math.sqrt(
            Math.pow(
                playerX - gateX,
                2
            ) +
            Math.pow(
                playerY - gateY,
                2
            )
        );


    if (gateDistance < 100) {

        showMessage(
            "빛이 깜빡이고 있다. 가까이 가면 들어갈 수 있을 것 같다."
        );

        return;
    }


    showMessage(
        "아직 아무것도 없다."
    );
}


/* ===================================
   FILE DISTANCE
=================================== */

function updateFileDistance() {

    let closestDistance =
        Infinity;


    fileObjects.forEach((object) => {

        const rect =
            object.getBoundingClientRect();


        const objectX =
            rect.left + rect.width / 2;

        const objectY =
            rect.top + rect.height / 2;


        const distance =
            Math.sqrt(
                Math.pow(
                    playerX - objectX,
                    2
                ) +
                Math.pow(
                    playerY - objectY,
                    2
                )
            );


        if (
            distance < closestDistance
        ) {

            closestDistance =
                distance;
        }

    });


    const rounded =
        Math.round(closestDistance);


    distanceValue.textContent =
        rounded + "px";


    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                100 - rounded / 5
            )
        );


    distanceGauge.style.width =
        percentage + "%";
}


/* ===================================
   MESSAGE
=================================== */

function showMessage(message) {

    dialogueText.textContent =
        message;
}


/* ===================================
   WINDOW RESIZE
=================================== */

window.addEventListener(
    "resize",
    () => {

        if (gameMode === "main") {

            playerX =
                Math.min(
                    playerX,
                    game.clientWidth
                );

            playerY =
                Math.min(
                    playerY,
                    game.clientHeight
                );
        }

    }
);


/* ===================================
   GAME LOOP
=================================== */

function gameLoop() {

    updatePlayer();

    requestAnimationFrame(gameLoop);
}


/* ===================================
   START
=================================== */

gameLoop();
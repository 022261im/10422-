/* ===================================
   ELEMENTS
=================================== */

const game = document.getElementById("game");
const world = document.getElementById("game-world");
const player = document.getElementById("player");

const dialogueText =
    document.getElementById("dialogue-text");

const distanceValue =
    document.getElementById("distance-value");

const distanceGauge =
    document.getElementById("distance-gauge");

const lightField =
    document.getElementById("light-field");

const fileObjects =
    document.querySelectorAll(".file-object");

const keys = {};


/* ===================================
   WORLD
=================================== */

const WORLD_WIDTH = 2400;


/* ===================================
   PLAYER
=================================== */

/*
    플레이어는 실제로 월드 안에서 움직인다.
    화면에서는 항상 중앙에 보인다.
*/

let playerX = 250;
let playerY = window.innerHeight * 0.60;


/* ===================================
   CAMERA
=================================== */

let cameraX = 0;

const speed = 4;


/* ===================================
   GAME STATE
=================================== */

let gameMode = "main";

let enteredFileSpace = false;

let wrongMessageCooldown = 0;


/* ===================================
   KEYBOARD
=================================== */

document.addEventListener(
    "keydown",
    (event) => {

        keys[event.key.toLowerCase()] = true;


        if (event.code === "Space") {

            event.preventDefault();

            interact();
        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[event.key.toLowerCase()] = false;

    }
);


/* ===================================
   PLAYER MOVEMENT
=================================== */

function updatePlayer() {

    let moving = false;


    /* ↑ */

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        playerY -= speed;

        moving = true;
    }


    /* ↓ */

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        playerY += speed;

        moving = true;
    }


    /* ← */

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        playerX -= speed;

        moving = true;
    }


    /* → */

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        playerX += speed;

        moving = true;
    }


    /* ===================================
       WORLD LIMIT
    =================================== */

    const halfWidth =
        player.offsetWidth / 2;

    const halfHeight =
        player.offsetHeight / 2;


    playerX = Math.max(
        60,
        Math.min(
            WORLD_WIDTH - 60,
            playerX
        )
    );


    playerY = Math.max(
        60,
        Math.min(
            game.clientHeight - 60,
            playerY
        )
    );


    /* ===================================
       CAMERA
    =================================== */

    updateCamera();


    /* ===================================
       SENSOR
    =================================== */

    updateDistanceSensor();


    /* ===================================
       WRONG WAY
    =================================== */

    if (gameMode === "main") {

        checkWrongWay();

        checkSystemGate();
    }


    if (gameMode === "file") {

        updateFileSensor();
    }


    if (moving) {

        if (
            wrongMessageCooldown > 0
        ) {

            wrongMessageCooldown--;
        }
    }

}


/* ===================================
   CAMERA
=================================== */

function updateCamera() {

    const screenCenter =
        window.innerWidth / 2;


    /*
        캐릭터를 화면 중앙에 놓기 위해
        월드를 반대로 이동한다.
    */

    cameraX =
        playerX - screenCenter;


    /*
        월드가 화면 왼쪽으로
        너무 많이 빠지지 않게 한다.
    */

    const maxCamera =
        WORLD_WIDTH - window.innerWidth;


    cameraX = Math.max(
        0,
        Math.min(
            maxCamera,
            cameraX
        )
    );


    world.style.transform =
        `translateX(${-cameraX}px)`;


    /*
        플레이어는 화면 중앙 고정
    */

    player.style.left =
        "50%";

    player.style.top =
        `${playerY}px`;
}


/* ===================================
   DISTANCE SENSOR
=================================== */

function updateDistanceSensor() {

    const gateX = 1420;
    const gateY =
        game.clientHeight * 0.38;


    const distance = Math.sqrt(
        Math.pow(
            playerX - gateX,
            2
        ) +
        Math.pow(
            playerY - gateY,
            2
        )
    );


    const rounded =
        Math.round(distance);


    distanceValue.textContent =
        rounded + "cm";


    /*
        가까워질수록 게이지 상승
    */

    const gauge =
        Math.max(
            0,
            Math.min(
                100,
                100 - rounded / 12
            )
        );


    distanceGauge.style.width =
        gauge + "%";


    /*
        오른쪽으로 갈수록
        빛의 강도가 증가
    */

    const lightProgress =
        Math.max(
            0,
            Math.min(
                1,
                playerX / 1450
            )
        );


    lightField.style.opacity =
        0.15 +
        lightProgress * 0.90;


    lightField.style.filter =
        `blur(${10 - lightProgress * 6}px)`;
}


/* ===================================
   WRONG WAY
=================================== */

function checkWrongWay() {

    if (
        wrongMessageCooldown > 0
    ) {

        return;
    }


    /*
        너무 뒤로 가면
    */

    if (playerX < 100) {

        showMessage(
            "여긴 아닌 것 같다."
        );

        wrongMessageCooldown = 90;

        return;
    }


    /*
        빛의 주 경로에서
        지나치게 벗어났을 때
    */

    const expectedY =
        0.60 -
        (
            Math.max(
                0,
                playerX - 100
            ) /
            1300
        ) *
        0.08;


    const distanceFromRoad =
        Math.abs(
            playerY -
            game.clientHeight * expectedY
        );


    if (
        distanceFromRoad > 180
    ) {

        showMessage(
            "빛이 이쪽으로 이어지지 않는다."
        );

        wrongMessageCooldown = 100;
    }

}


/* ===================================
   SYSTEM GATE
=================================== */

function checkSystemGate() {

    const gateX = 1420;
    const gateY =
        game.clientHeight * 0.38;


    const distance = Math.sqrt(
        Math.pow(
            playerX - gateX,
            2
        ) +
        Math.pow(
            playerY - gateY,
            2
        )
    );


    if (
        distance < 130
    ) {

        showMessage(
            "빛이 강해지고 있다. 무언가에 연결되어 있는 것 같다."
        );
    }


    if (
        distance < 60 &&
        !enteredFileSpace
    ) {

        enterFileSpace();
    }

}


/* ===================================
   ENTER FILE SYSTEM
=================================== */

function enterFileSpace() {

    enteredFileSpace = true;

    gameMode = "file";


    /*
        여기서는 화면 자체를 전환하기보다
        월드가 계속 움직이는 방식으로
        파일 공간에 진입한다.
    */

    showMessage(
        "SYSTEM에 접속했다."
    );


    /*
        빛의 길을 숨기고
        파일 시스템 영역을 강조
    */

    document
        .getElementById("light-road")
        .style.opacity = "0";


    document
        .getElementById("light-field")
        .style.opacity = "0.05";
}


/* ===================================
   FILE SENSOR
=================================== */

function updateFileSensor() {

    let closest =
        Infinity;


    fileObjects.forEach(
        (object) => {

            const rect =
                object.getBoundingClientRect();


            const objectX =
                playerX -
                cameraX +
                rect.width / 2;

            const objectY =
                rect.top +
                rect.height / 2;


            const distance =
                Math.sqrt(
                    Math.pow(
                        playerX -
                        (
                            objectX +
                            cameraX
                        ),
                        2
                    ) +
                    Math.pow(
                        playerY -
                        objectY,
                        2
                    )
                );


            if (
                distance <
                closest
            ) {

                closest =
                    distance;
            }

        }
    );


    distanceValue.textContent =
        Math.round(closest) + "cm";
}


/* ===================================
   INTERACTION
=================================== */

function interact() {

    /*
        파일 시스템
    */

    if (gameMode === "file") {

        interactWithFile();

        return;
    }


    /*
        메인 공간
    */

    const gateX = 1420;

    const gateY =
        game.clientHeight * 0.38;


    const distance =
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


    if (
        distance < 120
    ) {

        showMessage(
            "SYSTEM에 접근 중이다..."
        );

        return;
    }


    showMessage(
        "아무것도 없다."
    );

}


/* ===================================
   FILE INTERACTION
=================================== */

function interactWithFile() {

    let nearest =
        null;

    let nearestDistance =
        Infinity;


    fileObjects.forEach(
        (object) => {

            const rect =
                object.getBoundingClientRect();


            /*
                화면 기준으로 실제 플레이어와
                오브젝트의 거리를 계산한다.
            */

            const objectX =
                rect.left +
                rect.width / 2;

            const objectY =
                rect.top +
                rect.height / 2;


            const playerScreenX =
                window.innerWidth / 2;


            const playerScreenY =
                playerY;


            const distance =
                Math.sqrt(
                    Math.pow(
                        playerScreenX -
                        objectX,
                        2
                    ) +
                    Math.pow(
                        playerScreenY -
                        objectY,
                        2
                    )
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearest =
                    object;
            }

        }
    );


    if (
        nearest &&
        nearestDistance < 120
    ) {

        showMessage(
            nearest.dataset.message
        );

    }

    else {

        showMessage(
            "주변에 조사할 수 있는 것이 없다."
        );
    }

}


/* ===================================
   MESSAGE
=================================== */

function showMessage(message) {

    dialogueText.textContent =
        message;
}


/* ===================================
   RESIZE
=================================== */

window.addEventListener(
    "resize",
    () => {

        updateCamera();
    }
);


/* ===================================
   GAME LOOP
=================================== */

function gameLoop() {

    updatePlayer();

    requestAnimationFrame(
        gameLoop
    );
}


/* ===================================
   START
=================================== */

updateCamera();

updateDistanceSensor();

gameLoop();
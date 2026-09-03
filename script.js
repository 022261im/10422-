/* =================================
   ELEMENTS
================================= */

const game = document.getElementById("game");
const world = document.getElementById("world");
const player = document.getElementById("player");

const dialogueText =
    document.getElementById("dialogue-text");

const distanceValue =
    document.getElementById("distance-value");

const distanceGauge =
    document.getElementById("distance-gauge");

const accessPoint =
    document.getElementById("access-point");

const fileObjects =
    document.querySelectorAll(".file-object");


/* =================================
   GAME SETTINGS
================================= */

const WORLD_WIDTH = 3000;

const PLAYER_SPEED = 5;


/* =================================
   PLAYER POSITION
================================= */

/*
    플레이어의 실제 월드 좌표
*/

let playerX = 250;

let playerY =
    window.innerHeight * 0.55;


/* =================================
   CAMERA
================================= */

let cameraX = 0;


/* =================================
   INPUT
================================= */

const keys = {};

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


/* =================================
   PLAYER UPDATE
================================= */

function updatePlayer() {

    let dx = 0;
    let dy = 0;


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx += PLAYER_SPEED;
    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx -= PLAYER_SPEED;
    }


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy -= PLAYER_SPEED;
    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy += PLAYER_SPEED;
    }


    /*
        실제 위치 변경
    */

    playerX += dx;

    playerY += dy;


    /*
        월드 범위
    */

    playerX = Math.max(
        40,
        Math.min(
            WORLD_WIDTH - 40,
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


    /*
        플레이어의 월드 위치
    */

    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;


    /*
        카메라
    */

    updateCamera();


    /*
        센서
    */

    updateDistanceSensor();


    /*
        파일 시스템 진입 체크
    */

    checkFileArea();
}


/* =================================
   CAMERA
================================= */

function updateCamera() {

    /*
        화면 중앙을 기준으로 카메라가 따라감
    */

    const targetCamera =
        playerX -
        window.innerWidth / 2;


    /*
        카메라 시작점
    */

    const maxCamera =
        WORLD_WIDTH -
        window.innerWidth;


    cameraX =
        Math.max(
            0,
            Math.min(
                maxCamera,
                targetCamera
            )
        );


    /*
        월드를 반대로 이동
    */

    world.style.transform =
        `translateX(${-cameraX}px)`;
}


/* =================================
   DISTANCE SENSOR
================================= */

function updateDistanceSensor() {

    const gateX = 1530;

    const distance =
        Math.abs(
            gateX -
            playerX
        );


    distanceValue.textContent =
        `${Math.round(distance)}px`;


    /*
        가까워질수록 게이지 증가
    */

    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                100 -
                distance / 12
            )
        );


    distanceGauge.style.width =
        `${percentage}%`;
}


/* =================================
   FILE AREA
================================= */

function checkFileArea() {

    /*
        SYSTEM ACCESS를 지나면
        파일 시스템 공간으로 진입
    */

    if (
        playerX >= 1660
    ) {

        document.body.classList.add(
            "inside-file-system"
        );

    }

    else {

        document.body.classList.remove(
            "inside-file-system"
        );
    }
}


/* =================================
   INTERACTION
================================= */

function interact() {

    /*
        가장 가까운 파일 찾기
    */

    let nearestObject = null;

    let nearestDistance = Infinity;


    fileObjects.forEach(
        (object) => {

            /*
                object의 월드 좌표
                left/top은 inline style에
                들어 있으므로 계산
            */

            const objectX =
                parseFloat(
                    object.style.left
                );

            const objectY =
                parseFloat(
                    object.style.top
                );


            const distance =
                Math.sqrt(
                    Math.pow(
                        playerX -
                        (
                            1700 +
                            objectX
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
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearestObject =
                    object;
            }
        }
    );


    /*
        조사 가능
    */

    if (
        nearestObject &&
        nearestDistance < 120
    ) {

        dialogueText.textContent =
            nearestObject.dataset.message;

        return;
    }


    /*
        SYSTEM 진입점
    */

    const accessDistance =
        Math.sqrt(
            Math.pow(
                playerX - 1530,
                2
            ) +
            Math.pow(
                playerY -
                window.innerHeight * 0.5,
                2
            )
        );


    if (
        accessDistance < 130
    ) {

        dialogueText.textContent =
            "SYSTEM에 접근할 수 있다.";

        return;
    }


    dialogueText.textContent =
        "주변에 조사할 수 있는 것이 없다.";
}


/* =================================
   INITIAL POSITION
================================= */

function initialize() {

    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;

    updateCamera();

    updateDistanceSensor();
}


/* =================================
   RESIZE
================================= */

window.addEventListener(
    "resize",
    () => {

        playerY =
            Math.min(
                playerY,
                window.innerHeight - 60
            );

        updateCamera();
    }
);


/* =================================
   GAME LOOP
================================= */

function gameLoop() {

    updatePlayer();

    requestAnimationFrame(
        gameLoop
    );
}


/* =================================
   START
================================= */

initialize();

gameLoop();
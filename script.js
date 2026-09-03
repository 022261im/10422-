/* =================================
   ELEMENTS
================================= */

const game =
    document.getElementById("game");

const world =
    document.getElementById("world");

const player =
    document.getElementById("player");

const dialogueText =
    document.getElementById("dialogue-text");

const distanceValue =
    document.getElementById("distance-value");

const distanceGauge =
    document.getElementById("distance-gauge");

const fileObjects =
    document.querySelectorAll(".file-object");


/* =================================
   SETTINGS
================================= */

const WORLD_WIDTH = 3200;

const INTRO_END = 1600;

const FILE_START = 1800;

const ACCESS_Y =
    window.innerHeight * 0.5;

const PLAYER_SPEED = 5;


/* =================================
   PLAYER WORLD POSITION
================================= */

let playerX = 300;

let playerY =
    window.innerHeight * 0.5;


/* =================================
   CAMERA
================================= */

let cameraX = 0;


/* =================================
   STATE
================================= */

const keys = {};

let lastMessage = "";

let wrongDirectionTimer = 0;


/* =================================
   KEYBOARD
================================= */

document.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;


        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            interact();
        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =================================
   MOVE PLAYER
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


    playerX += dx;

    playerY += dy;


    /* =================================
       WORLD LIMIT
    ================================== */

    playerX =
        Math.max(
            40,
            Math.min(
                WORLD_WIDTH - 40,
                playerX
            )
        );


    playerY =
        Math.max(
            70,
            Math.min(
                game.clientHeight - 70,
                playerY
            )
        );


    /* =================================
       CAMERA
    ================================== */

    updateCamera();


    /* =================================
       DISTANCE SENSOR
    ================================== */

    updateDistance();


    /* =================================
       WRONG WAY
    ================================== */

    if (
        wrongDirectionTimer > 0
    ) {

        wrongDirectionTimer--;
    }


    checkWrongDirection();


    /* =================================
       MESSAGE
    ================================== */

    checkAccessPoint();
}


/* =================================
   CAMERA
================================= */

function updateCamera() {

    /*
        카메라가 플레이어를 따라간다.
    */

    const targetCamera =
        playerX -
        window.innerWidth / 2;


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


    world.style.transform =
        `translateX(${-cameraX}px)`;


    /*
        플레이어는 월드 안에서 움직이지만
        자연스럽게 화면 중앙을 유지한다.
    */

    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;
}


/* =================================
   DISTANCE
================================= */

function updateDistance() {

    /*
        SYSTEM까지 남은 거리
    */

    const systemX = 1580;

    const distance =
        Math.max(
            0,
            systemX - playerX
        );


    distanceValue.textContent =
        `${Math.round(distance)}cm`;


    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                100 - distance / 12
            )
        );


    distanceGauge.style.width =
        `${percentage}%`;
}


/* =================================
   WRONG DIRECTION
================================= */

function checkWrongDirection() {

    if (
        wrongDirectionTimer > 0
    ) {

        return;
    }


    /*
        처음 공간에서 너무 위나 아래로
        벗어나면 안내 메시지
    */

    if (
        playerX < INTRO_END
    ) {

        const center =
            game.clientHeight * 0.5;

        const verticalDistance =
            Math.abs(
                playerY - center
            );


        if (
            verticalDistance > 220
        ) {

            showMessage(
                "여긴 아닌 것 같다."
            );

            wrongDirectionTimer = 90;

            return;
        }
    }
}


/* =================================
   SYSTEM ACCESS
================================= */

function checkAccessPoint() {

    const distance =
        Math.sqrt(
            Math.pow(
                playerX - 1580,
                2
            ) +
            Math.pow(
                playerY -
                game.clientHeight * 0.5,
                2
            )
        );


    if (
        distance < 150 &&
        distance > 60
    ) {

        showMessage(
            "앞에 무언가가 있다."
        );
    }


    if (
        distance <= 60
    ) {

        enterFileSystem();
    }
}


/* =================================
   ENTER FILE SYSTEM
================================= */

function enterFileSystem() {

    if (
        playerX < FILE_START
    ) {

        playerX = FILE_START + 80;

        playerY =
            game.clientHeight * 0.5;

        updateCamera();
    }


    showMessage(
        "SYSTEM에 접속했다."
    );
}


/* =================================
   INTERACTION
================================= */

function interact() {

    /*
        파일 객체와의 거리 계산
    */

    let nearestObject = null;

    let nearestDistance =
        Infinity;


    fileObjects.forEach(
        (object) => {

            const objectX =
                FILE_START +
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
                        objectX,
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


    if (
        nearestObject &&
        nearestDistance < 120
    ) {

        showMessage(
            nearestObject.dataset.message
        );

        return;
    }


    /*
        SYSTEM 근처
    */

    const systemDistance =
        Math.sqrt(
            Math.pow(
                playerX - 1580,
                2
            ) +
            Math.pow(
                playerY -
                game.clientHeight * 0.5,
                2
            )
        );


    if (
        systemDistance < 120
    ) {

        showMessage(
            "SYSTEM에 연결되어 있다."
        );

        return;
    }


    showMessage(
        "주변에 조사할 수 있는 것이 없다."
    );
}


/* =================================
   MESSAGE
================================= */

function showMessage(message) {

    if (
        lastMessage === message
    ) {

        return;
    }


    dialogueText.textContent =
        message;

    lastMessage =
        message;
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
                game.clientHeight - 70
            );

        updateCamera();
        updateDistance();
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

player.style.left =
    `${playerX}px`;

player.style.top =
    `${playerY}px`;

updateCamera();

updateDistance();

gameLoop();
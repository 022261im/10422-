/* =====================================================
   ELEMENTS
===================================================== */

const game =
    document.getElementById("game");

const world =
    document.getElementById("world");

const player =
    document.getElementById("player");

const dialogue =
    document.getElementById("dialogue-text");

const distanceValue =
    document.getElementById("distance-value");

const distanceGauge =
    document.getElementById("distance-gauge");

const temperatureGauge =
    document.getElementById("temperature-gauge");

const systemObjects =
    document.querySelectorAll(".system-object");

const hiddenExit =
    document.getElementById("hidden-exit");


/* =====================================================
   WORLD
===================================================== */

const INTRO_END = 1700;
const WORLD_WIDTH = 3600;

const PLAYER_SPEED = 5;


/* =====================================================
   PLAYER
===================================================== */

let playerX = 350;

let playerY =
    window.innerHeight * 0.5;


/* =====================================================
   CAMERA
===================================================== */

let cameraX = 0;


/* =====================================================
   INPUT
===================================================== */

const keys = {};


/* =====================================================
   GAME STATE
===================================================== */

const state = {

    currentMap: "main",

    documents: false,

    sensors: false,

    power: false,

    control: false,

    diagnostics: false,

    errorLog: false,

    hiddenExitUnlocked: false

};


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = true;


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


/* =====================================================
   MOVEMENT
===================================================== */

function updatePlayer() {

    /*
        Puzzle map에서는 캐릭터 이동을 막는다.
    */

    if (
        state.currentMap !== "main"
    ) {

        return;
    }


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


    /*
        WORLD LIMIT
    */

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


    /*
        플레이어 표시
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
        거리 센서
    */

    updateDistanceSensor();


    /*
        초기 공간
    */

    if (
        playerX < INTRO_END
    ) {

        checkWrongDirection();
    }

}


/* =====================================================
   CAMERA
===================================================== */

function updateCamera() {

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
}


/* =====================================================
   DISTANCE SENSOR
===================================================== */

function updateDistanceSensor() {

    let targetX =
        INTRO_END;


    /*
        SYSTEM 공간에서는
        가장 가까운 조사 대상까지 거리
    */

    if (
        playerX >= INTRO_END
    ) {

        const points = [

            INTRO_END + 180,

            INTRO_END + 430,

            INTRO_END + 680,

            INTRO_END + 930,

            INTRO_END + 1120

        ];


        targetX =
            points.reduce(
                (closest, current) => {

                    return Math.abs(
                        current -
                        playerX
                    ) <
                    Math.abs(
                        closest -
                        playerX
                    )
                        ? current
                        : closest;

                }
            );
    }


    const distance =
        Math.abs(
            targetX -
            playerX
        );


    distanceValue.textContent =
        `${Math.round(distance)}cm`;


    const gauge =
        Math.max(
            0,
            Math.min(
                100,
                100 -
                distance / 10
            )
        );


    distanceGauge.style.width =
        `${gauge}%`;
}


/* =====================================================
   WRONG WAY
===================================================== */

let wrongCooldown = 0;


function checkWrongDirection() {

    if (
        wrongCooldown > 0
    ) {

        wrongCooldown--;

        return;
    }


    const center =
        game.clientHeight / 2;


    if (
        Math.abs(
            playerY -
            center
        ) > 220
    ) {

        showMessage(
            "여긴 아닌 것 같다."
        );

        wrongCooldown =
            70;

        return;
    }


    if (
        playerX < 130
    ) {

        showMessage(
            "뒤쪽에는 아무것도 없다."
        );

        wrongCooldown =
            70;
    }

}


/* =====================================================
   INTERACTION
===================================================== */

function interact() {

    if (
        state.currentMap !== "main"
    ) {

        return;
    }


    /*
        가장 가까운 SYSTEM object
    */

    let nearest =
        null;

    let nearestDistance =
        Infinity;


    systemObjects.forEach(
        (object) => {

            const objectX =
                INTRO_END +
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

                nearest =
                    object;
            }

        }
    );


    /*
        HIDDEN EXIT
    */

    const exitDistance =
        Math.sqrt(
            Math.pow(
                playerX -
                (
                    INTRO_END +
                    1120
                ),
                2
            ) +
            Math.pow(
                playerY -
                540,
                2
            )
        );


    if (
        exitDistance <
        110 &&
        state.hiddenExitUnlocked
    ) {

        showMessage(
            "출구가 나타났다."
        );

        return;
    }


    /*
        SYSTEM ACCESS
    */

    if (
        playerX < INTRO_END
    ) {

        const accessDistance =
            Math.abs(
                playerX -
                1580
            );


        if (
            accessDistance <
            120
        ) {

            showMessage(
                "SYSTEM에 접근했다."
            );

            return;
        }

        showMessage(
            "아직 아무것도 없다."
        );

        return;
    }


    if (
        nearest &&
        nearestDistance < 130
    ) {

        handleSystemObject(
            nearest.dataset.type
        );

        return;
    }


    showMessage(
        "주변에 조사할 수 있는 것이 없다."
    );
}


/* =====================================================
   OBJECT HANDLER
===================================================== */

function handleSystemObject(type) {

    switch (type) {

        case "documents":
            openPuzzle("documents");
            break;


        case "sensors":
            openPuzzle("sensors");
            break;


        case "control":
            openPuzzle("control");
            break;


        case "power":
            openPuzzle("power");
            break;


        case "diagnostics":
            openPuzzle("diagnostics");
            break;


        case "error":

            state.errorLog = true;

            showMessage(
                "ERROR_LOG.txt를 읽었다."
            );

            break;


        case "trash":

            showMessage(
                "휴지통에는 아무것도 없다."
            );

            break;

        default:

            showMessage(
                "알 수 없는 시스템이다."
            );
    }
}


/* =====================================================
   PUZZLE MAP OPEN
===================================================== */

function openPuzzle(name) {

    /*
        main에서 해당 Puzzle Map으로 이동
    */

    state.currentMap =
        name;


    document.querySelectorAll(
        ".puzzle-map"
    ).forEach(
        (map) => {

            map.classList.remove(
                "active"
            );
        }
    );


    const map =
        document.getElementById(
            `map-${name}`
        );


    if (
        map
    ) {

        map.classList.add(
            "active"
        );
    }
}


/* =====================================================
   RETURN TO SYSTEM
===================================================== */

function returnToSystem() {

    state.currentMap =
        "main";


    document.querySelectorAll(
        ".puzzle-map"
    ).forEach(
        (map) => {

            map.classList.remove(
                "active"
            );
        }
    );


    updateCamera();


    updateDistanceSensor();
}


/* =====================================================
   DOCUMENT PUZZLE
===================================================== */

document
    .querySelectorAll(
        "#map-documents button"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const answer =
                        button.dataset.answer;


                    if (
                        answer === "B"
                    ) {

                        state.documents =
                            true;


                        showMessage(
                            "모순된 기록을 찾아냈다."
                        );


                        revealReturnMessage(
                            "DOCUMENTS COMPLETE"
                        );


                        setTimeout(
                            returnToSystem,
                            500
                        );

                    }

                    else {

                        alert(
                            "이 기록만으로 오류라고 판단하기 어렵다."
                        );
                    }

                }
            );

        }
    );


/* =====================================================
   SENSOR PUZZLE
===================================================== */

document
    .getElementById(
        "sensor-submit"
    )
    .addEventListener(
        "click",
        () => {

            const value =
                Number(
                    document
                        .getElementById(
                            "sensor-answer"
                        )
                        .value
                );


            const result =
                document
                    .getElementById(
                        "sensor-result"
                    );


            if (
                value === -8
            ) {

                state.sensors =
                    true;


                result.textContent =
                    "CALIBRATION COMPLETE";


                showMessage(
                    "센서의 +8cm 오차를 보정했다."
                );


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                result.textContent =
                    "잘못된 보정값이다.";
            }

        }
    );


/* =====================================================
   CONTROL PUZZLE
===================================================== */

const controlSlider =
    document.getElementById(
        "control-slider"
    );

const controlCurrent =
    document.getElementById(
        "control-current"
    );


controlSlider.addEventListener(
    "input",
    () => {

        controlCurrent.textContent =
            `${controlSlider.value}°`;

    }
);


document
    .getElementById(
        "control-submit"
    )
    .addEventListener(
        "click",
        () => {

            const value =
                Number(
                    controlSlider.value
                );


            const result =
                document
                    .getElementById(
                        "control-result"
                    );


            if (
                value === 90
            ) {

                state.control =
                    true;


                result.textContent =
                    "CONTROL RESPONSE : STABLE";


                showMessage(
                    "모터가 목표 각도에 도달했다."
                );


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                result.textContent =
                    "TARGET : 90°";
            }

        }
    );


/* =====================================================
   POWER PUZZLE
===================================================== */

document
    .getElementById(
        "power-submit"
    )
    .addEventListener(
        "click",
        () => {

            const sensor =
                document
                    .getElementById(
                        "power-sensor"
                    )
                    .checked;

            const motor =
                document
                    .getElementById(
                        "power-motor"
                    )
                    .checked;

            const light =
                document
                    .getElementById(
                        "power-light"
                    )
                    .checked;

            const cooling =
                document
                    .getElementById(
                        "power-cooling"
                    )
                    .checked;


            let load = 0;


            if (sensor) {
                load += 15;
            }

            if (motor) {
                load += 40;
            }

            if (light) {
                load += 10;
            }

            if (cooling) {
                load += 30;
            }


            const result =
                document
                    .getElementById(
                        "power-result"
                    );


            if (
                sensor &&
                motor &&
                load <= 100
            ) {

                state.power =
                    true;


                result.textContent =
                    "POWER STABLE : " +
                    `${load}%`;


                showMessage(
                    "필요한 장치만 활성화하여 전력을 안정화했다."
                );


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                result.textContent =
                    `CURRENT LOAD : ${load}%`;

            }

        }
    );


/* =====================================================
   DIAGNOSTICS
===================================================== */

document
    .getElementById(
        "diagnostic-submit"
    )
    .addEventListener(
        "click",
        () => {

            const sensorStatus =
                document
                    .getElementById(
                        "diag-sensor"
                    );

            const powerStatus =
                document
                    .getElementById(
                        "diag-power"
                    );

            const controlStatus =
                document
                    .getElementById(
                        "diag-control"
                    );


            sensorStatus.textContent =
                state.sensors
                    ? "ONLINE"
                    : "ERROR";

            powerStatus.textContent =
                state.power
                    ? "ONLINE"
                    : "ERROR";

            controlStatus.textContent =
                state.control
                    ? "ONLINE"
                    : "ERROR";


            sensorStatus.style.color =
                state.sensors
                    ? "#9bc7a8"
                    : "#b56d6d";

            powerStatus.style.color =
                state.power
                    ? "#9bc7a8"
                    : "#b56d6d";

            controlStatus.style.color =
                state.control
                    ? "#9bc7a8"
                    : "#b56d6d";


            const result =
                document
                    .getElementById(
                        "diagnostic-result"
                    );


            if (
                state.sensors &&
                state.power &&
                state.control
            ) {

                state.diagnostics =
                    true;

                result.textContent =
                    "ALL SYSTEMS NORMAL";


                revealExit();

            }

            else {

                result.textContent =
                    "복구되지 않은 시스템이 있다.";
            }

        }
    );


/* =====================================================
   EXIT REVEAL
===================================================== */

function revealExit() {

    state.hiddenExitUnlocked =
        true;


    hiddenExit.classList.add(
        "revealed"
    );


    showMessage(
        "SYSTEM DIAGNOSTICS 완료. 시스템 어딘가에서 새로운 신호가 감지된다."
    );


    setTimeout(
        returnToSystem,
        900
    );
}


/* =====================================================
   FINAL EXIT
===================================================== */

hiddenExit.addEventListener(
    "click",
    () => {

        if (
            !state.hiddenExitUnlocked
        ) {

            return;
        }


        openPuzzle("final");

    }
);


document
    .getElementById(
        "final-exit"
    )
    .addEventListener(
        "click",
        () => {

            showMessage(
                "EXIT UNLOCKED."
            );


            /*
                최종 화면
            */

            setTimeout(
                () => {

                    document
                        .getElementById(
                            "map-final"
                        )
                        .innerHTML = `
                            <div class="final-title">
                                ESCAPE COMPLETE
                            </div>

                            <div class="final-message">
                                시스템 복구 완료.<br><br>
                                외부 연결이 복구되었다.<br><br>
                                당신은 시설을 빠져나왔다.
                            </div>
                        `;

                },
                300
            );

        }
    );


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(message) {

    dialogue.textContent =
        message;
}


/* =====================================================
   RETURN MESSAGE
===================================================== */

function revealReturnMessage(message) {

    showMessage(message);
}


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        playerY =
            Math.min(
                playerY,
                game.clientHeight - 70
            );

        updateCamera();

    }
);


/* =====================================================
   START
===================================================== */

player.style.left =
    `${playerX}px`;

player.style.top =
    `${playerY}px`;

updateCamera();

updateDistanceSensor();


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

    updatePlayer();

    requestAnimationFrame(
        gameLoop
    );
}


gameLoop();
/* =================================
   ELEMENTS
================================= */

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

const modal =
    document.getElementById("modal");

const modalTitle =
    document.getElementById("modal-title");

const modalContent =
    document.getElementById("modal-content");

const modalClose =
    document.getElementById("modal-close");


/* =================================
   WORLD SETTINGS
================================= */

const INTRO_END = 1700;

const SYSTEM_OFFSET = 1700;

const WORLD_WIDTH = 3100;


/* =================================
   PLAYER
================================= */

let playerX = 350;

let playerY =
    window.innerHeight * 0.5;

const PLAYER_SPEED = 5;


/* =================================
   CAMERA
================================= */

let cameraX = 0;


/* =================================
   INPUT
================================= */

const keys = {};


/* =================================
   GAME STATE
================================= */

const state = {

    sensorCalibrated: false,

    temperatureFixed: false,

    powerRestored: false,

    motorFixed: false,

    diagnosticsComplete: false,

    documentsRead: false,

    errorLogRead: false
};


/* =================================
   KEYBOARD
================================= */

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


/* =================================
   PLAYER MOVEMENT
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


    /*
        범위 제한
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
        플레이어 위치
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
        잘못된 방향
    */

    if (
        playerX < INTRO_END
    ) {

        checkWrongDirection();
    }
}


/* =================================
   CAMERA
================================= */

function updateCamera() {

    /*
        플레이어가 이동하면
        월드가 반대 방향으로 이동
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
}


/* =================================
   DISTANCE SENSOR
================================= */

function updateDistanceSensor() {

    /*
        처음에는 SYSTEM까지 거리
    */

    const systemX =
        INTRO_END;


    let distance =
        Math.abs(
            systemX -
            playerX
        );


    /*
        SYSTEM에 들어간 뒤에는
        가장 가까운 주요 장치까지의 거리
    */

    if (
        playerX >= INTRO_END
    ) {

        const positions = [

            SYSTEM_OFFSET + 170,
            SYSTEM_OFFSET + 450,
            SYSTEM_OFFSET + 730,
            SYSTEM_OFFSET + 1010,
            SYSTEM_OFFSET + 1100
        ];


        distance =
            Math.min(
                ...positions.map(
                    (x) =>
                        Math.abs(
                            x - playerX
                        )
                )
            );
    }


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


/* =================================
   WRONG DIRECTION
================================= */

function checkWrongDirection() {

    const center =
        game.clientHeight / 2;


    const verticalDistance =
        Math.abs(
            playerY - center
        );


    if (
        verticalDistance > 230
    ) {

        showMessage(
            "여긴 아닌 것 같다."
        );

        return;
    }


    if (
        playerX < 150
    ) {

        showMessage(
            "뒤쪽에는 아무것도 없다."
        );
    }
}


/* =================================
   INTERACTION
================================= */

function interact() {

    /*
        먼저 근처의 특별한 오브젝트를 찾는다.
    */

    const nearest =
        getNearestSystemObject();


    if (
        !nearest
    ) {

        /*
            INTRO
        */

        if (
            playerX < INTRO_END
        ) {

            showMessage(
                "빛이 이곳으로 이어진다."
            );

            return;
        }


        showMessage(
            "주변에 조사할 것이 없다."
        );

        return;
    }


    handleObject(
        nearest.type
    );
}


/* =================================
   FIND NEAREST OBJECT
================================= */

function getNearestSystemObject() {

    const objects =
        document.querySelectorAll(
            ".system-object, #exit-door, #machine"
        );


    let nearest =
        null;

    let nearestDistance =
        Infinity;


    objects.forEach(
        (object) => {

            const type =
                object.dataset.type;


            let objectX;
            let objectY;


            /*
                시스템 오브젝트는
                system-area 내부에 있음
            */

            if (
                object.parentElement.id ===
                "system-area"
            ) {

                objectX =
                    SYSTEM_OFFSET +
                    parseFloat(
                        object.style.left
                    );

                objectY =
                    parseFloat(
                        object.style.top
                    );
            }


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

                nearest = {
                    element: object,
                    type: type,
                    distance:
                        nearestDistance
                };
            }

        }
    );


    if (
        nearest &&
        nearest.distance < 130
    ) {

        return nearest;
    }


    return null;
}


/* =================================
   OBJECT HANDLER
================================= */

function handleObject(type) {

    switch (type) {

        case "documents":
            openDocuments();
            break;

        case "sensors":
            openSensors();
            break;

        case "control":
            openControl();
            break;

        case "power":
            openPower();
            break;

        case "diagnostics":
            openDiagnostics();
            break;

        case "error":
            openErrorLog();
            break;

        case "trash":
            showMessage(
                "휴지통이다. 현재 비어 있다."
            );
            break;

        case "exit":
            handleExit();
            break;

        case "machine":
            openMachine();
            break;

        default:
            showMessage(
                "알 수 없는 장치다."
            );
    }
}


/* =================================
   DOCUMENTS
================================= */

function openDocuments() {

    state.documentsRead = true;


    openModal(
        "DOCUMENTS / MANUAL",
        `
        <div class="puzzle">

            <div class="readout">
                AUTOMATED FACILITY MANUAL
            </div>

            <p>
                이 시설은 센서, 제어기,
                전력 시스템, 구동기로 구성된
                자동화 시스템이다.
            </p>

            <p>
                시스템 오류 발생 시
                다음 순서로 복구할 것.
            </p>

            <p>
                01. SENSOR<br>
                02. ENVIRONMENT<br>
                03. POWER<br>
                04. CONTROL<br>
                05. DIAGNOSTICS
            </p>

        </div>
        `
    );
}


/* =================================
   ERROR LOG
================================= */

function openErrorLog() {

    state.errorLogRead = true;


    openModal(
        "ERROR_LOG.txt",
        `
        <div class="puzzle">

            <div class="readout">
                ERROR LOG #001
            </div>

            <p>
                DISTANCE SENSOR : INVALID
            </p>

            <p>
                TEMPERATURE SYSTEM : WARNING
            </p>

            <p>
                POWER DISTRIBUTION : OVERLOAD
            </p>

            <p>
                MOTOR CONTROLLER :
                UNSTABLE RESPONSE
            </p>

            <p>
                EXIT LOCK :
                SYSTEM DEPENDENCY
            </p>

        </div>
        `
    );
}


/* =================================
   SENSOR PUZZLE
================================= */

function openSensors() {

    openModal(
        "SENSOR CALIBRATION",
        `
        <div class="puzzle">

            <div class="readout">
                SENSOR OUTPUT<br><br>

                실제 거리와 측정값의 차이를
                찾아 보정값을 입력하십시오.
            </div>

            <div class="readout">
                20cm → 28cm<br>
                30cm → 38cm<br>
                40cm → 48cm
            </div>

            <input
                id="sensor-input"
                type="number"
                placeholder="OFFSET"
            >

            <button
                id="sensor-submit"
            >
                CALIBRATE
            </button>

            <div id="sensor-result"></div>

        </div>
        `
    );


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
                                "sensor-input"
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

                    state.sensorCalibrated = true;

                    result.textContent =
                        "CALIBRATION COMPLETE";

                    showMessage(
                        "거리 센서가 정상화되었다."
                    );

                }

                else {

                    result.textContent =
                        "잘못된 보정값이다.";
                }

            }
        );
}


/* =================================
   TEMPERATURE
================================= */

function openControl() {

    openModal(
        "ENVIRONMENT CONTROL",
        `
        <div class="puzzle">

            <div class="readout">

                TEMPERATURE : 67°C<br>
                TARGET      : 30°C<br><br>

                COOLING FAN PWM을 조절하십시오.

            </div>

            <input
                id="pwm-input"
                type="range"
                min="0"
                max="100"
                value="0"
            >

            <div>
                PWM :
                <span id="pwm-value">
                    0
                </span>%
            </div>

            <div
                class="readout"
                id="temp-output"
            >
                TEMP : 67°C
            </div>

            <button
                id="temp-submit"
            >
                APPLY
            </button>

        </div>
        `
    );


    const slider =
        document.getElementById(
            "pwm-input"
        );

    const value =
        document.getElementById(
            "pwm-value"
        );

    const output =
        document.getElementById(
            "temp-output"
        );


    slider.addEventListener(
        "input",
        () => {

            const pwm =
                Number(slider.value);

            value.textContent =
                pwm;


            const temp =
                67 -
                pwm * 0.47;


            output.textContent =
                `TEMP : ${temp.toFixed(1)}°C`;
        }
    );


    document
        .getElementById(
            "temp-submit"
        )
        .addEventListener(
            "click",
            () => {

                const pwm =
                    Number(slider.value);


                if (
                    pwm >= 75 &&
                    pwm <= 80
                ) {

                    state.temperatureFixed = true;

                    showMessage(
                        "온도 제어 시스템이 정상화되었다."
                    );

                }

                else {

                    showMessage(
                        "목표 온도에 도달하지 않았다."
                    );
                }

            }
        );
}


/* =================================
   POWER
================================= */

function openPower() {

    openModal(
        "POWER DISTRIBUTION",
        `
        <div class="puzzle">

            <div class="readout">

                TOTAL POWER : 100%<br>
                CURRENT LOAD : 118%

            </div>

            <p>
                각 시스템의 전력 소비량:
            </p>

            <p>
                SENSOR&nbsp;&nbsp;15%<br>
                COOLING&nbsp;30%<br>
                MOTOR&nbsp;&nbsp;&nbsp;40%<br>
                LIGHT&nbsp;&nbsp;&nbsp;10%
            </p>

            <p>
                EXIT를 열려면<br>
                SENSOR + MOTOR가 필요하다.
            </p>

            <button
                id="power-submit"
            >
                SENSOR + MOTOR 활성화
            </button>

            <div id="power-result"></div>

        </div>
        `
    );


    document
        .getElementById(
            "power-submit"
        )
        .addEventListener(
            "click",
            () => {

                if (
                    state.sensorCalibrated
                ) {

                    state.powerRestored = true;

                    document
                        .getElementById(
                            "power-result"
                        )
                        .textContent =
                        "POWER STABLE";

                    showMessage(
                        "전력 분배가 안정화되었다."
                    );

                }

                else {

                    document
                        .getElementById(
                            "power-result"
                        )
                        .textContent =
                        "SENSOR SYSTEM이 필요하다.";
                }

            }
        );
}


/* =================================
   MACHINE / MOTOR
================================= */

function openMachine() {

    openModal(
        "MOTOR CONTROLLER",
        `
        <div class="puzzle">

            <div class="readout">
                TARGET : 90°<br>
                CURRENT : <span id="motor-value">63</span>°
            </div>

            <input
                id="motor-input"
                type="range"
                min="0"
                max="180"
                value="63"
            >

            <button
                id="motor-submit"
            >
                APPLY
            </button>

            <div
                id="motor-result"
            ></div>

        </div>
        `
    );


    const slider =
        document.getElementById(
            "motor-input"
        );

    const value =
        document.getElementById(
            "motor-value"
        );


    slider.addEventListener(
        "input",
        () => {

            value.textContent =
                slider.value;
        }
    );


    document
        .getElementById(
            "motor-submit"
        )
        .addEventListener(
            "click",
            () => {

                const angle =
                    Number(slider.value);


                const result =
                    document.getElementById(
                        "motor-result"
                    );


                if (
                    angle === 90 &&
                    state.powerRestored
                ) {

                    state.motorFixed = true;

                    result.textContent =
                        "MOTOR CONTROL : OK";

                    showMessage(
                        "모터 제어가 정상화되었다."
                    );

                }

                else if (
                    !state.powerRestored
                ) {

                    result.textContent =
                        "전력 시스템을 먼저 복구해야 한다.";

                }

                else {

                    result.textContent =
                        "TARGET : 90°";
                }

            }
        );
}


/* =================================
   DIAGNOSTICS
================================= */

function openDiagnostics() {

    const sensor =
        state.sensorCalibrated
            ? "ONLINE"
            : "ERROR";

    const temperature =
        state.temperatureFixed
            ? "ONLINE"
            : "WARNING";

    const power =
        state.powerRestored
            ? "ONLINE"
            : "ERROR";

    const motor =
        state.motorFixed
            ? "ONLINE"
            : "ERROR";


    openModal(
        "SYSTEM DIAGNOSTICS",
        `
        <div class="puzzle">

            <div class="readout">

                SENSOR :
                ${sensor}<br>

                TEMPERATURE :
                ${temperature}<br>

                POWER :
                ${power}<br>

                MOTOR :
                ${motor}

            </div>

            <p>
                모든 시스템이 정상화되어야
                출구의 잠금이 해제된다.
            </p>

            <button
                id="diagnostic-submit"
            >
                RUN DIAGNOSTICS
            </button>

            <div id="diagnostic-result"></div>

        </div>
        `
    );


    document
        .getElementById(
            "diagnostic-submit"
        )
        .addEventListener(
            "click",
            () => {

                const complete =
                    state.sensorCalibrated &&
                    state.temperatureFixed &&
                    state.powerRestored &&
                    state.motorFixed;


                const result =
                    document
                        .getElementById(
                            "diagnostic-result"
                        );


                if (
                    complete
                ) {

                    state.diagnosticsComplete =
                        true;

                    result.textContent =
                        "ALL SYSTEMS NORMAL";

                    showMessage(
                        "모든 시스템이 정상이다. 출구를 열 수 있다."
                    );

                }

                else {

                    result.textContent =
                        "SYSTEM ERROR : 복구되지 않은 장치가 있다.";
                }

            }
        );
}


/* =================================
   EXIT
================================= */

function handleExit() {

    if (
        !state.diagnosticsComplete
    ) {

        showMessage(
            "출구가 잠겨 있다. SYSTEM DIAGNOSTICS가 필요하다."
        );

        return;
    }


    showMessage(
        "EXIT UNLOCKED."
    );


    setTimeout(
        () => {

            openModal(
                "SYSTEM",
                `
                <div class="puzzle">

                    <div class="readout">
                        POWER       : ONLINE<br>
                        SENSOR      : ONLINE<br>
                        TEMPERATURE : ONLINE<br>
                        MOTOR       : ONLINE<br>
                        CONTROL     : ONLINE<br><br>

                        EXIT        : UNLOCKED
                    </div>

                    <h2>
                        ESCAPE COMPLETE
                    </h2>

                    <p>
                        고장 난 자동화 시스템을
                        복구하고 시설에서 탈출했다.
                    </p>

                    <p>
                        측정 → 분석 → 보정 → 제어 → 검증
                    </p>

                </div>
                `
            );

        },
        500
    );
}


/* =================================
   MESSAGE
================================= */

function showMessage(message) {

    dialogue.textContent =
        message;
}


/* =================================
   MODAL
================================= */

function openModal(
    title,
    content
) {

    modalTitle.textContent =
        title;

    modalContent.innerHTML =
        content;

    modal.classList.add(
        "active"
    );
}


function closeModal() {

    modal.classList.remove(
        "active"
    );
}


modalClose.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modal
        ) {

            closeModal();
        }
    }
);


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

player.style.left =
    `${playerX}px`;

player.style.top =
    `${playerY}px`;

updateCamera();

updateDistanceSensor();

gameLoop();
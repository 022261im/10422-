/* =================================================
   ELEMENTS
================================================= */

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

const systemObjects =
    document.querySelectorAll(
        ".system-object"
    );

const puzzleRooms =
    document.querySelectorAll(
        ".puzzle-room"
    );

const hiddenExit =
    document.getElementById(
        "hidden-exit"
    );

const clearedFiles =
    document.getElementById(
        "cleared-files"
    );


/* =================================================
   SETTINGS
================================================= */

const WORLD_WIDTH =
    3100;

const SYSTEM_X =
    1700;

const SYSTEM_ACCESS_X =
    1580;

const SPEED =
    5;


/* =================================================
   PLAYER
================================================= */

let playerX =
    300;

let playerY =
    window.innerHeight *
    0.5;


/* =================================================
   CAMERA
================================================= */

let cameraX =
    0;


/* =================================================
   GAME MODE
================================================= */

let mode =
    "intro";


/* =================================================
   INPUT
================================================= */

const keys = {};


/* =================================================
   PUZZLE STATE
================================================= */

const state = {

    sensor:
        false,

    power:
        false,

    control:
        false,

    currentPuzzle:
        null,

    sensorMeasurements:
        {},

    powerNodes:
        new Set(),

    controlObservations:
        new Set(),

    exitRevealed:
        false

};


/* =================================================
   KEYBOARD
================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            interact();

            return;
        }


        switch (
            event.code
        ) {

            case "KeyW":
            case "ArrowUp":

                keys.up = true;

                break;


            case "KeyS":
            case "ArrowDown":

                keys.down = true;

                break;


            case "KeyA":
            case "ArrowLeft":

                keys.left = true;

                break;


            case "KeyD":
            case "ArrowRight":

                keys.right = true;

                break;
        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        switch (
            event.code
        ) {

            case "KeyW":
            case "ArrowUp":

                keys.up = false;

                break;


            case "KeyS":
            case "ArrowDown":

                keys.down = false;

                break;


            case "KeyA":
            case "ArrowLeft":

                keys.left = false;

                break;


            case "KeyD":
            case "ArrowRight":

                keys.right = false;

                break;
        }

    }
);


/* =================================================
   GAME LOOP
================================================= */

function gameLoop() {

    updatePlayer();

    requestAnimationFrame(
        gameLoop
    );
}


/* =================================================
   PLAYER UPDATE
================================================= */

function updatePlayer() {

    if (
        mode !== "intro" &&
        mode !== "system"
    ) {

        return;
    }


    let dx = 0;

    let dy = 0;


    if (keys.up) {
        dy -= SPEED;
    }

    if (keys.down) {
        dy += SPEED;
    }

    if (keys.left) {
        dx -= SPEED;
    }

    if (keys.right) {
        dx += SPEED;
    }


    playerX += dx;

    playerY += dy;


    /* =============================================
       INTRO LIMIT
    ============================================= */

    if (
        mode === "intro"
    ) {

        playerX =
            Math.max(
                40,
                Math.min(
                    SYSTEM_ACCESS_X + 20,
                    playerX
                )
            );

    }


    /* =============================================
       SYSTEM LIMIT
    ============================================= */

    if (
        mode === "system"
    ) {

        const left =
            SYSTEM_X + 50;

        const right =
            SYSTEM_X +
            window.innerWidth -
            50;


        playerX =
            Math.max(
                left,
                Math.min(
                    right,
                    playerX
                )
            );
    }


    /* =============================================
       Y LIMIT
    ============================================= */

    playerY =
        Math.max(
            70,
            Math.min(
                window.innerHeight - 70,
                playerY
            )
        );


    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;


    /* =============================================
       CAMERA
    ============================================= */

    if (
        mode === "intro"
    ) {

        updateIntroCamera();

        checkWrongDirection();

        updateIntroDistance();

        checkSystemAccess();

    }


    if (
        mode === "system"
    ) {

        updateSystemView();

        updateSystemDistance();

        checkHiddenExit();

    }

}


/* =================================================
   INTRO CAMERA
================================================= */

function updateIntroCamera() {

    const target =
        playerX -
        window.innerWidth / 2;


    const maxCamera =
        SYSTEM_ACCESS_X -
        window.innerWidth / 2;


    cameraX =
        Math.max(
            0,
            Math.min(
                maxCamera,
                target
            )
        );


    world.style.transform =
        `translateX(${-cameraX}px)`;

}


/* =================================================
   ENTER SYSTEM
================================================= */

function enterSystem() {

    mode =
        "system";


    /*
        SYSTEM은 브라우저 화면에
        딱 맞게 고정된다.
    */

    world.style.transform =
        `translateX(-${SYSTEM_X}px)`;


    playerX =
        SYSTEM_X +
        window.innerWidth * 0.5;

    playerY =
        window.innerHeight * 0.56;


    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;


    showMessage(
        "SYSTEM에 접속했다. 파일을 조사해 보자."
    );

}


/* =================================================
   SYSTEM VIEW
================================================= */

function updateSystemView() {

    world.style.transform =
        `translateX(-${SYSTEM_X}px)`;

}


/* =================================================
   INTRO DISTANCE
================================================= */

function updateIntroDistance() {

    const distance =
        Math.max(
            0,
            SYSTEM_ACCESS_X -
            playerX
        );


    distanceValue.textContent =
        `${Math.round(distance)}cm`;


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


/* =================================================
   SYSTEM DISTANCE
================================================= */

function updateSystemDistance() {

    const nearest =
        findNearestObject();


    if (!nearest) {

        distanceValue.textContent =
            "--cm";

        return;
    }


    distanceValue.textContent =
        `${Math.round(
            nearest.distance
        )}cm`;


    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                100 -
                nearest.distance / 2
            )
        );


    distanceGauge.style.width =
        `${percentage}%`;

}


/* =================================================
   WRONG WAY
================================================= */

let wrongCooldown =
    0;


function checkWrongDirection() {

    if (
        wrongCooldown > 0
    ) {

        wrongCooldown--;

        return;
    }


    const center =
        window.innerHeight / 2;


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
            80;

    }


}


/* =================================================
   SYSTEM ACCESS
================================================= */

function checkSystemAccess() {

    const distance =
        Math.sqrt(

            Math.pow(
                playerX -
                SYSTEM_ACCESS_X,
                2
            )

            +

            Math.pow(
                playerY -
                window.innerHeight / 2,
                2
            )

        );


    if (
        distance < 100
    ) {

        showMessage(
            "SYSTEM ACCESS"
        );


        if (
            distance < 55
        ) {

            enterSystem();
        }

    }

}


/* =================================================
   INTERACTION
================================================= */

function interact() {

    if (
        mode === "intro"
    ) {

        checkSystemAccess();

        return;
    }


    if (
        mode !== "system"
    ) {

        return;
    }


    const nearest =
        findNearestObject();


    if (
        !nearest
    ) {

        showMessage(
            "주변에 조사할 것이 없다."
        );

        return;
    }


    handleSystemObject(
        nearest.type
    );

}


/* =================================================
   FIND NEAREST OBJECT
================================================= */

function findNearestObject() {

    let nearest =
        null;

    let nearestDistance =
        Infinity;


    systemObjects.forEach(
        (object) => {

            /*
                system-area 내부의
                % 위치를 실제 픽셀로 변환
            */

            const x =
                SYSTEM_X +
                window.innerWidth *
                parseFloat(
                    object.style.left
                ) /
                100;


            const y =
                window.innerHeight *
                parseFloat(
                    object.style.top
                ) /
                100;


            const distance =
                Math.sqrt(

                    Math.pow(
                        playerX - x,
                        2
                    )

                    +

                    Math.pow(
                        playerY - y,
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

                    type:
                        object.dataset.type,

                    element:
                        object,

                    distance:
                        distance
                };

            }

        }
    );


    /*
        EXIT
    */

    const exitX =
        SYSTEM_X +
        window.innerWidth *
        0.90;


    const exitY =
        window.innerHeight *
        0.78;


    const exitDistance =
        Math.sqrt(

            Math.pow(
                playerX -
                exitX,
                2
            )

            +

            Math.pow(
                playerY -
                exitY,
                2
            )

        );


    if (
        exitDistance <
        nearestDistance
    ) {

        nearest = {

            type:
                "exit",

            element:
                hiddenExit,

            distance:
                exitDistance
        };

    }


    if (
        nearest &&
        nearest.distance <
        130
    ) {

        return nearest;
    }


    return null;

}


/* =================================================
   OBJECT HANDLER
================================================= */

function handleSystemObject(type) {

    switch(type) {

        case "sensor":

            openPuzzle(
                "sensor"
            );

            break;


        case "power":

            openPuzzle(
                "power"
            );

            break;


        case "control":

            openPuzzle(
                "control"
            );

            break;


        case "diagnostics":

            if (
                state.sensor &&
                state.power &&
                state.control
            ) {

                openPuzzle(
                    "final"
                );

            }

            else {

                showMessage(
                    "아직 복구되지 않은 시스템이 있다."
                );

            }

            break;


        case "trash":

            showMessage(
                "휴지통에는 종이 조각만 남아 있다."
            );

            break;


        case "exit":

            if (
                state.exitRevealed
            ) {

                openPuzzle(
                    "final"
                );

            }

            else {

                showMessage(
                    "이곳에는 출구가 없는 것 같다."
                );

            }

            break;

    }

}


/* =================================================
   OPEN PUZZLE
================================================= */

function openPuzzle(name) {

    mode =
        name;


    puzzleRooms.forEach(
        (room) => {

            room.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            `puzzle-${name}`
        );


    if (!target) {

        return;
    }


    target.classList.add(
        "active"
    );


    /*
        퍼즐마다 초기 데이터 설정
    */

    if (
        name === "sensor"
    ) {

        state.sensorMeasurements =
            {};

        document
            .getElementById(
                "sensor-evidence"
            )
            .textContent =
            "센서 노드를 조사해라.";

    }


    if (
        name === "power"
    ) {

        state.powerNodes.clear();

        updatePowerText();

    }


    if (
        name === "control"
    ) {

        state.controlObservations.clear();

        document
            .getElementById(
                "control-evidence"
            )
            .textContent =
            "제어 응답을 조사해라.";
    }

}


/* =================================================
   RETURN TO SYSTEM
================================================= */

function returnToSystem() {

    mode =
        "system";


    puzzleRooms.forEach(
        (room) => {

            room.classList.remove(
                "active"
            );

        }
    );


    world.style.transform =
        `translateX(-${SYSTEM_X}px)`;


    updateSystemDistance();

}


/* =================================================
   BACK BUTTONS
================================================= */

document
    .querySelectorAll(
        "[data-back]"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                returnToSystem
            );

        }
    );


/* =================================================
   SENSOR INVESTIGATION
================================================= */

document
    .querySelectorAll(
        "[data-sensor]"
    )
    .forEach(
        (node) => {

            node.addEventListener(
                "click",
                () => {

                    const id =
                        node.dataset.sensor;


                    const values = {

                        A:
                            "REFERENCE 20cm / MEASURED 27cm",

                        B:
                            "REFERENCE 30cm / MEASURED 37cm",

                        C:
                            "REFERENCE 40cm / MEASURED 47cm"

                    };


                    state.sensorMeasurements[id] =
                        values[id];


                    document
                        .getElementById(
                            "sensor-evidence"
                        )
                        .innerHTML =
                        values[id] +
                        "<br><br>" +
                        "공통적인 차이를 찾아라.";

                }
            );

        }
    );


/* =================================================
   SENSOR SOLVE
================================================= */

document
    .getElementById(
        "sensor-submit"
    )
    .addEventListener(
        "click",
        () => {

            const answer =
                Number(
                    document
                        .getElementById(
                            "sensor-answer"
                        )
                        .value
                );


            if (
                Object.keys(
                    state.sensorMeasurements
                ).length < 3
            ) {

                document
                    .getElementById(
                        "sensor-evidence"
                    )
                    .textContent =
                    "세 센서를 모두 조사해야 한다.";

                return;
            }


            if (
                answer === -7
            ) {

                state.sensor =
                    true;


                showMessage(
                    "센서의 +7cm 오차를 보정했다."
                );


                addClearedPaper(
                    "SENSOR"
                );


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                document
                    .getElementById(
                        "sensor-evidence"
                    )
                    .textContent =
                    "세 측정값을 비교해 공통된 차이를 찾아라.";

            }

        }
    );


/* =================================================
   POWER INVESTIGATION
================================================= */

document
    .querySelectorAll(
        "[data-power]"
    )
    .forEach(
        (node) => {

            node.addEventListener(
                "click",
                () => {

                    const type =
                        node.dataset.power;


                    const messages = {

                        sensor:
                            "SENSOR: 항상 켜져 있어야 출구의 위치를 확인할 수 있다.",

                        cooling:
                            "COOLING: 현재 온도가 안전 범위라면 꺼도 된다.",

                        motor:
                            "MOTOR: 문을 움직이는 데 반드시 필요하다.",

                        light:
                            "LIGHT: 주변을 밝히지만 출구 제어에는 필요 없다."

                    };


                    state.powerNodes.add(
                        type
                    );


                    document
                        .getElementById(
                            "power-evidence"
                        )
                        .textContent =
                        messages[type];


                    updatePowerText();

                }
            );

        }
    );


/* =================================================
   POWER TEXT
================================================= */

function updatePowerText() {

    const active =
        Array.from(
            state.powerNodes
        );


    document
        .getElementById(
            "power-selected"
        )
        .textContent =

        active.length === 0
            ? "ACTIVE : NONE"
            : "ACTIVE : " +
              active.join(
                  " / "
              );

}


/* =================================================
   POWER SOLVE
================================================= */

document
    .getElementById(
        "power-submit"
    )
    .addEventListener(
        "click",
        () => {

            const required =
                [
                    "sensor",
                    "motor"
                ];


            const current =
                Array.from(
                    state.powerNodes
                ).sort();


            const answer =
                [
                    ...current
                ].sort();


            /*
                SENSOR + MOTOR만
            */

            if (
                JSON.stringify(
                    answer
                ) ===
                JSON.stringify(
                    required.sort()
                )
            ) {

                state.power =
                    true;


                showMessage(
                    "필수 장치만 활성화하여 전력망을 안정화했다."
                );


                addClearedPaper(
                    "POWER"
                );


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                document
                    .getElementById(
                        "power-evidence"
                    )
                    .textContent =
                    "각 장치의 역할을 확인하고 필요한 장치만 남겨라.";

            }

        }
    );


/* =================================================
   CONTROL INVESTIGATION
================================================= */

document
    .querySelectorAll(
        "[data-control]"
    )
    .forEach(
        (node) => {

            node.addEventListener(
                "click",
                () => {

                    const type =
                        node.dataset.control;


                    const messages = {

                        low:
                            "RESPONSE A — 목표값에 늦게 접근하지만 진동은 거의 없다.",

                        medium:
                            "RESPONSE B — 목표값 근처에서 안정적으로 수렴한다.",

                        high:
                            "RESPONSE C — 목표값을 크게 넘어선 뒤 진동한다."

                    };


                    state.controlObservations.add(
                        type
                    );


                    document
                        .getElementById(
                            "control-evidence"
                        )
                        .innerHTML =
                        messages[type] +
                        "<br><br>" +
                        "어떤 특성이 안정적인 제어에 가까운가?";

                }
            );

        }
    );


/* =================================================
   CONTROL SOLVE
================================================= */

document
    .getElementById(
        "control-submit"
    )
    .addEventListener(
        "click",
        () => {

            if (
                state.controlObservations.size < 3
            ) {

                document
                    .getElementById(
                        "control-evidence"
                    )
                    .textContent =
                    "세 응답을 모두 조사해야 한다.";

                return;
            }


            const kp =
                Number(
                    document
                        .getElementById(
                            "control-kp"
                        )
                        .value
                );

            const kd =
                Number(
                    document
                        .getElementById(
                            "control-kd"
                        )
                        .value
                );


            /*
                안정적인 조건
            */

            if (
                kp === 40 &&
                kd === 60
            ) {

                state.control =
                    true;


                showMessage(
                    "제어 응답이 안정적으로 수렴한다."
                );


                addClearedPaper(
                    "CONTROL"
                );


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                document
                    .getElementById(
                        "control-evidence"
                    )
                    .textContent =
                    "관찰한 응답을 비교하여 안정적인 Kp와 Kd를 추론해라.";

            }

        }
    );


/* =================================================
   CLEARED PAPER
================================================= */

function addClearedPaper(type) {

    /*
        이미 만들어졌으면 다시 만들지 않음
    */

    if (
        document.querySelector(
            `[data-cleared="${type}"]`
        )
    ) {

        return;
    }


    const paper =
        document.createElement(
            "div"
        );


    paper.className =
        "cleared-paper";


    paper.dataset.cleared =
        type;


    const positions = {

        SENSOR:
            ["18%", "72%"],

        POWER:
            ["48%", "75%"],

        CONTROL:
            ["72%", "70%"]

    };


    const position =
        positions[type];


    paper.style.left =
        position[0];

    paper.style.top =
        position[1];


    paper.innerHTML =

        `
        <strong>
            ${type}
        </strong>

        <br><br>

        RECOVERED
        `;


    clearedFiles.appendChild(
        paper
    );


    checkAllCleared();

}


/* =================================================
   CHECK ALL CLEAR
================================================= */

function checkAllCleared() {

    if (
        state.sensor &&
        state.power &&
        state.control
    ) {

        state.exitRevealed =
            true;


        hiddenExit.classList.add(
            "revealed"
        );


        document
            .getElementById(
                "system-state"
            )
            .textContent =
            "SYSTEM RESTORED";


        document
            .getElementById(
                "system-state"
            )
            .style.color =
            "#a8c9b1";


        showMessage(
            "세 시스템이 모두 복구됐다. 방 어딘가에서 새로운 신호가 감지된다."
        );

    }

}


/* =================================================
   FINAL CHECK
================================================= */

document
    .getElementById(
        "final-submit"
    )
    .addEventListener(
        "click",
        () => {

            if (
                state.sensor
            ) {

                document
                    .getElementById(
                        "final-sensor"
                    )
                    .textContent =
                    "ONLINE";

            }


            if (
                state.power
            ) {

                document
                    .getElementById(
                        "final-power"
                    )
                    .textContent =
                    "ONLINE";

            }


            if (
                state.control
            ) {

                document
                    .getElementById(
                        "final-control"
                    )
                    .textContent =
                    "ONLINE";

            }


            if (
                state.sensor &&
                state.power &&
                state.control
            ) {

                setTimeout(
                    finishGame,
                    900
                );

            }

        }
    );


/* =================================================
   FINISH GAME
================================================= */

function finishGame() {

    mode =
        "escaped";


    game.innerHTML =

        `
        <div class="ending-screen">

            <div>
                SYSTEM CONNECTION
            </div>

            <strong>
                RESTORED
            </strong>

            <p>
                센서와 전력, 제어 시스템을 복구했다.<br>
                출구 잠금이 해제되었다.<br><br>
                시설을 빠져나왔다.
            </p>

            <span>
                END
            </span>

        </div>
        `;

}


/* =================================================
   MESSAGE
================================================= */

function showMessage(message) {

    dialogue.textContent =
        message;

}


/* =================================================
   RESIZE
================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            mode === "intro"
        ) {

            playerY =
                Math.min(
                    playerY,
                    window.innerHeight -
                    70
                );

            updateIntroCamera();

        }


        if (
            mode === "system"
        ) {

            playerY =
                Math.min(
                    playerY,
                    window.innerHeight -
                    70
                );

            updateSystemView();

        }

    }
);


/* =================================================
   START
================================================= */

player.style.left =
    `${playerX}px`;

player.style.top =
    `${playerY}px`;

updateIntroCamera();

updateIntroDistance();

gameLoop();
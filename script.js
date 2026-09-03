/* =================================================
   ELEMENTS
================================================= */

const game = document.getElementById("game");
const world = document.getElementById("world");
const player = document.getElementById("player");

const dialogue = document.getElementById("dialogue-text");

const distanceValue =
    document.getElementById("distance-value");

const distanceGauge =
    document.getElementById("distance-gauge");

const systemObjects =
    document.querySelectorAll(".system-object");

const puzzleMaps =
    document.querySelectorAll(".puzzle-map");

const hiddenExit =
    document.getElementById("hidden-exit");


/* =================================================
   SETTINGS
================================================= */

const WORLD_WIDTH = 3500;

const SYSTEM_START = 1700;

const SYSTEM_ACCESS_X = 1580;

const SPEED = 5;


/* =================================================
   PLAYER WORLD POSITION
================================================= */

let playerX = 300;

let playerY =
    window.innerHeight * 0.5;


/* =================================================
   GAME STATE
================================================= */

let mode = "intro";

let cameraX = 0;

let wrongCooldown = 0;


/* =================================================
   PUZZLE STATE
================================================= */

const state = {

    documents: false,
    sensors: false,
    control: false,
    power: false,
    diagnostics: false,
    exitRevealed: false

};


/* =================================================
   KEY STATE
================================================= */

const keys = {

    up: false,
    down: false,
    left: false,
    right: false

};


/* =================================================
   KEYBOARD
================================================= */

document.addEventListener("keydown", (event) => {

    switch (event.code) {

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

        case "Space":

            event.preventDefault();

            interact();

            break;
    }

});


document.addEventListener("keyup", (event) => {

    switch (event.code) {

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

});


/* =================================================
   MAIN UPDATE
================================================= */

function update() {

    if (
        mode === "intro" ||
        mode === "system"
    ) {

        movePlayer();

    }

}


/* =================================================
   PLAYER MOVEMENT
================================================= */

function movePlayer() {

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


    /*
        실제 플레이어 좌표 변경
    */

    playerX += dx;
    playerY += dy;


    /* =============================================
       INTRO LIMIT
    ============================================= */

    if (mode === "intro") {

        playerX = Math.max(
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

    if (mode === "system") {

        const minX =
            SYSTEM_START + 40;

        const maxX =
            SYSTEM_START +
            window.innerWidth -
            40;


        playerX = Math.max(
            minX,
            Math.min(
                maxX,
                playerX
            )
        );

    }


    /* =============================================
       Y LIMIT
    ============================================= */

    playerY = Math.max(
        70,
        Math.min(
            window.innerHeight - 70,
            playerY
        )
    );


    /*
        실제 화면에 플레이어 표시
    */

    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;


    /* =============================================
       CAMERA
    ============================================= */

    if (mode === "intro") {

        updateIntroCamera();

        updateIntroDistance();

        checkWrongWay();

        checkSystemAccess();

    }


    if (mode === "system") {

        /*
            SYSTEM에서는 카메라 이동 없음
        */

        world.style.transform =
            "translateX(-1700px)";

        updateSystemDistance();

    }


    if (wrongCooldown > 0) {

        wrongCooldown--;

    }

}


/* =================================================
   INTRO CAMERA
================================================= */

function updateIntroCamera() {

    /*
        플레이어가 화면 중앙 근처에 오도록
        월드를 반대로 이동한다.
    */

    let target =
        playerX -
        window.innerWidth / 2;


    /*
        INTRO WORLD는
        1700px에서 끝난다.
    */

    const maxCamera =
        SYSTEM_ACCESS_X -
        window.innerWidth / 2;


    target = Math.max(
        0,
        Math.min(
            maxCamera,
            target
        )
    );


    cameraX = target;


    world.style.transform =
        `translateX(${-cameraX}px)`;

}


/* =================================================
   ENTER SYSTEM
================================================= */

function enterSystem() {

    mode = "system";


    /*
        SYSTEM 화면의 중앙에
        플레이어 배치
    */

    playerX =
        SYSTEM_START +
        window.innerWidth / 2;

    playerY =
        window.innerHeight * 0.55;


    /*
        월드를 SYSTEM 시작점으로 이동
    */

    world.style.transform =
        "translateX(-1700px)";


    player.style.left =
        `${playerX}px`;

    player.style.top =
        `${playerY}px`;


    /*
        SYSTEM 화면 상태
    */

    dialogue.textContent =
        "SYSTEM에 접속했다. 주변을 조사해 보자.";

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
        distance < 120
    ) {

        showMessage(
            "SYSTEM에 접속할 수 있을 것 같다."
        );

    }


    if (
        distance < 55
    ) {

        enterSystem();

    }

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


    const gauge =
        Math.max(
            0,
            Math.min(
                100,
                100 -
                distance / 12
            )
        );


    distanceGauge.style.width =
        `${gauge}%`;

}


/* =================================================
   SYSTEM DISTANCE
================================================= */

function updateSystemDistance() {

    const objects =
        document.querySelectorAll(
            ".system-object"
        );


    let closest =
        Infinity;


    objects.forEach(
        (object) => {

            const x =
                SYSTEM_START +
                getPercentX(
                    object
                );

            const y =
                getPercentY(
                    object
                );


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
                distance < closest
            ) {

                closest = distance;

            }

        }
    );


    if (
        closest !== Infinity
    ) {

        distanceValue.textContent =
            `${Math.round(closest)}cm`;

    }

}


/* =================================================
   PERCENT POSITION
================================================= */

function getPercentX(object) {

    const percent =
        parseFloat(
            object.style.left
        );


    return (
        window.innerWidth *
        percent /
        100
    );

}


function getPercentY(object) {

    const percent =
        parseFloat(
            object.style.top
        );


    return (
        window.innerHeight *
        percent /
        100
    );

}


/* =================================================
   WRONG WAY
================================================= */

function checkWrongWay() {

    if (
        wrongCooldown > 0
    ) {

        return;

    }


    const center =
        window.innerHeight / 2;


    const difference =
        Math.abs(
            playerY -
            center
        );


    if (
        difference > 220
    ) {

        showMessage(
            "여긴 아닌 것 같다."
        );

        wrongCooldown =
            80;

        return;

    }


    if (
        playerX < 100
    ) {

        showMessage(
            "뒤쪽에는 아무것도 없다."
        );

        wrongCooldown =
            80;

    }

}


/* =================================================
   INTERACTION
================================================= */

function interact() {

    if (
        mode === "intro"
    ) {

        const dx =
            playerX -
            SYSTEM_ACCESS_X;

        const dy =
            playerY -
            window.innerHeight / 2;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance < 110
        ) {

            enterSystem();

        }

        else {

            showMessage(
                "주변에 조사할 것이 없다."
            );

        }

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
        nearest === null
    ) {

        showMessage(
            "주변에 조사할 것이 없다."
        );

        return;

    }


    handleObject(
        nearest.type
    );

}


/* =================================================
   FIND OBJECT
================================================= */

function findNearestObject() {

    let result =
        null;

    let closest =
        Infinity;


    systemObjects.forEach(
        (object) => {

            const x =
                SYSTEM_START +
                getPercentX(object);

            const y =
                getPercentY(object);


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
                distance < closest
            ) {

                closest =
                    distance;

                result = {

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
        숨겨진 EXIT
    */

    const exitX =
        SYSTEM_START +
        window.innerWidth *
        0.89;

    const exitY =
        window.innerHeight *
        0.73;


    const exitDistance =
        Math.sqrt(

            Math.pow(
                playerX - exitX,
                2
            )

            +

            Math.pow(
                playerY - exitY,
                2
            )

        );


    if (
        exitDistance < closest
    ) {

        result = {

            type: "exit",

            element: hiddenExit,

            distance: exitDistance

        };

    }


    if (
        result &&
        result.distance < 120
    ) {

        return result;

    }


    return null;

}


/* =================================================
   OBJECT HANDLER
================================================= */

function handleObject(type) {

    switch(type) {

        case "documents":

            openPuzzle(
                "documents"
            );

            break;


        case "sensors":

            openPuzzle(
                "sensors"
            );

            break;


        case "control":

            openPuzzle(
                "control"
            );

            break;


        case "power":

            openPuzzle(
                "power"
            );

            break;


        case "diagnostics":

            openPuzzle(
                "diagnostics"
            );

            break;


        case "error":

            showMessage(
                "ERROR_LOG.txt — 센서 → 제어 → 모터의 오류 기록이다."
            );

            break;


        case "trash":

            showMessage(
                "휴지통은 비어 있다."
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
                    "아직 출구가 보이지 않는다."
                );

            }

            break;

    }

}


/* =================================================
   PUZZLE MAP
================================================= */

function openPuzzle(name) {

    mode =
        name;


    document.body.classList.add(
        "puzzle-open"
    );


    puzzleMaps.forEach(
        (map) => {

            map.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            `map-${name}`
        );


    if (
        target
    ) {

        target.classList.add(
            "active"
        );

    }

}


/* =================================================
   RETURN
================================================= */

function returnToSystem() {

    mode =
        "system";


    document.body.classList.remove(
        "puzzle-open"
    );


    puzzleMaps.forEach(
        (map) => {

            map.classList.remove(
                "active"
            );

        }
    );


    world.style.transform =
        "translateX(-1700px)";


    updateSystemDistance();

}


/* =================================================
   DOCUMENT PUZZLE
================================================= */

document
    .querySelectorAll(
        "#map-documents [data-answer]"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const answer =
                        button.dataset.answer;


                    if (
                        answer === "sensor"
                    ) {

                        state.documents =
                            true;


                        document
                            .getElementById(
                                "document-result"
                            )
                            .textContent =
                            "추론 성공.";

                        setTimeout(
                            returnToSystem,
                            700
                        );

                    }

                    else {

                        document
                            .getElementById(
                                "document-result"
                            )
                            .textContent =
                            "기록을 다시 비교해 보자.";

                    }

                }
            );

        }
    );


/* =================================================
   SENSOR PUZZLE
================================================= */

document
    .querySelectorAll(
        ".measurement-station"
    )
    .forEach(
        (station) => {

            station.addEventListener(
                "click",
                () => {

                    const value =
                        station.dataset.measurement;


                    document
                        .getElementById(
                            "sensor-evidence"
                        )
                        .textContent =
                        `MEASURED : ${value}`;

                }
            );

        }
    );


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
                answer === -8
            ) {

                state.sensors =
                    true;


                result.textContent =
                    "CALIBRATION COMPLETE";


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                result.textContent =
                    "측정값의 공통 오차를 다시 확인해라.";

            }

        }
    );


/* =================================================
   CONTROL PUZZLE
================================================= */

const kpSlider =
    document.getElementById(
        "kp-slider"
    );

const kdSlider =
    document.getElementById(
        "kd-slider"
    );

const kpValue =
    document.getElementById(
        "kp-value"
    );

const kdValue =
    document.getElementById(
        "kd-value"
    );

const controlAngle =
    document.getElementById(
        "control-angle"
    );


function updateControl() {

    const kp =
        Number(
            kpSlider.value
        );

    const kd =
        Number(
            kdSlider.value
        );


    const response =
        63 +
        kp * 0.9 -
        kd * 0.12;


    controlAngle.textContent =
        `${Math.round(response)}°`;

}


kpSlider.addEventListener(
    "input",
    () => {

        kpValue.textContent =
            `Kp = ${kpSlider.value}`;

        updateControl();

    }
);


kdSlider.addEventListener(
    "input",
    () => {

        kdValue.textContent =
            `Kd = ${kdSlider.value}`;

        updateControl();

    }
);


document
    .getElementById(
        "control-submit"
    )
    .addEventListener(
        "click",
        () => {

            const kp =
                Number(
                    kpSlider.value
                );

            const kd =
                Number(
                    kdSlider.value
                );


            const response =
                63 +
                kp * 0.9 -
                kd * 0.12;


            const result =
                document.getElementById(
                    "control-result"
                );


            if (
                response >= 88 &&
                response <= 92 &&
                kd >= 35
            ) {

                state.control =
                    true;


                result.textContent =
                    "CONTROL RESPONSE : STABLE";


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                result.textContent =
                    "목표값과 감쇠 조건을 다시 확인해라.";

            }

        }
    );


/* =================================================
   POWER PUZZLE
================================================= */

const powerSensor =
    document.getElementById(
        "power-sensor"
    );

const powerCooling =
    document.getElementById(
        "power-cooling"
    );

const powerMotor =
    document.getElementById(
        "power-motor"
    );

const powerLight =
    document.getElementById(
        "power-light"
    );

const powerLoad =
    document.getElementById(
        "power-load"
    );


function calculatePower() {

    let load =
        0;


    if (
        powerSensor.checked
    ) {

        load += 15;
    }


    if (
        powerCooling.checked
    ) {

        load += 30;
    }


    if (
        powerMotor.checked
    ) {

        load += 40;
    }


    if (
        powerLight.checked
    ) {

        load += 10;
    }


    powerLoad.textContent =
        `LOAD : ${load}%`;


    return load;

}


[
    powerSensor,
    powerCooling,
    powerMotor,
    powerLight
]
.forEach(
    (checkbox) => {

        checkbox.addEventListener(
            "change",
            calculatePower
        );

    }
);


document
    .getElementById(
        "power-submit"
    )
    .addEventListener(
        "click",
        () => {

            const load =
                calculatePower();


            const result =
                document.getElementById(
                    "power-result"
                );


            if (
                powerSensor.checked &&
                powerCooling.checked &&
                powerMotor.checked &&
                !powerLight.checked &&
                load === 85
            ) {

                state.power =
                    true;


                result.textContent =
                    "POWER STABLE : 85%";


                setTimeout(
                    returnToSystem,
                    700
                );

            }

            else {

                result.textContent =
                    "필요한 시스템과 전력량을 다시 분석해라.";

            }

        }
    );


/* =================================================
   DIAGNOSTICS
================================================= */

document
    .getElementById(
        "diagnostic-submit"
    )
    .addEventListener(
        "click",
        () => {

            const sensor =
                document.getElementById(
                    "diag-sensor"
                );

            const power =
                document.getElementById(
                    "diag-power"
                );

            const control =
                document.getElementById(
                    "diag-control"
                );

            sensor.textContent =
                state.sensors
                    ? "ONLINE"
                    : "ERROR";

            power.textContent =
                state.power
                    ? "ONLINE"
                    : "ERROR";

            control.textContent =
                state.control
                    ? "ONLINE"
                    : "ERROR";


            if (
                state.sensors &&
                state.power &&
                state.control
            ) {

                state.diagnostics =
                    true;

                state.exitRevealed =
                    true;


                hiddenExit.classList.add(
                    "revealed"
                );


                document
                    .getElementById(
                        "diagnostic-result"
                    )
                    .textContent =
                    "ALL SYSTEMS NORMAL";


                setTimeout(
                    returnToSystem,
                    900
                );

            }

            else {

                document
                    .getElementById(
                        "diagnostic-result"
                    )
                    .textContent =
                    "아직 복구되지 않은 시스템이 있다.";

            }

        }
    );


/* =================================================
   FINAL
================================================= */

document
    .getElementById(
        "final-exit"
    )
    .addEventListener(
        "click",
        () => {

            mode =
                "escaped";


            game.innerHTML = `
                <div class="ending-screen">

                    <div>
                        SYSTEM CONNECTION
                    </div>

                    <strong>
                        RESTORED
                    </strong>

                    <p>
                        모든 시스템을 복구하고<br>
                        시설을 탈출했다.
                    </p>

                    <span>
                        END
                    </span>

                </div>
            `;

        }
    );


/* =================================================
   RETURN BUTTON
================================================= */

document
    .querySelectorAll(
        "[data-return]"
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
   MESSAGE
================================================= */

function showMessage(message) {

    dialogue.textContent =
        message;

}


/* =================================================
   INITIALIZE
================================================= */

player.style.left =
    `${playerX}px`;

player.style.top =
    `${playerY}px`;

updateIntroCamera();

updateIntroDistance();


/* =================================================
   GAME LOOP
================================================= */

function gameLoop() {

    update();

    requestAnimationFrame(
        gameLoop
    );

}

gameLoop();
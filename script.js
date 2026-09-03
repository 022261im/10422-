* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

body {
    background: #070c12;
    color: #dce6ef;

    font-family:
        "Courier New",
        monospace;

    image-rendering: pixelated;
}


/* =================================================
   GAME
================================================= */

#game {
    position: relative;

    width: 100vw;
    height: 100vh;

    overflow: hidden;

    background: #0b1219;
}


/* =================================================
   WORLD
================================================= */

#world {
    position: absolute;

    left: 0;
    top: 0;

    width: 3500px;
    height: 100%;

    will-change: transform;

    transition:
        transform 0.08s linear;
}


/* =================================================
   INTRO
================================================= */

#intro-area {
    position: absolute;

    left: 0;
    top: 0;

    width: 1700px;
    height: 100%;

    overflow: hidden;

    background:
        radial-gradient(
            ellipse at 83% 50%,
            #253b4b 0%,
            #172731 26%,
            #101921 57%,
            #080d13 100%
        );
}


.intro-title {
    position: absolute;

    left: 120px;
    top: 42%;

    color: #8195a5;

    font-size: 18px;

    letter-spacing: 4px;
}


.intro-subtitle {
    position: absolute;

    left: 120px;
    top: calc(42% + 34px);

    color: #536875;

    font-size: 10px;

    letter-spacing: 2px;
}


/* =================================================
   LIGHT
================================================= */

.light-path {
    position: absolute;

    left: 0;
    top: 50%;

    width: 1600px;
    height: 320px;

    transform:
        translateY(-50%);

    background:
        linear-gradient(
            90deg,
            rgba(100,180,235,0),
            rgba(112,189,238,.025) 25%,
            rgba(137,203,242,.08) 46%,
            rgba(166,220,250,.17) 67%,
            rgba(199,235,255,.36) 85%,
            rgba(224,248,255,.62)
        );

    filter:
        blur(38px);

    pointer-events:
        none;
}


.light-core {
    position: absolute;

    left: 90px;
    top: 50%;

    width: 1510px;
    height: 22px;

    transform:
        translateY(-50%);

    background:
        linear-gradient(
            90deg,
            transparent,
            rgba(137,201,238,.04) 30%,
            rgba(181,226,249,.13) 64%,
            rgba(220,246,255,.62)
        );

    filter:
        blur(13px);

    pointer-events:
        none;
}


/* =================================================
   ACCESS
================================================= */

#system-access {
    position: absolute;

    left: 1580px;
    top: 50%;

    width: 130px;
    height: 150px;

    transform:
        translate(-50%, -50%);

    display: flex;

    align-items: center;
    justify-content: center;
}


.access-frame {
    position: absolute;

    width: 82px;
    height: 82px;

    border:
        1px solid #a7cbe0;

    transform:
        rotate(45deg);

    box-shadow:
        0 0 24px
        rgba(135,204,242,.2);
}


.access-core {
    width: 18px;
    height: 18px;

    background: #edf9ff;

    box-shadow:
        0 0 13px #d8f2ff,
        0 0 35px rgba(132,210,255,.8);

    animation:
        accessPulse 1.35s
        infinite
        alternate;
}


.access-label {
    position: absolute;

    top: 107px;

    color: #90a9bb;

    font-size: 9px;

    letter-spacing: 3px;
}


@keyframes accessPulse {

    from {
        transform: scale(.65);
        opacity: .55;
    }

    to {
        transform: scale(1.2);
        opacity: 1;
    }
}


/* =================================================
   SYSTEM AREA
================================================= */

#system-area {
    position: absolute;

    left: 1700px;
    top: 0;

    width: 100vw;
    height: 100%;

    overflow: hidden;

    background:
        linear-gradient(
            rgba(255,255,255,.018) 1px,
            transparent 1px
        ),
        linear-gradient(
            90deg,
            rgba(255,255,255,.018) 1px,
            transparent 1px
        ),
        #26313c;

    background-size:
        56px 56px;

    border-left:
        1px solid #617583;
}


/* =================================================
   SYSTEM VIEW
================================================= */

.system-view #world {
    transform:
        translateX(-1700px) !important;
}

.system-view #intro-area {
    display: none;
}


/* =================================================
   SYSTEM HEADER
================================================= */

.system-header {
    position: absolute;

    left: 6%;
    right: 6%;
    top: 45px;

    display: flex;

    justify-content: space-between;

    padding-bottom: 12px;

    border-bottom:
        1px solid #536673;

    color: #a5b5c0;

    font-size: 12px;

    letter-spacing: 2px;
}


#system-state {
    color: #7ca18a;
}


/* =================================================
   PLAYER
================================================= */

#player {
    position: absolute;

    width: 42px;
    height: 64px;

    transform:
        translate(-50%, -50%);

    z-index: 100;
}


.player-shadow {
    position: absolute;

    left: 4px;
    top: 53px;

    width: 34px;
    height: 7px;

    background:
        rgba(0,0,0,.45);

    border-radius: 50%;
}


.player-head {
    position: absolute;

    left: 10px;
    top: 0;

    width: 22px;
    height: 22px;

    background: #9b623c;

    border:
        3px solid #15191d;
}


.player-body {
    position: absolute;

    left: 6px;
    top: 23px;

    width: 30px;
    height: 30px;

    background: #dbe3e7;

    border:
        3px solid #15191d;
}


/* =================================================
   SYSTEM OBJECT
================================================= */

.system-object {
    position: absolute;

    width: 120px;

    transform:
        translate(-50%, -50%);

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 9px;

    color: #d0dce3;

    font-size: 11px;

    text-align: center;

    transition:
        filter .15s;
}

.system-object:hover {
    filter:
        brightness(1.18);
}


/* =================================================
   FOLDER
================================================= */

.folder-icon {
    position: relative;

    width: 58px;
    height: 42px;

    background:
        linear-gradient(
            #f3c63d,
            #dfa91f
        );

    border:
        3px solid #55420c;

    border-radius:
        3px 5px 5px 5px;

    box-shadow:
        0 4px 0 rgba(0,0,0,.2);
}


.folder-icon::before {
    content: "";

    position: absolute;

    left: -3px;
    top: -11px;

    width: 26px;
    height: 11px;

    background:
        #f3c63d;

    border:
        3px solid #55420c;

    border-bottom:
        none;
}


/* =================================================
   DOCUMENT
================================================= */

.document-icon {
    position: relative;

    width: 46px;
    height: 56px;

    background:
        #edf1f3;

    border:
        3px solid #242b31;
}


.document-lines {
    position: absolute;

    left: 8px;
    top: 23px;

    display: flex;

    flex-direction: column;

    gap: 6px;
}


.document-lines i {
    width: 25px;
    height: 2px;

    background:
        #75838d;
}


.extension {
    position: absolute;

    right: -20px;
    bottom: 0;

    min-width: 29px;
    height: 17px;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
        #edf1f3;

    border:
        3px solid #242b31;

    color:
        #293038;

    font-size: 8px;
}


/* =================================================
   TRASH
================================================= */

.trash {
    position: relative;

    width: 55px;
    height: 61px;
}


.trash-handle {
    position: absolute;

    left: 20px;
    top: 0;

    width: 15px;
    height: 8px;

    border:
        3px solid #bdc8d0;

    border-bottom:
        none;
}


.trash-lid {
    position: absolute;

    left: 4px;
    top: 9px;

    width: 47px;
    height: 9px;

    background:
        #8998a3;

    border:
        3px solid #c3cdd4;

    border-radius: 2px;
}


.trash-body {
    position: absolute;

    left: 10px;
    top: 17px;

    width: 36px;
    height: 40px;

    background:
        #6d7b85;

    border:
        3px solid #bbc7ce;

    clip-path:
        polygon(
            4% 0,
            96% 0,
            82% 100%,
            18% 100%
        );

    display: flex;

    justify-content: space-evenly;
}


.trash-body i {
    width: 3px;
    height: 27px;

    margin-top: 5px;

    background:
        #46525b;
}


/* =================================================
   HIDDEN EXIT
================================================= */

#hidden-exit {
    position: absolute;

    width: 80px;

    transform:
        translate(-50%, -50%);

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 8px;

    color: #7a8f9b;

    font-size: 10px;

    opacity: .025;

    transition:
        opacity .7s ease;
}


#hidden-exit.revealed {
    opacity: 1;
}


.exit-door {
    width: 56px;
    height: 76px;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
        #18222b;

    border:
        1px solid #7d919d;
}


.exit-question {
    color: #9db1bd;
    font-size: 15px;
}


/* =================================================
   HUD
================================================= */

#system-status {
    position: fixed;

    left: 16px;
    top: 16px;

    width: 205px;

    padding:
        10px 12px;

    background:
        rgba(13,20,28,.93);

    border:
        1px solid #657784;

    border-radius: 3px;

    z-index: 300;
}


.status-title {
    margin-bottom: 7px;

    padding-bottom: 6px;

    color: #dce5eb;

    font-size: 13px;

    font-weight: bold;

    letter-spacing: 1px;

    border-bottom:
        1px solid #4e606f;
}


.status-row {
    display: flex;

    align-items: center;

    gap: 6px;

    margin:
        7px 0;

    font-size: 10px;
}


.status-row span:first-child {
    width: 37px;

    color:
        #9babb8;
}


.status-row strong {
    width: 42px;

    text-align:
        right;

    font-size:
        10px;

    font-weight:
        normal;
}


.gauge {
    width: 65px;
    height: 8px;

    overflow:
        hidden;

    background:
        #18222b;

    border:
        1px solid #344551;
}


.gauge span {
    display:
        block;

    width:
        50%;

    height:
        100%;

    background:
        #91b4ce;

    transition:
        width .2s ease;
}


/* =================================================
   DIALOGUE
================================================= */

#dialogue {
    position: fixed;

    left: 50%;
    bottom: 24px;

    transform:
        translateX(-50%);

    width:
        min(760px,82vw);

    min-height:
        76px;

    padding:
        15px 20px;

    background:
        rgba(17,25,34,.96);

    border:
        1px solid #7e8e9d;

    border-radius:
        2px;

    z-index:
        300;
}


#dialogue-text {
    min-height:
        38px;

    font-size:
        15px;

    line-height:
        1.5;
}


#dialogue-hint {
    position:
        absolute;

    right:
        12px;

    bottom:
        7px;

    color:
        #94a5b4;

    font-size:
        10px;
}


/* =================================================
   PUZZLE MAPS
================================================= */

.puzzle-map {
    position: fixed;

    left: 0;
    top: 0;

    width: 100vw;
    height: 100vh;

    display: none;

    z-index: 1000;

    overflow: hidden;

    background:
        radial-gradient(
            circle at center,
            #263b49 0%,
            #182832 55%,
            #0b141b 100%
        );
}


.puzzle-map.active {
    display: block;
}


/*
    퍼즐 맵이 열리면
    기존 HUD가 클릭을 가로막지 않도록 한다.
*/

.puzzle-open #system-status,
.puzzle-open #dialogue {
    display: none;
}


/* =================================================
   PUZZLE TEXT
================================================= */

.map-title {
    position: absolute;

    left: 70px;
    top: 55px;

    color:
        #cedee7;

    font-size:
        21px;

    letter-spacing:
        3px;
}


.map-subtitle {
    position: absolute;

    left: 70px;
    top: 89px;

    color:
        #8298a7;

    font-size:
        10px;

    letter-spacing:
        2px;
}


/* =================================================
   CLUE OBJECTS
================================================= */

.clue-object,
.measurement-station {
    position: absolute;

    transform:
        translate(-50%,-50%);

    width:
        150px;

    min-height:
        65px;

    border:
        1px solid #748b9a;

    background:
        #17242d;

    color:
        #c9d9e2;

    font-family:
        "Courier New",
        monospace;

    font-size:
        11px;

    cursor:
        pointer;

    z-index:
        20;
}


.clue-object:hover,
.measurement-station:hover {
    background:
        #263b48;
}


/* =================================================
   EVIDENCE PANEL
================================================= */

.evidence-panel {
    position: absolute;

    right: 8%;
    top: 20%;

    width:
        300px;

    min-height:
        180px;

    padding:
        20px;

    background:
        #101a22;

    border:
        1px solid #5e7380;

    color:
        #bdcdd6;

    font-size:
        11px;

    line-height:
        1.8;

    z-index:
        10;
}


/* =================================================
   DOCUMENT DEDUCTION
================================================= */

.deduction-question {
    position: absolute;

    left: 70px;
    bottom: 175px;

    color:
        #bdcbd3;

    font-size:
        14px;
}


.answer-grid {
    position: absolute;

    left: 70px;
    bottom: 90px;

    display:
        grid;

    grid-template-columns:
        repeat(2, 160px);

    gap:
        8px;
}


.answer-grid button {
    padding:
        10px;

    border:
        1px solid #748995;

    background:
        #263842;

    color:
        #d5e0e6;

    cursor:
        pointer;
}


.answer-grid button:hover {
    background:
        #354c58;
}


/* =================================================
   SENSOR
================================================= */

.sensor-question {
    position: absolute;

    left: 15%;
    top: 60%;

    width:
        350px;

    color:
        #aebfc9;

    font-size:
        12px;

    line-height:
        1.7;
}


#sensor-input {
    position: absolute;

    left: 55%;
    top: 59%;

    width:
        140px;

    padding:
        10px;

    background:
        #111b23;

    border:
        1px solid #687d89;

    color:
        #dbe6ec;
}


#sensor-submit {
    position: absolute;

    left: calc(55% + 150px);
    top: 59%;

    padding:
        10px 14px;

    border:
        1px solid #7a909e;

    background:
        #263842;

    color:
        #d8e4e9;

    cursor:
        pointer;
}


/* =================================================
   CONTROL
================================================= */

.control-machine {
    position: absolute;

    left: 12%;
    top: 20%;

    width:
        470px;

    padding:
        25px;

    background:
        #101a22;

    border:
        1px solid #637986;
}


.control-screen {
    padding:
        18px;

    border:
        1px solid #4c626f;

    line-height:
        1.7;
}


.control-screen strong {
    display:
        block;

    margin-bottom:
        10px;

    color:
        #d9e8ef;

    font-size:
        28px;
}


.control-machine label {
    display:
        block;

    margin-top:
        20px;

    margin-bottom:
        8px;

    color:
        #a8bbc5;

    font-size:
        11px;
}


.control-machine input {
    width:
        100%;
}


#kp-value,
#kd-value {
    margin-top:
        6px;

    color:
        #91a7b5;

    font-size:
        10px;
}


#control-submit {
    margin-top:
        25px;

    padding:
        10px 14px;

    border:
        1px solid #7d919d;

    background:
        #263a45;

    color:
        #dce7ed;

    cursor:
        pointer;
}


.control-observation {
    position: absolute;

    right: 12%;
    top: 30%;

    width:
        300px;

    padding:
        20px;

    background:
        #101a22;

    border:
        1px solid #536975;

    color:
        #9eb2be;

    font-size:
        11px;

    line-height:
        1.8;
}


/* =================================================
   POWER
================================================= */

.power-budget {
    position: absolute;

    left: 10%;
    top: 20%;

    width:
        260px;

    padding:
        20px;

    background:
        #101a22;

    border:
        1px solid #566d7a;
}


.power-budget strong {
    display:
        block;

    margin-top:
        10px;

    font-size:
        28px;

    color:
        #d7e7ee;
}


.power-info {
    position: absolute;

    left: 10%;
    top: 42%;

    width:
        320px;

    background:
        #111b23;

    border:
        1px solid #506571;
}


.power-info div {
    display:
        flex;

    justify-content:
        space-between;

    padding:
        12px;

    border-bottom:
        1px solid #344852;

    font-size:
        11px;
}


.power-info div:last-child {
    border-bottom:
        none;
}


.power-switches {
    position: absolute;

    right: 18%;
    top: 22%;

    display:
        flex;

    flex-direction:
        column;

    gap:
        20px;
}


.power-switches label {
    color:
        #c4d2da;

    font-size:
        13px;

    cursor:
        pointer;
}


.power-load {
    position: absolute;

    right: 18%;
    top: 55%;

    color:
        #a9bdc8;

    font-size:
        18px;
}


#power-submit {
    position: absolute;

    right: 18%;
    top: 61%;

    padding:
        10px 15px;

    border:
        1px solid #7c919e;

    background:
        #263842;

    color:
        #dce7ed;

    cursor:
        pointer;
}


/* =================================================
   PUZZLE RESULT
================================================= */

.puzzle-result {
    color:
        #a9c8b1;

    font-size:
        12px;
}


/* =================================================
   DIAGNOSTICS
================================================= */

.diagnostic-panel {
    position: absolute;

    left: 14%;
    top: 22%;

    width:
        420px;

    background:
        #101a22;

    border:
        1px solid #607582;
}


.diagnostic-panel div {
    display:
        flex;

    justify-content:
        space-between;

    padding:
        17px;

    color:
        #c7d6dd;

    border-bottom:
        1px solid #3e525d;
}


.diagnostic-panel div:last-child {
    border-bottom:
        none;
}


.diagnostic-panel span {
    color:
        #ba6e6e;
}


#diagnostic-submit {
    position: absolute;

    left: 14%;
    top: 53%;

    padding:
        10px 15px;

    border:
        1px solid #7c919e;

    background:
        #263842;

    color:
        #dce7ed;

    cursor:
        pointer;
}


#diagnostic-result {
    position: absolute;

    left: 14%;
    top: 63%;
}


/* =================================================
   RETURN
================================================= */

.return-button {
    position: absolute;

    right: 30px;
    bottom: 25px;

    padding:
        9px 12px;

    border:
        1px solid #708692;

    background:
        #1c2b34;

    color:
        #aebec7;

    font-family:
        "Courier New",
        monospace;

    font-size:
        10px;

    cursor:
        pointer;

    z-index:
        50;
}


.return-button:hover {
    background:
        #2b404c;
}


/* =================================================
   FINAL
================================================= */

#map-final {
    text-align:
        center;
}


.final-title {
    margin-top:
        120px;

    color:
        #d2e1e8;

    font-size:
        23px;

    letter-spacing:
        3px;
}


.final-panel {
    width:
        430px;

    margin:
        55px auto 0;

    padding:
        22px;

    text-align:
        left;

    line-height:
        2;

    background:
        #101a22;

    border:
        1px solid #607783;
}


.final-panel span {
    float:
        right;

    color:
        #a8c9b1;
}


.final-text {
    margin-top:
        40px;

    color:
        #acbdc7;

    line-height:
        1.9;
}


#final-exit {
    margin-top:
        35px;

    padding:
        12px 18px;

    border:
        1px solid #8b9fa9;

    background:
        #263842;

    color:
        #dce7ed;

    cursor:
        pointer;
}


/* =================================================
   ENDING
================================================= */

.ending-screen {
    position:
        fixed;

    inset:
        0;

    display:
        flex;

    flex-direction:
        column;

    align-items:
        center;

    justify-content:
        center;

    gap:
        25px;

    background:
        #080e14;

    color:
        #cfdde5;

    text-align:
        center;

    letter-spacing:
        2px;
}


.ending-screen strong {
    font-size:
        32px;
}


.ending-screen p {
    color:
        #93a6b2;

    font-size:
        13px;

    line-height:
        1.8;

    letter-spacing:
        0;
}


.ending-screen span {
    color:
        #6c7d88;

    font-size:
        11px;
}


/* =================================================
   MOBILE
================================================= */

@media (max-width: 700px) {

    #system-status {
        width:
            175px;

        left:
            10px;

        top:
            10px;
    }


    #dialogue {
        width:
            calc(100vw - 20px);
    }


    .puzzle-map {
        overflow-y:
            auto;
    }
}
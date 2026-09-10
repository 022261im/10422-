const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const COLS = 20;
const ROWS = 15;

// 1. 타일 맵 데이터 (0: 빈 바닥, 1: 벽/회로선, 2: 센서 노드, 3: 차단문, 4: 복구된 코어)
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,2,0,1,0,1,1,1,3,1,0,1,0,1,1,1,4,0,1],
    [1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,1],
    [1,1,0,1,1,0,1,0,0,0,1,0,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,0,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,0,0,1,1,1,0,0,0,1,1,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,2,0,0,0,0,0,1,0,0,0,0,0,0,1,0,2,0,1],
    [1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// 2. 플레이어 객체
const player = {
    x: 2,
    y: 2,
    color: '#88c0d0'
};

// 3. 오브젝트 및 퍼즐 정보
const interactables = {
    "2_2": {
        name: "온도 센서 S-01",
        type: "sensor",
        solved: false,
        rawInput: 20, // 입력 센서값 (mV)
        target: 50,  // 목표 보정 온도 (°C)
        dialogue: "센서 노드 S-01: 왜곡된 보정치로 인해 데이터 버스가 차단되었습니다. $V_{out} = Gain \\times Raw + Offset$ 공식을 사용해 50.0°C에 맞추세요."
    },
    "10_2": {
        name: "전압 제어 센서 S-02",
        type: "sensor",
        solved: false,
        rawInput: 30,
        target: 90,
        dialogue: "센서 노드 S-02: 전압 측정치 오차가 발생했습니다. Gain과 Offset을 조정해 90.0°C로 정밀 보정하세요."
    },
    "9_3": {
        name: "보안 차단문 GATE-A",
        type: "gate",
        dialogue: "🔒 [경고] S-01 센서 노드가 복구되지 않아 차단문이 잠겨 있습니다."
    }
};

let currentInteractObj = null;

// 4. 조작 입력
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (['e', 'E', ' '].includes(e.key)) {
        checkInteraction();
    }
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

function updatePlayerPosition() {
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) dy = -1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dy = 1;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx = -1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx = 1;

    if (dx !== 0 || dy !== 0) {
        const newX = player.x + dx;
        const newY = player.y + dy;

        // 충돌 체크 (벽 및 잠긴 문)
        if (map[newY] && map[newY][newX] !== undefined) {
            const tile = map[newY][newX];
            if (tile !== 1 && tile !== 3) { // 1: 벽, 3: 잠긴 문
                player.x = newX;
                player.y = newY;
            }
        }
        keys['ArrowUp'] = keys['ArrowDown'] = keys['ArrowLeft'] = keys['ArrowRight'] = false;
        keys['w'] = keys['W'] = keys['s'] = keys['S'] = keys['a'] = keys['A'] = keys['d'] = keys['D'] = false;
    }
}

// 5. 사물 조사 (Interaction)
function checkInteraction() {
    // 플레이어 주변 1칸 탐색
    const neighbors = [
        {x: player.x, y: player.y},
        {x: player.x+1, y: player.y}, {x: player.x-1, y: player.y},
        {x: player.x, y: player.y+1}, {x: player.x, y: player.y-1}
    ];

    for (let pos of neighbors) {
        const key = `${pos.x}_${pos.y}`;
        if (interactables[key]) {
            openTerminal(interactables[key]);
            break;
        }
    }
}

// 6. 퍼즐 모달 팝업
function openTerminal(obj) {
    currentInteractObj = obj;
    const modal = document.getElementById('modal-overlay');
    document.getElementById('modal-title').innerText = `[${obj.name}]`;
    document.getElementById('dialogue-text').innerText = obj.dialogue;

    const puzzlePanel = document.getElementById('puzzle-panel');
    if (obj.type === 'sensor' && !obj.solved) {
        puzzlePanel.classList.remove('hidden');
        document.getElementById('target-val').innerText = `${obj.target}.0 °C`;
        updateCalculatedSensorVal();
    } else {
        puzzlePanel.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// 7. 슬라이더 공학 보정 실시간 계산
const sliderGain = document.getElementById('slider-gain');
const sliderOffset = document.getElementById('slider-offset');

sliderGain.addEventListener('input', () => {
    document.getElementById('gain-val').innerText = sliderGain.value;
    updateCalculatedSensorVal();
});

sliderOffset.addEventListener('input', () => {
    document.getElementById('offset-val').innerText = sliderOffset.value;
    updateCalculatedSensorVal();
});

function calculateSensor() {
    if (!currentInteractObj) return 0;
    const gain = parseFloat(sliderGain.value);
    const offset = parseFloat(sliderOffset.value);
    // V_out = Gain * Raw + Offset
    return (gain * currentInteractObj.rawInput + offset).toFixed(1);
}

function updateCalculatedSensorVal() {
    const val = calculateSensor();
    const currentValEl = document.getElementById('current-val');
    currentValEl.innerText = `${val} °C`;
    
    if (parseFloat(val) === currentInteractObj.target) {
        currentValEl.style.color = '#00ff00';
    } else {
        currentValEl.style.color = '#ff3333';
    }
}

// 8. 보정 정답 확인 및 구역 해금
function checkCalibration() {
    const val = parseFloat(calculateSensor());
    if (val === currentInteractObj.target) {
        currentInteractObj.solved = true;
        currentInteractObj.dialogue = "✅ 센서 보정이 완료되어 정상 동작 중입니다.";
        
        // S-01 해결 시 Gate-A 해금
        if (currentInteractObj.name.includes("S-01")) {
            map[2][9] = 0; // 차단문 제거
            interactables["9_3"].dialogue = "🔓 게이트가 해금되었습니다. 다음 섹터로 진입 가능합니다.";
            document.getElementById('quest-text').innerText = "Mission: 게이트가 열렸습니다. 중앙 코어로 이동하세요!";
        }

        alert("🎯 센서 보정 성공! 시스템 데이터 오차가 복구되었습니다.");
        closeModal();
    } else {
        alert("❌ 보정 실패! 목표 값과 일치하지 않습니다.");
    }
}

// 9. 렌더링 루프 (2D Pixel Art Canvas)
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 맵 타일 렌더링
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = map[r][c];
            if (tile === 1) { // 벽 / 회로
                ctx.fillStyle = '#2e3440';
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#4c566a';
                ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) { // 센서 노드
                ctx.fillStyle = '#d08770';
                ctx.fillRect(c * TILE_SIZE + 4, r * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else if (tile === 3) { // 잠긴 문
                ctx.fillStyle = '#bf616a';
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (tile === 4) { // 메인 코어
                ctx.fillStyle = '#ebcb8b';
                ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else { // 바닥 Grid
                ctx.strokeStyle = '#181b20';
                ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // 플레이어 렌더링
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x * TILE_SIZE + 6, player.y * TILE_SIZE + 6, TILE_SIZE - 12, TILE_SIZE - 12);

    updatePlayerPosition();
    requestAnimationFrame(render);
}

// 게임 시작
render();
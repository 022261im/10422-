// 게임 상태 변수
const state = {
    x: 100,
    y: 220,
    speed: 4,
    currentRoom: 1,
    keys: {},
    clearedPuzzles: {
        sensor: false,
        power: false,
        control: false
    },
    activeObject: null
};

// 퀴즈 데이터 (공학 주제: 센서, 전력 배분, PID 제어)
const quizzes = {
    'quiz-sensor': {
        title: "CALIBRATION PUZZLE: 센서 영점 조율",
        desc: "센서 측정값에 지속적인 +5cm의 오프셋(Offset) 오차가 발생하고 있습니다. 기준값 50cm를 정확히 출력하기 위한 보정 공식은?",
        options: [
            { text: "1. 측정값 - 5", correct: true },
            { text: "2. 측정값 + 5", correct: false },
            { text: "3. 측정값 * 1.05", correct: false }
        ],
        type: 'sensor'
    },
    'quiz-power': {
        title: "POWER GRID PUZZLE: 과전류 방지 배분",
        desc: "메인 메인 인버터 허용 용량은 100W입니다. 센서(20W)와 모터(50W)가 동작 중일 때, 쿨러 시스템에 할당 가능한 최대 전력은?",
        options: [
            { text: "1. 40W (과부하 발생)", correct: false },
            { text: "2. 30W (정상 가동)", correct: true },
            { text: "3. 50W (시스템 다운)", correct: false }
        ],
        type: 'power'
    },
    'quiz-control': {
        title: "CONTROL SYSTEM PUZZLE: PID 튜닝",
        desc: "게이트 제어 모터의 목표 위치 도달 시 심각한 진동(Overshoot)이 발생합니다. 진동을 억제하고 안정화하기 위해 조절해야 하는 게인은?",
        options: [
            { text: "1. 비례 게인(Kp)을 극대화한다.", correct: false },
            { text: "2. 미분 게인(Kd)을 올려 감쇄(Damping)력을 높인다.", correct: true },
            { text: "3. 적분 게인(Ki)을 줄여 응답 속도를 낮춘다.", correct: false }
        ],
        type: 'control'
    },
    'sensor1': { title: "센서 A 상태", desc: "실제 거리: 50cm / 센서 출력값: 55cm (오차 감지됨)", isInfo: true },
    'sensor2': { title: "센서 B 상태", desc: "실제 거리: 100cm / 센서 출력값: 105cm (오차 감지됨)", isInfo: true },
    'power1': { title: "모터 가동부", desc: "소모 전력: 50W (정상 작동 중)", isInfo: true },
    'power2': { title: "냉각 시스템", desc: "소모 전력 미지수. 전체 한계 전력 100W 초과 주의.", isInfo: true },
    'ctrl1': { title: "응답 곡선 A 분석", desc: "Kp가 너무 높아 목표치 주변에서 심하게 진동함.", isInfo: true },
    'ctrl2': { title: "응답 곡선 B 분석", desc: "미분 요소(Kd) 추가 시 진동이 빠르게 감쇄됨.", isInfo: true }
};

// DOM 요소
const playerEl = document.getElementById('player');
const mapEl = document.getElementById('map');
const promptEl = document.getElementById('prompt-ui');
const modalEl = document.getElementById('quiz-modal');
const roomTitleEl = document.getElementById('room-title');
const clearedCountEl = document.getElementById('cleared-count');

// 키보드 입력 이벤트
window.addEventListener('keydown', (e) => {
    state.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        interact();
    }
    if (e.key === 'Escape') {
        closeModal();
    }
});

window.addEventListener('keyup', (e) => {
    state.keys[e.key.toLowerCase()] = false;
});

document.getElementById('close-quiz-btn').addEventListener('click', closeModal);

// 게임 루프
function gameLoop() {
    movePlayer();
    checkProximity();
    requestAnimationFrame(gameLoop);
}

// 플레이어 이동 함수
function movePlayer() {
    if (!modalEl.classList.contains('hidden')) return; // 모달이 떠있으면 이동 정지

    let dx = 0;
    let dy = 0;

    if (state.keys['w'] || state.keys['arrowup']) dy -= state.speed;
    if (state.keys['s'] || state.keys['arrowdown']) dy += state.speed;
    if (state.keys['a'] || state.keys['arrowleft']) dx -= state.speed;
    if (state.keys['d'] || state.keys['arrowright']) dx += state.speed;

    // 경계 제한 (현재 방 크기 내)
    const minX = (state.currentRoom - 1) * 800 + 30;
    const maxX = state.currentRoom * 800 - 60;
    
    state.x = Math.max(minX, Math.min(maxX, state.x + dx));
    state.y = Math.max(40, Math.min(410, state.y + dy));

    // 플레이어 엘리먼트 위치 반영
    playerEl.style.left = `${state.x}px`;
    playerEl.style.top = `${state.y}px`;

    // 카메라(맵 위치) 이동
    const cameraOffset = -(state.currentRoom - 1) * 800;
    mapEl.style.transform = `translateX(${cameraOffset}px)`;
}

// 상호작용 가능한 객체 감지
function checkProximity() {
    const objects = document.querySelectorAll('.obj, .door');
    let nearObj = null;

    objects.forEach(obj => {
        const rect = obj.getBoundingClientRect();
        const playerRect = playerEl.getBoundingClientRect();

        const dist = Math.hypot(
            (playerRect.left + playerRect.width / 2) - (rect.left + rect.width / 2),
            (playerRect.top + playerRect.height / 2) - (rect.top + rect.height / 2)
        );

        if (dist < 60) {
            nearObj = obj;
        }
    });

    if (nearObj) {
        state.activeObject = nearObj;
        promptEl.style.display = 'block';
    } else {
        state.activeObject = null;
        promptEl.style.display = 'none';
    }
}

// 상호작용 실행 (Space 키 입력 시)
function interact() {
    if (!state.activeObject) return;

    const obj = state.activeObject;

    // 문(Door) 상호작용
    if (obj.classList.contains('door')) {
        if (obj.classList.contains('unlocked')) {
            if (obj.id === 'door-exit') {
                document.getElementById('ending-screen').classList.remove('hidden');
            } else {
                state.currentRoom++;
                state.x = (state.currentRoom - 1) * 800 + 80; // 다음 방 입구로 이동
                updateHUD();
            }
        } else {
            alert("문이 잠겨 있습니다! 방 안의 제어 콘솔 퀴즈를 해결하세요.");
        }
        return;
    }

    // 오브젝트/터미널 퀴즈 팝업 실행
    const id = obj.dataset.id;
    const data = quizzes[id];

    if (data) {
        showModal(data);
    }
}

// 퀴즈 모달창 표시
function showModal(data) {
    document.getElementById('quiz-title').innerText = data.title;
    document.getElementById('quiz-desc').innerText = data.desc;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    if (data.isInfo) {
        // 단순 정보 단말기
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = '확인';
        btn.onclick = closeModal;
        optionsContainer.appendChild(btn);
    } else {
        // 공학 퍼즐
        data.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt.text;
            btn.onclick = () => handleAnswer(opt.correct, data.type);
            optionsContainer.appendChild(btn);
        });
    }

    modalEl.classList.remove('hidden');
}

// 정답 처리 Logic
function handleAnswer(isCorrect, type) {
    if (isCorrect) {
        alert("Correct! 시스템 정밀 조율 완료.");
        state.clearedPuzzles[type] = true;
        
        // 정답 시 해당 방의 문 잠금 해제
        if (type === 'sensor') unlockDoor('door-1');
        if (type === 'power') unlockDoor('door-2');
        if (type === 'control') unlockDoor('door-exit');

        updateHUD();
        closeModal();
    } else {
        alert("Incorrect! 잘못된 제어값 입력. 다시 시도하세요.");
    }
}

function unlockDoor(doorId) {
    const door = document.getElementById(doorId);
    if (door) {
        door.classList.remove('locked');
        door.classList.add('unlocked');
        door.innerHTML = "GATE<br>(OPEN)";
    }
}

function closeModal() {
    modalEl.classList.add('hidden');
}

function updateHUD() {
    const titles = [
        "ROOM 1: SENSOR CALIBRATION LAB",
        "ROOM 2: POWER DISTRIBUTION BAY",
        "ROOM 3: CONTROL & PID LAB"
    ];
    roomTitleEl.innerText = titles[state.currentRoom - 1];

    const clearedCount = Object.values(state.clearedPuzzles).filter(Boolean).length;
    clearedCountEl.innerText = clearedCount;
}

// 게임 시작 Loop 구동
gameLoop();
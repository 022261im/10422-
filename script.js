// 시스템 상태 데이터 (Game State)
const state = {
    hp: 100,
    temp: 35, // °C
    power: 80, // Watts
    maxPower: 100,
    overclock: false,
    modules: {
        fan: true,
        regulator: true,
        filter: false
    },
    anomaliesCount: 0
};

// 1. Window Drag and Drop 기능
let activeWin = null;
let offset = [0, 0];

document.querySelectorAll('.title-bar').forEach(header => {
    header.addEventListener('mousedown', (e) => {
        activeWin = header.parentElement;
        offset = [activeWin.offsetLeft - e.clientX, activeWin.offsetTop - e.clientY];
        // 선택 시 제일 위로 끌어올리기 (Z-index 처리)
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = 1);
        activeWin.style.zIndex = 100;
    });
});

document.addEventListener('mousemove', (e) => {
    if (activeWin) {
        activeWin.style.left = (e.clientX + offset[0]) + 'px';
        activeWin.style.top = (e.clientY + offset[1]) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    activeWin = null;
});

// 2. 모듈 토글
function toggleModule(modName) {
    state.modules[modName] = !state.modules[modName];
    const el = document.getElementById(`mod-${modName}`);
    if (state.modules[modName]) {
        el.classList.add('active');
        log(`[MODULE] ${modName.toUpperCase()} ENABLED.`);
    } else {
        el.classList.remove('active');
        log(`[MODULE] ${modName.toUpperCase()} DISABLED.`);
    }
}

// 3. 버튼 이벤트 핸들러
document.getElementById('btn-cool').addEventListener('click', () => {
    state.temp = Math.max(20, state.temp - 25);
    state.power = Math.max(0, state.power - 15);
    log(`[ACTION] Rapid Cooling System Triggered (-25°C, -15W)`);
    updateUI();
});

const ocBtn = document.getElementById('btn-overclock');
ocBtn.addEventListener('click', () => {
    state.overclock = !state.overclock;
    ocBtn.innerText = state.overclock ? "⚡ OVERCLOCK (ON)" : "⚡ OVERCLOCK (OFF)";
    ocBtn.style.background = state.overclock ? "#ffcc00" : "#c0c0c0";
    log(`[SYS] Overclock mode set to ${state.overclock ? 'ACTIVE' : 'INACTIVE'}`);
});

// 4. 터미널 로그 출력 함수
function log(msg) {
    const consoleEl = document.getElementById('log-output');
    consoleEl.innerHTML += `<br>> ${msg}`;
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// 5. 실시간 메인 루프 (공학적 메카닉 계산)
setInterval(() => {
    // 발열 계산: 기본 + 오버클럭 - 쿨링 팬 효과
    let heatGen = state.overclock ? 3.5 : 0.8;
    if (state.modules.fan) heatGen -= 1.2;
    state.temp = Math.min(120, Math.max(20, state.temp + heatGen));

    // 전력 회복 및 소모 계산
    let powerRegen = state.modules.regulator ? 3 : 1;
    if (state.overclock) powerRegen -= 4;
    state.power = Math.min(state.maxPower, Math.max(0, state.power + powerRegen));

    // 오버히트 시 내구도 손상 (열역학 결과)
    if (state.temp > 85) {
        state.hp = Math.max(0, state.hp - 2);
        log(`<span style="color:red">[WARN] CRITICAL TEMP! CPU DAMAGED!</span>`);
    }

    updateUI();
}, 1000);

// 6. 무작위 오류(에러 팝업) 생성 - Kingsway 스타일의 전투 인카운터
setInterval(() => {
    if (Math.random() < 0.35 && state.anomaliesCount < 3) {
        spawnAnomaly();
    }
}, 4000);

function spawnAnomaly() {
    state.anomaliesCount++;
    const id = 'anomaly-' + Date.now();
    const posX = Math.floor(Math.random() * (window.innerWidth - 300));
    const posY = Math.floor(Math.random() * (window.innerHeight - 200));

    const pop = document.createElement('div');
    pop.className = 'window anomaly-win';
    pop.id = id;
    pop.style.left = posX + 'px';
    pop.style.top = posY + 'px';
    pop.style.width = '260px';
    pop.style.zIndex = 50;

    pop.innerHTML = `
        <div class="title-bar">
            <span>🚨 SYSTEM ANOMALY</span>
        </div>
        <div class="window-body">
            <p style="font-size: 8px; color: red;">FREQ_MISMATCH DETECTED!</p>
            <p style="font-size: 8px;">Fix Voltage Spike to clear!</p>
            <button class="pixel-btn" onclick="resolveAnomaly('${id}')">🛠️ PATCH ERROR</button>
        </div>
    `;

    document.getElementById('desktop').appendChild(pop);
    log(`<span style="color:yellow">[ALERT] Hardware Anomaly spawned at Grid 0x${Math.floor(Math.random()*900+100)}!</span>`);
}

function resolveAnomaly(id) {
    const el = document.getElementById(id);
    if (el) {
        el.remove();
        state.anomaliesCount--;
        state.power = Math.min(state.maxPower, state.power + 10);
        log(`[RESOLVED] Anomaly patched. Power restored +10W.`);
        updateUI();
    }
}

// 7. UI 업데이트
function updateUI() {
    document.getElementById('hp-bar').style.width = state.hp + '%';
    
    const heatPercent = Math.min(100, (state.temp / 100) * 100);
    document.getElementById('heat-bar').style.width = heatPercent + '%';
    document.getElementById('temp-text').innerText = `${Math.round(state.temp)}°C`;

    document.getElementById('power-bar').style.width = state.power + '%';
    document.getElementById('power-text').innerText = `${Math.round(state.power)}W / 100W`;

    // 시계 업데이트
    const now = new Date();
    document.getElementById('clock').innerText = now.toTimeString().split(' ')[0];
}
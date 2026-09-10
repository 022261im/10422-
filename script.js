/* =========================================================
   FRAGMENT — 파일 공간 탈출
========================================================= */

const game = document.getElementById('game');
const player = document.getElementById('player');
const dialogue = document.getElementById('dialogue');
const dialogueTitle = document.getElementById('dialogue-title');
const dialogueText = document.getElementById('dialogue-text');
const dialogueClose = document.getElementById('dialogue-close');
const interactionPrompt = document.getElementById('interaction-prompt');
const hudChapter = document.getElementById('hud-chapter');
const hudObjective = document.getElementById('hud-objective');
const hudProgress = document.getElementById('hud-progress');
const ending = document.getElementById('ending');
const endingText = document.getElementById('ending-text');

const rooms = {
  intro: document.getElementById('room-intro'),
  hub: document.getElementById('room-hub'),
  signal: document.getElementById('room-signal'),
  power: document.getElementById('room-power'),
  logic: document.getElementById('room-logic')
};

const state = {
  room: 'intro',
  x: 100,
  y: Math.round(window.innerHeight / 2),
  solved: { signal:false, power:false, logic:false },
  ready: { signal:false, power:false, logic:false },
  evidence: { signal:new Set(), power:new Set(), logic:new Set() },
  signalOffset: 0,
  signalAdjusting: false,
  selectedWire: null,
  wires: { LOW:null, HIGH:null, GND:null },
  sequence: []
};

const keys = {};
let spaceDown = false;

/* =========================================================
   MOTES
========================================================= */
function spawnMotes(id, count){
  const container = document.getElementById(id);
  if(!container) return;
  for(let i=0;i<count;i++){
    const m = document.createElement('span');
    m.className = 'mote';
    m.style.left = (Math.random()*88+5)+'%';
    m.style.top = (Math.random()*78+10)+'%';
    m.style.animationDelay = (Math.random()*6)+'s';
    m.style.animationDuration = (5+Math.random()*4)+'s';
    container.appendChild(m);
  }
}

/* =========================================================
   HUD
========================================================= */
const hudData = {
  intro:{ chapter:'BOOT SEQUENCE', objective:'오른쪽의 ENTRY NODE로 이동하세요.' },
  hub:{ chapter:'FRAGMENT ARCHIVE', objective:'세 개의 손상된 섹터를 복구하세요.' },
  signal:{ chapter:'SIGNAL SECTOR', objective:'어긋난 안테나를 찾아 정렬을 맞추세요.' },
  power:{ chapter:'POWER SECTOR', objective:'각 모듈에 맞는 도관을 연결하세요.' },
  logic:{ chapter:'LOGIC SECTOR', objective:'장치의 조건을 조사하고 작동 순서를 복구하세요.' }
};

function updateHUD(){
  const d = hudData[state.room];
  hudChapter.textContent = d.chapter;
  hudObjective.textContent = d.objective;
  const count = Number(state.solved.signal) + Number(state.solved.power) + Number(state.solved.logic);
  hudProgress.textContent = `복구 ${count} / 3`;
}

/* =========================================================
   ROOM SWITCH
========================================================= */
function switchRoom(name){
  if(!rooms[name]) return;
  Object.values(rooms).forEach(r => r.classList.remove('active'));
  rooms[name].classList.add('active');
  state.room = name;
  state.signalAdjusting = false;
  const mini = document.getElementById('power-mini');
  if(mini) mini.classList.remove('visible');
  updateHUD();
  updatePlayer();
  updatePrompt();
}

/* =========================================================
   PLAYER
========================================================= */
function updatePlayer(){
  player.style.left = `${Math.round(state.x)}px`;
  player.style.top = `${Math.round(state.y)}px`;
}

function limitPlayer(){
  const maxX = window.innerWidth - 55;
  const maxY = window.innerHeight - 65;
  state.x = Math.max(25, Math.min(maxX, state.x));
  state.y = Math.max(80, Math.min(maxY, state.y));
}

function movePlayer(){
  if(!dialogue.classList.contains('hidden')) return;
  if(!ending.classList.contains('hidden')) return;
  if(state.room === 'signal' && state.signalAdjusting) return;

  let dx = 0, dy = 0;
  if(keys['w'] || keys['arrowup']) dy -= 4;
  if(keys['s'] || keys['arrowdown']) dy += 4;
  if(keys['a'] || keys['arrowleft']) dx -= 4;
  if(keys['d'] || keys['arrowright']) dx += 4;

  if(dx !== 0 || dy !== 0){
    state.x += dx;
    state.y += dy;
    limitPlayer();
    updatePlayer();
    updatePrompt();
  }

  if(state.room === 'intro' && state.x > window.innerWidth * 0.72){
    enterHub();
  }
}

/* =========================================================
   INTRO -> HUB
========================================================= */
function enterHub(){
  if(state.room !== 'intro') return;
  switchRoom('hub');
  state.x = 130;
  state.y = Math.round(window.innerHeight * 0.55);
  updatePlayer();

  showDialogue('FRAGMENT',
    '당신은 하나의 조각(Fragment)입니다.\n\n' +
    '무엇의 조각인지는 아직 알 수 없습니다.\n\n' +
    '이곳은 손상되어 격리된 파일 공간, ARCHIVE 섹터입니다.\n\n' +
    '압축 해제 절차가 중단된 채 방치되어 있습니다.\n\n' +
    '세 개의 손상된 섹터를 복구해야만\n이 공간의 출구가 열립니다.'
  );
}

/* =========================================================
   DIALOGUE
========================================================= */
function showDialogue(title, text){
  dialogueTitle.textContent = title;
  dialogueText.textContent = text;
  dialogue.classList.remove('hidden');
  interactionPrompt.classList.remove('visible');
}

function closeDialogue(){
  dialogue.classList.add('hidden');
  updatePrompt();
}

dialogueClose.addEventListener('click', closeDialogue);

/* =========================================================
   INTERACTABLES
========================================================= */
function getInteractables(){
  const room = rooms[state.room];
  if(!room) return [];
  return [...room.querySelectorAll('.interactable')];
}

function getObjectCenter(el){
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}

function getDistance(el){
  const c = getObjectCenter(el);
  const px = state.x + 13;
  const py = state.y + 13;
  return Math.hypot(px - c.x, py - c.y);
}

function getNearestInteractable(){
  const objects = getInteractables();
  let nearest = null;
  let nearestDistance = Infinity;
  objects.forEach(o => {
    if(o.classList.contains('disabled')) return;
    const d = getDistance(o);
    if(d < nearestDistance){ nearest = o; nearestDistance = d; }
  });
  return nearestDistance <= 110 ? nearest : null;
}

function updatePrompt(){
  if(!dialogue.classList.contains('hidden')){
    interactionPrompt.classList.remove('visible');
    return;
  }
  const target = getNearestInteractable();
  if(!target){
    interactionPrompt.classList.remove('visible');
    return;
  }
  interactionPrompt.textContent = `SPACE  ${target.dataset.label || '조사'}`;
  interactionPrompt.classList.add('visible');
}

function interact(){
  const target = getNearestInteractable();
  if(!target) return;
  const action = target.dataset.action;
  if(actions[action]) actions[action](target);
}

/* =========================================================
   ACTIONS
========================================================= */
const actions = {

  openSignal: () => openPuzzle('signal'),
  openPower: () => openPuzzle('power'),
  openLogic: () => openPuzzle('logic'),

  exit: () => {
    const complete = state.solved.signal && state.solved.power && state.solved.logic;
    if(complete) finishGame();
  },

  /* SIGNAL */
  antennaA: () => {
    state.evidence.signal.add('A');
    showDialogue('ANTENNA A',
      '수신 주파수 : 440.1 ㎒\n기준 대역 : 438 ~ 442 ㎒\n\n기준 신호와 일치합니다.\n\n상태 : 정상');
  },
  antennaB: () => {
    state.evidence.signal.add('B');
    showDialogue('ANTENNA B',
      '수신 주파수 : 471.6 ㎒\n기준 대역 : 438 ~ 442 ㎒\n\n다른 안테나와 뚜렷한 편차가 있습니다.\n\n' +
      '기준 발신원 자체에는 변화가 없다는 기록이 있습니다.\n\n안테나의 정렬 상태를 의심할 필요가 있습니다.');
  },
  antennaC: () => {
    state.evidence.signal.add('C');
    showDialogue('ANTENNA C',
      '수신 주파수 : 439.4 ㎒\n기준 대역 : 438 ~ 442 ㎒\n\n기준 신호와 일치합니다.\n\n상태 : 정상');
  },
  signalReference: () => {
    state.evidence.signal.add('REF');
    showDialogue('기준 발신원',
      '세 안테나는 같은 고정 발신원을 수신해야 합니다.\n\n출력은 변하지 않았습니다.\n\n' +
      '따라서 B의 편차는 발신원이 아니라\n안테나 자체의 정렬 문제일 가능성이 높습니다.');
  },
  signalConsole: () => {
    if(state.ready.signal){
      showDialogue('TUNER CONSOLE', '이미 정렬이 완료된 섹터입니다.');
      return;
    }
    const ready = ['A','B','C','REF'].every(k => state.evidence.signal.has(k));
    if(!ready){
      showDialogue('TUNER 잠김', '안테나 A, B, C와 기준 발신원을\n모두 조사해야 합니다.');
      return;
    }
    state.signalAdjusting = true;
    showDialogue('TUNER CONSOLE',
      '안테나 B의 정렬을 다시 맞춰야 합니다.\n\n창을 닫은 뒤 A / D 키로 정렬 값을 조정하세요.\n\n' +
      '기준 정렬은 0입니다.\n\n올바른 값을 찾으면 SPACE로 확정하세요.');
  },
  signalReturn: () => {
    if(!state.ready.signal) return;
    state.solved.signal = true;
    clearFile('signal');
    switchRoom('hub');
    state.x = 150; state.y = 380;
    updatePlayer();
    showDialogue('SIGNAL RECALIBRATED',
      '안테나 B가 기준 정렬로 돌아왔습니다.\n\n수신 주파수가 정상 대역으로 복구되었습니다.\n\n' +
      '첫 번째 섹터가 복구되었습니다.');
  },

  /* POWER */
  powerLink: () => {
    state.evidence.power.add('LINK');
    showDialogue('LINK MODULE', '요구 전력 : LOW\n\nHIGH 전력을 연결하면 모듈이 손상됩니다.');
  },
  powerDrive: () => {
    state.evidence.power.add('DRIVE');
    showDialogue('DRIVE MODULE', '요구 전력 : HIGH\n\n출구 구동에 필요한 만큼 충분한 전력이 필요합니다.');
  },
  powerCore: () => {
    state.evidence.power.add('CORE');
    showDialogue('CORE MODULE', '기준 : GND\n\n전력 공급보다 먼저 공통 접지 기준이 필요합니다.');
  },
  powerPanel: () => {
    const ready = ['LINK','DRIVE','CORE'].every(k => state.evidence.power.has(k));
    if(!ready){
      showDialogue('배전반', 'LINK, DRIVE, CORE 모듈의 요구 규격을\n먼저 확인해야 합니다.');
      return;
    }
    document.getElementById('power-mini').classList.add('visible');
    updatePrompt();
  },
  powerReturn: () => {
    if(!state.ready.power) return;
    state.solved.power = true;
    clearFile('power');
    switchRoom('hub');
    state.x = 150; state.y = 380;
    updatePlayer();
    showDialogue('POWER RECOVERED',
      'LOW는 LINK로,\nHIGH는 DRIVE로,\nGND는 CORE로 연결되었습니다.\n\n두 번째 섹터가 복구되었습니다.');
  },

  /* LOGIC */
  logicPressure: () => {
    state.evidence.logic.add('PRESSURE');
    showDialogue('PRESSURE VALVE', '현재 압력 : 낮음\n\n기록에는 압력이 먼저 안정되어야 한다고 적혀 있습니다.');
  },
  logicLock: () => {
    state.evidence.logic.add('LOCK');
    showDialogue('SAFETY LOCK', '현재 상태 : 잠김\n\n모터를 작동하기 전에\n먼저 해제되어야 합니다.');
  },
  logicMotor: () => {
    state.evidence.logic.add('MOTOR');
    showDialogue('DRIVE MOTOR', '현재 상태 : 대기\n\n작동 순서의 마지막 단계로 설계되어 있습니다.');
  },
  logicNote: () => {
    state.evidence.logic.add('NOTE');
    showDialogue('MAINTENANCE LOG',
      '압력이 안정된 뒤 잠금이 해제된다.\n\n잠금이 해제된 뒤 모터가 작동한다.\n\n' +
      '장치 사이의 조건을 연결하면\n전체 순서를 알아낼 수 있습니다.');
  },
  logicReturn: () => {
    if(!state.ready.logic) return;
    state.solved.logic = true;
    clearFile('logic');
    switchRoom('hub');
    state.x = 150; state.y = 380;
    updatePlayer();
    showDialogue('LOGIC RECOVERED',
      '압력 안정 → 잠금 해제 → 모터 작동\n\n세 장치의 작동 순서가 복구되었습니다.\n\n세 번째 섹터가 복구되었습니다.');
  }
};

/* =========================================================
   OPEN PUZZLE
========================================================= */
const puzzleIntro = {
  signal: 'SIGNAL SECTOR\n\n세 개의 안테나가 서로 다른 주파수를 수신하고 있습니다.\n\n' +
    '안테나와 기준 발신원을 모두 조사한 뒤,\n어긋난 안테나를 기준 정렬에 맞추세요.',
  power: 'POWER SECTOR\n\n세 모듈이 서로 다른 전력 규격을 요구합니다.\n\n' +
    '모듈을 조사한 뒤 배전반에서 알맞은 도관을 연결하세요.',
  logic: 'LOGIC SECTOR\n\n세 장치 사이에는 작동 조건이 얽혀 있습니다.\n\n' +
    '장치와 기록을 조사한 뒤,\n올바른 작동 순서를 재구성하세요.'
};

const roomTitle = { signal:'SIGNAL SECTOR', power:'POWER SECTOR', logic:'LOGIC SECTOR' };

function openPuzzle(type){
  if(state.solved[type]){
    showDialogue('복구된 섹터', '이 섹터는 이미 복구되었습니다.\n\n원래 기록 대신 종이 조각이 남아 있습니다.');
    return;
  }
  switchRoom(type);
  state.x = 100;
  state.y = window.innerHeight - 130;
  updatePlayer();
  showDialogue(roomTitle[type], puzzleIntro[type]);
}

/* =========================================================
   SIGNAL TUNING
========================================================= */
function adjustSignal(delta){
  state.signalOffset = Math.max(-50, Math.min(50, state.signalOffset + delta));
  updateSignalDisplay();
}

function updateSignalDisplay(){
  const display = document.getElementById('tuner-display');
  const marker = document.getElementById('tuner-marker');
  display.textContent = `정렬 값 : ${state.signalOffset}`;
  const pos = 50 + (state.signalOffset / 50) * 42;
  marker.style.left = `${pos}%`;
}

function confirmSignalTuning(){
  if(state.signalOffset === 0){
    completeSignal();
  } else {
    showDialogue('정렬 실패', '현재 정렬 값이 기준과 일치하지 않습니다.\n\n표시된 값을 다시 확인하세요.');
  }
}

function completeSignal(){
  state.signalAdjusting = false;
  state.ready.signal = true;
  document.getElementById('signal-return').classList.remove('disabled');
  showDialogue('SIGNAL CALIBRATED',
    '안테나 B의 정렬이 기준값 0으로 돌아왔습니다.\n\n수신 주파수도 정상 대역으로 복구됩니다.\n\n' +
    '이제 RETURN으로 허브에 돌아갈 수 있습니다.');
}

/* =========================================================
   POWER MINI GAME
========================================================= */
const sourceNodes = document.querySelectorAll('.source-node');
const targetNodes = document.querySelectorAll('.target-node');

function invalidatePowerReady(){
  if(state.ready.power){
    state.ready.power = false;
    document.getElementById('power-return').classList.add('disabled');
  }
}

sourceNodes.forEach(node => {
  node.addEventListener('click', () => {
    invalidatePowerReady();
    state.selectedWire = node.dataset.wire;
    sourceNodes.forEach(n => n.classList.remove('selected'));
    node.classList.add('selected');
    document.getElementById('wire-status').textContent =
      `${state.selectedWire} 도관을 선택했습니다. 연결할 모듈을 선택하세요.`;
  });
});

targetNodes.forEach(node => {
  node.addEventListener('click', () => {
    if(!state.selectedWire){
      document.getElementById('wire-status').textContent = '먼저 왼쪽에서 전력 도관을 선택하세요.';
      return;
    }
    invalidatePowerReady();
    const target = node.dataset.target;
    state.wires[state.selectedWire] = target;
    drawWires();
    document.getElementById('wire-status').textContent =
      `${state.selectedWire} → ${target.toUpperCase()} 연결`;
    state.selectedWire = null;
    sourceNodes.forEach(n => n.classList.remove('selected'));
  });
});

function drawWires(){
  const group = document.getElementById('wire-lines');
  group.innerHTML = '';
  const panel = document.getElementById('power-mini');
  const panelRect = panel.getBoundingClientRect();

  Object.entries(state.wires).forEach(([source, target]) => {
    if(!target) return;
    const sourceEl = document.querySelector(`.source-node[data-wire="${source}"]`);
    const targetEl = document.querySelector(`.target-node[data-target="${target}"]`);
    if(!sourceEl || !targetEl) return;

    const s = sourceEl.getBoundingClientRect();
    const t = targetEl.getBoundingClientRect();
    const x1 = s.left + s.width - panelRect.left;
    const y1 = s.top + s.height/2 - panelRect.top;
    const x2 = t.left - panelRect.left;
    const y2 = t.top + t.height/2 - panelRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.classList.add('wire-line');
    group.appendChild(line);
  });
}

function checkPowerSolved(){
  return state.wires.LOW === 'link' && state.wires.HIGH === 'drive' && state.wires.GND === 'core';
}

document.getElementById('wire-check').addEventListener('click', () => {
  if(checkPowerSolved()){
    state.ready.power = true;
    document.getElementById('power-mini').classList.remove('visible');
    document.getElementById('power-return').classList.remove('disabled');
    showDialogue('POWER ROUTE COMPLETE',
      'LOW → LINK\nHIGH → DRIVE\nGND → CORE\n\n모든 모듈이 요구 규격에 맞게 연결되었습니다.\n\nRETURN이 해제되었습니다.');
  } else {
    document.getElementById('wire-status').textContent =
      '도관 연결이 올바르지 않습니다. 모듈의 요구 규격을 다시 확인하세요.';
  }
});

document.getElementById('wire-close').addEventListener('click', () => {
  document.getElementById('power-mini').classList.remove('visible');
});

/* =========================================================
   LOGIC SEQUENCE
========================================================= */
const sequenceButtons = document.querySelectorAll('.sequence-button');
const sequenceNames = { pressure:'압력 안정', lock:'잠금 해제', motor:'모터 작동' };

function invalidateLogicReady(){
  if(state.ready.logic){
    state.ready.logic = false;
    document.getElementById('logic-return').classList.add('disabled');
  }
}

sequenceButtons.forEach(button => {
  button.addEventListener('click', () => {
    if(state.sequence.length >= 3) return;
    invalidateLogicReady();
    state.sequence.push(button.dataset.sequence);
    updateSequenceDisplay();
  });
});

function updateSequenceDisplay(){
  const display = document.getElementById('sequence-display');
  const result = state.sequence.map(v => sequenceNames[v]);
  while(result.length < 3) result.push('_');
  display.textContent = result.join(' → ');
}

document.getElementById('sequence-reset').addEventListener('click', () => {
  invalidateLogicReady();
  state.sequence = [];
  updateSequenceDisplay();
});

document.getElementById('sequence-check').addEventListener('click', () => {
  const investigated = ['PRESSURE','LOCK','MOTOR','NOTE'].every(k => state.evidence.logic.has(k));
  if(!investigated){
    showDialogue('작동 순서 잠김', 'PRESSURE, LOCK, MOTOR와\n기록을 모두 조사해야 합니다.');
    return;
  }
  const correct = state.sequence.length === 3 &&
    state.sequence[0] === 'pressure' &&
    state.sequence[1] === 'lock' &&
    state.sequence[2] === 'motor';

  if(!correct){
    showDialogue('순서 오류',
      '장치 사이의 조건과 맞지 않는 순서입니다.\n\n어떤 장치가 먼저 안정되어야 하는지\n다시 생각해 보세요.');
    return;
  }

  state.ready.logic = true;
  document.getElementById('logic-return').classList.remove('disabled');
  showDialogue('LOGIC SEQUENCE COMPLETE',
    '압력 안정 → 잠금 해제 → 모터 작동\n\n모든 조건이 올바른 순서로 연결되었습니다.\n\nRETURN이 해제되었습니다.');
});

/* =========================================================
   CLEAR FILE (HUB RECORD)
========================================================= */
const clearedText = {
  signal: '신호 정렬\n복구 완료',
  power: '전력 경로\n복구 완료',
  logic: '작동 순서\n복구 완료'
};

function clearFile(type){
  const file = document.querySelector(`.record[data-file="${type}"]`);
  if(!file) return;
  file.classList.add('disabled');
  file.dataset.action = '';
  file.dataset.label = '';
  file.innerHTML = `
    <div class="paper-fragment">
      <div class="paper-small">남겨진 메모</div>
      <div class="paper-main">${clearedText[type].replace('\n','<br>')}</div>
    </div>
  `;
  updateExit();
}

function updateExit(){
  const exit = document.getElementById('hub-exit');
  const complete = state.solved.signal && state.solved.power && state.solved.logic;
  if(complete){
    exit.classList.remove('disabled');
    exit.classList.add('revealed');
    exit.dataset.label = 'EXIT 진입';
  }
}

/* =========================================================
   ENDING
========================================================= */
function finishGame(){
  endingText.innerHTML =
    '세 개의 손상된 섹터가 모두 복구되었습니다.\n\n' +
    '신호는 다시 기준 방향을 향하고,\n' +
    '전력은 필요한 모듈에만 정확히 흐르며,\n' +
    '작동 순서는 안정적으로 조정됩니다.\n\n' +
    '<strong>그리고 이제, 이 공간의 정체가 드러납니다.</strong>\n\n' +
    '이곳은 고장난 파일이 아니라,\n' +
    '삭제되기 직전 마지막으로 보존된 백업이었습니다.\n\n' +
    '당신은 그 백업이 스스로를 복구하기 위해 남긴,\n' +
    '작은 조각(Fragment)이었습니다.\n\n' +
    '압축 해제 완료. 파일이 재구성됩니다.\n\n' +
    '공간이 닫힙니다.';
  ending.classList.remove('hidden');
  interactionPrompt.classList.remove('visible');
}

/* =========================================================
   INPUT
========================================================= */
function handleSpace(){
  if(!dialogue.classList.contains('hidden')){
    closeDialogue();
    return;
  }
  if(!ending.classList.contains('hidden')) return;
  if(state.room === 'signal' && state.signalAdjusting){
    confirmSignalTuning();
    return;
  }
  interact();
}

document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();

  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){
    event.preventDefault();
  }
  keys[key] = true;

  if(event.code === 'Space'){
    event.preventDefault();
    if(!spaceDown) handleSpace();
    spaceDown = true;
  }

  if(event.code === 'Escape'){
    closeDialogue();
  }

  if(state.room === 'signal' && state.signalAdjusting && dialogue.classList.contains('hidden')){
    if(key === 'a') adjustSignal(-5);
    if(key === 'd') adjustSignal(5);
  }
});

document.addEventListener('keyup', event => {
  const key = event.key.toLowerCase();
  keys[key] = false;
  if(event.code === 'Space') spaceDown = false;
});

window.addEventListener('resize', () => {
  limitPlayer();
  updatePlayer();
  updatePrompt();
  drawWires();
});

/* =========================================================
   LOOP
========================================================= */
function gameLoop(){
  movePlayer();
  requestAnimationFrame(gameLoop);
}

/* =========================================================
   INIT
========================================================= */
spawnMotes('motes-intro', 10);
spawnMotes('motes-hub', 8);
spawnMotes('motes-signal', 8);
spawnMotes('motes-power', 8);
spawnMotes('motes-logic', 8);

switchRoom('intro');
state.x = 100;
state.y = Math.round(window.innerHeight * 0.5);
updatePlayer();
updateHUD();
updateExit();
updatePrompt();
updateSignalDisplay();

gameLoop();
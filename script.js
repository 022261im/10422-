(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('gameCanvas'), ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W=960,H=540;
  const rooms = {
    hub:{title:'기억의 복도',crumb:'DIRECTORY',tag:'ROOT DIRECTORY',spawn:{x:145,y:390},nodes:[{id:'terminal',x:480,y:260,label:'CORE TERMINAL',symbol:'▣'}]},
    servo:{title:'구동부 보관소',crumb:'01_SERVO',tag:'SERVO / KINEMATICS',spawn:{x:120,y:420},nodes:[{id:'arm',x:690,y:278,label:'SERVO ARM',symbol:'⌁'}]},
    power:{title:'전력 분배실',crumb:'02_POWER',tag:'POWER / CIRCUIT ROUTING',spawn:{x:120,y:420},nodes:[{id:'wire',x:710,y:320,label:'ROUTER PANEL',symbol:'ϟ'}]},
    sensor:{title:'센서 교정실',crumb:'03_SENSOR',tag:'SENSOR / CALIBRATION',spawn:{x:120,y:420},nodes:[{id:'sensor',x:690,y:280,label:'RANGE SENSOR',symbol:'⌖'}]}
  };
  let room='hub', player={x:145,y:390}, keys={}, nearby=null, modalOpen=false, toastTimer=0, lastTime=0, completed={servo:false,power:false,sensor:false}, fragments=[], arm={a:28,b:42}, wire={from:null,links:[]}, sensorOffset=0, sensorNoise=0, running=false;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function showToast(text){const t=$('sceneToast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2100)}
  function updateUI(){
    const r=rooms[room];$('roomTitle').textContent=r.title;$('roomCrumb').textContent=r.crumb;$('sceneTag').textContent=r.tag;
    document.querySelectorAll('.folder').forEach(b=>b.classList.toggle('active',b.dataset.room===room));
    $('coords').textContent=String(Math.round(player.x)).padStart(3,'0')+' : '+String(Math.round(player.y)).padStart(3,'0');
    const count=Object.values(completed).filter(Boolean).length;$('progressBar').style.width=(count/3*100)+'%';$('progressText').textContent=count+' / 3 NODES';$('progressPct').textContent=Math.round(count/3*100)+'%';$('syncBar').style.width=(12+count*29)+'%';$('syncValue').textContent=(12+count*29)+'%';
    $('systemLabel').textContent=count===3?'SYSTEM STABLE':'SYSTEM UNSTABLE';$('footerProcess').textContent=count===3?'RECOVERY COMPLETE':'EXPLORING';
    [['servo','servoMark'],['power','powerMark'],['sensor','sensorMark']].forEach(([key,id])=>{const b=$(id);b.textContent=completed[key]?'✓':'○';b.closest('.folder').classList.toggle('completed',completed[key])});
    const trace=$('traceList');trace.innerHTML='';
    const traces=[['servo','구동 범위 복구','관절 각도와 도달 좌표를 맞춰라.'],['power','전력망 재연결','전원을 올바른 노드로 전달하라.'],['sensor','거리 센서 교정','오차를 보정하고 기준 범위에 맞춰라.']];
    traces.forEach(([key,title,desc])=>{const el=document.createElement('div');el.className='trace-item '+(completed[key]?'done':room===key?'current':'');el.innerHTML='<span class="trace-dot"></span><div><b>'+title+'</b><small>'+(completed[key]?'복구 완료 · 데이터 기록됨':desc)+'</small></div>';trace.appendChild(el)});
    $('traceCount').textContent=String(count+1).padStart(2,'0');
    const fg=$('fragmentGrid');fg.innerHTML='';if(!fragments.length)fg.innerHTML='<div class="fragment-empty">기록 조각이 아직 없습니다.</div>';else fragments.forEach(f=>{const el=document.createElement('div');el.className='fragment';el.innerHTML=f.symbol+'<small>'+f.label+'</small>';fg.appendChild(el)});
  }
  function goRoom(next){if(!rooms[next])return;room=next;player={...rooms[next].spawn};nearby=null;updateUI();showToast('DIRECTORY OPENED // '+rooms[next].tag)}
  function rect(x,y,w,h,fill,stroke){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h)}}
  function text(t,x,y,size,color,font='monospace'){ctx.font=size+'px '+font;ctx.fillStyle=color;ctx.fillText(t,x,y)}
  function drawRoom(){
    ctx.clearRect(0,0,W,H);
    const isHub=room==='hub', isServo=room==='servo', isPower=room==='power', isSensor=room==='sensor';
    const wall=isHub?'#242036':isServo?'#1c2632':isPower?'#292234':'#1c2930';
    const floor=isHub?'#171522':isServo?'#131b25':isPower?'#191522':'#121c21';
    rect(0,0,W,H,wall); 
    // wall panel rhythm and pixel grid
    for(let x=0;x<W;x+=80){rect(x,0,2,370,'#ffffff07');rect(x+12,26,30,3,'#ffffff0a')}
    for(let y=36;y<355;y+=54){rect(0,y,W,1,'#d4caff0a')}
    // windows / data glass
    rect(55,50,250,118,'#10121d','#4a4264');rect(63,58,234,102,isServo?'#152b37':isPower?'#28213c':'#1a1930');
    for(let i=0;i<9;i++){const h=12+(i*17%65);rect(77+i*23,145-h,10,h,isServo?'#6bd7c2':isPower?'#a995ff':'#7365a2')}
    rect(330,65,570,72,'#11111c','#3c3652');text(isHub?'MEMORY INDEX / ROOT':isServo?'JOINT KINEMATICS // LIVE':isPower?'DISTRIBUTION GRID // OFFLINE':'RANGE ARRAY // CALIBRATION',350,91,12,'#a59bc9');
    for(let i=0;i<12;i++)rect(350+i*43,108,28,3,i<3&&isHub?'#91f3d0':'#39344e');
    // floor and perspective
    ctx.fillStyle=floor;ctx.beginPath();ctx.moveTo(0,350);ctx.lineTo(W,350);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#b2a1ff16';ctx.lineWidth=1;
    for(let x=-200;x<W+200;x+=80){ctx.beginPath();ctx.moveTo(480+(x-480)*.25,350);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=380;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    // pillars
    [24,910].forEach(x=>{rect(x,178,27,195,'#171522','#403951');rect(x+5,189,17,5,'#7d6ca7');rect(x+5,350,17,22,'#252038')});
    if(isHub){
      // main data tree hologram
      rect(407,204,148,145,'#131320','#51446e');rect(420,217,122,117,'#1b1830','#706095');
      ctx.strokeStyle='#a995ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(480,240);ctx.lineTo(447,270);ctx.lineTo(480,300);ctx.lineTo(514,270);ctx.closePath();ctx.stroke();
      ctx.fillStyle='#91f3d0';ctx.fillRect(474,264,12,12);text('ROOT NODE',438,366,10,'#b8addc');
    }
    if(isServo){
      // robot arm pedestal and target
      rect(630,375,120,24,'#303048','#5c5277');rect(660,330,60,45,'#4b4367','#9a8bc6');
      ctx.strokeStyle='#9b8be1';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(690,337);ctx.lineTo(670,292);ctx.lineTo(700,252);ctx.stroke();
      ctx.fillStyle='#c9bcff';ctx.fillRect(658,280,24,24);ctx.fillRect(688,240,24,24);
      ctx.strokeStyle='#91f3d0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(772,238,25,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(759,238);ctx.lineTo(785,238);ctx.moveTo(772,225);ctx.lineTo(772,251);ctx.stroke();text('TARGET',749,204,9,'#91f3d0');
      rect(130,250,180,95,'#151a25','#3b5264');text('ARM / AXIS 02',148,275,10,'#8ccdbf');text('R: 80 + 65 units',148,296,10,'#8b91a7');text('LINKS DISCONNECTED',148,321,9,'#f0bd83');
    }
    if(isPower){
      // circuit board on wall
      rect(520,175,290,190,'#13121f','#504367');
      for(let i=0;i<4;i++)for(let j=0;j<3;j++){rect(550+i*62,205+j*43,28,20,'#27233d','#65567e')}
      ctx.strokeStyle='#a995ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(564,215);ctx.lineTo(626,215);ctx.lineTo(626,258);ctx.lineTo(688,258);ctx.lineTo(750,258);ctx.stroke();
      ctx.strokeStyle='#4b4760';ctx.beginPath();ctx.moveTo(564,258);ctx.lineTo(564,301);ctx.lineTo(688,301);ctx.lineTo(688,344);ctx.lineTo(750,344);ctx.stroke();
      text('INPUT',544,193,9,'#a59bc9');text('OUTPUT',748,193,9,'#a59bc9');
      rect(130,248,220,90,'#161522','#443957');text('GRID VOLTAGE',149,273,10,'#aaa0ce');text('24.0 V',149,303,20,'#f1d2a0');text('ROUTING FAULT × 2',149,324,9,'#dc9eac');
    }
    if(isSensor){
      rect(530,200,290,150,'#121a20','#405c60');
      ctx.strokeStyle='#4b7d80';ctx.lineWidth=1;for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(550+i*38,215);ctx.lineTo(550+i*38,332);ctx.stroke()}
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(545,230+i*28);ctx.lineTo(800,230+i*28);ctx.stroke()}
      ctx.strokeStyle='#91f3d0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(550,300);ctx.lineTo(590,300);ctx.lineTo(615,264);ctx.lineTo(650,264);ctx.lineTo(682,288);ctx.lineTo(730,288);ctx.lineTo(760,245);ctx.lineTo(800,245);ctx.stroke();
      rect(130,250,205,94,'#131a20','#3b555b');text('DISTANCE / RAW',148,274,10,'#9bc8c8');text('0.84 m',148,304,20,'#91f3d0');text('BIAS +0.16 m',148,326,9,'#e5b88b');
    }
    // bottom door / portal
    const open=Object.values(completed).filter(Boolean).length===3;
    rect(425,350,110,122,open?'#273f42':'#101018',open?'#91f3d0':'#39334b');rect(437,363,86,109,open?'#325a58':'#1b1927',open?'#91f3d0':'#4a405e');
    if(open){for(let i=0;i<5;i++)rect(445+i*15,374,4,84,'#91f3d055');text('EXIT',458,459,11,'#91f3d0')}else{text('LOCKED',448,459,10,'#77708f')}
    // little scattered data scraps
    for(let i=0;i<6;i++){const x=80+i*137,y=468+(i%2)*22;rect(x,y,25,15,'#29243b','#4d4269');rect(x+5,y+4,13,2,'#9382bd')}
    // node glow and labels
    const node=rooms[room].nodes[0];const pulse=.5+.5*Math.sin(performance.now()/260);
    ctx.fillStyle='rgba(169,149,255,'+(.12+pulse*.1)+')';ctx.beginPath();ctx.arc(node.x,node.y,43+pulse*8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#b8a8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(node.x,node.y,20+pulse*3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#ded6ff';ctx.fillRect(node.x-7,node.y-7,14,14);text(node.symbol,node.x-5,node.y+5,12,'#161323');
    rect(node.x-68,node.y+34,136,22,'#0d0c16d9','#4c426a');text(node.label,node.x-59,node.y+49,9,'#d6d0ee');
    if(room==='hub'){text('A PROCESS WITHOUT A MEMORY',344,403,10,'#a7a0c6');text('FIND THE THREE DAMAGED NODES',340,420,9,'#66617e')}
    drawPlayer();
  }
  function drawPlayer(){
    const x=Math.round(player.x),y=Math.round(player.y);
    // shadow
    ctx.fillStyle='#05050b99';ctx.fillRect(x-12,y+18,27,6);
    // scarf and body
    ctx.fillStyle='#77709e';ctx.fillRect(x-9,y-5,19,21);ctx.fillStyle='#b7a8e5';ctx.fillRect(x-8,y-22,17,17);
    ctx.fillStyle='#d9cfff';ctx.fillRect(x-5,y-25,11,5);ctx.fillStyle='#1c1a2c';ctx.fillRect(x-6,y-15,4,3);ctx.fillRect(x+3,y-15,4,3);
    ctx.fillStyle='#b5f6df';ctx.fillRect(x+3,y-15,3,2);
    ctx.fillStyle='#50476f';ctx.fillRect(x-8,y+16,7,9);ctx.fillRect(x+2,y+16,7,9);
    ctx.fillStyle='#9b8bc9';ctx.fillRect(x-13,y-1,4,12);ctx.fillRect(x+9,y-1,4,12);
    ctx.fillStyle='#a995ff';ctx.fillRect(x-3,y-3,6,3);
  }
  function update(dt){
    if(modalOpen)return;
    const speed=(keys.Shift?230:155)*dt;let dx=0,dy=0;
    if(keys.ArrowLeft||keys.a||keys.A)dx-=speed;if(keys.ArrowRight||keys.d||keys.D)dx+=speed;
    if(keys.ArrowUp||keys.w||keys.W)dy-=speed;if(keys.ArrowDown||keys.s||keys.S)dy+=speed;
    if(dx&&dy){dx*=.707;dy*=.707}
    player.x=clamp(player.x+dx,50,910);player.y=clamp(player.y+dy,205,478);
    const node=rooms[room].nodes[0];const dist=Math.hypot(player.x-node.x,player.y-node.y);
    nearby=dist<92?node:null;$('interactHint').classList.toggle('visible',!!nearby);
    $('hintText').textContent=nearby?(nearby.id==='terminal'?'코어 터미널에 접속':nearby.id==='arm'?'로봇 팔 제어 패널 열기':nearby.id==='wire'?'전력 라우팅 패널 열기':'거리 센서 보정 패널 열기'):'빛나는 오브젝트와 상호작용';
    $('coords').textContent=String(Math.round(player.x)).padStart(3,'0')+' : '+String(Math.round(player.y)).padStart(3,'0');
  }
  function loop(t){const dt=Math.min((t-lastTime)/1000||0,.04);lastTime=t;if(running){update(dt);drawRoom()}requestAnimationFrame(loop)}
  function openModal(id){
    modalOpen=true;$('modalBackdrop').hidden=false;$('puzzleContent').innerHTML='';
    if(id==='terminal'){
      $('modalCategory').textContent='ROOT ACCESS / SYSTEM MESSAGE';$('modalTitle').textContent='세 개의 손상된 노드';
      $('modalDescription').textContent='이 컴퓨터의 기억은 서로 다른 세 개의 시스템에 흩어져 있다. 장치를 직접 복구해 데이터 흐름을 되살려라. 단순한 암호가 아니라 실제 장치의 작동 조건을 맞춰야 한다.';
      const stage=document.createElement('div');stage.className='puzzle-stage';stage.innerHTML='<div class="stage-label">AVAILABLE DIRECTORIES</div><div class="wire-board"><button class="wire-terminal" data-go="servo"><b>⌁ 01_SERVO</b><small>2-link manipulator</small></button><button class="wire-terminal" data-go="power"><b>ϟ 02_POWER</b><small>Power distribution</small></button><button class="wire-terminal" data-go="sensor"><b>⌖ 03_SENSOR</b><small>Range calibration</small></button><button class="wire-terminal" data-go="exit"><b>▣ CORE EXIT</b><small>Unlock after 3 repairs</small></button></div><p class="wire-status">CORE LOG: “내가 누구였는지는 모르겠어. 하지만 이 시스템이 멈추면 나도 사라질 거야.”</p>';
      $('puzzleContent').appendChild(stage);stage.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const go=b.dataset.go;if(go==='exit'){if(Object.values(completed).every(Boolean)){closeModal();showToast('CORE EXIT AVAILABLE — 중앙 출구가 열렸습니다.')}else{$('modalStatus').textContent='3개의 노드를 먼저 복구해야 합니다.'}}else{closeModal();goRoom(go)}}));
      $('modalStatus').textContent='3 SYSTEM NODES / 0–3 RESTORED';
    } else if(id==='arm') buildArmPuzzle();
    else if(id==='wire') buildWirePuzzle();
    else if(id==='sensor') buildSensorPuzzle();
  }
  function buildArmPuzzle(){
    $('modalCategory').textContent='ENGINEERING NODE 01 / KINEMATICS';$('modalTitle').textContent='2-link 로봇 팔 — 도달 좌표 맞추기';
    $('modalDescription').textContent='두 링크의 길이는 각각 80, 65 단위다. 관절 각도를 직접 조절해 그리퍼를 목표점에 가져가라. 목표 좌표는 X=124, Y=69이며 오차가 6 단위 이하여야 잡을 수 있다.';
    const stage=document.createElement('div');stage.className='puzzle-stage';stage.innerHTML='<div class="stage-label">JOINT CONTROL / FORWARD KINEMATICS</div><div class="range-row"><div class="range-head"><span>JOINT θ₁ · BASE</span><b id="angA">28°</b></div><input id="rangeA" type="range" min="-90" max="150" value="'+arm.a+'"></div><div class="range-row"><div class="range-head"><span>JOINT θ₂ · ELBOW</span><b id="angB">42°</b></div><input id="rangeB" type="range" min="-150" max="150" value="'+arm.b+'"></div><div class="engineering-readout"><div class="readout"><span>ENDPOINT X</span><b id="endX">—</b></div><div class="readout"><span>ENDPOINT Y</span><b id="endY">—</b></div><div class="readout"><span>POSITION ERROR</span><b id="endErr">—</b></div></div><div class="action-row"><button class="action-button" id="armReset">RESET ANGLES</button><button class="action-button primary" id="armGrab">CLOSE GRIPPER ↗</button></div><div class="wire-status" id="armStatus">관절을 움직여 목표점에 접근하세요.</div>';
    $('puzzleContent').appendChild(stage);
    function calc(){arm.a=+stage.querySelector('#rangeA').value;arm.b=+stage.querySelector('#rangeB').value;const a=arm.a*Math.PI/180,b=(arm.a+arm.b)*Math.PI/180;const x=80*Math.cos(a)+65*Math.cos(b),y=80*Math.sin(a)+65*Math.sin(b),err=Math.hypot(x-124,y-69);stage.querySelector('#angA').textContent=arm.a+'°';stage.querySelector('#angB').textContent=arm.b+'°';stage.querySelector('#endX').textContent=x.toFixed(1);stage.querySelector('#endY').textContent=y.toFixed(1);stage.querySelector('#endErr').textContent=err.toFixed(1);stage.querySelector('#endErr').style.color=err<=6?'#91f3d0':'#f4c98a';return err}
    stage.querySelectorAll('input').forEach(el=>el.addEventListener('input',calc));stage.querySelector('#armReset').addEventListener('click',()=>{stage.querySelector('#rangeA').value=28;stage.querySelector('#rangeB').value=42;calc()});
    stage.querySelector('#armGrab').addEventListener('click',()=>{const err=calc();if(err<=6){completeNode('servo','ARM','⌁');stage.querySelector('#armStatus').textContent='GRIP CONFIRMED — 목표점 도달. 구동부 로그 복구 완료.';stage.querySelector('#armStatus').style.color='#91f3d0';}else{stage.querySelector('#armStatus').textContent='도달 실패. 현재 오차 '+err.toFixed(1)+' 단위 — 각도를 다시 조절하세요.';stage.querySelector('#armStatus').style.color='#f4c98a'}});calc();$('modalStatus').textContent=completed.servo?'NODE RESTORED':'MANIPULATOR OFFLINE';
  }
  function buildWirePuzzle(){
    $('modalCategory').textContent='ENGINEERING NODE 02 / CIRCUIT ROUTING';$('modalTitle').textContent='전력 분배 — 회로를 직접 연결하기';
    $('modalDescription').textContent='전원에서 컨트롤러와 센서로 전력을 보내야 한다. 노드를 순서대로 선택해 유효한 연결을 만들고, 두 장치가 모두 전력을 받게 하라.';
    const stage=document.createElement('div');stage.className='puzzle-stage';stage.innerHTML='<div class="stage-label">PATCH PANEL / CLICK TWO NODES TO CONNECT</div><div class="wire-board" id="wireBoard"><button class="wire-terminal" data-node="source"><b>◉ POWER SOURCE</b><small>24V / output</small></button><button class="wire-terminal" data-node="controller"><b>▣ CONTROLLER</b><small>required input</small></button><button class="wire-terminal" data-node="sensor"><b>⌖ SENSOR BUS</b><small>required input</small></button><button class="wire-terminal" data-node="ground"><b>⏚ GROUND</b><small>return path</small></button></div><div class="wire-status" id="wireStatus">연결: 없음. 노드를 두 개씩 선택해 배선을 연결하세요.</div><div class="action-row"><button class="action-button" id="wireReset">CLEAR WIRES</button><button class="action-button primary" id="wireTest">TEST CIRCUIT ↗</button></div>';
    $('puzzleContent').appendChild(stage);wire={from:null,links:[]};const board=stage.querySelector('#wireBoard'),status=stage.querySelector('#wireStatus');
    board.querySelectorAll('[data-node]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.node;if(!wire.from){wire.from=n;b.classList.add('selected');status.textContent='첫 번째 노드 선택됨: '+n.toUpperCase()+'. 연결할 다음 노드를 선택하세요.'}else if(wire.from===n){wire.from=null;board.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));status.textContent='선택이 취소되었습니다.'}else{const key=[wire.from,n].sort().join('-');if(!wire.links.includes(key))wire.links.push(key);wire.from=null;board.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));board.querySelectorAll('[data-node]').forEach(x=>x.classList.toggle('connected',wire.links.some(k=>k.includes(x.dataset.node))));status.textContent='연결 수: '+wire.links.length+' · 계속 배선하거나 회로를 테스트하세요.'}}));
    stage.querySelector('#wireReset').addEventListener('click',()=>{wire={from:null,links:[]};board.querySelectorAll('button').forEach(b=>b.classList.remove('selected','connected'));status.textContent='배선이 초기화되었습니다.'});
    stage.querySelector('#wireTest').addEventListener('click',()=>{const valid=wire.links.includes('controller-source')&&wire.links.includes('sensor-source')&&wire.links.includes('ground-source');if(valid){completeNode('power','GRID','ϟ');status.textContent='CIRCUIT STABLE — 전력 공급이 정상화되었습니다.';status.style.color='#91f3d0'}else{status.textContent='전압 경로 불완전. SOURCE→CONTROLLER, SOURCE→SENSOR, SOURCE→GROUND 연결을 확인하세요.';status.style.color='#f4c98a'}});
    $('modalStatus').textContent=completed.power?'NODE RESTORED':'ROUTING FAULT';
  }
  function buildSensorPuzzle(){
    $('modalCategory').textContent='ENGINEERING NODE 03 / SENSOR CALIBRATION';$('modalTitle').textContent='거리 센서 — 오프셋 보정하기';
    $('modalDescription').textContent='센서의 원시 측정값에는 +0.16m의 편향이 있다. 슬라이더로 보정값을 조절해 보정 후 측정값을 기준 거리 0.68m ±0.02m 안에 맞추고 교정을 실행하라.';
    const stage=document.createElement('div');stage.className='puzzle-stage';stage.innerHTML='<div class="stage-label">RANGE SENSOR / RAW VALUE 0.84 m</div><div class="sensor-track"><div class="sensor-band"></div><div class="sensor-needle" id="sensorNeedle"></div></div><div class="sensor-labels"><span>0.40 m</span><span>REFERENCE BAND</span><span>1.00 m</span></div><div class="range-row"><div class="range-head"><span>BIAS CORRECTION</span><b id="offsetValue">−0.00 m</b></div><input id="offsetRange" type="range" min="-30" max="10" value="0"></div><div class="engineering-readout"><div class="readout"><span>RAW VALUE</span><b>0.84 m</b></div><div class="readout"><span>CALIBRATED</span><b id="calibratedValue">0.84 m</b></div><div class="readout"><span>ERROR</span><b id="sensorError">+0.16 m</b></div></div><div class="action-row"><button class="action-button primary" id="calibrateButton">APPLY CALIBRATION ↗</button></div><div class="wire-status" id="sensorStatus">기준 거리 0.68m에 맞게 센서의 편향을 보정하세요.</div>';
    $('puzzleContent').appendChild(stage);const range=stage.querySelector('#offsetRange');
    function upd(){sensorOffset=+range.value/100;const val=.84+sensorOffset;stage.querySelector('#offsetValue').textContent=(sensorOffset>0?'+':'−')+Math.abs(sensorOffset).toFixed(2)+' m';stage.querySelector('#calibratedValue').textContent=val.toFixed(2)+' m';stage.querySelector('#sensorError').textContent=(val-.68>=0?'+':'−')+Math.abs(val-.68).toFixed(2)+' m';stage.querySelector('#sensorNeedle').style.left=clamp((val-.4)/.6*100,0,100)+'%';stage.querySelector('#sensorError').style.color=Math.abs(val-.68)<=.02?'#91f3d0':'#f4c98a';return val}
    range.addEventListener('input',upd);stage.querySelector('#calibrateButton').addEventListener('click',()=>{const val=upd();if(Math.abs(val-.68)<=.02){completeNode('sensor','RANGE','⌖');stage.querySelector('#sensorStatus').textContent='CALIBRATION SAVED — 센서 오차가 허용 범위에 들어왔습니다.';stage.querySelector('#sensorStatus').style.color='#91f3d0'}else{stage.querySelector('#sensorStatus').textContent='교정 실패. 기준 0.68m ±0.02m에 들어오도록 조절하세요.';stage.querySelector('#sensorStatus').style.color='#f4c98a'}});upd();$('modalStatus').textContent=completed.sensor?'NODE RESTORED':'BIAS DETECTED';
  }
  function completeNode(key,label,symbol){if(!completed[key]){completed[key]=true;fragments.push({label,symbol});updateUI();showToast('FRAGMENT RECOVERED // '+label)}else{showToast('NODE ALREADY RESTORED')} }
  function closeModal(){$('modalBackdrop').hidden=true;modalOpen=false}
  function interact(){if(modalOpen)return;if(!nearby){showToast('주변에 상호작용 가능한 장치가 없습니다.');return}openModal(nearby.id)}
  $('startButton').addEventListener('click',()=>{$('bootScreen').hidden=true;$('gameApp').hidden=false;running=true;updateUI();showToast('MICA PROCESS INITIALIZED');canvas.focus()});
  document.querySelectorAll('.folder').forEach(b=>b.addEventListener('click',()=>goRoom(b.dataset.room)));
  $('closeModal').addEventListener('click',closeModal);$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal()});
  $('helpButton').addEventListener('click',()=>$('helpBackdrop').hidden=false);$('closeHelp').addEventListener('click',()=>$('helpBackdrop').hidden=true);$('helpOkay').addEventListener('click',()=>$('helpBackdrop').hidden=true);
  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='Escape'){if(modalOpen)closeModal();$('helpBackdrop').hidden=true}if(e.key===' '&&!$('bootScreen').hidden)return;if(e.key===' '&&running){interact();return}keys[e.key]=true});
  window.addEventListener('keyup',e=>{keys[e.key]=false});
  updateUI();requestAnimationFrame(loop);
})();
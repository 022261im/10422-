(() => {
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const $ = id => document.getElementById(id);
const W = 320, H = 180, keys = new Set();
let started = false, frame = 0, toastTimer = 0, toastText = '';
let archiveOpen = false, facilityDirectoryOpen = false;
const memoryRecords = [
 {title:'기록 01 — 최초의 이상 신호',facility:'광학 연구실',text:'대피가 끝날 때까지 코어를 재가동하지 마. — 손상된 음성 기록',clue:'시설 정지 전, 광학 장치에서 비정상 신호가 먼저 감지됐다.'},
 {title:'기록 02 — 대피용 전력 경로',facility:'자동 분류 시설',text:'마지막 순간까지 대피 구역에 전력을 우선 공급했다.',clue:'MICA는 특정 명령을 거부했다. 당시의 제어 로그가 더 필요하다.'},
 {title:'기록 03 — 봉인 명령',facility:'하중 시험실',text:'MICA, 네 기억을 남겨 두고 내 기록은 봉인해.',clue:'플레이어가 MICA의 기억을 보호하도록 직접 명령했다.'},
 {title:'기록 04 — 비상 정지',facility:'열 제어 시설',text:'대피가 끝나기 전 코어가 과열됐다. 네 개의 셀에 기억을 나눠 봉인했다.',clue:'MICA가 기억을 잃은 것은 명령을 지키기 위해서였다.'}
];
let stage = 0, carried = null, restored = { light: false, belt: false, floor: false, thermal: false }, batteries = 0, stageStep = 0, ending = false, testTimer = 0, testReady = false, endingAnimFrame = 0;
const stageKeys=['light','belt','floor','thermal'];
const pixelCache=new Map();
let dialogue = null, dialoguePos = 0;
const player = { x: 28, y: 126, vx: 0, vy: 0, w: 10, h: 13, face: 1, grounded: false, step: 0, jumpPose: 0 };
const world = {
  light: { name:'OPTICS LAB', title:'광학 장치', desc:'광원에서 나온 신호가 수신기에 도달하지 못하고 있어. 중앙 반사판을 광선 경로에 맞춰 교정해 오른쪽 수신기로 보내자.', platforms:[{x:0,y:151,w:320,h:29},{x:65,y:125,w:42,h:6},{x:136,y:106,w:42,h:6},{x:222,y:126,w:38,h:6}], exit:{x:298,y:126,w:14,h:25}},
  belt: { name:'SORTING BAY', title:'자동 분류 라인', desc:'오염된 광센서가 상자를 감지하지 못해 분류 라인이 멈췄어. 센서를 청소한 뒤 상자를 오른쪽 파란 분류 투입구로 옮기고 라인을 시험하자.', platforms:[{x:0,y:151,w:320,h:29},{x:74,y:124,w:45,h:6},{x:201,y:124,w:43,h:6}], exit:{x:298,y:126,w:14,h:25}},
  floor: { name:'LOAD TEST CHAMBER', title:'하중 시험 구역', desc:'중앙 바닥의 지지대가 빠져 통로가 끊겼어. 느슨한 지지대를 틈에 설치하고 하중 센서의 영점을 보정한 뒤 시험 하중으로 안전성을 확인하자.', platforms:[{x:0,y:151,w:82,h:29},{x:124,y:151,w:66,h:29},{x:232,y:151,w:88,h:29},{x:25,y:124,w:35,h:6},{x:253,y:124,w:34,h:6}], exit:{x:298,y:126,w:14,h:25}},
  thermal: { name:'THERMAL CONTROL', title:'열 제어실', desc:'냉각 이상으로 코어 온도가 118°C까지 상승했어. 방열 모듈을 코어에 설치하고 냉각 밸브를 조정한 뒤 시험 가동으로 온도가 내려가는지 확인하자.', platforms:[{x:0,y:151,w:69,h:29},{x:99,y:151,w:61,h:29},{x:205,y:151,w:115,h:29},{x:70,y:126,w:31,h:6},{x:126,y:108,w:37,h:6},{x:177,y:126,w:31,h:6},{x:225,y:113,w:35,h:6}], exit:{x:298,y:126,w:14,h:25}}
};
const dialogues = [
  [['MICA','복구 모듈 기동. 이번엔 직접 움직이며 장치를 복구해야 해.']],
  [['MICA','광학 실험실이야. 위쪽 발판을 점프해서 건너가 봐.'],['MICA','깨진 반사판 근처에서 E를 눌러 복구하면 빛이 다시 수신기로 향할 거야.']],
  [['MICA','자동 분류 라인이 멈췄어. 벨트 위에 잘못 분류된 상자가 있어.'],['MICA','상자 옆에서 E를 눌러 들고, 오른쪽의 파란 투입구까지 옮긴 다음 다시 E를 눌러 내려놔.']],
  [['MICA','하중 시험 구역이야. 가운데 바닥이 무너져 있어.'],['MICA','느슨해진 지지대를 찾아 E로 들고, 끊어진 바닥 틈으로 가져가 E를 눌러 설치해. 그 뒤에 건너가면 돼.']]
];
function say(lines){dialogue=lines;dialoguePos=0;showLine();$('dialogue').classList.remove('hidden')}
function renderArchive(){const list=$('memory-list');if(!list)return;const count=Math.min(batteries,memoryRecords.length);list.innerHTML='';for(let i=0;i<memoryRecords.length;i++){const r=memoryRecords[i],item=document.createElement('article');item.className='memory-entry'+(i<count?' recovered':' locked');if(i<count){item.innerHTML='<h3></h3><small></small><p></p><p class="memory-clue"></p>';item.querySelector('h3').textContent=r.title;item.querySelector('small').textContent=r.facility;item.querySelectorAll('p')[0].textContent=r.text;item.querySelectorAll('p')[1].textContent=r.clue;}else{item.innerHTML='<h3></h3><small>기록 잠김</small><p>시설을 복구하면 이 기록을 확인할 수 있다.</p>';item.querySelector('h3').textContent='기록 '+String(i+1).padStart(2,'0')+' — ?????';}list.appendChild(item)}const status=$('memory-status');if(status)status.textContent='기억 복구 '+count+' / '+memoryRecords.length;const archive=$('memory-archive');if(archive)archive.classList.toggle('hidden',!archiveOpen)}
function toggleArchive(){if(!started||ending||dialogue||facilityDirectoryOpen)return;archiveOpen=!archiveOpen;renderArchive();if(archiveOpen)toast('기억 아카이브 — M 또는 닫기 버튼으로 돌아가기')}
function toggleFacilityDirectory(){if(!started||ending||dialogue||archiveOpen)return;facilityDirectoryOpen=!facilityDirectoryOpen;$('facility-directory')?.classList.toggle('hidden',!facilityDirectoryOpen);}
function showLine(){const a=dialogue[dialoguePos];$('speaker').textContent=a[0];$('line').innerHTML=a[1].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');$('dialogue-index').textContent=String(dialoguePos+1).padStart(2,'0')+' / '+String(dialogue.length).padStart(2,'0')}
function advance(){if(!dialogue)return;if(++dialoguePos>=dialogue.length){dialogue=null;$('dialogue').classList.add('hidden');return}showLine()}
function toast(s){toastText=s;$('toast').textContent=s;$('toast').classList.remove('hidden');toastTimer=130}
function drawToastPixel(s){const c=$('toast-pixel')?.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;c.clearRect(0,0,280,30);const lines=wrapText(s,39);lines.slice(0,3).forEach((line,i)=>pixelText(c,line,3,8+i*9,274,6,'#f0d5a8'))}
function setStage(n){stage=Math.max(0,Math.min(3,n));stageStep=0;player.x=20;player.y=126;player.vx=player.vy=0;carried=null;drawHud();if(restored[stageKeys[stage]])return;if(stage===1)say([['MICA','**지령 02 / 자동 분류실.** 광센서 표면의 오염 때문에 상자가 감지되지 않아 분류 라인이 멈췄어. 먼저 센서 앞에서 E를 눌러 오염을 제거해.'],['MICA','그다음 컨베이어 위 상자를 들어 오른쪽 파란 분류 투입구에 내려놔. 마지막으로 제어 패널에서 라인을 시험 가동하고, 시험이 끝나면 결과를 승인해.']]);if(stage===2)say([['MICA','**지령 03 / 하중 시험실.** 중앙 바닥의 지지대가 빠져 바닥이 끊어졌어. 왼쪽에 떨어진 지지대를 들어 틈에 가로로 설치해 통로를 복구해.'],['MICA','통로가 연결되면 하중 센서의 영점을 보정하고 시험 하중을 가해. 시험 중 구조물이 안정적으로 버티는지 확인한 뒤 결과를 승인해.']]);if(stage===3)say([['MICA','**지령 04 / 열 제어실.** 냉각 회로 이상으로 코어 온도가 118°C까지 상승했어. 먼저 온도 센서에서 상태를 확인해.'],['MICA','왼쪽 바닥의 방열 모듈을 들어 코어에 설치하고, 중앙 냉각 밸브를 조정해 냉각 회로를 연결해. 코어에서 시험 가동을 시작하고 온도가 안정되는지 확인한 뒤 결과를 승인해.']]);}
function directive(){if(restored[stageKeys[stage]])return '복구 완료 — 출구로 이동';if(stage===0)return '1. <b>LIGHT SOURCE</b> 출력 확인 → 2. <b>MIRROR</b> 각도 교정 → 3. <b>RECEIVER</b> 신호 확인';if(stage===1)return stageStep===3?(testReady?'4. <b>CONTROL PANEL</b>에서 시험 결과 승인':'3. 분류 라인 시험 중 — 완료까지 기다리기'):['1. <b>SENSOR</b> 오염 제거','2. <b>CARGO</b>를 <b>SORT CHUTE</b>에 배치','3. <b>CONTROL PANEL</b>에서 라인 시험 가동'][Math.min(stageStep,2)];if(stage===2)return stageStep===3?(testReady?'4. <b>CONTROL PANEL</b>에서 하중 시험 결과 승인':'3. 하중 시험 중 — 완료까지 기다리기'):['1. <b>SUPPORT</b>를 <b>SUPPORT SLOT</b>에 설치','2. <b>LOAD SENSOR</b> 영점 보정','3. <b>LOAD TEST</b> 실행'][Math.min(stageStep,2)];return stageStep===4?(testReady?'5. <b>CONTROL PANEL</b>에서 시험 결과 승인':'4. 냉각 시험 중 — 완료 후 <b>CONTROL PANEL</b>로 이동'):['1. <b>TEMP SENSOR</b>에서 118°C 확인','2. <b>HEAT SINK</b>를 <b>CORE</b>에 설치','3. <b>COOLANT VALVE</b> 조정','4. <b>CORE</b>에서 냉각 시험 가동'][Math.min(stageStep,3)];}function drawHud(){const hud=$('hud');if(!hud)return;hud.innerHTML='<div class="hudline"><b>REBOOT</b><span>'+String(stage+1).padStart(2,'0')+' / '+['OPTICS LAB','SORTING BAY','LOAD TEST','THERMAL'][stage]+'</span><b>CELL '+batteries+'/4</b></div><div class="hudobjective"><strong>지령</strong> · '+directive()+'</div>';}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function pixelText(target,str,x,y,maxW,size,color){const key=size+'|'+str;let pts=pixelCache.get(key);if(!pts){const tmp=document.createElement('canvas');tmp.width=Math.max(8,Math.ceil(str.length*size*1.5+4));tmp.height=size+5;const t=tmp.getContext('2d');t.clearRect(0,0,tmp.width,tmp.height);t.fillStyle='#fff';t.font=size+'px monospace';t.textBaseline='alphabetic';t.fillText(str,1,size);const d=t.getImageData(0,0,tmp.width,tmp.height).data;pts=[];for(let py=0;py<tmp.height;py++)for(let px=0;px<tmp.width;px++){const i=(py*tmp.width+px)*4;if(d[i+3]>110&&d[i]>100)pts.push([px,py])}pixelCache.set(key,pts)}target.fillStyle=color;for(const p of pts){if(p[0] <= maxW)target.fillRect(Math.round(x+p[0]),Math.round(y-size+p[1]),1,1)}}
function wrapText(str,maxChars){const out=[];let line='';for(const ch of str){if(line.length>=maxChars&&ch!==' '){out.push(line);line=''}line+=ch}if(line)out.push(line);return out}
function drawDialoguePixel(who,body,index,total){const c=$('dialogue-pixel')?.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;c.clearRect(0,0,288,40);pixelText(c,who,1,8,185,7,'#f0d2ff');pixelText(c,String(index).padStart(2,'0')+'/'+String(total).padStart(2,'0'),238,8,48,6,'#c4b1d0');c.fillStyle='#655070';c.fillRect(1,11,286,1);const lines=wrapText(body,40);lines.slice(0,3).forEach((line,i)=>pixelText(c,line,1,21+i*9,286,7,'#fff7f0'))}
function drawSpaceKey(){const el=$('space-key');if(!el||typeof el.getContext!=='function')return;const c=el.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;c.clearRect(0,0,54,15);c.fillStyle='#fff0ff';c.fillRect(1,1,52,12);c.fillStyle='#a88ab8';c.fillRect(1,11,52,3);c.fillStyle='#24172e';c.fillRect(2,2,50,9);pixelText(c,'SPACE',15,10,26,6,'#fff0ff')}
function line(x1,y1,x2,y2,c,w=1){const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let i=0;i<=n;i++){const t=n?i/n:0;rect(x1+(x2-x1)*t,y1+(y2-y1)*t,w,w,c)}}
function glow(x,y,c='#f3d48d'){const p=frame%24<12;rect(x-4,y-1,9,3,c);rect(x-1,y-4,3,9,c);rect(x-1,y-1,3,3,p?'#fff6d9':c)}
function background(){const id=['light','belt','floor'][stage];rect(0,0,W,H,'#101d2a');rect(0,0,W,151,stage===0?'#173345':stage===1?'#263744':'#292b3c');
 // deep industrial wall panels
 for(let x=0;x<W;x+=32){rect(x,27,1,120,'#3a5662');rect(x+2,31,26,1,'#294552');rect(x+3,33,1,22,'#223d49');rect(x+24,32,1,25,'#345260')}
 for(let y=42;y<145;y+=25){rect(0,y,W,1,'#284653');rect(0,y+1,W,1,'#1a3442')}
 // upper pipes and glowing indicators
 rect(0,22,W,4,'#17232e');rect(0,25,W,2,'#65717a');rect(12,18,64,5,'#46525c');rect(12,18,64,2,'#84949b');rect(245,17,64,6,'#3c4d58');rect(245,17,64,2,'#788d95');
 for(let i=0;i<6;i++){rect(16+i*12,8,5,3,i%2?'#6da8a7':'#c1a875');rect(17+i*12,9,2,1,'#e8e4c5')}
 // background machinery silhouettes
 rect(8,73,36,66,'#142633');rect(11,77,30,57,'#2b424e');rect(15,82,22,3,'#60747a');rect(15,91,22,2,'#49636d');rect(15,102,22,22,'#1b303c');
 rect(273,69,34,70,'#14232e');rect(277,73,26,61,'#334a55');rect(281,80,18,4,'#78878a');rect(281,91,18,2,'#4b6870');rect(281,101,18,20,'#1c303b');
 // floor and hazard stripe
 rect(0,145,W,6,'#4a5058');rect(0,145,W,2,'#9a9b8f');rect(0,151,W,29,'#202530');for(let x=0;x<W;x+=16){rect(x,153,8,2,'#353d48');rect(x+8,153,8,2,'#252d39');rect(x,175,1,5,'#4b5360')}
 if(stage===0)drawOptics();if(stage===1)drawConveyor();if(stage===2)drawLoadRoom();if(stage===3)drawThermalRoom();
}
function drawOptics(){rect(38,57,62,8,'#263641');rect(42,60,54,3,'#506875');rect(245,48,45,7,'#253b47');rect(249,51,37,2,'#5c777f');
 // laser emitter and receiver
 rect(25,111,22,25,'#24343d');rect(28,114,16,18,'#59656a');rect(31,119,10,7,restored.light?'#9ce7bd':'#b9d9e0');rect(30,117,12,2,'#b8d7dc');
 rect(270,81,25,26,'#24343d');rect(274,85,17,18,'#435964');rect(277,89,11,9,restored.light?'#a8e8b9':'#c17e71');rect(278,91,9,5,'#e4cfa3');
 // broken mirror
 rect(158,75,12,19,'#2b303b');rect(160,77,8,15,restored.light?'#9ce7bd':'#9bbac6');if(!restored.light){line(161,79,167,84,'#f1e9ce',1);line(164,85,161,89,'#e8c58d',1);glow(164,73,'#e9cf8b')}
 if(restored.light){line(39,122,164,84,'#f6d98a',1);line(164,84,281,95,'#f6d98a',1);glow(164,84,'#f7e4a3');glow(281,95,'#a4e7b8')}else{line(39,122,159,85,'#cf8c78',1);glow(164,73,'#e9cf8b')}
 
}
function drawConveyor(){// belt
 rect(25,117,270,17,'#8b7138');rect(28,120,264,8,'#e2c45f');rect(28,128,264,3,'#a9873d');for(let x=30;x<290;x+=12){rect(x,121,6,6,'#b58f3f');rect(x+6,122,2,4,'#f2d978')}
 rect(42,88,42,27,'#293943');rect(46,92,34,19,'#52616a');rect(50,96,26,3,'#91a1a1');rect(50,103,26,3,'#384e5a');
 rect(240,78,43,37,'#24313b');rect(244,82,35,29,'#4c626c');rect(249,87,25,15,restored.belt?'#8ed7aa':'#c2a66e');rect(249,105,25,3,'#1c2932');
 // box
 const bx=restored.belt?95:carried==='box'?Math.round(player.x+player.face*9):154+Math.sin(frame/28)*12;
 const by=carried==='box'?Math.round(player.y-13):103;
 rect(bx,by,13,13,'#8c6948');rect(bx+2,by+2,9,9,'#c5a16b');rect(bx+5,by+2,2,9,'#6f523c');rect(bx+2,by+5,9,2,'#6f523c');
 if(!restored.belt)glow(bx+6,by-3,'#e8cf8b');else{rect(91,101,20,3,'#8ed7aa');glow(101,98,'#9ce7b2')}
 rect(110,83,6,25,'#263740');rect(112,87,2,17,'#d9a77b');rect(202,84,6,24,'#263740');rect(204,88,2,16,'#d9a77b');
}
function drawLoadRoom(){// gap and beams
 rect(82,145,42,35,'#101a25');rect(190,145,42,35,'#101a25');rect(82,145,42,3,'#a76d68');rect(190,145,42,3,'#a76d68');
 for(let x=85;x<121;x+=8){rect(x,150,4,24,'#35424c');rect(x+1,152,1,18,'#62717a')}for(let x=193;x<229;x+=8){rect(x,150,4,24,'#35424c');rect(x+1,152,1,18,'#62717a')}
 rect(39,111,32,10,'#27343f');rect(43,114,24,4,'#67767c');rect(250,111,32,10,'#27343f');rect(254,114,24,4,'#67767c');
 // loose support beam near start
 if(!restored.floor&&carried!=='beam'){rect(51,132,23,5,'#8a7658');rect(53,133,19,2,'#c5b18a');glow(62,129,'#e8cf8b')}
 if(carried==='beam'){rect(player.x-5,player.y-7,18,4,'#bda77b');rect(player.x-4,player.y-6,16,2,'#e2d0a1')}
 if(restored.floor||stageStep>=1){rect(82,145,42,6,'#6e857c');rect(190,145,42,6,'#6e857c');rect(83,146,40,2,'#b4d1ad');rect(191,146,40,2,'#b4d1ad');for(let x=86;x<121;x+=8)rect(x,152,3,21,'#62776e');for(let x=194;x<229;x+=8)rect(x,152,3,21,'#62776e');glow(103,141,'#9ce7b2');glow(211,141,'#9ce7b2')}
 rect(134,74,51,5,'#17232e');rect(135,75,restored.floor?48:21,3,restored.floor?'#8ed7aa':'#d78d77');
}
function text(s,x,y,color='#e8e2dc'){ctx.save();ctx.fillStyle=color;ctx.font='7px monospace';ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.imageSmoothingEnabled=false;ctx.fillText(s,x,y);ctx.restore()}
function drawThermalRoom(){rect(0,135,320,16,'#482d39');for(let x=0;x<320;x+=12){rect(x,138,5,3,'#d47b67');rect(x+5,143,4,3,'#f0b16e')}rect(20,92,31,39,'#263640');rect(24,96,23,31,'#536a73');rect(28,100,15,22,'#db866c');rect(31,103,9,15,'#ffd28c');rect(246,78,43,34,'#263640');rect(250,82,35,26,'#4d6570');rect(255,87,25,16,restored.thermal?'#93e3b3':'#c77866');if(!restored.thermal&&carried!=='sink'){rect(50,132,16,8,'#9bb8c2');rect(52,134,12,4,'#d5e4dc');glow(58,130,'#e8cf8b')}if(carried==='sink'){rect(player.x+player.face*3,player.y-7,12,6,'#9bb8c2');rect(player.x+player.face*3+2,player.y-5,8,2,'#e0eee8')}rect(132,96,26,8,'#3a505b');rect(136,98,18,4,'#6d8b95');rect(224,112,29,36,'#172630');rect(227,115,23,29,'#405965');rect(230,118,17,13,'#182a35');rect(232,120,13,2,restored.thermal?'#9ce7b2':'#df9b78');rect(232,124,13,2,'#91a8ad');rect(232,128,13,2,'#91a8ad');rect(235,134,7,3,'#d8c58c');rect(231,144,15,3,'#202c35');if(restored.thermal){line(38,113,267,94,'#a4e7b8',1);glow(267,94,'#a4e7b8')}else{glow(267,94,'#df7c65');}}
function platforms(){const base=world[stageKeys[stage]].platforms;if(stage===2&&(restored.floor||stageStep>=1))return [...base,{x:82,y:145,w:42,h:10},{x:190,y:145,w:42,h:10}];return base}
function collide(){player.grounded=false;for(const p of platforms()){const wasBottom=player.y+player.h-player.vy;const overlaps=player.x+player.w>p.x&&player.x<p.x+p.w;const bridgeSnap=stage===2&&p.y===145&&(restored.floor||stageStep>=1)&&player.y+player.h>=p.y-3&&player.y+player.h<=p.y+12;if(player.vy>=0&&overlaps&&((wasBottom<=p.y+3&&player.y+player.h>=p.y)||bridgeSnap)){player.y=p.y-player.h;player.vy=0;player.grounded=true}}}
function physics(){const left=keys.has('a')||keys.has('arrowleft'),right=keys.has('d')||keys.has('arrowright');player.vx=left?-1.65:right?1.65:0;if(player.vx)player.face=player.vx>0?1:-1;player.x=Math.max(0,Math.min(W-player.w,player.x+player.vx));player.vy=Math.min(5.2,player.vy+.24);player.y+=player.vy;collide();if(stage===3&&player.y+player.h>149&&((player.x>65&&player.x<101)||(player.x>157&&player.x<207))){player.x=20;player.y=125;player.vy=0;toast('과열 바닥 접촉 — 안전 플랫폼으로 후퇴');}if(player.y>190){player.x=20;player.y=125;player.vy=0;toast('낙하 감지 — 안전 지점으로 복귀');}if(player.grounded&&player.vx)player.step+=.5;player.jumpPose=player.grounded?0:player.vy<0?1:2}
function playerDraw(){
 const x=Math.round(player.x),y=Math.round(player.y),air=!player.grounded,phase=Math.floor(player.step)%4;
 const bob=air?0:(phase===0||phase===3?0:1);
 // Small, simplified cream-colored pixel robot; no mint/turquoise palette.
 rect(x+1,y+player.h+1,9,1,'#111821');
 // tiny floating side pods
 rect(x-3,y+6+bob,2,4,'#d9b7ad');rect(x-2,y+6+bob,1,3,'#fff0dc');
 rect(x+11,y+3+bob,3,5,'#d9b7ad');rect(x+12,y+3+bob,2,4,'#fff0dc');
 // compact round body
 rect(x+2,y+1+bob,6,1,'#d5c4c0');rect(x+1,y+2+bob,8,7,'#fff0dc');
 rect(x+2,y+9+bob,6,2,'#f0c9bc');rect(x+3,y+11+bob,4,1,'#dca99e');
 // dark visor, warm cream outline
 rect(x+2,y+3+bob,6,5,'#c9b9b5');rect(x+2,y+4+bob,6,4,'#17202b');
 // soft ivory eyes instead of mint
 rect(x+3,y+5+bob,2,1,'#fff0dc');rect(x+3,y+6+bob,1,1,'#fff0dc');
 rect(x+6,y+5+bob,2,1,'#fff0dc');rect(x+7,y+6+bob,1,1,'#fff0dc');
 if(carried==='box'){rect(x+player.face*5,y-5,7,5,'#9b744b');rect(x+player.face*5+2,y-4,3,2,'#c7a16a')}
 if(carried==='beam'){rect(x-3,y-4,15,3,'#bda77b');rect(x-2,y-3,13,1,'#e2d0a1')}
 if(carried==='sink'){rect(x+player.face*4,y-5,7,5,'#b6b0b4');rect(x+player.face*4+2,y-3,3,2,'#e0d8d4')}
}
function near(x,y,r=23){return Math.hypot(player.x+4-x,player.y+7-y)<r}
function prompt(){if(!started||dialogue||ending)return;let s='';
if(stage===0&&!restored.light){if(stageStep===0&&near(39,122,27))s='E  <b>LIGHT SOURCE</b> · 출력 확인';else if(stageStep===1&&near(164,84,27))s='E  <b>MIRROR</b> · 각도 교정';else if(stageStep===2&&near(281,95,28))s='E  <b>RECEIVER</b> · 신호 확인';}
if(stage===1&&!restored.belt){if(stageStep===0&&near(93,96,27))s='E  <b>SENSOR</b> · 오염 제거';else if(stageStep===1&&carried!=='box'&&near(160,109,27))s='E  <b>CARGO</b> · 상자 들기';else if(stageStep===1&&carried==='box'&&near(260,99,32))s='E  <b>SORT CHUTE</b> · 상자 놓기';else if(stageStep===2&&near(208,97,30))s='E  <b>CONTROL PANEL</b> · 라인 시험 가동';}
if(stage===2&&!restored.floor){if(stageStep===0&&carried!=='beam'&&near(62,134,27))s='E  <b>SUPPORT</b> · 지지대 들기';else if(stageStep===0&&carried==='beam'&&near(103,148,42))s='E  <b>SUPPORT SLOT</b> · 지지대 설치';else if(stageStep===1&&near(79,137,30))s='E  <b>LOAD SENSOR</b> · 영점 보정';else if(stageStep===2&&near(160,140,35))s='E  <b>LOAD TEST</b> · 시험 하중 가하기';}
if(stage===3&&!restored.thermal){if(stageStep===0&&near(37,111,28))s='E  <b>TEMP SENSOR</b> · 온도 확인';else if(stageStep===1&&carried!=='sink'&&near(58,135,28))s='E  <b>HEAT SINK</b> · 방열 모듈 들기';else if(stageStep===1&&carried==='sink'&&near(267,95,35))s='E  <b>CORE</b> · 방열 모듈 설치';else if(stageStep===2&&near(145,102,30))s='E  <b>COOLANT VALVE</b> · 냉각 밸브 조정';else if(stageStep===3&&near(267,95,35))s='E  <b>CORE</b> · 냉각 시험 가동';}
if(stage===3&&!restored.thermal&&stageStep===4&&testReady&&near(239,130,34))s='E  <b>CONTROL PANEL</b> · 시험 결과 승인';const promptEl=$('interaction-prompt');if(promptEl){promptEl.innerHTML=s;promptEl.classList.toggle('visible',Boolean(s))}}
function finishStage(){
 const key=stageKeys[stage]; if(restored[key])return; restored[key]=true; batteries=Math.min(4,batteries+1);drawHud();renderArchive();
 toast('배터리 셀 회수 '+batteries+'/4 — 복구 기록 저장');
 if(stage===0)say([['MICA','광선 경로 안정화. 첫 번째 셀 회수 완료. **광학실의 기록 조각**이 복구됐어.'],['MICA','기록에는 네 목소리가 남아 있어. “대피가 끝날 때까지 코어를 재가동하지 마.” 누군가를 기다렸던 걸까? 다음 구역에서 나머지 기록을 찾아보자.']]);
 if(stage===1)say([['MICA','분류 센서와 컨베이어 시험 가동 정상. 두 번째 셀 확보.'],['MICA','기억 기록 일부가 돌아왔어. 너는 마지막 순간까지 시설을 떠나지 않고 **대피용 전력 경로를 직접 연결**했어. 그 뒤에 무슨 일이 있었는지는 아직 손상돼 있어.']]);
 if(stage===2)say([['MICA','지지대 변형률과 하중 시험 모두 정상. 세 번째 셀 확보.'],['MICA','복구된 로그에 내 마지막 명령이 있어. “MICA, 네 기억을 남겨 두고 내 기록은 봉인해.” 그래서 내가 네 과거를 기억하지 못했던 거야. **네가 내 기억을 지키려고 했어.**']]);
 if(stage===3)say([['MICA','방열 모듈 장착 완료. 코어 온도가 안전 범위로 내려갔어. 네 번째 셀 확보.'],['MICA','마지막 기록이 복구됐어. 대피가 끝나기 전, 코어가 과열되면서 비상 차단이 필요했어. 너는 사람들을 먼저 내보내고, 시설을 안전하게 멈추기 위해 **네 기억과 내 핵심 기록을 네 개의 셀로 나눠 봉인**했어.'],['MICA','나는 널 잊은 게 아니었어. 네 명령대로 기억을 지키고 있었지만, 복구가 끝날 때까지 그 이유를 알 수 없었던 거야.'],['MICA','네 구역의 장치가 모두 정상이고 대피 구역도 안전해. 이제 코어를 다시 켜도 돼. 출구로 가면 **REBOOT 절차가 완료**될 거야.']]);
}
function interact(){
 if(dialogue){advance();return}
 if(ending)return;
 if((stage===1&&stageStep===3&&testReady&&near(208,97,30))||(stage===2&&stageStep===3&&testReady&&near(160,140,35))||(stage===3&&stageStep===4&&testReady&&near(239,130,34))){testReady=false;finishStage();return;}
 if(restored[stageKeys[stage]])return;
 if(stage===0&&!restored.light){
  if(stageStep===0&&near(39,122,27)){stageStep=1;drawHud();toast('광원 출력은 정상. 중앙 반사판의 각도가 어긋나 빛이 오른쪽 수신기를 빗나가고 있어. 반사판을 교정해.');return}
  if(stageStep===1&&near(164,84,27)){stageStep=2;drawHud();toast('반사판 각도 교정 완료. 광선이 오른쪽 수신기까지 이어졌는지 수신기에서 확인해.');return}
  if(stageStep===2&&near(281,95,28)){finishStage();return}
 }
 if(stage===1&&!restored.belt){
  if(stageStep===0&&near(93,96,27)){stageStep=1;drawHud();toast('광센서가 상자를 다시 감지해. 컨베이어 위 상자를 오른쪽 파란 분류 투입구로 옮겨.');return}
  if(stageStep===1){
   if(carried!=='box'&&near(160,109,27)){carried='box';toast('상자를 들었어. 오른쪽 끝의 파란 분류 투입구까지 운반해 그 안에 내려놔.');return}
   if(carried==='box'&&near(260,99,34)){carried=null;stageStep=2;drawHud();toast('상자 분류 완료. 라인 시험 가동을 해야 해.');return}
  }
  if(stageStep===2&&near(208,97,30)){stageStep=3;testTimer=90;testReady=false;toast('시험 가동 중 — 종료 후 제어기에서 E를 눌러 결과를 승인해.');return}
 }
 if(stage===2&&!restored.floor){
  if(stageStep===0&&carried!=='beam'&&near(62,134,27)){carried='beam';toast('지지대를 들었어. 중앙 바닥의 끊어진 틈으로 옮겨 가로로 설치해.');return}
  if(stageStep===0&&carried==='beam'&&near(103,148,42)){carried=null;stageStep=1;drawHud();toast('지지대가 중앙 틈을 연결했어. 이제 하중 센서에 아무 하중도 없는 상태에서 영점을 보정해.');drawHud();return}
  if(stageStep===1&&near(79,137,30)){stageStep=2;drawHud();toast('하중 센서 영점 보정 완료. 시험 하중을 가해 안전성을 확인해.');return}
  if(stageStep===2&&near(160,140,35)){stageStep=3;testTimer=100;testReady=false;toast('시험 하중 투입 중 — 종료 후 제어기에서 E를 눌러 결과를 승인해.');return}
 }
 if(stage===3&&!restored.thermal){if(stageStep===0&&near(37,111,28)){stageStep=1;drawHud();toast('코어 온도가 118°C야. 왼쪽 바닥의 방열 모듈을 코어까지 옮겨 장착해.');return}if(stageStep===1&&carried!=='sink'&&near(58,135,28)){carried='sink';toast('방열 모듈을 들었어. 발판을 이용해 코어로 운반해.');return}if(stageStep===1&&carried==='sink'&&near(267,95,35)){carried=null;stageStep=2;drawHud();toast('방열 모듈을 코어에 장착했어. 중앙 냉각 밸브를 조정해 냉각수가 흐를 경로를 연결해.');return}if(stageStep===2&&near(145,102,30)){stageStep=3;drawHud();toast('냉각 회로 연결. 코어에서 시험 가동을 시작해.');return}if(stageStep===3&&near(267,95,35)){stageStep=4;testTimer=160;testReady=false;toast('냉각 시험 가동 중 — 종료 후 오른쪽 아래 CONTROL PANEL에서 E를 눌러 결과를 승인해.');return}}
 if(near(305,139,25)){if(stage===0&&restored.light){setStage(1);return}if(stage===1&&restored.belt){setStage(2);return}if(stage===2&&restored.floor){setStage(3);return}if(stage===3&&restored.thermal){showEnding();return}}
 toast('주변 장치 가까이에서 E를 눌러. 진단과 수리를 마친 뒤 시험 가동까지 완료해야 해.');
}
function showEnding(){ending=true;$('dialogue').classList.add('hidden');$('ending-screen').classList.add('hidden');const c=$('ending-animation');if(c){c.classList.remove('hidden');endingAnimFrame=0;animateEnding()}else{$('ending-screen').classList.remove('hidden');drawEndingScene()}}function animateEnding(){const canvas=$('ending-animation');if(!canvas)return;const c=canvas.getContext('2d');if(!c)return;const f=endingAnimFrame++;c.imageSmoothingEnabled=false;c.fillStyle='#090d18';c.fillRect(0,0,320,180);const cx=160,cy=72,pulse=2+Math.floor((Math.sin(f/5)+1)*2);c.fillStyle='#202b3c';c.fillRect(cx-34,cy-34,68,68);c.fillStyle='#465563';c.fillRect(cx-29,cy-29,58,58);c.fillStyle='#111a28';c.fillRect(cx-23,cy-23,46,46);c.fillStyle=f%18<9?'#e8d39a':'#a8b9d3';c.fillRect(cx-9-pulse,cy-9-pulse,18+pulse*2,18+pulse*2);c.fillStyle='#fff0cf';c.fillRect(cx-6,cy-6,12,12);for(let i=0;i<4;i++){const a=f*.045+i*Math.PI/2,rad=Math.max(7,78-Math.min(f,100)*.58),x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;c.fillStyle=['#f0d39b','#d7c1e4','#c5d2dc','#f3e7d2'][i];c.fillRect(Math.round(x)-3,Math.round(y)-3,6,6);c.fillRect(Math.round(x)-1,Math.round(y)-5,2,10)}c.fillStyle='#e6d8c8';c.fillRect(cx-7,cy+38,14,17);c.fillStyle='#f7e9d8';c.fillRect(cx-10,cy+33,20,15);c.fillStyle='#1b2431';c.fillRect(cx-7,cy+36,14,8);c.fillStyle='#f7e9d8';c.fillRect(cx-5,cy+38,3,2);c.fillRect(cx+2,cy+38,3,2);if(f>35){c.fillStyle='#e9d8a1';for(let i=0;i<12;i++){const a=i*Math.PI/6+f*.025,r=42+((f+i*7)%20);c.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),2,2)}}if(f<165){c.fillStyle='#f0e2f4';c.font='8px monospace';c.textAlign='center';c.fillText(f<45?'CORE LINK: CONNECTING':f<100?'MEMORY CELLS: RESTORING':'MICA: ONLINE',160,145);c.fillStyle='#51445e';c.fillRect(72,154,176,4);c.fillStyle='#d7c1e4';c.fillRect(72,154,Math.min(176,Math.floor(f/165*176)),4);requestAnimationFrame(animateEnding)}else{canvas.classList.add('hidden');$('ending-screen').classList.remove('hidden');drawEndingScene()}}

function drawExit(){const ex=world[stageKeys[stage]].exit;rect(ex.x,ex.y,ex.w,ex.h,'#17232d');rect(ex.x+3,ex.y+3,ex.w-6,ex.h-6,stage===2&&restored.floor?'#8dd5a7':'#425660');rect(ex.x+5,ex.y+5,2,ex.h-10,'#c4d0c9');if((stage===0&&restored.light)||(stage===1&&restored.belt)||(stage===2&&restored.floor))glow(ex.x+6,ex.y+3,'#a5e8b8');else rect(ex.x+4,ex.y+5,6,2,'#bd8e77')}
function drawFacilityLabels(){const layer=$('facility-labels');if(!layer)return;const labels=stage===0?[[39,112,'LIGHT SOURCE'],[164,75,'MIRROR'],[281,82,'RECEIVER']]:stage===1?[[63,88,'SENSOR'],[160,99,'CARGO'],[261,78,'SORT CHUTE'],[208,83,'CONTROL']]:stage===2?[[62,124,'SUPPORT'],[103,133,'LOAD SENSOR'],[160,74,'LOAD TEST'],[266,103,'CONTROL']]:[[37,94,'TEMP SENSOR'],[58,121,'HEAT SINK'],[145,91,'COOLANT VALVE'],[267,66,'CORE'],[239,107,'CONTROL PANEL']];layer.innerHTML='';for(const [x,y,label] of labels){const d=Math.hypot((player.x+player.w/2)-x,(player.y+player.h/2)-y);if(d>100)continue;const el=document.createElement('span');el.className='facility-label';el.textContent=label;el.style.left=(x/W*100)+'%';el.style.top=(y/H*100)+'%';layer.appendChild(el)}}function draw(){background();for(const p of platforms()){if(stage===2&&p.y===151&&((p.x===0)||(p.x===124)||(p.x===232)))continue;if(stage===3&&p.y===151&&((p.x===0)||(p.x===99)||(p.x===205)))continue;rect(p.x,p.y,p.w,p.h,'#d9d2ae');rect(p.x,p.y,p.w,2,'#eee8ca');for(let x=p.x+5;x<p.x+p.w-3;x+=13)rect(x,p.y+4,5,2,'#bdb58f')}drawExit();if(stage===0&&!restored.light)drawBattery(286,116);if(stage===1&&!restored.belt)drawBattery(286,116);if(stage===2&&!restored.floor)drawBattery(286,116);if(stage===3&&!restored.thermal)drawBattery(286,116);drawFacilityLabels();playerDraw();prompt()}
function drawBattery(x,y){rect(x,y,8,13,'#d8c26d');rect(x+2,y-2,4,2,'#d8c26d');rect(x+2,y+3,4,2,'#fff0a0');rect(x+2,y+7,4,2,'#fff0a0');glow(x+4,y-3,'#e8cf8b')}
function drawEndingScene(){const ec=$('ending-logo')?.getContext('2d');if(ec){ec.imageSmoothingEnabled=false;ec.clearRect(0,0,112,30);pixelText(ec,'REBOOT',10,22,94,18,'#f2e6df');ec.fillStyle='#b99bc9';ec.fillRect(14,26,84,2)}}
function begin(){if(started)return;started=true;$('start-screen').classList.add('hidden');drawHud();say([['MICA','**REBOOT 복구 프로토콜**을 시작합니다. 시설 중앙 코어 응답률 3%.'],['MICA','나는 MICA, 네가 직접 설계한 시설 관리 AI야. 지금은 기억 기록이 손상돼서 네 이름조차 읽을 수 없어.'],['MICA','비상 정지 기록에 따르면, 네가 마지막으로 내린 명령은 **대피 구역에 전력을 우선 공급하라**였어. 코어를 차단한 뒤 네 기억 백업도 네 구역 네 곳에 나뉘어 봉인됐어.'],['MICA','첫 번째 문제는 광학실의 신호 전달 장치야. 왼쪽 광원은 켜져 있지만 중앙 반사판의 각도가 어긋나 오른쪽 수신기에 빛이 닿지 않아. 중앙 반사판까지 이동해 E를 눌러 각도를 교정하고, 빛이 수신기에 도달하는지 확인해.']])}
$('start-screen').addEventListener('click',begin);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowleft','arrowright','arrowup','arrowdown'].includes(k))e.preventDefault();const was=keys.has(k);keys.add(k);if(k==='m'&&!was&&started&&!dialogue&&!ending&&!facilityDirectoryOpen){e.preventDefault();toggleArchive();return}if(k==='f'&&!was&&started&&!dialogue&&!ending){e.preventDefault();toggleFacilityDirectory();return}if((k===' '||k==='arrowup'||k==='w')&&!was){if(!started)begin();else if(dialogue)advance();else if(!archiveOpen&&player.grounded){player.vy=-4.6;player.grounded=false}}if(k==='e'&&!was&&started&&!archiveOpen&&!facilityDirectoryOpen)interact();if(k==='enter'&&!started)begin()});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
$('memory-close')?.addEventListener('click',()=>{archiveOpen=false;renderArchive()});
$('facility-directory-close')?.addEventListener('click',()=>{facilityDirectoryOpen=false;$('facility-directory')?.classList.add('hidden')});
function loop(){frame++;if(started&&!dialogue&&!ending&&!archiveOpen&&!facilityDirectoryOpen){physics();if((stage===1&&stageStep===3||stage===2&&stageStep===3||stage===3&&stageStep===4)&&testTimer>0){testTimer--;if(testTimer===0){testReady=true;toast('시험 종료. 제어기로 돌아가 E를 눌러 결과를 승인해.')}}const ex=world[stageKeys[stage]].exit;if(player.x>ex.x-3&&player.y+player.h>125&&player.y<154){if(stage===0&&restored.light)setStage(1);else if(stage===1&&restored.belt)setStage(2);else if(stage===2&&restored.floor)setStage(3);else if(stage===3&&restored.thermal)showEnding()}}if(toastTimer>0&&!--toastTimer)$('toast').classList.add('hidden');draw();requestAnimationFrame(loop)}
drawHud();const logo=$('logo-pixel');if(logo){const lc=logo.getContext('2d');lc.imageSmoothingEnabled=false;lc.clearRect(0,0,logo.width,logo.height);pixelText(lc,'REBOOT',10,22,94,18,'#f2e6df');lc.fillStyle='#b99bc9';lc.fillRect(16,26,80,2)}drawSpaceKey();loop();
})();
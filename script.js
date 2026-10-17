(() => {
const canvas=document.getElementById('screen'),ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const W=320,H=180,keys=new Set();
let started=false,dialogue=null,dialoguePos=0,toastTimer=0,frame=0,room='atrium',lastRoom='atrium',done={wire:false,arm:false,sensor:false},cableHeld=false,cableAt='floor',armAngle=0,armLocked=false,sensorOffset=0,ending=false;
const player={x:44,y:116,dx:0,dy:0,face:1,step:0};
const story={
intro:[['MICA','…전원 잔량 3%. 기록 복구 모듈, 기동.'],['MICA','여기는 기억 저장소야. 방마다 멈춘 장치가 있고, 빛나는 표시가 상호작용할 수 있는 곳이야.'],['MICA','먼저 **노란색 케이블 끝**을 찾아보자. **WASD / 방향키**로 다가가서 **SHIFT를 누른 채** 오른쪽 소켓까지 끌고 가면 돼.']],
wire:[['MICA','좋아, 전력실이야. 바닥에 노란색으로 반짝이는 케이블 끝이 보여.'],['MICA','**케이블 끝**에 다가가 **SHIFT를 누른 채** 오른쪽 소켓까지 이동하자. 소켓 가까이에서 SHIFT를 놓으면 연결돼!']],
arm:[['MICA','서보실이야. 로봇팔 끝을 오른쪽 위의 금색 표적에 맞춰야 해.'],['MICA','팔 밑으로 다가가 SHIFT를 누른 채 방향키를 눌러 각도를 조절해. 팔 끝이 표적에 가까워지면 SHIFT를 놓아 고정하자. 빗나가면 다시 SHIFT로 조정할 수 있어.']],
sensor:[['MICA','센서 복도에 도착했어. 센서가 실제보다 0.12m 멀리 측정하고 있어.'],['MICA','센서 옆에서 **SHIFT + 좌우 방향키**로 보정값을 조절해. 목표는 **-0.16m**야. 값을 맞춘 뒤 SHIFT를 놓으면 복구돼!']],
memory:[['MICA','이건… 내 제작자의 음성 기록이야.'],['기록 07','“미카, 네가 이걸 듣는다면 정전은 사고가 아니야. 핵심 기억을 분리한 건 내가 한 일이야.”'],['기록 07','“너를 지키려고 했어. 네가 스스로 선택할 수 있도록, 마지막 복구 키는 네 안에 남겨뒀어.”']],
end:[['MICA','기억을 전부 연결했어. 이제 알겠어. 나는 고장 난 장치가 아니라, 누군가의 약속을 이어받은 로봇이야.'],['MICA','밖으로 나가면 이 기록을 세상에 전할 수 있어.'],['SYSTEM','복구 완료. 새로운 하루를 시작합니다.']]
};
function startDialogue(id){dialogue=story[id]||[[ 'MICA','아직 응답이 없어.' ]];dialoguePos=0;showLine();$('dialogue').classList.remove('hidden')}
function showLine(){const line=dialogue[dialoguePos];const safe=line[1].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');$('speaker').textContent=({'MICA':'미카','SYSTEM':'시스템'})[line[0]]||line[0];$('line').innerHTML=safe.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');$('dialogue-index').textContent=String(dialoguePos+1).padStart(2,'0')+' / '+String(dialogue.length).padStart(2,'0')}
function advance(){if(!dialogue)return;dialoguePos++;if(dialoguePos>=dialogue.length){dialogue=null;$('dialogue').classList.add('hidden');if(room==='memory'&&done.wire&&done.arm&&done.sensor&&!storySeen.end){storySeen.end=true;startDialogue('end')}return}showLine()}
function toast(s){$('toast').textContent=s;$('toast').classList.remove('hidden');toastTimer=105}
function status(){const n=Object.values(done).filter(Boolean).length;$('parts').textContent='복구 '+n+'/3';$('battery-fill').style.width=(18+n*27)+'%';$('objective').textContent=ending?'목표: 기록을 세상으로 가져가기':!done.wire?'목표: 끊어진 전력 케이블 연결':!done.arm?'목표: 서보 팔을 기준점에 고정':!done.sensor?'목표: 거리 센서 보정':'목표: 중앙 기억실로 돌아가기';$('chapter').textContent=['기동 기록 00','기억 기록 01','기억 기록 02','기억 기록 03'][n]}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function text(s,x,y,c='#f4e9dc'){
  ctx.fillStyle=c;ctx.textBaseline='alphabetic';
  const glyph={
  'A':'010/101/111/101/101','B':'110/101/110/101/110','C':'011/100/100/100/011','D':'110/101/101/101/110','E':'111/100/110/100/111','F':'111/100/110/100/100','G':'011/100/101/101/011','H':'101/101/111/101/101','I':'111/010/010/010/111','J':'001/001/001/101/010','K':'101/101/110/101/101','L':'100/100/100/100/111','M':'101/111/111/101/101','N':'101/111/111/111/101','O':'010/101/101/101/010','P':'110/101/110/100/100','Q':'010/101/101/111/011','R':'110/101/110/101/101','S':'011/100/010/001/110','T':'111/010/010/010/010','U':'101/101/101/101/111','V':'101/101/101/101/010','W':'101/101/111/111/101','X':'101/101/010/101/101','Y':'101/101/010/010/010','Z':'111/001/010/100/111',
  '0':'111/101/101/101/111','1':'010/110/010/010/111','2':'110/001/010/100/111','3':'110/001/010/001/110','4':'101/101/111/001/001','5':'111/100/110/001/110','6':'011/100/110/101/010','7':'111/001/010/010/010','8':'010/101/010/101/010','9':'010/101/011/001/110',':':'000/010/000/010/000','/':'001/001/010/100/100','-':'000/000/111/000/000'};
  if([...s].every(ch=>ch.charCodeAt(0)>=32&&ch.charCodeAt(0)<=126)){
    let px=Math.round(x);
    for(const ch of s.toUpperCase()){
      if(ch===' '){px+=4;continue}
      const rows=glyph[ch];
      if(rows){rows.split('/').forEach((row,yy)=>{for(let xx=0;xx<3;xx++)if(row[xx]==='1')rect(px+xx,Math.round(y)-5+yy,1,1,c)});px+=4}
      else px+=4;
    }
    return;
  }
  ctx.font='8px monospace';ctx.fillText(s,Math.round(x),Math.round(y));
}
const PIXEL_GLYPHS={'A':'010/101/111/101/101','B':'110/101/110/101/110','C':'011/100/100/100/011','D':'110/101/101/101/110','E':'111/100/110/100/111','F':'111/100/110/100/100','G':'011/100/101/101/011','H':'101/101/111/101/101','I':'111/010/010/010/111','J':'001/001/001/101/010','K':'101/101/110/101/101','L':'100/100/100/100/111','M':'101/111/111/101/101','N':'101/111/111/111/101','O':'010/101/101/101/010','P':'110/101/110/100/100','Q':'010/101/101/111/011','R':'110/101/110/101/101','S':'011/100/010/001/110','T':'111/010/010/010/010','U':'101/101/101/101/111','V':'101/101/101/101/010','W':'101/101/111/111/101','X':'101/101/010/101/101','Y':'101/101/010/010/010','Z':'111/001/010/100/111','0':'111/101/101/101/111','1':'010/110/010/010/111','2':'110/001/010/100/111','3':'110/001/010/001/110','4':'101/101/111/001/001','5':'111/100/110/001/110','6':'011/100/110/101/010','7':'111/001/010/010/010','8':'010/101/010/101/010','9':'101/101/011/001/110'};
function drawBitmapLabel(canvasId,label,scale=1,color='#f2e6df'){const canvas=$(canvasId);if(!canvas)return;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);const width=label.length*4*scale;let x=Math.max(0,Math.floor((canvas.width-width)/2));const yo=Math.max(0,Math.floor((canvas.height-5*scale)/2));for(const ch of label){if(ch===' '){x+=4*scale;continue}const rows=PIXEL_GLYPHS[ch];if(rows)rows.split('/').forEach((row,y)=>{for(let xx=0;xx<3;xx++)if(row[xx]==='1'){c.fillStyle=color;c.fillRect(x+xx*scale,yo+y*scale,scale,scale)}});x+=4*scale}}
function drawLogo(){drawBitmapLabel('logo-pixel','REBOOT',2,'#f2e6df');drawBitmapLabel('space-key','SPACE',1,'#24172e')}
function drawFloor(){rect(0,0,W,H,'#211b2c');rect(0,30,W,118,'#393045');rect(0,148,W,32,'#211a2b');
for(let y=38;y<148;y+=16){rect(0,y,W,1,'#4b3b52');for(let x=(y%32===0?0:8);x<W;x+=32)rect(x,y,1,16,'#49394f')}
rect(0,30,W,2,'#77617a');rect(0,147,W,2,'#8b6e82');
for(let i=0;i<12;i++){const x=(i*29+13)%W,y=42+(i*17)%98;rect(x,y,1,1,'#77627e')}
}
function wall(x,y,w,h){rect(x,y,w,h,'#282133');rect(x,y,w,2,'#76617b');rect(x,y+h-2,w,2,'#171321');for(let a=x+5;a<x+w-4;a+=10)rect(a,y+3,1,2,'#4c3b57')}
function glow(x,y,col='#e5c3f5'){const p=(frame%32<16?1:0);rect(x-3,y-3,7,1,col);rect(x-3,y+3,7,1,col);rect(x-3,y-2,1,5,col);rect(x+3,y-2,1,5,col);rect(x-1,y-1,3,3,p?'#fff0c9':col)}
function drawRoom(){
drawFloor();
if(room==='atrium'){
wall(14,42,52,18);wall(254,42,52,18);rect(117,39,86,10,'#54405f');rect(121,41,78,6,'#80648a');text('MEMORY ATRIUM',111,36,'#f0dff5');
rect(25,74,20,28,'#282037');rect(28,77,14,22,'#4d3c5c');rect(32,82,6,12,'#b5a0c8');rect(276,74,20,28,'#282037');rect(279,77,14,22,'#4d3c5c');rect(283,82,6,12,'#b5a0c8');
if(done.wire)glow(34,88,'#a8e3bc');else{rect(44,127,70,2,'#e2bc62');rect(44,127,70,1,'#fff0b8');glow(46,128,'#ffe2a0')}
rect(141,63,38,12,'#252033');rect(145,66,30,5,done.arm?'#91c6a2':'#5b435f');if(done.sensor)glow(160,69,'#a8e3bc');else glow(160,69);
door(150,145,'down');text('CORE',151,139,'#e8c8f1');
if(done.wire&&done.arm&&done.sensor){glow(160,53,'#f4d69a');text('MEMORY',143,51,'#f4d69a')}
}else if(room==='cable'){
wall(18,39,84,13);wall(218,39,84,13);text('POWER HALL',125,37,'#c9b5d5');
rect(34,61,36,35,'#292037');rect(38,65,28,27,'#4d3b5a');rect(42,69,20,4,'#b49ac5');rect(46,79,12,9,'#2a2234');
rect(244,61,36,35,'#292037');rect(248,65,28,27,'#4d3b5a');rect(252,69,20,4,'#b49ac5');rect(256,79,12,9,'#2a2234');
rect(54,82,3,3,'#ffca83');rect(260,82,3,3,done.wire?'#a8e3bc':'#ffca83');
if(!done.wire){if(cableAt==='floor'){for(let i=0;i<8;i++){const xx=88+i*4,yy=115+Math.sin(i*.8)*3;rect(xx,yy,4,1,'#e8bd66')}glow(100,115,'#ffe4a1')}else if(cableAt==='held'){for(let i=0;i<6;i++)rect(player.x+5+i*2,player.y+8+Math.sin(frame/4+i)*2,2,1,'#f0c978')}else{rect(62,84,195,2,'#a9e5b8');glow(260,84,'#a9e5b8')}}
text(cableHeld?'케이블을 끌고 있어':'바닥의 빛나는 케이블을 잡아 봐',77,132,'#e3d2eb');
}else if(room==='servo'){
wall(18,39,82,13);wall(220,39,82,13);text('SERVO BAY',130,37,'#c9b5d5');
rect(125,108,70,27,'#282034');rect(130,112,60,19,'#53405f');rect(136,116,48,11,'#30263b');
rect(154,102,12,10,'#b7a0c9');rect(157,99,6,5,'#e4c4f4');
const a=armAngle*Math.PI/180,x1=160+Math.cos(a)*28,y1=101-Math.sin(a)*28,a2=(armAngle-45)*Math.PI/180,x2=x1+Math.cos(a2)*23,y2=y1-Math.sin(a2)*23;
rect(156,98,8,8,'#b69acb');line(160,101,x1,y1,'#d8c2eb',5);line(x1,y1,x2,y2,'#b79acb',4);rect(x2-3,y2-3,7,7,'#e8d1f5');rect(194,73,17,17,'#282034');rect(198,77,9,9,'#f0cf9a');glow(203,81,armLocked?'#a8e3bc':'#f0cf9a');text('TARGET',190,69,'#f0cf9a');text('SHIFT + ARROWS',118,141,'#d8c3e7');
}else if(room==='sensor'){
wall(18,39,85,13);wall(217,39,85,13);text('SENSOR CORRIDOR',111,37,'#c9b5d5');
for(let i=0;i<5;i++){rect(35+i*50,58,26,3,'#5c4767');rect(35+i*50,61,26,2,'#80678a')}
rect(45,83,26,34,'#292037');rect(49,87,18,26,'#5a4565');rect(54,92,8,8,'#c3a8d4');rect(54,104,8,5,'#7a5f87');
rect(236,81,37,35,'#292037');rect(240,85,29,27,'#584463');rect(244,89,21,7,'#d4b9e3');rect(248,101,13,5,done.sensor?'#a8e3bc':'#e9bf87');glow(254,103,done.sensor?'#a8e3bc':'#f0cf9a');
rect(77,91,151,1,'#d6ad73');for(let i=0;i<6;i++)rect(84+i*25,87,1,8,'#e3c18d');
text('RAW 0.84m',127,122,'#e4c7e9');text('SHIFT + LEFT / RIGHT',103,137,'#d8c3e7');
}else if(room==='memory'){
wall(18,39,284,13);text('CORE MEMORY',130,37,'#c9b5d5');rect(123,63,74,62,'#282034');rect(128,68,64,52,'#51405f');rect(134,74,52,40,'#2d2437');
for(let i=0;i<5;i++){rect(140+i*8,82,4,24,'#8c719e');rect(140+i*8,76,4,3,'#d5b5e6')}
glow(160,91,'#f2d49c');text(ending?'EXIT OPEN':'MEMORY SEALED',123,137,ending?'#a8e3bc':'#e6c6ee');
}
drawDoorways();drawPlayer();drawPrompt();
}
function line(x1,y1,x2,y2,c,w){const dx=x2-x1,dy=y2-y1,n=Math.max(Math.abs(dx),Math.abs(dy));for(let i=0;i<=n;i++){const t=n?i/n:0;rect(x1+dx*t-w/2,y1+dy*t-w/2,w,w,c)}}
function door(x,y,dir){rect(x,y,20,5,'#171321');rect(x+2,y-1,16,2,'#bba0c8')}
function drawDoorways(){if(room!=='atrium'){rect(145,29,30,4,'#b39ac4');rect(145,148,30,4,'#b39ac4')}if(room==='atrium'){rect(148,145,24,4,'#b39ac4')}if(room==='memory'&&ending){rect(148,145,24,4,'#a8e3bc')}}
function drawPlayer(){const x=Math.round(player.x),y=Math.round(player.y),bob=(Math.sin(player.step)*1.2)|0;
rect(x-4,y+9,9,2,'#171321');rect(x-4,y+4+bob,3,5,'#6d526f');rect(x+1,y+4-bob,3,5,'#6d526f');
rect(x-4,y-5+bob,8,10,'#b8a0ca');rect(x-3,y-9+bob,6,5,'#e0c4e8');rect(x-5,y-5+bob,10,3,'#a184b5');rect(x+(player.face>0?1:-3),y-3+bob,2,2,'#35243f');rect(x-2,y+2+bob,5,4,'#8f739f');rect(x-3,y+6,2,3,'#e7d2e9');rect(x+1,y+6,2,3,'#e7d2e9');if(cableHeld){rect(x+4,y+5,3,3,'#f0c978');line(x+6,y+7,x+10,y+10,'#e8bd66',1)}}
function drawPrompt(){if(!started||dialogue)return;let s='';if(room==='cable'&&!done.wire&&Math.hypot(player.x-(cableAt==='floor'?100:260),player.y-(cableAt==='floor'?115:84))<28)s=cableHeld?'SHIFT — 케이블 연결':'SHIFT — 케이블 잡기';else if(room==='servo'&&!done.arm&&Math.hypot(player.x-160,player.y-126)<38)s=armLocked?'SHIFT — 다시 조정':'SHIFT + 방향키 — 팔 움직이기';else if(room==='sensor'&&!done.sensor&&Math.hypot(player.x-254,player.y-103)<34)s='SHIFT + 좌우 — 보정';else if(room==='atrium'&&done.wire&&done.arm&&done.sensor&&Math.hypot(player.x-160,player.y-65)<25)s='SHIFT — 기억 열기';else if(room==='memory'&&ending&&player.y>137)s='SHIFT — 나가기';if(s){rect(70,158,180,13,'#171321');rect(70,158,180,1,'#8d7599');text(s,79,167,'#f1dfb9')}}
function moveRoom(next){lastRoom=room;room=next;if(next==='cable'){player.x=45;player.y=110;if(!storySeen.wire){storySeen.wire=true;startDialogue('wire')}}else if(next==='servo'){player.x=160;player.y=133;if(!storySeen.arm){storySeen.arm=true;startDialogue('arm')}}else if(next==='sensor'){player.x=60;player.y=124;if(!storySeen.sensor){storySeen.sensor=true;startDialogue('sensor')}}else if(next==='memory'){player.x=160;player.y=132;if(!storySeen.memory){storySeen.memory=true;startDialogue('memory')}}else{player.x=160;player.y=130} }
const storySeen={intro:false,wire:false,arm:false,sensor:false,memory:false,end:false};
function interact(){if(dialogue){advance();return}if(room==='cable'&&!done.wire){const d=Math.hypot(player.x-100,player.y-115);if(!cableHeld&&cableAt==='floor'&&d<42){cableHeld=true;cableAt='held';toast('케이블을 잡았어. SHIFT를 누른 채 소켓까지 끌어가!');return}return}
if(room==='servo'&&!done.arm&&Math.hypot(player.x-160,player.y-126)<38){if(!armLocked){armLocked=true;const tipX=160+Math.cos(armAngle*Math.PI/180)*28+Math.cos((armAngle-45)*Math.PI/180)*23;const tipY=101-Math.sin(armAngle*Math.PI/180)*28-Math.sin((armAngle-45)*Math.PI/180)*23;if(Math.hypot(tipX-203,tipY-81)<22){done.arm=true;toast('서보 팔 기준점 고정');status()}else toast('기준점에서 벗어났어. 다시 조정해 봐')}else{armLocked=false;toast('관절 잠금 해제')}return}
if(room==='sensor'&&!done.sensor&&Math.hypot(player.x-254,player.y-103)<34){if(Math.abs(sensorOffset+0.16)<=0.02){done.sensor=true;toast('센서 보정 완료');status()}else toast('측정값이 아직 기준과 달라');return}
if(room==='atrium'&&done.wire&&done.arm&&done.sensor&&Math.hypot(player.x-160,player.y-65)<28){moveRoom('memory');return}
if(room==='memory'&&ending&&player.y>137){ending=false;toast('END — 기억이 이어졌다');$('objective').textContent='기록 복구 완료';return}

toast('조금 더 가까이 다가가 봐')}
function input(){if(!started||dialogue)return;let dx=0,dy=0;const up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),left=keys.has('a')||keys.has('arrowleft'),right=keys.has('d')||keys.has('arrowright');
if(room==='servo'&&!done.arm&&keys.has('shift')&&!armLocked){if(left)armAngle=Math.max(-10,armAngle-1.5);if(right)armAngle=Math.min(90,armAngle+1.5);if(up)armAngle=Math.min(90,armAngle+1.5);if(down)armAngle=Math.max(-10,armAngle-1.5);return}
if(room==='sensor'&&!done.sensor&&keys.has('shift')){if(left)sensorOffset=Math.max(-.3,sensorOffset-.005);if(right)sensorOffset=Math.min(.1,sensorOffset+.005);return}
if(up)dy=-1;if(down)dy=1;if(left)dx=-1;if(right)dx=1;if(dx&&dy){dx*=.707;dy*=.707}
player.x=Math.max(4,Math.min(316,player.x+dx*1.15));player.y=Math.max(31,Math.min(151,player.y+dy*1.15));if(dx)player.face=dx>0?1:-1;if(dx||dy)player.step+=.6;
if(room==='atrium'&&player.x<7)moveRoom('cable');else if(room==='atrium'&&player.x>313)moveRoom('sensor');else if(room==='cable'&&player.x>311)moveRoom('atrium');else if(room==='sensor'&&player.x<8)moveRoom('atrium');else if(room==='atrium'&&player.y<34)moveRoom('servo');else if(room==='servo'&&player.y>146)moveRoom('atrium');else if(room==='memory'&&player.y>150&&ending){player.y=150}}
function update(){frame++;input();if(toastTimer>0&&!--toastTimer)$('toast').classList.add('hidden');if(room==='sensor')$('objective').textContent=done.sensor?'목표: 중앙 기억실로 돌아가기':'목표: 보정값 '+sensorOffset.toFixed(2)+'m 조절';if(room==='servo')$('objective').textContent=done.arm?'목표: 중앙 기억실로 돌아가기':'목표: 관절 각도 '+Math.round(armAngle)+'°';if(done.wire&&done.arm&&done.sensor&&!ending)ending=true;drawRoom();requestAnimationFrame(update)}
function beginGame(){if(started)return;started=true;$('start-screen').classList.add('hidden');status();if(!storySeen.intro){storySeen.intro=true;startDialogue('intro')}}$('start-screen').addEventListener('click',beginGame);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();const wasDown=keys.has(k);keys.add(k);if(k===' '&&!wasDown){if(!started)beginGame();else if(dialogue)advance();else interact()}if(k==='enter'&&!started)beginGame();if(k==='shift'&&!wasDown&&started&&!dialogue){if(room==='cable'&&!cableHeld)interact();else if(room==='atrium'&&done.wire&&done.arm&&done.sensor&&Math.hypot(player.x-160,player.y-65)<28)interact();else if(room==='memory'&&ending&&player.y>137)interact()}});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys.delete(k);if(k==='shift'&&room==='cable'&&cableHeld&&!dialogue){if(Math.hypot(player.x-260,player.y-84)<48){cableHeld=false;cableAt='socket';done.wire=true;toast('전력 회로 연결 완료');status()}else{cableHeld=false;cableAt='floor';toast('케이블을 놓았어. 다시 잡아 소켓까지 끌어가자.')}}if(k==='shift'&&room==='servo'&&!done.arm){const tipX=160+Math.cos(armAngle*Math.PI/180)*28+Math.cos((armAngle-45)*Math.PI/180)*23;const tipY=101-Math.sin(armAngle*Math.PI/180)*28-Math.sin((armAngle-45)*Math.PI/180)*23;if(Math.hypot(tipX-203,tipY-81)<22){armLocked=true;done.arm=true;toast('서보 팔 기준점 고정');status()}else toast('아직 기준점에 닿지 않았어')}if(k==='shift'&&room==='sensor'&&!done.sensor){if(Math.abs(sensorOffset+0.16)<=0.02){done.sensor=true;toast('센서 보정 완료');status()}else toast('측정값이 아직 기준과 달라')}});
drawLogo();status();drawRoom();requestAnimationFrame(update);
})();
(() => {
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const $ = id => document.getElementById(id);
const W = 320, H = 180, keys = new Set();
let started = false, frame = 0, toastTimer = 0, toastText = '';
let stage = 0, carried = null, restored = { light: false, belt: false, floor: false };
let dialogue = null, dialoguePos = 0;
const player = { x: 28, y: 126, vx: 0, vy: 0, w: 8, h: 15, face: 1, grounded: false, step: 0 };
const world = {
  light: { name:'OPTICS LAB', title:'광학 장치', desc:'고장 난 반사판을 복구해 빛을 수신기로 보내자.', platforms:[{x:0,y:151,w:320,h:29},{x:65,y:125,w:42,h:6},{x:136,y:106,w:42,h:6},{x:222,y:126,w:38,h:6}], exit:{x:298,y:126,w:14,h:25}},
  belt: { name:'SORTING BAY', title:'자동 분류 라인', desc:'벨트 위의 잘못 분류된 상자를 올바른 투입구로 옮기자.', platforms:[{x:0,y:151,w:320,h:29},{x:74,y:124,w:45,h:6},{x:201,y:124,w:43,h:6}], exit:{x:298,y:126,w:14,h:25}},
  floor: { name:'LOAD TEST CHAMBER', title:'하중 시험 구역', desc:'바닥 지지대를 복구해 약한 발판을 안전하게 건너자.', platforms:[{x:0,y:151,w:82,h:29},{x:124,y:151,w:66,h:29},{x:232,y:151,w:88,h:29},{x:25,y:124,w:35,h:6},{x:253,y:124,w:34,h:6}], exit:{x:298,y:126,w:14,h:25}}
};
const dialogues = [
  [['MICA','복구 모듈 기동. 이번엔 직접 움직이며 장치를 복구해야 해.']],
  [['MICA','광학 실험실이야. 위쪽 발판을 점프해서 건너가 봐.'],['MICA','깨진 반사판 근처에서 E를 눌러 복구하면 빛이 다시 수신기로 향할 거야.']],
  [['MICA','자동 분류 라인이 멈췄어. 벨트 위에 잘못 분류된 상자가 있어.'],['MICA','상자 옆에서 E를 눌러 들고, 오른쪽의 파란 투입구까지 옮긴 다음 다시 E를 눌러 내려놔.']],
  [['MICA','하중 시험 구역이야. 가운데 바닥이 무너져 있어.'],['MICA','느슨해진 지지대를 찾아 E로 들고, 끊어진 바닥 틈으로 가져가 E를 눌러 설치해. 그 뒤에 건너가면 돼.']]
];
function say(lines){dialogue=lines;dialoguePos=0;showLine();$('dialogue').classList.remove('hidden')}
function showLine(){const a=dialogue[dialoguePos];$('speaker').textContent=a[0];$('line').textContent=a[1];$('dialogue-index').textContent=String(dialoguePos+1).padStart(2,'0')+' / '+String(dialogue.length).padStart(2,'0')}
function advance(){if(!dialogue)return;if(++dialoguePos>=dialogue.length){dialogue=null;$('dialogue').classList.add('hidden');return}showLine()}
function toast(s){toastText=s;$('toast').textContent=s;$('toast').classList.remove('hidden');toastTimer=100}
function setStage(n){stage=Math.max(0,Math.min(2,n));player.x=stage===0?20:stage===1?20:18;player.y=126;player.vx=player.vy=0;carried=null;drawHud();if(!restored[['light','belt','floor'][stage]])say(dialogues[stage+1]);}
function drawHud(){const c=$('hud-pixel')?.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;c.clearRect(0,0,320,28);c.fillStyle='#211a2b';c.fillRect(0,0,320,28);c.fillStyle='#f2d5a0';c.font='7px monospace';c.fillText('REBOOT  /  '+world[['light','belt','floor'][stage]].name,7,10);c.fillStyle='#e5d6e8';c.fillText(restored.light&&restored.belt&&restored.floor?'시스템 복구 완료':world[['light','belt','floor'][stage]].desc,7,21);for(let i=0;i<3;i++){c.fillStyle=restored[['light','belt','floor'][i]]?'#9ee2b0':'#66516f';c.fillRect(277+i*12,5,8,5);c.fillStyle='#e5c6f1';c.fillRect(277+i*12,12,8,1)}}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
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
 if(stage===0)drawOptics();if(stage===1)drawConveyor();if(stage===2)drawLoadRoom();
}
function drawOptics(){rect(38,57,62,8,'#263641');rect(42,60,54,3,'#506875');rect(245,48,45,7,'#253b47');rect(249,51,37,2,'#5c777f');
 // laser emitter and receiver
 rect(25,111,22,25,'#24343d');rect(28,114,16,18,'#59656a');rect(31,119,10,7,restored.light?'#9ce7bd':'#b9d9e0');rect(30,117,12,2,'#b8d7dc');
 rect(270,81,25,26,'#24343d');rect(274,85,17,18,'#435964');rect(277,89,11,9,restored.light?'#a8e8b9':'#c17e71');rect(278,91,9,5,'#e4cfa3');
 // broken mirror
 rect(158,75,12,19,'#2b303b');rect(160,77,8,15,restored.light?'#9ce7bd':'#9bbac6');if(!restored.light){line(161,79,167,84,'#f1e9ce',1);line(164,85,161,89,'#e8c58d',1);glow(164,73,'#e9cf8b')}
 if(restored.light){line(39,122,164,84,'#f6d98a',1);line(164,84,281,95,'#f6d98a',1);glow(164,84,'#f7e4a3');glow(281,95,'#a4e7b8')}else{line(39,122,159,85,'#cf8c78',1);glow(164,73,'#e9cf8b')}
 text('MIRROR',148,70,'#e5d7d3');text('RX',279,78,'#b7dce1');
}
function drawConveyor(){// belt
 rect(25,117,270,17,'#1b252e');rect(28,120,264,8,'#67747b');rect(28,128,264,3,'#2d3942');for(let x=30;x<290;x+=12){rect(x,121,6,6,'#3a4c56');rect(x+6,122,2,4,'#879194')}
 rect(42,88,42,27,'#293943');rect(46,92,34,19,'#52616a');rect(50,96,26,3,'#91a1a1');rect(50,103,26,3,'#384e5a');
 rect(240,78,43,37,'#24313b');rect(244,82,35,29,'#4c626c');rect(249,87,25,15,restored.belt?'#8ed7aa':'#c2a66e');rect(249,105,25,3,'#1c2932');text('SORT',247,74,'#e7d9ba');
 // box
 const bx=restored.belt?95:carried==='box'?Math.round(player.x+player.face*9):154+Math.sin(frame/28)*12;
 const by=carried==='box'?Math.round(player.y-13):103;
 rect(bx,by,13,13,'#8c6948');rect(bx+2,by+2,9,9,'#c5a16b');rect(bx+5,by+2,2,9,'#6f523c');rect(bx+2,by+5,9,2,'#6f523c');
 if(!restored.belt)glow(bx+6,by-3,'#e8cf8b');else{rect(91,101,20,3,'#8ed7aa');glow(101,98,'#9ce7b2')}
 rect(110,83,6,25,'#263740');rect(112,87,2,17,'#d9a77b');rect(202,84,6,24,'#263740');rect(204,88,2,16,'#d9a77b');text('BELT',132,113,'#d5e0df');
}
function drawLoadRoom(){// gap and beams
 rect(82,145,42,35,'#101a25');rect(190,145,42,35,'#101a25');rect(82,145,42,3,'#a76d68');rect(190,145,42,3,'#a76d68');
 for(let x=85;x<121;x+=8){rect(x,150,4,24,'#35424c');rect(x+1,152,1,18,'#62717a')}for(let x=193;x<229;x+=8){rect(x,150,4,24,'#35424c');rect(x+1,152,1,18,'#62717a')}
 rect(39,111,32,10,'#27343f');rect(43,114,24,4,'#67767c');rect(250,111,32,10,'#27343f');rect(254,114,24,4,'#67767c');
 // loose support beam near start
 if(!restored.floor&&carried!=='beam'){rect(51,132,23,5,'#8a7658');rect(53,133,19,2,'#c5b18a');glow(62,129,'#e8cf8b')}
 if(carried==='beam'){rect(player.x-5,player.y-7,18,4,'#bda77b');rect(player.x-4,player.y-6,16,2,'#e2d0a1')}
 if(restored.floor){rect(82,145,42,6,'#6e857c');rect(190,145,42,6,'#6e857c');rect(83,146,40,2,'#b4d1ad');rect(191,146,40,2,'#b4d1ad');for(let x=86;x<121;x+=8)rect(x,152,3,21,'#62776e');for(let x=194;x<229;x+=8)rect(x,152,3,21,'#62776e');glow(103,141,'#9ce7b2');glow(211,141,'#9ce7b2')}
 text('LOAD TEST',128,55,'#d4c8df');text('MAX LOAD',133,69,'#c1b6c6');rect(134,74,51,5,'#17232e');rect(135,75,restored.floor?48:21,3,restored.floor?'#8ed7aa':'#d78d77');
}
function text(s,x,y,color='#e8e2dc'){ctx.fillStyle=color;ctx.font='7px monospace';ctx.fillText(s,x,y)}
function platforms(){const base=world[['light','belt','floor'][stage]].platforms;if(stage===2&&restored.floor)return [...base,{x:82,y:145,w:42,h:6},{x:190,y:145,w:42,h:6}];return base}
function collide(){player.grounded=false;for(const p of platforms()){if(player.vy>=0&&player.x+player.w>p.x&&player.x<p.x+p.w&&player.y+player.h>=p.y&&player.y+player.h-player.vy<=p.y+2){player.y=p.y-player.h;player.vy=0;player.grounded=true}}}
function physics(){const left=keys.has('a')||keys.has('arrowleft'),right=keys.has('d')||keys.has('arrowright');player.vx=left?-1.45:right?1.45:0;if(player.vx)player.face=player.vx>0?1:-1;player.x=Math.max(0,Math.min(W-player.w,player.x+player.vx));player.vy=Math.min(4.8,player.vy+.22);player.y+=player.vy;collide();if(player.y>190){player.x=18;player.y=120;player.vy=0;toast('발판에서 떨어졌어. 다시 시도해 봐.')}if(player.grounded&&player.vx)player.step+=.5}
function playerDraw(){const x=Math.round(player.x),y=Math.round(player.y),b=player.grounded?Math.sin(player.step)*1:0;rect(x-2,y+player.h,12,2,'#111821');rect(x+1,y+8+b,3,6,'#5b4a65');rect(x+5,y+8-b,3,6,'#5b4a65');rect(x,y+1+b,8,9,'#a8a0b8');rect(x+1,y-4+b,6,6,'#d8c6d7');rect(x-1,y+1+b,10,3,'#776985');rect(x+(player.face>0?5:1),y+b,2,2,'#27303b');rect(x+2,y+6+b,4,3,'#6d5c7a');if(carried==='box'){rect(x+player.face*4,y-9,11,10,'#9b744b');rect(x+player.face*4+2,y-7,7,6,'#c7a16a')}if(carried==='beam'){rect(x-5,y-8,18,4,'#bda77b');rect(x-4,y-7,16,2,'#e2d0a1')}}
function near(x,y,r=23){return Math.hypot(player.x+4-x,player.y+7-y)<r}
function prompt(){if(!started||dialogue)return;let s='';if(stage===0&&!restored.light&&near(164,84))s='E  반사판 복구';if(stage===1&&!restored.belt&&carried!=='box'&&near(160,109,27))s='E  상자 들기';if(stage===1&&!restored.belt&&carried==='box'&&near(260,99,32))s='E  분류 투입구에 놓기';if(stage===2&&!restored.floor&&carried!=='beam'&&near(62,134,27))s='E  지지대 들기';if(stage===2&&!restored.floor&&carried==='beam'&&near(103,148,34))s='E  지지대 설치';if(s){rect(78,159,164,13,'#141923');rect(78,159,164,1,'#b7a1b9');text(s,86,168,'#f2dfb6')}}
function interact(){if(dialogue){advance();return}
 if(stage===0&&!restored.light&&near(164,84)){restored.light=true;toast('광선 경로 복구 — 수신기 감지!');drawHud();return}
 if(stage===1&&!restored.belt){if(carried!=='box'&&near(160,109,27)){carried='box';toast('상자를 들었어. 파란 분류 투입구로 옮겨.');return}if(carried==='box'&&near(260,99,34)){carried=null;restored.belt=true;toast('분류 완료 — 자동 라인 정상 작동!');drawHud();return}}
 if(stage===2&&!restored.floor){if(carried!=='beam'&&near(62,134,28)){carried='beam';toast('지지대를 들었어. 바닥의 틈으로 이동해.');return}if(carried==='beam'&&near(103,148,36)){carried=null;restored.floor=true;toast('지지대 설치 완료 — 바닥 안정화!');drawHud();return}}
 if(near(305,139,25)){if(stage===0&&restored.light){setStage(1);return}if(stage===1&&restored.belt){setStage(2);return}if(stage===2&&restored.floor){toast('세 장치 복구 완료. 시스템이 안정됐어.');return}}
 toast('주변을 더 살펴봐. 빛나는 장치에 가까이 가면 E로 상호작용할 수 있어.')}
function drawExit(){const ex=world[['light','belt','floor'][stage]].exit;rect(ex.x,ex.y,ex.w,ex.h,'#17232d');rect(ex.x+3,ex.y+3,ex.w-6,ex.h-6,stage===2&&restored.floor?'#8dd5a7':'#425660');rect(ex.x+5,ex.y+5,2,ex.h-10,'#c4d0c9');if((stage===0&&restored.light)||(stage===1&&restored.belt)||(stage===2&&restored.floor))glow(ex.x+6,ex.y+3,'#a5e8b8');else rect(ex.x+4,ex.y+5,6,2,'#bd8e77')}
function draw(){background();for(const p of platforms()){if(stage===2&&p.y===151&&((p.x===0)||(p.x===124)||(p.x===232)))continue;rect(p.x,p.y,p.w,p.h,'#414d58');rect(p.x,p.y,p.w,2,'#a5a5a0');for(let x=p.x+5;x<p.x+p.w-3;x+=13)rect(x,p.y+4,5,2,'#303b47')}drawExit();playerDraw();prompt()}
function begin(){if(started)return;started=true;$('start-screen').classList.add('hidden');drawHud();say(dialogues[0])}
$('start-screen').addEventListener('click',begin);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowleft','arrowright','arrowup','arrowdown'].includes(k))e.preventDefault();const was=keys.has(k);keys.add(k);if((k===' '||k==='arrowup'||k==='w')&&!was){if(!started)begin();else if(dialogue)advance();else if(player.grounded){player.vy=-4.6;player.grounded=false}}if(k==='e'&&!was&&started&&!dialogue)interact();if(k==='enter'&&!started)begin()});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function loop(){frame++;if(started&&!dialogue){physics();if(player.x>world[['light','belt','floor'][stage]].exit.x-3&&player.y+player.h>125&&player.y<154){if(stage===0&&restored.light)setStage(1);else if(stage===1&&restored.belt)setStage(2);else if(stage===2&&restored.floor)toast('모든 장치 복구 완료!')}}if(toastTimer>0&&!--toastTimer)$('toast').classList.add('hidden');draw();requestAnimationFrame(loop)}
drawHud();const logo=$('logo-pixel');if(logo){const lc=logo.getContext('2d');lc.imageSmoothingEnabled=false;lc.clearRect(0,0,logo.width,logo.height);lc.font='bold 18px monospace';lc.textAlign='center';lc.fillStyle='#f2e6df';lc.fillText('REBOOT',logo.width/2,15);lc.fillStyle='#b99bc9';lc.fillRect(16,18,80,2);lc.font='5px monospace';lc.fillStyle='#d7c3df';lc.fillText('SYSTEM RESTORE // PRESS SPACE',logo.width/2,26)}loop();
})();
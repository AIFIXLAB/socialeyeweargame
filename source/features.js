/* ===== NavSystem: ชนสิ่งของและหาเส้นทาง ===== */
const CELL=20,NCOL=Math.ceil(W/CELL),NROW=Math.ceil(H/CELL);
function gOff(){return[0,0];}
function applyLayout(){navKey='';}
let navKey='',navGrid=null;
function solidRects(){const out=[[35,293,465,40],[475,293,25,115],[475,512,25,85],[35,552,465,42],[475,594,25,95],[475,776,25,98],[35,858,465,16],[1030,205,455,20],[1030,205,25,115],[1030,400,25,125],[1030,485,455,40],[1455,205,30,320],[1130,570,360,30],[1152,600,338,142],[1128,570,25,200],[1190,815,290,40],[670,395,200,38],[130,500,80,20],[150,372,300,38],[1090,270,340,35]];
 if(own('seat1'))out.push([670,645,200,38]);if(own('chair2'))out.push([130,760,80,20],[150,632,300,38]);if(own('ctcorner'))out.push([1010,170,240,25]);return out;}
function grid(){const k=JSON.stringify([own('seat1'),own('chair2'),own('ctcorner')]);if(k===navKey&&navGrid)return navGrid;navKey=k;const a=new Uint8Array(NCOL*NROW);
 for(let y=0;y<NROW;y++)for(let x=0;x<NCOL;x++){const px=x*CELL+CELL/2,py=y*CELL+CELL/2;if(outOfShop(px,py))a[y*NCOL+x]=1;}
 solidRects().forEach(([x,y,w,h])=>{for(let cy=Math.floor(y/CELL);cy<=Math.floor((y+h)/CELL);cy++)for(let cx=Math.floor(x/CELL);cx<=Math.floor((x+w)/CELL);cx++)if(cx>=0&&cy>=0&&cx<NCOL&&cy<NROW)a[cy*NCOL+cx]=1;});
 navGrid=a;return a;}
function outOfShop(x,y){if(y<172||x<62||x>1484)return true;if(y>920&&!(x>590&&x<925&&y<965))return true;return false;}
function freePoint(x,y){if(outOfShop(x,y))return false;return !solidRects().some(([a,b,w,h])=>x>=a&&x<=a+w&&y>=b&&y<=b+h);}
function cellOf(x,y){return[clamp(Math.floor(x/CELL),0,NCOL-1),clamp(Math.floor(y/CELL),0,NROW-1)];}
function nearestFree(c){const g=grid();if(!g[c[1]*NCOL+c[0]])return c;for(let r=1;r<14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=c[0]+dx,y=c[1]+dy;if(x>=0&&y>=0&&x<NCOL&&y<NROW&&!g[y*NCOL+x])return[x,y];}return c;}
function findPath(sx,sy,tx,ty){const g=grid(),s=nearestFree(cellOf(sx,sy)),t=nearestFree(cellOf(tx,ty));const si=s[1]*NCOL+s[0],ti=t[1]*NCOL+t[0];if(si===ti)return[];
 const prev=new Int32Array(NCOL*NROW).fill(-1);prev[si]=si;const q=[si];let h=0;
 while(h<q.length){const c=q[h++];if(c===ti)break;const x=c%NCOL,y=(c-x)/NCOL;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=NCOL||ny>=NROW)continue;const n=ny*NCOL+nx;if(g[n]||prev[n]>=0)continue;if(dx&&dy&&(g[y*NCOL+nx]||g[ny*NCOL+x]))continue;prev[n]=c;q.push(n);}}
 if(prev[ti]<0)return null;const raw=[];for(let c=ti;c!==si;c=prev[c])raw.push(c);raw.reverse();
 const pts=raw.map(c=>{const x=c%NCOL;return{x:x*CELL+CELL/2,y:(c-x)/NCOL*CELL+CELL/2};});
 const out=[];let cur={x:sx,y:sy},i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!lineClear(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1;}return out;}
function lineClear(a,b){const g=grid(),d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.ceil(d/8);for(let i=0;i<=n;i++){const c=cellOf(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n);if(g[c[1]*NCOL+c[0]])return false;}return true;}
function navWalk(e,tx,ty,speed,dt){speed*=W/MW;const c=cellOf(tx,ty),key=c[0]+','+c[1];
 if(!e.nav||e.nav.key!==key||e.nav.grid!==navKey){e.nav={key,path:findPath(e.x,e.y,tx,ty)||[],grid:(grid(),navKey)};}
 const p=e.nav.path;if(p.length){if(walkEntity(e,p[0].x,p[0].y,speed,dt))p.shift();return false;}
 return walkEntity(e,tx,ty,speed,dt);}

/* ---------- PlayerSystem: คีย์บอร์ด ---------- */
const KEYS={};
const KEYMAP={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};
function typing(e){const t=e.target&&e.target.tagName;return t==='INPUT'||t==='TEXTAREA';}
document.addEventListener('keydown',e=>{if(typing(e)||!G||!S||screen!=='play')return;const k=e.key.toLowerCase();
 if(k==='escape'&&$('#modal').hidden){pauseDialog();return;}
 if(!$('#modal').hidden||G.mobile)return;
 if(KEYMAP[k]){KEYS[k]=1;e.preventDefault();}if(k==='shift')KEYS.shift=1;if(k==='e'&&!e.repeat&&!paused)interact();});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();delete KEYS[k];});
window.addEventListener('blur',()=>{Object.keys(KEYS).forEach(k=>delete KEYS[k]);});
function keyMove(dt){let dx=0,dy=0;Object.keys(KEYS).forEach(k=>{if(KEYMAP[k]){dx+=KEYMAP[k][0];dy+=KEYMAP[k][1];}});const p=G.player;if(!dx&&!dy){p.keying=false;return false;}
 const l=Math.hypot(dx,dy),sp=moveSpeed()*(W/MW)*(KEYS.shift?1.5:1)*dt;const nx=p.x+dx/l*sp,ny=p.y+dy/l*sp;const stuck=!freePoint(p.x,p.y);if(stuck||freePoint(nx,p.y))p.x=nx;if(stuck||freePoint(p.x,ny))p.y=ny;
 p.moving=true;p.t=(p.t||0)+dt;p.keying=true;p.stay=true;p.nav=null;if(Math.abs(dx)>Math.abs(dy)){p.dir='s';p.flip=dx>0;}else{p.dir=dy>0?'f':'b';p.flip=false;}return true;}
function interact(){const p=G.player;const near=[...G.cust].filter(c=>c.phase!=='leaving'&&c.phase!=='angry').sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
 if(near&&Math.hypot(near.x-p.x,near.y-p.y)<110){onCustomerClick(near);return;}
 if(Math.hypot(SPOT.lab.x-p.x,SPOT.lab.y-p.y)<110){onLabClick();return;}toast('เดินเข้าใกล้ลูกค้าหรือโต๊ะช่าง แล้วกด E');}
function pauseDialog(){openModal(`<div class="sheethead"><h2>พักเกม</h2></div><table class="ledger"><tbody>
 <tr><td>เดิน</td><td>WASD หรือปุ่มลูกศร</td></tr><tr><td>วิ่ง</td><td>Shift</td></tr><tr><td>คุยหรือทำงานกับสิ่งที่อยู่ใกล้</td><td>E</td></tr><tr><td>พักเกม</td><td>ESC</td></tr><tr><td>เมาส์</td><td>คลิกหรือลากลูกค้าได้เหมือนเดิม</td></tr></tbody></table>
 <div class="row"><button class="btn gold" data-c="1">เล่นต่อ</button></div>`);$('#modal [data-c]').onclick=closeModal;}

/* ---------- มินิเกมวัดสายตา (เพื่อความบันเทิง) ---------- */
function examMinigame(c,done){if(S.minigame===false){done();return;}
 const dirs=[['บน',270],['ล่าง',90],['ซ้าย',180],['ขวา',0]];let round=0,right=0;const sizes=[64,38,22];
 const finish=()=>{closeModal();const ok=right;c.sat+=(ok-2)*.4;addStaffXp('owner',ok*4);addXp(ok*3);softPlay(ok>=3?'buy':ok>=2?'ok':'bad');toast(`วัดตาแม่น ${ok}/4`);done();};
 const lensRound=()=>{const a=Math.random()<.5;openModal(`<div class="sheethead"><h2>เลือกเลนส์ทดสอบ · 4/4</h2></div><div class="say">${sprHTML(c.k+'f',60)}<p>เลนส์ไหนทำให้ตัวอักษรคมชัดกว่า</p></div>
   <div class="row" style="justify-content:center"><button class="btn plain lenspick" data-a="${a?1:0}"><span class="chartE" style="font-size:60px;filter:blur(${a?0:2.2}px)">E F P</span><small>เลนส์ 1</small></button><button class="btn plain lenspick" data-a="${a?0:1}"><span class="chartE" style="font-size:60px;filter:blur(${a?2.2:0}px)">E F P</span><small>เลนส์ 2</small></button></div><p class="note">มินิเกมเพื่อความบันเทิง ไม่ใช่การตรวจสายตาจริง</p>`,{lock:true});
   $('#modal').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(b.dataset.a==='1')right++;finish();});};
 const eRound=()=>{if(round>=3)return lensRound();const d=pick(dirs);openModal(`<div class="sheethead"><h2>แผ่นวัดสายตา · ${round+1}/4</h2><button class="btn plain" data-skip="1">ข้ามมินิเกม</button></div><div class="say">${sprHTML(c.k+'f',60)}<p>ขาตัว E หันไปทางไหน</p></div>
   <div class="chartbox2"><span class="chartE" style="font-size:${sizes[round]}px;transform:rotate(${d[1]}deg)">E</span></div>
   <div class="railbtns menu4">${dirs.map(x=>`<button class="btn" data-d="${x[0]}">${x[0]}</button>`).join('')}</div>`,{lock:true});
  const m=$('#modal');m.querySelector('[data-skip]').onclick=()=>{closeModal();done();};m.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(b.dataset.d===d[0]){right++;softPlay('ok');}else softPlay('bad');round++;eRound();});};
 eRound();}

/* ---------- ความพึงพอใจ ---------- */
function satLabel(s){return s>=85?['พอใจมาก','#2f9e3f']:s>=70?['พอใจ','#3f9e6a']:s>=50?['เฉยๆ','#6c6450']:s>=30?['ไม่พอใจ','#f08a12']:['โกรธ','#d8324a'];}
function avgSat(){return S.stats.satN?Math.round(S.stats.satSum/S.stats.satN):0;}

/* ---------- ลูกค้าประจำ ---------- */
const REL=[['ลูกค้าใหม่',0],['ลูกค้าประจำ',3],['ลูกค้าภักดี',8],['ลูกค้า VIP',15],['ลูกค้าระดับ Elite',30]];
function relLv(k){const v=(S.rel[k]||0);let l=0;REL.forEach((r,i)=>{if(v>=r[1])l=i;});return l;}

/* ---------- QuestSystem: เพิ่มภารกิจใหม่ที่ตาราง ---------- */
const DAILY=[
 {id:'serve',name:'ให้บริการลูกค้า 8 คน',n:8,v:()=>S.served,money:1500,xp:40},
 {id:'frame',name:'ขายกรอบแว่น 5 ชิ้น',n:5,v:()=>S.stats.frameSold,money:1500,xp:40},
 {id:'lens',name:'ขายเลนส์ 4 คู่',n:4,v:()=>S.stats.lensSold,money:1500,xp:40},
 {id:'premium',name:'ขายเลนส์พรีเมียม 2 คู่',n:2,v:()=>S.stats.premium,money:5000,xp:80,when:()=>Object.keys(LENSES).some(k=>LENSES[k].premium&&lensAvailable(k))},
 {id:'exam',name:'ตรวจสายตา 4 คน',n:4,v:()=>S.stats.exams,money:1500,xp:40},
 {id:'happy',name:'ทำให้ลูกค้าพอใจมาก 3 คน',n:3,v:()=>S.stats.veryHappy,money:2000,xp:50}
];
const WEEKLY=[
 {id:'sales',name:'ทำยอดขาย ฿100,000',n:100000,v:()=>S.stats.total,money:15000,xp:200},
 {id:'win',name:'ชนะการแข่งขัน 1 ครั้ง',n:1,v:()=>S.ev.wins,money:10000,xp:150},
 {id:'train',name:'อบรมผ่าน 1 หลักสูตร',n:1,v:()=>Object.values(S.staffData).reduce((a,d)=>a+d.courses.length,0),money:8000,xp:150},
 {id:'mobile',name:'ออกหน่วยตรวจสายตา 1 ครั้ง',n:1,v:()=>S.hosp.reports.length,money:15000,xp:200},
 {id:'tro',name:'ปลดล็อกโทรฟี่ใหม่ 3 ชิ้น',n:3,v:()=>Object.keys(S.trophies).length,money:8000,xp:120}
];
const QDEF=[...DAILY,...WEEKLY].reduce((o,q)=>(o[q.id]=q,o),{});
function pickQuests(list,n){return [...list].filter(q=>!q.when||q.when()).sort(()=>Math.random()-.5).slice(0,n).map(q=>({id:q.id,base:q.v(),done:false}));}
function refreshQuests(){const q=S.quests;if(q.day!==S.day){q.day=S.day;q.daily=pickQuests(DAILY,3);}const wk=Math.floor((S.day-1)/7);if(q.week!==wk){q.week=wk;q.weekly=pickQuests(WEEKLY,3);}}
function checkQuests(){if(!S||!S.quests.daily)return;[...S.quests.daily,...S.quests.weekly].forEach(q=>{const d=QDEF[q.id];if(!q.done&&d.v()-q.base>=d.n){q.done=true;earn('reward',d.money);addXp(d.xp);log(`ภารกิจสำเร็จ: ${d.name} +${fmt(d.money)}`,'g');softPlay('buy');}});}
function questRows(a){return a.map(q=>{const d=QDEF[q.id],v=Math.min(d.n,Math.max(0,d.v()-q.base));return `<div class="item ${q.done?'owned':''}"><span class="tx"><b>${d.name}</b><small>รางวัล ${fmt(d.money)} · ${d.xp} EXP</small></span><span class="tag ${q.done?'ok':''}">${q.done?'สำเร็จ':Math.floor(v).toLocaleString('en-US')+'/'+d.n.toLocaleString('en-US')}</span></div>`;}).join('');}
function questDialog(){openModal(`<div class="sheethead"><h2>ภารกิจและลูกค้าประจำ</h2><button class="btn plain" data-c="1">ปิด</button></div>
 <h3>ภารกิจวันนี้</h3><div class="grid">${questRows(S.quests.daily)}</div><h3>ภารกิจสัปดาห์นี้ (7 วันในเกม)</h3><div class="grid">${questRows(S.quests.weekly)}</div>
 <h3>ลูกค้าประจำ</h3><p class="note">ยิ่งบริการดี ลูกค้าแต่ละกลุ่มยิ่งกลับมาบ่อยและให้ทิปเพิ่ม</p>
 <div class="grid">${CUST.map(c=>{const l=relLv(c.k);return `<div class="item">${sprHTML(c.k+'f',54)}<span class="tx"><b>${c.name}</b><small>${REL[l][0]} · มาแล้ว ${S.rel[c.k]||0} ครั้ง</small></span></div>`;}).join('')}</div>`);$('#modal [data-c]').onclick=closeModal;}

/* ---------- เหตุการณ์สุ่ม: เพิ่มเหตุการณ์ใหม่ที่ตารางนี้ ---------- */
function incident(n){n=Math.round(n/100)*100;spend('incident',n);return n;}
const RANDOM=[
 {id:'machine',spr:'ev_machine',bad:1,title:'เครื่องตรวจสายตาเสีย',say:'เครื่องตรวจขัดข้องกลางวัน ต้องตัดสินใจว่าจะซ่อมทันทีไหม',choices:[{t:'เรียกช่างซ่อมด่วน',cost:()=>6000+S.day*200,done:'ซ่อมเสร็จแล้ว ตรวจได้ตามปกติ'},{t:'ทำต่อแบบช้าลง',done:'วันนี้ตรวจสายตาช้าลง 50%',fx:{exam:1.5}}]},
 {id:'sick',spr:'ev_sick',bad:1,title:'พนักงานลาป่วย',when:()=>S.staff.length>0,say:()=>`${staffNameOf(G.evStaff=pick(S.staff))} ไม่สบาย ขอลาป่วยวันนี้`,choices:[{t:'จ้างคนมาแทนวันนี้',cost:()=>STAFF[G.evStaff].salary*1.5,done:'มีคนมาทำงานแทนแล้ว'},{t:'ทำงานโดยไม่มีคนแทน',done:'วันนี้มีคนในร้านน้อยลง 1 คน',run:()=>{G.dayFx.sick=G.evStaff;}}]},
 {id:'stock',spr:'ev_stock',bad:1,title:'สินค้าขายดีหมดสต็อก',say:'เลนส์ราคาประหยัดและกรอบพื้นฐานใกล้หมด ชั้นวางเริ่มโล่ง',run:()=>{lensState('hilux').stock=Math.min(lensState('hilux').stock,1);S.frames.basic=Math.min(frameStock('basic'),1);},choices:[{t:'สั่งด่วนเพิ่มราคา',cost:()=>4500,done:'ได้สินค้าเพิ่มทันที เลนส์ 5 คู่ กรอบ 5 ชิ้น',run:()=>{lensState('hilux').stock+=5;S.frames.basic+=5;}},{t:'ไว้สั่งเองทีหลัง',done:'อย่าลืมกดสั่งสินค้าก่อนของหมด'}]},
 {id:'vip',spr:'ev_vip',title:'ลูกค้า VIP เดินเข้าร้าน',say:'ลูกค้าคนสำคัญกำลังมา ถ้าดูแลดี จะจ่ายแพงขึ้นและให้ทิปเยอะ',choices:[{t:'รับทราบ',done:'ลูกค้า VIP กำลังเดินเข้าร้าน',run:()=>{G.forceVip=1;G.spawn=.5;}}]},
 {id:'rival',spr:'ev_rival',bad:1,title:'คู่แข่งจัดโปรโมชัน',say:'ร้านคู่แข่งลดราคาแรง ลูกค้าอาจเข้าร้านเราน้อยลงวันนี้',choices:[{t:'ลงโฆษณาสู้',cost:()=>3000+S.day*150,done:'ลูกค้ายังเข้าร้านตามปกติ'},{t:'ไม่สู้ราคา',done:'วันนี้ลูกค้าเข้าร้านน้อยลง',fx:{spawn:1.4}}]},
 {id:'rain',spr:'ev_rain',bad:1,title:'ฝนตกหนัก',say:'ฝนตกหนักจนน้ำรั่วเข้าร้าน ต้องเสียค่าซ่อมหลังคา ลูกค้าเข้าน้อยลงแต่รอได้นานขึ้น',choices:[{t:'จ่ายค่าซ่อมหลังคา',force:1,cost:()=>2500,done:'ซ่อมแล้ว วันนี้ลูกค้าน้อยลงแต่รอได้นานขึ้น',fx:{spawn:1.3,pat:1.2}}]},
 {id:'viral',spr:'ev_viral',title:'รีวิวร้านเป็นไวรัล',say:'มีคนรีวิวร้านเราจนดังในโซเชียล ลูกค้าแห่เข้าร้านและชื่อเสียงเพิ่มขึ้น',choices:[{t:'เยี่ยมเลย',done:'วันนี้ลูกค้าเข้าร้านมากขึ้น',fx:{spawn:.7},run:()=>{S.rep=clamp(S.rep+.15,1,5);}}]},
 {id:'broken',spr:'ev_broken',bad:1,title:'ลูกค้าทำกรอบแว่นเสียหาย',say:'ลูกค้าทำกรอบตกระหว่างลองในร้าน กรอบเสียหายและกำลังไม่พอใจ',choices:[{t:'เปลี่ยนกรอบให้ฟรี',cost:()=>1500,done:'ลูกค้าประทับใจ ชื่อเสียงร้านเพิ่มขึ้น',run:()=>{S.rep=clamp(S.rep+.05,1,5);}},{t:'ให้ลูกค้ารับผิดชอบ',done:'ลูกค้าไม่พอใจ ชื่อเสียงร้านลดลง',run:()=>{S.rep=clamp(S.rep-.15,1,5);}}]},
 {id:'late',spr:'ev_late',bad:1,title:'Supplier ส่งสินค้าล่าช้า',say:'รถขนส่งติดปัญหา ของที่สั่งวันนี้จะมาช้ากว่าปกติ',choices:[{t:'จ่ายค่าส่งด่วน',cost:()=>2500,done:'ของยังมาตามเวลาปกติ'},{t:'รอของตามปกติ',done:'วันนี้ของที่สั่งมาช้าลง 2 เท่า',fx:{deliver:2}}]},
 {id:'friend',spr:'ev_friend',title:'ลูกค้าแนะนำเพื่อน',say:'ลูกค้าเก่าบอกต่อเพื่อน ๆ จะมีลูกค้าเพิ่มอีก 2 คน',choices:[{t:'ดีเลย',done:'เพื่อนลูกค้ากำลังเดินมาที่ร้าน',run:()=>{G.spawn=.5;G.extra=2;}}]}
];
let RAND_ON=true;
function rollRandom(){G.dayFx={};G.dayNote='';G.randT=0;if(!RAND_ON||S.day<2||S.day-S.lastRandom<2||Math.random()>.55)return;S.lastRandom=S.day;G.randT=rnd(15,DAY_LEN-40);}
function tickRandom(){if(!G.randT||G.closing||G.event||S.dayT<G.randT)return;G.randT=0;showRandom();}
function showRandom(id){const e=id?RANDOM.find(x=>x.id===id):pick(RANDOM.filter(x=>!x.when||x.when()));if(!e)return;
 if(e.run)e.run();const say=typeof e.say==='function'?e.say():e.say;softPlay(e.bad?'bad':'buy');
 const cs=e.choices.map(c=>({c,cost:c.cost?Math.round(c.cost()/100)*100:0}));
 openModal(`<div class="evhead">${sprHTML('ev_banner',54)}</div><div class="say">${sprHTML(e.spr,130)}<p><b>${e.title}</b><br>${esc(say)}</p></div>
 <div class="evchoices">${cs.map((x,i)=>`<button class="btn ${x.cost?'red':'green'}" data-ev="${i}" ${x.cost&&!x.c.force&&S.money<x.cost?'disabled':''}>${x.c.t}${x.cost?` · จ่าย ${fmt(x.cost)}`:''}</button>`).join('')}</div>`,{lock:true});
 $('#modal').querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>{const x=cs[+b.dataset.ev];if(x.cost)incident(x.cost);Object.assign(G.dayFx,x.c.fx||{});if(x.c.run)x.c.run();G.dayNote=e.title;closeModal();log(`${e.title}: ${x.c.done}${x.cost?` (จ่าย ${fmt(x.cost)})`:''}`,x.cost?'r':'g');toast(x.c.done);saveGame(true);renderRail();});}

/* ---------- ลีกแข่งขัน ---------- */
const LEAGUES=[['Bronze League',0],['Silver League',2],['Gold League',4],['Diamond League',7],['City Champion',10]];
function leagueName(){let n=LEAGUES[0][0];LEAGUES.forEach(l=>{if(S.ev.wins>=l[1])n=l[0];});return n;}
const EVMODES={sales:{name:'แข่งยอดขาย',say:'นับจากยอดบิลที่จ่ายแล้ว',unit:'฿'},fast:{name:'แข่งบริการเร็ว',say:'ได้ 1,500 แต้มต่อลูกค้าหนึ่งคน',unit:'แต้ม'},sat:{name:'แข่งความพึงพอใจ',say:'ยิ่งลูกค้าพอใจ ยิ่งได้แต้มมาก',unit:'แต้ม'}};
function evFmt(mode,v){return mode==='sales'?fmt(v):Math.round(v).toLocaleString('en-US')+' แต้ม';}
function eventAdd(total,score){const e=G.event;if(!e)return;e.me+=e.mode==='fast'?1500:e.mode==='sat'?score*25:total;}

/* ---------- ซื้อกรอบ ---------- */
function frameStock(cat){return S.frames[cat]||0;}
function buyFrames(cat){const f=FRAME_CATS[cat],c=f.cost*5;if(S.money<c)return false;spend('frameCost',c);S.frames[cat]=frameStock(cat)+5;softPlay('buy');log(`สั่ง${f.name} 5 ชิ้น`);return true;}

/* ---------- ลูกค้าพิเศษ: เพิ่มประเภทใหม่ที่ตารางนี้ ---------- */
const CTYPE={
 impatient:{tag:'ใจร้อน',rate:2.2,rep:.25,mul:1.1,col:'#d8324a',say:'ลูกค้าใจร้อนมาแล้ว หลอดวิ่งเร็ว รีบบริการ'},
 picky:{tag:'ช่างเลือก',rate:.8,rep:.12,mul:1,col:'#8a3fc4',say:'ลูกค้าช่างเลือกมาแล้ว ต้องลองกรอบ 3 ครั้งก่อนซื้อ'},
 vip:{tag:'VIP',rate:1.4,rep:.35,mul:2,col:'#b8860b',say:'ลูกค้า VIP มาแล้ว จ่ายแพง แต่ต้องการบริการระดับสูง'},
 bargain:{tag:'ต่อราคา',rate:1,rep:.1,mul:1,col:'#2f8f4e',say:'ลูกค้าต่อราคามาแล้ว ตอนคิดเงินต้องเจรจา'},
 regular:{tag:'ขาประจำ',rate:.75,rep:.06,mul:1,col:'#1f5fd0',say:'ลูกค้าขาประจำกลับมาแล้ว'},
 celeb:{tag:'คนดัง',rate:3.2,rep:.6,mul:1,col:'#6a3fc4',say:'ลูกค้าคนดังมาแล้ว! หลอดวิ่งเร็วมาก ถ้าถูกใจจะจ่ายเยอะ'}
};
function bargainDialog(c){const sub=c.bill.reduce((a,b)=>a+b.amount,0);const cost=(c.sold||[]).reduce((a,x)=>a+(x.t==='lens'?LENSES[x.id].cost:x.t==='frame'?FRAME_CATS[x.cat].cost:CT[x.id].cost),0);
 const offers=[[0,.2],[.05,.5],[.1,.8],[.2,1]].filter(o=>o[0]>=(c.minDeal||0));
 openModal(`<div class="sheethead"><h2>เจรจาราคา</h2></div><div class="say">${sprHTML('p_bargain',100)}<p>ลดให้หน่อยได้ไหมครับ ซื้อตั้ง ${fmt(sub)}</p></div>
 <table class="ledger"><tbody><tr><td>ยอดบิล</td><td>${fmt(sub)}</td></tr><tr><td>ต้นทุนสินค้าโดยประมาณ</td><td>${fmt(cost)}</td></tr></tbody></table>
 <div class="evchoices">${offers.map((o,i)=>`<button class="btn ${o[0]?'':'green'}" data-o="${i}">${o[0]?'ลด '+o[0]*100+'%':'ยืนราคา'} · กำไร ${fmt(sub*(1-o[0])-cost)}</button>`).join('')}</div><p class="note">ยิ่งลดน้อย ลูกค้ายิ่งอาจไม่ยอม ถ้าไม่ยอมจะหงุดหงิดและต้องเสนอใหม่</p>`,{lock:true});
 $('#modal').querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const o=offers[+b.dataset.o];if(Math.random()<o[1]){c.deal=o[0];closeModal();softPlay('ok');completeCash(c);}else{c.pat=Math.max(5,c.pat-20);c.minDeal=Math.min(.2,o[0]+.05);softPlay('bad');toast('ลูกค้าไม่ยอม ลองเสนอใหม่');bargainDialog(c);}});}

/* ---------- คอนแทคเลนส์: เพิ่มยี่ห้อใหม่ที่ตารางนี้ ---------- */
const CTTYPE={day:'รายวัน','2w':'ราย 2 สัปดาห์',month:'รายเดือน',toric:'สำหรับสายตาเอียง',color:'สีแฟชั่น'};
const CT={
 acuvue:{brand:'ACUVUE',type:'day',cost:420,price:950,spr:'ct_acuvue',free:1},
 bl:{brand:'Bausch + Lomb',type:'month',cost:520,price:1200,spr:'ct_bl',shop:10000},
 alcon:{brand:'Alcon',type:'2w',cost:480,price:1100,spr:'ct_alcon',shop:10000},
 cooper:{brand:'CooperVision',type:'toric',cost:800,price:1900,spr:'ct_cooper',shop:16000},
 menicon:{brand:'Menicon',type:'month',cost:650,price:1500,spr:'ct_menicon',shop:13000},
 seed:{brand:'SEED',type:'color',cost:550,price:1400,spr:'ct_seed',shop:12000}
};
const CTPOW=['-1.00','-2.00','-3.00','-4.00','-5.00'];
function ctOwned(k){return own('ctcorner')&&(CT[k].free||own('ct_'+k));}
function ctList(){return Object.keys(CT).filter(ctOwned);}
function ctStock(k,p){return S.ct[k+'|'+p]||0;}
function ctBuy(k,p){const c=CT[k].cost*5;if(S.money<c)return false;spend('lensBuy',c);S.ct[k+'|'+p]=ctStock(k,p)+5;softPlay('buy');return true;}
function ctWorkerPick(c,acc){const types=ctList().filter(k=>CT[k].type===c.ctType);const have=types.filter(k=>CTPOW.some(p=>ctStock(k,p)>0));if(!have.length)return null;
 const k=have.find(x=>ctStock(x,c.ctPow)>0);if(k&&Math.random()<=acc)return[k,c.ctPow];const a=have[0];const near=CTPOW.filter(p=>ctStock(a,p)>0&&(p!==c.ctPow||!k));return near.length?[a,near[0]]:[a,c.ctPow];}
function contactDialog(c){const rows=ctList().map(k=>{const d=CT[k];return `<div class="ctrow">${sprHTML(d.spr,62)}<span class="tx"><b>${d.brand}</b><small>${CTTYPE[d.type]} · ${fmt(d.price*repMul())}</small></span><span class="ctpow">${CTPOW.map(p=>{const n=ctStock(k,p);return n?`<button class="tab" data-ct="${k}|${p}">${p}<small> ${n}</small></button>`:`<button class="tab empty" data-buy="${k}|${p}" ${S.money<d.cost*5?'disabled':''} title="สั่ง 5 กล่อง">${p}<small> สั่ง</small></button>`;}).join('')}</span></div>`;}).join('');
 openModal(`<div class="sheethead"><h2>จ่ายคอนแทคเลนส์</h2><button class="btn plain" data-later="1">ไว้ก่อน</button></div>
 <div class="say">${sprHTML(c.k+'f',84)}<p>ขอคอนแทคเลนส์<b>${CTTYPE[c.ctType]}</b><br>ค่าสายตาในใบวัด <b>${c.ctPow}</b></p></div><div class="ctlist">${rows}</div>
 <p class="note">ต้องจ่ายให้ตรงทั้งชนิดและค่าสายตา ถ้าไม่ตรงลูกค้าจะไม่พอใจและชื่อเสียงร้านลดลง · กด "สั่ง" เพื่อซื้อเข้า 5 กล่อง ทุน ${fmt(CT[ctList()[0]].cost*5)} ขึ้นไป · ยี่ห้อเป็นเพียงฉากในเกม ราคาสมมติ</p>`,{lock:true,onClose:()=>dropOwner(c,'player')});
 const m=$('#modal');m.querySelector('[data-later]').onclick=closeModal;
 m.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const[k,p]=b.dataset.buy.split('|');if(ctBuy(k,p)){m._o={};contactDialog(c);renderRail();}});
 m.querySelectorAll('[data-ct]').forEach(b=>b.onclick=()=>{const[k,p]=b.dataset.ct.split('|');m._o={};closeModal();G.player.carry='ct_box';softPlay('pick');G.player.tasks.unshift({kind:'deliverCt',c,pid:k,pow:p,x:c.x+50,y:c.y+6,dur:.2});});}
function chooseContact(c,k,p,who){const d=CT[k];S.ct[k+'|'+p]=Math.max(0,ctStock(k,p)-1);const ok=d.type===c.ctType&&p===c.ctPow;const price=d.price*repMul();
 bill(c,'lens',`คอนแทคเลนส์ ${d.brand} ${p}`,price,'lens');c.sold.push({t:'contact',id:k});S.stats.contact=(S.stats.contact||0)+1;if(who&&who.role==='sales')workerComm(c,who,price*COMM.sales);
 c.sat+=ok?1.2:-1.6;G.fx.push({x:c.x,y:c.y-100,t:1.5,text:ok?'ตรงค่าสายตาเลย!':'ค่าสายตาไม่ตรง ใส่ไม่ชัด!',col:ok?'#2f9e3f':'#d8324a'});
 if(!ok){c.pat=Math.max(5,c.pat-25);S.rep=clamp(S.rep-.15,1,5);S.stats.mismatch=(S.stats.mismatch||0)+1;log(`จ่ายคอนแทคไม่ตรงให้${c.name} ชื่อเสียงลดลง`,'r');}
 c.si++;c.owner=null;c.phase='idle';softPlay(ok?'ok':'bad');}

/* ---------- โทษชื่อเสียงตก: ขายได้ราคาลดลงจนกว่าจะกลับถึง 3 ดาว ---------- */
const PEN_RULE=[[1.4,30],[1.9,20],[2.4,10]],PEN_CLEAR=3;
function updatePenalty(){let p=S.penalty||0;if(S.rep>=PEN_CLEAR)p=0;else{const r=PEN_RULE.find(x=>S.rep<x[0]);if(r&&r[1]>p)p=r[1];}
 if(p!==(S.penalty||0)){const up=p>(S.penalty||0);S.penalty=p;if(up){softPlay('bad');toast(`ชื่อเสียงตก! ขายได้ราคาลดลง ${p}% จนกว่าชื่อเสียงจะกลับถึง ${PEN_CLEAR} ดาว`);log(`โดนลดราคาขาย ${p}%`,'r');}else{softPlay('buy');toast('ชื่อเสียงกลับมาแล้ว ขายราคาปกติ');log('ราคาขายกลับเป็นปกติ','g');}renderRail();}}

/* ---------- นัดลูกค้ากลับเมื่อเลนส์ไม่มีของ ---------- */
const APPT_DAYS=3,APPT_PENALTY=.3;
function makeAppt(c){S.appts.push({k:c.k,name:c.name,type:c.type||null,lens:c.lens,frCat:c.frCat,examLv:c.examLv,steps:c.steps.slice(c.si),bill:c.bill,sold:c.sold,comm:c.comm,sat:c.sat,q:c.q,due:S.day+APPT_DAYS});
 log(`นัด${c.name}กลับมาอีก ${APPT_DAYS} วัน`,'g');toast(`นัดแล้ว สั่งเลนส์ให้ทันภายใน ${APPT_DAYS} วัน`);c.owner=null;leave(c,true);saveGame(true);renderRail();}
function processAppts(){G.returning=G.returning||[];S.appts=S.appts.filter(a=>{if(a.due>S.day)return true;
 if(bestLensFor(a.lens)){G.returning.push(a);return false;}
 S.rep=clamp(S.rep-APPT_PENALTY,1,5);log(`เลนส์ของ${a.name}ยังไม่มาตามนัด ชื่อเสียงลดลง`,'r');toast(`${a.name}ผิดหวังเพราะเลนส์ไม่มาตามนัด ชื่อเสียงลดลง`);softPlay('bad');return false;});
 if(G.returning.length)G.spawn=Math.min(G.spawn,1);}
function applyReturn(c,a){Object.assign(c,{steps:a.steps,si:0,lens:a.lens,frCat:a.frCat,examLv:a.examLv,bill:a.bill||[],sold:a.sold||[],comm:a.comm||0,sat:(a.sat||0)+.3,q:a.q,pat:100});G.fx.push({x:c.x,y:c.y-120,t:1.8,text:'มาตามนัด',col:'#2f9e3f'});log(`${c.name}กลับมาตามนัด`,'g');}
function apptNote(){return S.appts.length?`<div class="mini">นัดรอเลนส์: ${S.appts.map(a=>`${LENSES[a.lens].name} อีก ${Math.max(0,a.due-S.day)} วัน`).join(' · ')}</div>`:'';}

/* ---------- เปลี่ยนชื่อพนักงาน ---------- */
function staffNameOf(k){return (S&&S.names&&S.names[k])||STAFF[k].name;}
function renameDialog(k){const d=STAFF[k];openModal(`<div class="sheethead"><h2>เปลี่ยนชื่อพนักงาน</h2></div><div class="say">${sprHTML(k+'f',80)}<p>ชื่อเดิมตอนจ้าง: ${d.name}<br><small>${ROLE[d.role]}</small></p></div>
 <form id="rnForm" class="row"><label class="vh" for="rnName">ชื่อใหม่</label><input id="rnName" class="nameinput" maxlength="20" autocomplete="off" placeholder="พิมพ์ชื่อใหม่"><button class="btn green">บันทึกชื่อ</button><button class="btn plain" type="button" data-c="1">ยกเลิก</button></form>
 <p class="note">ไม่เกิน 20 ตัวอักษร ถ้าเว้นว่าง จะกลับไปใช้ชื่อเดิม</p>`,{lock:true});
 const i=$('#rnName');i.value=(S.names&&S.names[k])||'';i.focus();
 $('#modal [data-c]').onclick=staffDialog;
 $('#rnForm').onsubmit=e=>{e.preventDefault();const v=i.value.replace(/[<>&"']/g,'').trim().slice(0,20);if(v)S.names[k]=v;else delete S.names[k];softPlay('ok');saveGame(true);log(`เปลี่ยนชื่อเป็น ${staffNameOf(k)} แล้ว`,'g');staffDialog();renderRail();};}

function playerKey(){return S&&S.owner&&S.owner.gender==='f'?'od2':'od1';}

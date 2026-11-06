/* ===== NavSystem: ชนสิ่งของและหาเส้นทาง ===== */
const CELL=20,NCOL=Math.ceil(W/CELL),NROW=Math.ceil(H/CELL);
const GROUPS={
 frames:{name:'ชั้นวางกรอบ',x:30,y:215,w:340,h:125,solid:[[30,272,330,62]]},
 lab:{name:'โต๊ะช่าง',x:600,y:210,w:280,h:155,solid:[[640,275,190,60]]},
 counter:{name:'เคาน์เตอร์',x:610,y:432,w:270,h:112,solid:[[620,495,250,47]]},
 exam:{name:'ห้องตรวจ',x:10,y:395,w:335,h:275,solid:[[12,445,45,30],[55,478,75,40]]},
 wait:{name:'ที่นั่งรอ',x:355,y:372,w:190,h:82,solid:[[368,405,165,42]]}
};
const BASE=JSON.parse(JSON.stringify({SPOT,CHAIRS,QUEUE,SEATS,ZONE}));
function gOff(g){return (S&&S.layout&&S.layout[g])||[0,0];}
function applyLayout(){const mv=(o,b,g)=>{const[d,e]=gOff(g);o.x=b.x+d;o.y=b.y+e;};
 mv(SPOT.frames,BASE.SPOT.frames,'frames');mv(ZONE.frames,BASE.ZONE.frames,'frames');mv(SPOT.lab,BASE.SPOT.lab,'lab');mv(ZONE.lab,BASE.ZONE.lab,'lab');
 mv(SPOT.cash,BASE.SPOT.cash,'counter');mv(SPOT.counter,BASE.SPOT.counter,'counter');mv(ZONE.counter,BASE.ZONE.counter,'counter');QUEUE.forEach((q,i)=>mv(q,BASE.QUEUE[i],'counter'));
 const[ex,ey]=gOff('exam');CHAIRS.forEach((c,i)=>{const b=BASE.CHAIRS[i];c.x=b.x+ex;c.y=b.y+ey;c.sx=b.sx+ex;c.sy=b.sy+ey;});ZONE.exam.x=BASE.ZONE.exam.x+ex;ZONE.exam.y=BASE.ZONE.exam.y+ey;
 const[wx,wy]=gOff('wait');SEATS.forEach((s,i)=>{s.x=BASE.SEATS[i].x+wx;s.y=BASE.SEATS[i].y+wy;});navKey='';}
let navKey='',navGrid=null;
function solidRects(){const out=[];Object.keys(GROUPS).forEach(g=>{const[d,e]=gOff(g);GROUPS[g].solid.forEach(r=>out.push([r[0]+d,r[1]+e,r[2],r[3]]));});
 const[wx,wy]=gOff('wait');if(own('seat1'))out.push([368+wx,535+wy,165,42]);const[ex,ey]=gOff('exam');if(own('chair2'))out.push([12+ex,585+ey,45,30],[55+ex,618+ey,75,40]);return out;}
function grid(){const k=JSON.stringify([S.layout,own('seat1'),own('chair2')]);if(k===navKey&&navGrid)return navGrid;navKey=k;const a=new Uint8Array(NCOL*NROW);
 for(let y=0;y<NROW;y++)for(let x=0;x<NCOL;x++){const px=x*CELL+CELL/2,py=y*CELL+CELL/2;if(py<322||px<18||px>H+W-H-18||py>H-4)a[y*NCOL+x]=1;}
 solidRects().forEach(([x,y,w,h])=>{for(let cy=Math.floor(y/CELL);cy<=Math.floor((y+h)/CELL);cy++)for(let cx=Math.floor(x/CELL);cx<=Math.floor((x+w)/CELL);cx++)if(cx>=0&&cy>=0&&cx<NCOL&&cy<NROW)a[cy*NCOL+cx]=1;});
 navGrid=a;return a;}
function freePoint(x,y){if(x<18||x>W-18||y<322||y>H-4)return false;return !solidRects().some(([a,b,w,h])=>x>=a&&x<=a+w&&y>=b&&y<=b+h);}
function cellOf(x,y){return[clamp(Math.floor(x/CELL),0,NCOL-1),clamp(Math.floor(y/CELL),0,NROW-1)];}
function nearestFree(c){const g=grid();if(!g[c[1]*NCOL+c[0]])return c;for(let r=1;r<14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=c[0]+dx,y=c[1]+dy;if(x>=0&&y>=0&&x<NCOL&&y<NROW&&!g[y*NCOL+x])return[x,y];}return c;}
function findPath(sx,sy,tx,ty){const g=grid(),s=nearestFree(cellOf(sx,sy)),t=nearestFree(cellOf(tx,ty));const si=s[1]*NCOL+s[0],ti=t[1]*NCOL+t[0];if(si===ti)return[];
 const prev=new Int32Array(NCOL*NROW).fill(-1);prev[si]=si;const q=[si];let h=0;
 while(h<q.length){const c=q[h++];if(c===ti)break;const x=c%NCOL,y=(c-x)/NCOL;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=NCOL||ny>=NROW)continue;const n=ny*NCOL+nx;if(g[n]||prev[n]>=0)continue;if(dx&&dy&&(g[y*NCOL+nx]||g[ny*NCOL+x]))continue;prev[n]=c;q.push(n);}}
 if(prev[ti]<0)return null;const raw=[];for(let c=ti;c!==si;c=prev[c])raw.push(c);raw.reverse();
 const pts=raw.map(c=>{const x=c%NCOL;return{x:x*CELL+CELL/2,y:(c-x)/NCOL*CELL+CELL/2};});
 const out=[];let cur={x:sx,y:sy},i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!lineClear(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1;}return out;}
function lineClear(a,b){const g=grid(),d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.ceil(d/8);for(let i=0;i<=n;i++){const c=cellOf(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n);if(g[c[1]*NCOL+c[0]])return false;}return true;}
function navWalk(e,tx,ty,speed,dt){const c=cellOf(tx,ty),key=c[0]+','+c[1];
 if(!e.nav||e.nav.key!==key||e.nav.grid!==navKey){e.nav={key,path:findPath(e.x,e.y,tx,ty)||[],grid:(grid(),navKey)};}
 const p=e.nav.path;if(p.length){if(walkEntity(e,p[0].x,p[0].y,speed,dt))p.shift();return false;}
 return walkEntity(e,tx,ty,speed,dt);}

/* ---------- PlayerSystem: คีย์บอร์ด ---------- */
const KEYS={};
const KEYMAP={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};
function typing(e){const t=e.target&&e.target.tagName;return t==='INPUT'||t==='TEXTAREA';}
document.addEventListener('keydown',e=>{if(typing(e)||!G||!S||screen!=='play')return;const k=e.key.toLowerCase();
 if(k==='escape'&&$('#modal').hidden&&!editLayout){pauseDialog();return;}
 if(!$('#modal').hidden||G.mobile)return;
 if(KEYMAP[k]){KEYS[k]=1;e.preventDefault();}if(k==='shift')KEYS.shift=1;if(k==='e'&&!e.repeat&&!paused)interact();});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();delete KEYS[k];});
window.addEventListener('blur',()=>{Object.keys(KEYS).forEach(k=>delete KEYS[k]);});
function keyMove(dt){let dx=0,dy=0;Object.keys(KEYS).forEach(k=>{if(KEYMAP[k]){dx+=KEYMAP[k][0];dy+=KEYMAP[k][1];}});const p=G.player;if(!dx&&!dy){p.keying=false;return false;}
 const l=Math.hypot(dx,dy),sp=moveSpeed()*(KEYS.shift?1.5:1)*dt;const nx=p.x+dx/l*sp,ny=p.y+dy/l*sp;if(freePoint(nx,p.y))p.x=nx;if(freePoint(p.x,ny))p.y=ny;
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
 {id:'sick',spr:'ev_sick',bad:1,title:'พนักงานลาป่วย',when:()=>S.staff.length>0,say:()=>`${STAFF[G.evStaff=pick(S.staff)].name} ไม่สบาย ขอลาป่วยวันนี้`,choices:[{t:'จ้างคนมาแทนวันนี้',cost:()=>STAFF[G.evStaff].salary*1.5,done:'มีคนมาทำงานแทนแล้ว'},{t:'ทำงานโดยไม่มีคนแทน',done:'วันนี้มีคนในร้านน้อยลง 1 คน',run:()=>{G.dayFx.sick=G.evStaff;}}]},
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

/* ---------- จัดร้าน: ลากโซนไปวางบนกริด ---------- */
let editLayout=null;
function layoutMode(){if(G.mobile||G.event||G.cust.length){toast('จัดร้านได้เมื่อไม่มีลูกค้าในร้าน');return;}editLayout={drag:null};paused++;const b=$('#hint');toast('ลากโซนไปวางที่ใหม่ แล้วกดเสร็จสิ้น');$('#layoutBar').hidden=false;renderRail();}
function endLayout(){if(!editLayout)return;editLayout=null;paused=Math.max(0,paused-1);$('#layoutBar').hidden=true;saveGame(true);G.player.nav=null;G.player.x=SPOT.home.x;G.player.y=SPOT.home.y;G.workers.forEach(w=>{w.nav=null;w.task=null;});log('จัดร้านใหม่แล้ว','g');}
function groupBox(g){const[d,e]=gOff(g),b=GROUPS[g];return{x:b.x+d,y:b.y+e,w:b.w,h:b.h};}
function layoutOk(g,dx,dy){const b=GROUPS[g],r={x:b.x+dx,y:b.y+dy,w:b.w,h:b.h};if(r.x<8||r.x+r.w>W-8||r.y<190||r.y+r.h>H-2)return false;
 const hit=(a,c)=>a.x<c.x+c.w&&a.x+a.w>c.x&&a.y<c.y+c.h&&a.y+a.h>c.y;if(hit(r,{x:355,y:190,w:190,h:185}))return false;
 return !Object.keys(GROUPS).some(o=>o!==g&&hit(r,groupBox(o)));}
function layoutDown(p){const g=Object.keys(GROUPS).find(k=>{const b=groupBox(k);return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;});if(g)editLayout.drag={g,sx:p.x,sy:p.y,o:[...gOff(g)]};}
function layoutMove(p){const d=editLayout.drag;if(!d)return;const dx=Math.round((d.o[0]+p.x-d.sx)/CELL)*CELL,dy=Math.round((d.o[1]+p.y-d.sy)/CELL)*CELL;if(layoutOk(d.g,dx,dy)){S.layout[d.g]=[dx,dy];applyLayout();}}
function drawLayoutEdit(){ctx.save();Object.keys(GROUPS).forEach(k=>{const b=groupBox(k);ctx.strokeStyle=editLayout.drag&&editLayout.drag.g===k?'#f08a12':'#f6b21b';ctx.lineWidth=3;ctx.setLineDash([10,6]);ctx.fillStyle='rgba(246,178,27,.14)';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeRect(b.x,b.y,b.w,b.h);ctx.setLineDash([]);label(b.x+b.w/2,b.y+16,GROUPS[k].name,'#16204a','#fff');});ctx.restore();}

/* ---------- ลีกแข่งขัน ---------- */
const LEAGUES=[['Bronze League',0],['Silver League',2],['Gold League',4],['Diamond League',7],['City Champion',10]];
function leagueName(){let n=LEAGUES[0][0];LEAGUES.forEach(l=>{if(S.ev.wins>=l[1])n=l[0];});return n;}
const EVMODES={sales:{name:'แข่งยอดขาย',say:'นับจากยอดบิลที่จ่ายแล้ว',unit:'฿'},fast:{name:'แข่งบริการเร็ว',say:'ได้ 1,500 แต้มต่อลูกค้าหนึ่งคน',unit:'แต้ม'},sat:{name:'แข่งความพึงพอใจ',say:'ยิ่งลูกค้าพอใจ ยิ่งได้แต้มมาก',unit:'แต้ม'}};
function evFmt(mode,v){return mode==='sales'?fmt(v):Math.round(v).toLocaleString('en-US')+' แต้ม';}
function eventAdd(total,score){const e=G.event;if(!e)return;e.me+=e.mode==='fast'?1500:e.mode==='sat'?score*25:total;}

/* ---------- ซื้อกรอบ ---------- */
function frameStock(cat){return S.frames[cat]||0;}
function buyFrames(cat){const f=FRAME_CATS[cat],c=f.cost*5;if(S.money<c)return false;spend('frameCost',c);S.frames[cat]=frameStock(cat)+5;softPlay('buy');log(`สั่ง${f.name} 5 ชิ้น`);return true;}

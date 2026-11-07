/* ===== ธนาคารและหุ้นร้าน ===== */
function capIn(n){S.money+=n;S.ledger.capIn=(S.ledger.capIn||0)+n;}
function capOut(n){S.money-=n;S.ledger.capOut=(S.ledger.capOut||0)+n;}
/* ===== ตั้งค่าเริ่มเกม ตั้งชื่อตอนจ้าง ===== */
function cleanName(v,max){return String(v).replace(/[<>&"']/g,'').trim().slice(0,max);}
function setupDialog(){let g=S.owner.gender,goal=5000000;
 openModal(`<div class="sheethead"><h2>สร้างร้านของคุณ</h2></div><div class="row gpick">${[['m','od1f','ชาย'],['f','od2f','หญิง']].map(x=>`<button type="button" class="item col ${g===x[0]?'owned':''}" data-g="${x[0]}">${sprHTML(x[1],110)}<b>เจ้าของร้าน${x[2]}</b></button>`).join('')}</div>
 <form id="suForm" class="suform"><label for="suOwner">ชื่อเจ้าของร้าน</label><input id="suOwner" class="nameinput" maxlength="20" autocomplete="off" value="เจ้าของร้าน"><label for="suShop">ชื่อร้าน</label><input id="suShop" class="nameinput" maxlength="24" autocomplete="off" value="Social Eyewear">
 <label for="suGoal">เงินถึงเท่าไหร่จึงชนะ (บาท)</label><div class="row">${[1000000,5000000,10000000,50000000].map(n=>`<button type="button" class="tab ${n===goal?'on':''}" data-goal="${n}">${fmt(n)}</button>`).join('')}<input id="suGoal" class="nameinput" type="number" min="100000" step="100000" value="${goal}"></div>
 <button class="btn gold">เริ่มเกม</button></form>`,{lock:true});
 const m=$('#modal');m.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{g=b.dataset.g;m.querySelectorAll('[data-g]').forEach(x=>x.classList.toggle('owned',x===b));});
 const gi=$('#suGoal');m.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{gi.value=b.dataset.goal;m.querySelectorAll('[data-goal]').forEach(x=>x.classList.toggle('on',x===b));});
 gi.oninput=()=>m.querySelectorAll('[data-goal]').forEach(x=>x.classList.toggle('on',x.dataset.goal===gi.value));
 $('#suForm').onsubmit=e=>{e.preventDefault();S.owner={gender:g,name:cleanName($('#suOwner').value,20)||'เจ้าของร้าน'};S.shopName=cleanName($('#suShop').value,24)||'Social Eyewear';S.goal=Math.max(100000,Math.floor(+gi.value)||5000000);closeModal();startPlay(true);welcome();};}
function hireDialog(k){const d=STAFF[k];openModal(`<div class="sheethead"><h2>จ้าง${ROLE[d.role]}</h2></div><div class="say">${sprHTML(k+'f',84)}<p>ค่าเริ่มงาน ${fmt(d.hire)} · เงินเดือน ${fmt(monthlySalary(k))}/เดือน<br><small>ตั้งชื่อพนักงานคนนี้ได้เลย</small></p></div>
 <form id="hrForm" class="row"><label class="vh" for="hrName">ชื่อพนักงาน</label><input id="hrName" class="nameinput" maxlength="20" autocomplete="off"><button class="btn green">ยืนยันจ้าง</button><button class="btn plain" type="button" data-c="1">ยกเลิก</button></form>`,{lock:true});
 const i=$('#hrName');i.value=d.name;i.select();$('#modal [data-c]').onclick=staffDialog;
 $('#hrForm').onsubmit=e=>{e.preventDefault();if(S.money<d.hire)return;const v=cleanName(i.value,20);if(v&&v!==d.name)S.names[k]=v;else delete S.names[k];spend('hire',d.hire);G.today.buy+=d.hire;S.staff.push(k);addWorker(k);softPlay('buy');log(`${staffNameOf(k)} เริ่มงานแล้ว`,'g');saveGame(true);staffDialog();renderRail();};}

/* ===== จัดอุปกรณ์แยกชิ้นบนตู้ และชั้นโชว์ ===== */
const EQSLOTS=[];[180,238,296,354,412].forEach(x=>EQSLOTS.push({x,y:362,room:1}));[180,238,296,354,412].forEach(x=>EQSLOTS.push({x,y:622,room:2}));[1120,1190,1260,1330,1400].forEach(x=>EQSLOTS.push({x,y:258,room:3}));
const SHSLOTS=[{x:130,y:178},{x:270,y:178},{x:410,y:178},{x:525,y:178},{x:590,y:300},{x:950,y:300}];
const EQITEMS=[['auto','k_auto',0],['phoro','phoro',1],['slit','k_slit',2],['fundus','k_fundus',3],['oct','oct',4],['bench','bench',10],['edger','edger',11],['lmeter','lmeter',12],['ultra','ultra',13],['uv','uv',14]];
const SHITEMS=[['disp2','disp2',0],['disp1','disp1',1],['cab','cab',2],['spin','spin',3],['glass','glass',4],['disp4','disp4',5]];
function eqOwned(k){return k==='bench'||own(k);}function shOwned(k){return k==='disp2'||own(k);}
function slotOpen(i){return EQSLOTS[i].room!==2||own('chair2');}
function placeMap(items,has,ns,slots,okSlot){const pl=S.place[ns]||(S.place[ns]={}),used={},out={};
 items.filter(t=>has(t[0])).forEach(t=>{const v=pl[t[0]];if(v!=null&&slots[v]&&okSlot(v)&&!used[v]){used[v]=1;out[t[0]]=v;}});
 items.filter(t=>has(t[0])&&out[t[0]]==null).forEach(t=>{let v=t[2];if(used[v]||!okSlot(v)){v=slots.findIndex((_,i)=>!used[i]&&okSlot(i));}if(v>=0){used[v]=1;out[t[0]]=v;pl[t[0]]=v;}});return out;}
function eqMap(){return placeMap(EQITEMS,eqOwned,'eq',EQSLOTS,slotOpen);}
function shMap(){return placeMap(SHITEMS,shOwned,'sh',SHSLOTS,()=>true);}
let arrange=null;
function arrangeMode(){if(G.mobile||G.event){toast('จัดร้านระหว่างแข่งหรือออกหน่วยไม่ได้');return;}arrange={sel:null};paused++;$('#layoutBar').hidden=false;toast('กดอุปกรณ์ แล้วกดช่องที่ต้องการวาง');}
function endArrange(){if(!arrange)return;arrange=null;paused=Math.max(0,paused-1);$('#layoutBar').hidden=true;saveGame(true);log('จัดอุปกรณ์ใหม่แล้ว','g');}
function arrangeClick(p){const test=(ns,slots,okSlot,map)=>{const i=slots.findIndex((s,n)=>okSlot(n)&&Math.abs(p.x-s.x)<(ns==='sh'?60:30)&&p.y<s.y+14&&p.y>s.y-(ns==='sh'?110:70));if(i<0)return false;
  const it=Object.keys(map).find(k=>map[k]===i);if(!arrange.sel||arrange.sel.ns!==ns){if(it){arrange.sel={ns,k:it};softPlay('pick');}return true;}
  const a=arrange.sel.k,from=map[a];if(it&&it!==a)S.place[ns][it]=from;S.place[ns][a]=i;arrange.sel=null;softPlay('ok');return true;};
 if(!test('eq',EQSLOTS,slotOpen,eqMap()))test('sh',SHSLOTS,()=>true,shMap());}
function drawArrange(){ctx.save();ctx.lineWidth=3;const ring=(s,w,h,on)=>{ctx.strokeStyle=on?'#f08a12':'#f6b21b';ctx.setLineDash(on?[]:[8,5]);ctx.fillStyle=on?'rgba(240,138,18,.25)':'rgba(246,178,27,.12)';ctx.fillRect(s.x-w,s.y-h,w*2,h+8);ctx.strokeRect(s.x-w,s.y-h,w*2,h+8);};
 const em=eqMap(),sm=shMap();EQSLOTS.forEach((s,i)=>{if(slotOpen(i))ring(s,28,66,arrange.sel&&arrange.sel.ns==='eq'&&em[arrange.sel.k]===i);});SHSLOTS.forEach((s,i)=>ring(s,58,108,arrange.sel&&arrange.sel.ns==='sh'&&sm[arrange.sel.k]===i));ctx.restore();}

/* ===== กันค้าง: คืนงานที่ไม่มีคนทำ ===== */
let wdT=0;
function watchdog(dt){if(S.party)return;wdT+=dt;if(wdT<2)return;wdT=0;const p=G.player,mine=new Set();[p.task,...p.tasks].forEach(t=>{if(t&&t.c)mine.add(t.c);if(t&&t.j)mine.add(t.j);});
 const work=new Set();G.workers.forEach(w=>{if(w.task){if(w.task.c)work.add(w.task.c);if(w.task.j)work.add(w.task.j);}});
 G.cust.forEach(c=>{if(c.owner==='player'&&!mine.has(c))c.owner=null;else if(c.owner&&c.owner!=='player'&&!work.has(c))c.owner=null;});
 G.jobs.forEach(j=>{if(j.owner==='player'&&!mine.has(j))j.owner=null;else if(j.owner&&j.owner!=='player'&&!work.has(j))j.owner=null;});
 G.chairs.forEach((c,i)=>{if(c&&(!G.cust.includes(c)||c.chair!==i))G.chairs[i]=null;});
 G.queue=G.queue.filter(c=>G.cust.includes(c));
 if(p.task&&p.task===p.lastTask){p.taskAge=(p.taskAge||0)+2;if(p.taskAge>=40){const t=p.task;if(t.c)t.c.owner=null;if(t.j)t.j.owner=null;p.task=null;p.carry=null;p.prog=0;p.taskAge=0;toast('ยกเลิกงานที่ค้างแล้ว');}}else{p.lastTask=p.task;p.taskAge=0;}}

/* ===== จำนวนสั่งซื้อ และระบบเติมสต็อกปุ่มเดียว ===== */
let orderQty=1;
const FILL_PRICE=100000,FILL_DEF={lens:10,frames:10,ct:5};
function fillGet(kind,key){const v=S.fill[kind]&&S.fill[kind][key];return v==null?FILL_DEF[kind]:v;}
function fillPlan(){const out=[];
 Object.keys(S.lens).filter(id=>S.lens[id].listed&&lensAvailable(id)).forEach(id=>{const pend=G.deliveries.filter(d=>d.id===id).reduce((a,d)=>a+d.qty,0);out.push({need:fillGet('lens',id)-lensState(id).stock-pend,unit:LENSES[id].cost,led:'lensBuy',add:q=>{lensState(id).stock+=q;}});});
 Object.keys(FRAME_CATS).filter(frameUnlocked).forEach(k=>out.push({need:fillGet('frames',k)-frameStock(k),unit:FRAME_CATS[k].cost,led:'frameCost',add:q=>{S.frames[k]=frameStock(k)+q;}}));
 ctList().forEach(k=>CTPOW.forEach(p=>out.push({need:fillGet('ct',k)-ctStock(k,p),unit:CT[k].cost,led:'lensBuy',add:q=>{S.ct[k+'|'+p]=ctStock(k,p)+q;}})));
 return out.filter(x=>x.need>0);}
function fillSummary(){const p=fillPlan();return{n:p.reduce((a,x)=>a+x.need,0),cost:p.reduce((a,x)=>a+x.need*x.unit,0)};}
function fillAll(){if(truckLock()){toast('การ์ดรถขนส่งเสีย วันนี้สั่งสินค้าไม่ได้');return;}const plan=fillPlan();let n=0,c=0,short=false;plan.forEach(x=>{const q=Math.min(x.need,Math.floor(Math.max(0,S.money)/x.unit));if(q<x.need)short=true;if(q<=0)return;spend(x.led,q*x.unit);x.add(q);n+=q;c+=q*x.unit;});
 G.today.buy+=c;if(n){softPlay('buy');log(`เติมสต็อก ${n} ชิ้น ${fmt(c)}`,'g');saveGame(true);}
 toast(!plan.length?'สต็อกครบตามที่ตั้งไว้แล้ว':short?`เงินไม่พอเติมครบ เติมได้ ${n} ชิ้น ${fmt(c)}`:`เติมสต็อกแล้ว ${n} ชิ้น ${fmt(c)}`);renderRail();}
function fillPanel(){if(!own('autostock'))return `<p class="note">ซื้อ "ระบบเติมสต็อกปุ่มเดียว" ได้ที่ ซื้อของ &gt; ปรับปรุงร้าน ราคา ${fmt(FILL_PRICE)}</p>`;const f=fillSummary();
 return `<div class="apptbox"><span>เติมสต็อกทุกชิ้นให้ถึงจำนวนที่ตั้งไว้ · ขาด ${f.n} ชิ้น · ใช้เงิน ${fmt(f.cost)}<br><small>ของมาถึงทันที</small></span><button class="btn gold" data-fillall="1" ${f.n?'':'disabled'}>เติมทุกชิ้น</button><button class="btn plain" data-fillset="1">ตั้งจำนวน</button></div>`;}
function fillDialog(){const row=(kind,key,name,stock)=>`<div class="kit"><span class="tx">${name}<small>มีอยู่ ${stock}</small></span><input class="qtyinput" type="number" min="0" max="999" id="fl_${kind}_${key}" data-fl="${kind}|${key}" value="${fillGet(kind,key)}" aria-label="จำนวนเป้าหมาย ${name}"></div>`;
 const lens=Object.keys(S.lens).filter(id=>S.lens[id].listed&&lensAvailable(id));
 openModal(`<div class="sheethead"><h2>ตั้งจำนวนเติมสต็อก</h2><button class="btn plain" data-c="1">เสร็จ</button></div>
 <p class="note">ใส่จำนวนที่อยากให้มีของแต่ละสินค้า ใส่ 0 ถ้าไม่ต้องการเติม เลนส์ที่ยังไม่ได้เปิดรายการต้องสั่งครั้งแรกเองก่อน</p>
 <div class="row"><span class="mini">ตั้งทุกชิ้นเป็น</span>${[0,5,10,20,50].map(n=>`<button class="tab" data-setall="${n}">${n}</button>`).join('')}</div>
 <h3>เลนส์ (คู่)</h3><div class="grid">${lens.map(id=>row('lens',id,LENSES[id].name,lensState(id).stock)).join('')}</div>
 <h3>กรอบแว่น (ชิ้น)</h3><div class="grid">${Object.keys(FRAME_CATS).filter(frameUnlocked).map(k=>row('frames',k,FRAME_CATS[k].name,frameStock(k))).join('')}</div>
 ${ctList().length?`<h3>คอนแทคเลนส์ (กล่องต่อค่าสายตา)</h3><div class="grid">${ctList().map(k=>row('ct',k,`${CT[k].brand} ${CTTYPE[CT[k].type]}`,CTPOW.reduce((a,p)=>a+ctStock(k,p),0))).join('')}</div>`:''}`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=()=>{saveGame(true);hoyaDialog();};
 m.querySelectorAll('[data-fl]').forEach(i=>i.onchange=()=>{const[a,b]=i.dataset.fl.split('|');const v=clamp(Math.floor(+i.value)||0,0,999);i.value=v;(S.fill[a]=S.fill[a]||{})[b]=v;});
 m.querySelectorAll('[data-setall]').forEach(b=>b.onclick=()=>{m.querySelectorAll('[data-fl]').forEach(i=>{i.value=b.dataset.setall;i.onchange();});softPlay('pick');});}
function qtyBar(){return `<div class="row qtybar"><b>จำนวนที่จะสั่ง</b>${[1,2,5,10,20].map(n=>`<button class="tab ${orderQty===n?'on':''}" data-qty="${n}">${n}</button>`).join('')}<label class="vh" for="qtyIn">ใส่จำนวนเอง</label><input class="qtyinput" id="qtyIn" type="number" min="1" max="999" value="${orderQty}"></div>`;}

/* ===== ธนาคารสิ้นเดือน: ขั้นบันไดดอกเบี้ยต่อเดือน แก้ตัวเลขที่ตารางนี้ ===== */
const DEP_TIERS=[[1000000,1],[500000,.5],[100000,.25]];
const LOAN_TIERS=[[100000,.27],[200000,.4]];
const LOAN_MAX=200000,WD_FEE=5000;
function depRate(b){const t=DEP_TIERS.find(x=>b>=x[0]);return t?t[1]:0;}
function loanRate(b){const t=LOAN_TIERS.find(x=>b<=x[0]);return t?t[1]:LOAN_TIERS[LOAN_TIERS.length-1][1];}
function financeMonth(){const b=S.bank;if(b.dep>0){const n=b.dep*depRate(b.dep)/100;if(n){b.dep+=n;S.ledger.depInt=(S.ledger.depInt||0)+n;}}if(b.loan>0)spend('loanInt',b.loan*loanRate(b.loan)/100);}
function netWorth(){return S.money+S.bank.dep-S.bank.loan;}
function bankMonth(then,fromMenu){const b=S.bank,mo=monthOf(S.day),used=b.txM===mo;const dep=[100000,500000,1000000];const money=Math.max(0,S.money);
 openModal(`<div class="sheethead"><h2>${fromMenu?'ธนาคาร':'ธนาคารสิ้นเดือน'}</h2><span class="price">${fmt(S.money)}</span></div>
 <p class="note">ฝากหรือถอนได้เดือนละ 1 รายการ · ฝากฟรี · ถอนครั้งละ ${fmt(WD_FEE)} · ดอกเบี้ยเงินฝากต่อเดือน: ฿100,000 ขึ้นไป 0.25% · ฿500,000 ขึ้นไป 0.5% · ฿1,000,000 ขึ้นไป 1%</p>
 <div class="two"><div class="card"><h3>เงินฝาก ${fmt(b.dep)}</h3><p class="mini">อัตราตอนนี้ ${depRate(b.dep)}% ต่อเดือน ${used?'· เดือนนี้ทำรายการแล้ว':''}</p>
 <div class="row">${[10000,...dep].map(n=>`<button class="btn" data-dep="${n}" ${used||money<n?'disabled':''}>ฝาก ${fmt(n)}</button>`).join('')}<button class="btn" data-dep="${Math.floor(money)}" ${used||money<=0?'disabled':''}>ฝากทั้งหมด</button></div>
 <div class="row">${[10000,...dep].map(n=>`<button class="btn plain" data-wd="${n}" ${used||b.dep<n||money+n<WD_FEE?'disabled':''}>ถอน ${fmt(n)}</button>`).join('')}<button class="btn plain" data-wd="${b.dep}" ${used||b.dep<=WD_FEE?'disabled':''}>ถอนทั้งหมด</button></div></div>
 <div class="card"><h3>เงินกู้ ${fmt(b.loan)}</h3><p class="mini">กู้ได้ไม่เกิน ${fmt(LOAN_MAX)} ต่อครั้ง · ดอกเบี้ยต่อเดือน: ไม่เกิน ฿100,000 คิด 0.27% · เกินกว่านั้น 0.4% · ต้องคืนหมดก่อนจึงกู้ใหม่ได้</p>
 <div class="row">${[50000,100000,200000].map(n=>`<button class="btn gold" data-loan="${n}" ${b.loan>0?'disabled':''}>กู้ ${fmt(n)}</button>`).join('')}</div>
 <div class="row">${[10000,50000,100000].map(n=>`<button class="btn green" data-rep="${n}" ${b.loan<n||money<n?'disabled':''}>คืน ${fmt(n)}</button>`).join('')}<button class="btn green" data-rep="${Math.min(b.loan,money)}" ${b.loan<=0||money<=0?'disabled':''}>คืนเท่าที่มี</button></div></div></div>
 <div class="row"><button class="btn gold" data-bknext="1">${fromMenu?'ปิด':'ไปต่อ'}</button></div>`,{lock:true});
 const m=$('#modal'),re=()=>{softPlay('coin');saveGame(true);bankMonth(then,fromMenu);renderRail();};
 m.querySelectorAll('[data-dep]').forEach(x=>x.onclick=()=>{const n=+x.dataset.dep;b.dep+=n;capOut(n);b.txM=mo;re();});
 m.querySelectorAll('[data-wd]').forEach(x=>x.onclick=()=>{const n=+x.dataset.wd;b.dep=Math.max(0,b.dep-n);capIn(n);spend('incident',WD_FEE);b.txM=mo;re();});
 m.querySelectorAll('[data-loan]').forEach(x=>x.onclick=()=>{const n=+x.dataset.loan;if(b.loan>0)return;b.loan=n;capIn(n);re();});
 m.querySelectorAll('[data-rep]').forEach(x=>x.onclick=()=>{const n=+x.dataset.rep;b.loan=Math.max(0,b.loan-n);capOut(n);re();});
 m.querySelector('[data-bknext]').onclick=()=>{closeModal();then();};}

/* ===== การ์ดสุ่ม: เรื่องดี 10 เรื่องไม่ดี 5 เพิ่มใบใหม่ที่ตารางนี้ ===== */
const allXp=n=>{addStaffXp('owner',n);S.staff.forEach(k=>addStaffXp(k,n));};
const GOODC=[
 {id:'star',spr:'t19',t:'พนักงานดีเด่น',when:()=>S.money>=5000,run:()=>{spend('incident',5000);const k=S.staff.length?pick(S.staff):'owner';addStaffXp(k,120);S.rep=clamp(S.rep+.15,1,5);return `ยอดขายดี มอบรางวัล ฿5,000 ให้${staffName(k)} ทีมมีกำลังใจ ชื่อเสียง +0.15`;}},
 {id:'trip',spr:'t13',t:'ยอดขายครบล้าน พาทีมเที่ยว',when:()=>S.stats.total>=1000000&&S.money>=50000,run:()=>{spend('incident',50000);S.closed=2;allXp(150);S.rep=clamp(S.rep+.3,1,5);return 'จ่าย ฿50,000 ปิดร้าน 2 วันพาทีมเที่ยว พนักงานได้ EXP ชื่อเสียง +0.3';}},
 {id:'gacha',spr:'t06',t:'สมาคมแว่นตาหมุนไข่',run:()=>{const a=['auto','phoro','slit','fundus','oct','edger','lmeter','ultra','uv'].filter(k=>!own(k));if(a.length){const k=pick(a);S.owned[k]=true;return `งานประชุมสมาคม หมุนไข่ได้ ${SHOPBY[k].name} ฟรี`;}earn('reward',20000);return 'เครื่องมือครบแล้ว รับเงินรางวัล ฿20,000 แทน';}},
 {id:'seminar',spr:'t08',t:'จับรางวัลงานอบรมเลนส์',run:()=>{const n=pick([5000,10000]);earn('reward',n);return `ไปอบรมเลนส์แล้วจับรางวัลได้ ${fmt(n)}`;}},
 {id:'award',spr:'t05',t:'ร้านดีเด่นประจำย่าน',run:()=>{const n=15000+S.level*500;earn('reward',n);S.rep=clamp(S.rep+.2,1,5);return `ได้รับเงินรางวัล ${fmt(n)} ชื่อเสียง +0.2`;}},
 {id:'gift',spr:'t15',t:'บริษัทเลนส์แถมสินค้า',run:()=>{Object.keys(S.lens).filter(k=>S.lens[k].listed).forEach(k=>{S.lens[k].stock+=3;});return 'เลนส์ทุกรุ่นที่ร้านขาย เพิ่มรุ่นละ 3 คู่ฟรี';}},
 {id:'frames',spr:'t12',t:'ตัวแทนแจกกรอบตัวอย่าง',run:()=>{Object.keys(FRAME_CATS).filter(frameUnlocked).forEach(k=>{S.frames[k]=frameStock(k)+4;});return 'กรอบทุกแบบที่มี เพิ่มแบบละ 4 ชิ้นฟรี';}},
 {id:'news',spr:'t18',t:'สื่อมาสัมภาษณ์ร้าน',run:()=>{S.rep=clamp(S.rep+.3,1,5);S.buzz=3;return 'ชื่อเสียง +0.3 และลูกค้าเข้าเยอะขึ้น 3 วัน';}},
 {id:'corp',spr:'t16',t:'บริษัทใหญ่สั่งแว่นยกแผนก',run:()=>{const n=20000+S.level*1000;earn('reward',n);return `ได้งานเหมา รับเงิน ${fmt(n)}`;}},
 {id:'coach',spr:'t07',t:'วิทยากรมาสอนฟรี',run:()=>{allXp(100);addXp(150);return 'ทุกคนได้ EXP และร้านได้ EXP เพิ่ม 150';}}
];
const BADC=[
 {id:'quit',spr:'ev_sick',t:'พนักงานลาออกกะทันหัน',when:()=>S.staff.length>0,run:()=>{const k=pick(S.staff);const n=staffNameOf(k);S.staff=S.staff.filter(x=>x!==k);const w=G.workers.find(x=>x.key===k);if(w&&w.task){if(w.task.c)w.task.c.owner=null;if(w.task.j)w.task.j.owner=null;}G.workers=G.workers.filter(x=>x.key!==k);return `${n} ลาออกทันที ต้องจ้างคนใหม่ถ้ายังต้องการตำแหน่งนี้`;}},
 {id:'broken',spr:'ev_machine',t:'เครื่องมือพังเสียหาย',when:()=>['auto','phoro','slit','fundus','oct','edger','lmeter','ultra','uv'].some(own),run:()=>{const k=pick(['auto','phoro','slit','fundus','oct','edger','lmeter','ultra','uv'].filter(own));delete S.owned[k];return `${SHOPBY[k].name} พังซ่อมไม่ได้ เครื่องหายไปจากร้าน ต้องซื้อใหม่`;}},
 {id:'leak',spr:'ev_rain',t:'ท่อน้ำแตกในร้าน',run:()=>{const n=10000+S.level*500;spend('incident',n);return `จ่ายค่าซ่อม ${fmt(n)}`;}},
 {id:'theft',spr:'ev_stock',t:'กรอบแว่นถูกขโมย',run:()=>{Object.keys(S.frames).forEach(k=>{S.frames[k]=Math.floor(frameStock(k)/2);});return 'สต็อกกรอบหายไปครึ่งหนึ่งทุกแบบ';}},
 {id:'fine',spr:'ev_rival',t:'รีวิวแย่และโดนปรับ',run:()=>{spend('incident',5000);S.rep=clamp(S.rep-.3,1,5);return 'จ่ายค่าปรับ ฿5,000 ชื่อเสียง -0.3';}}
];
function drawCard(){const bad=Math.random()<1/3;const list=(bad?BADC:GOODC).filter(c=>!c.when||c.when());const alt=GOODC.filter(c=>!c.when||c.when());return{bad:bad&&list.length>0,c:pick(list.length?list:alt)};}
function cardDialog(title,then,force){openModal(`<div class="sheethead"><h2>เปิดการ์ด${title}</h2></div><p>เลือก 1 ใบ อาจเป็นเรื่องดีหรือไม่ดีก็ได้</p><div class="cards">${[0,1,2].map(i=>`<button class="ecard" data-flip="${i}" aria-label="การ์ดใบที่ ${i+1}">?</button>`).join('')}</div>`,{lock:true});
 $('#modal').querySelectorAll('[data-flip]').forEach(b=>b.onclick=()=>{const d=force?{c:force,bad:BADC.includes(force)}:drawCard();const text=d.c.run();softPlay(d.bad?'bad':'buy');log(`การ์ด: ${d.c.t}`,d.bad?'r':'g');saveGame(true);renderRail();
  openModal(`<div class="sheethead"><h2>${d.bad?'เรื่องไม่ดี':'เรื่องดี'}</h2></div><div class="say">${sprHTML(d.c.spr,110)}<p><b>${d.c.t}</b><br>${esc(text)}</p></div><div class="row"><button class="btn gold" data-cardok="1">ตกลง</button></div>`,{lock:true});$('#modal [data-cardok]').onclick=()=>{closeModal();then();};});}

/* ===== เป้าหมายชนะ และความเร็วตามเลเวล ===== */
function lvSpawn(){return 1+Math.min(S.level,60)*.012;}
function lvPat(){return 1+Math.min(S.level,60)*.008;}
function checkGoal(){if(!S.goal||S.won||netWorth()<S.goal)return;if(S.party){S.won=S.day;return;}if(!$('#modal').hidden)return;S.won=S.day;checkTrophies();saveGame(true);softPlay('buy');
 openModal(`<div class="sheethead"><h2>คุณชนะแล้ว!</h2></div><div class="say">${sprHTML('e_podium',110)}<p>${esc(S.shopName)} มีเงินถึงเป้าหมาย ${fmt(S.goal)} ในวันที่ ${S.day}<br>รับถ้วยรางวัล "เป้าหมายสำเร็จ"</p></div><div class="row"><button class="btn gold" data-c="1">เล่นต่อ</button></div>`,{lock:true});$('#modal [data-c]').onclick=closeModal;}

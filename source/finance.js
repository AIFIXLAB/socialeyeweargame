/* ===== ธนาคารและหุ้นร้าน ===== */
const LOAN_APR=7.5,DEP_APR=1.5; /* อัตราต่อปีที่ตั้งไว้สำหรับเกม คิดเดือนละ 1/12 */
function creditLimit(){const h=S.history.slice(-3);const avg=h.length?h.reduce((a,x)=>a+x.income,0)/h.length:0;return Math.round((50000+S.level*10000+avg*1.5)/1000)*1000;}
function capIn(n){S.money+=n;S.ledger.capIn=(S.ledger.capIn||0)+n;}
function capOut(n){S.money-=n;S.ledger.capOut=(S.ledger.capOut||0)+n;}
function financeMonth(){const b=S.bank;if(b.dep>0){const n=b.dep*DEP_APR/100/12;b.dep+=n;S.ledger.depInt=(S.ledger.depInt||0)+n;}if(b.loan>0){const n=b.loan*LOAN_APR/100/12;spend('loanInt',n);}}
function bankDialog(){const b=S.bank,lim=creditLimit(),room=Math.max(0,lim-b.loan);const can=x=>x>0;
 const btn=(act,n,lab,ok)=>`<button class="btn ${act==='loan'?'gold':act==='repay'?'green':''}" data-b="${act}" data-n="${n}" ${ok&&n>0?'':'disabled'}>${lab}</button>`;
 const amts=[10000,50000,200000];
 openModal(`<div class="sheethead"><h2>ธนาคาร</h2><span class="price">${fmt(S.money)}</span><button class="btn plain" data-c="1">ปิด</button></div>
 <p class="note">ดอกเบี้ยคิดสิ้นเดือนในเกม: เงินกู้ ${LOAN_APR}% ต่อปี · เงินฝาก ${DEP_APR}% ต่อปี (หาร 12 ต่อเดือน) · อัตราตั้งขึ้นเพื่อเกม ไม่ใช่อัตราจริงของธนาคารใด</p>
 <div class="two"><div class="card"><h3>เงินกู้</h3><table class="ledger"><tbody><tr><td>หนี้คงเหลือ</td><td>${fmt(b.loan)}</td></tr><tr><td>วงเงินทั้งหมด</td><td>${fmt(lim)}</td></tr><tr><td>กู้เพิ่มได้</td><td>${fmt(room)}</td></tr><tr><td>ดอกเบี้ยสิ้นเดือนนี้</td><td>${fmt(b.loan*LOAN_APR/1200)}</td></tr></tbody></table>
  <div class="row">${amts.map(n=>btn('loan',n,'กู้ '+fmt(n),S.money>=0&&room>=n)).join('')}${btn('loan',room,'กู้เต็มวงเงิน',S.money>=0)}</div>
  <div class="row">${amts.map(n=>btn('repay',n,'คืน '+fmt(n),b.loan>=n&&S.money>=n)).join('')}${btn('repay',Math.min(b.loan,Math.max(0,S.money)),'คืนเท่าที่มี',b.loan>0&&S.money>0)}</div>
  <p class="note">วงเงินเพิ่มตามเลเวลร้านและรายรับย้อนหลัง 3 เดือน ถ้าเงินติดลบจะกู้เพิ่มไม่ได้</p></div>
 <div class="card"><h3>เงินฝาก</h3><table class="ledger"><tbody><tr><td>ยอดฝาก</td><td>${fmt(b.dep)}</td></tr><tr><td>ดอกเบี้ยสิ้นเดือนนี้</td><td>${fmt(b.dep*DEP_APR/1200)}</td></tr></tbody></table>
  <div class="row">${amts.map(n=>btn('dep',n,'ฝาก '+fmt(n),S.money>=n)).join('')}${btn('dep',Math.max(0,S.money),'ฝากทั้งหมด',S.money>0)}</div>
  <div class="row">${amts.map(n=>btn('wd',n,'ถอน '+fmt(n),b.dep>=n)).join('')}${btn('wd',b.dep,'ถอนทั้งหมด',b.dep>0)}</div></div></div>`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;
 m.querySelectorAll('[data-b]').forEach(x=>x.onclick=()=>{const n=+x.dataset.n,a=x.dataset.b;
  if(a==='loan'){b.loan+=n;capIn(n);}if(a==='repay'){b.loan=Math.max(0,b.loan-n);capOut(n);}if(a==='dep'){b.dep+=n;capOut(n);}if(a==='wd'){b.dep=Math.max(0,b.dep-n);capIn(n);}
  softPlay('coin');saveGame(true);bankDialog();renderRail();});}

const IPO_FEE=100000,IPO_LV=5,ST_SHARES=10000,ST_FLOAT=.1,ST_TRADE_FEE=.0025;
const ST_BOTS=[{n:'คุณป้าหุ้นปันผล',v:1.2,m:0,r:.2},{n:'กองทุนสายตาไทย',v:1.6,m:.2,r:.15},{n:'เซียนหุ้นคุณค่า',v:2.4,m:-.3,r:.2},{n:'เทรดเดอร์ซิ่ง',v:.2,m:3,r:.7},{n:'นักลงทุนรายย่อย',v:.5,m:1,r:.9}];
function monthlyOp(){const h=S.history.slice(-3);if(h.length)return h.reduce((a,x)=>a+x.profit+(x.l&&x.l.ipo||0),0)/h.length;
 const fixed=rentFee()+utilFee()+salaryFee();const d=S.daily.reduce((a,x)=>a+x.p,0);return S.daily.length?d/S.daily.length*MONTH_DAYS-fixed:0;}
function fairPrice(){const st=S.stock;const eq=S.money+S.bank.dep-S.bank.loan-(st?st.netCash:0);const assets=Object.keys(S.owned).reduce((a,k)=>a+((SHOPBY[k]&&SHOPBY[k].price)||0)*.5,0);
 return Math.max(1,(Math.max(0,eq)*.6+assets+Math.max(-eq*.5,monthlyOp()*8)+S.rep*20000+30000)/ST_SHARES);}
function stockTick(dt){const st=S.stock;if(!st||!st.listed)return;st.t=(st.t||0)+dt;if(st.t<4)return;st.t=0;const fair=fairPrice(),mom=st.hist.length>4?(st.price/st.hist[st.hist.length-4]-1):0;let net=0;
 ST_BOTS.forEach(b=>{if(Math.random()>b.r)return;const sig=b.v*(fair/st.price-1)+b.m*mom+rnd(-.05,.05);const q=Math.round(clamp(Math.abs(sig)*160,0,120)*rnd(.5,1));if(q<5)return;
  const hold=st.bots[b.n]||0;if(sig>0){const take=Math.min(q,st.pool);st.bots[b.n]=hold+take;st.pool-=take;net+=q;if(take)stFeed(`${b.n} ซื้อ ${take} หุ้น`,1);else net+=0;}
  else{const s=Math.min(q,hold);if(!s)return;st.bots[b.n]=hold-s;st.pool+=s;net-=s;stFeed(`${b.n} ขาย ${s} หุ้น`,0);}});
 st.price=Math.max(1,st.price*(1+net/ST_SHARES*1.2+rnd(-.004,.004))+(fair-st.price)*.04);st.hist.push(st.price);if(st.hist.length>60)st.hist.shift();}
function stFeed(t,up){const f=S.stock.feed;f.unshift({t,up});if(f.length>7)f.pop();}
function stockTrade(sell,q){const st=S.stock;q=Math.min(q,sell?st.mine:st.pool);if(q<=0)return;const impact=q/ST_SHARES*1.5;const avg=st.price*(sell?1-impact/2:1+impact/2);const amt=avg*q;const fee=amt*ST_TRADE_FEE;
 if(sell){st.mine-=q;st.pool+=q;capIn(amt-fee);st.netCash+=amt-fee;st.price*=1-impact;stFeed(`คุณขาย ${q} หุ้น ได้ ${fmt(amt-fee)}`,0);}
 else{if(S.money<amt+fee)return;st.mine+=q;st.pool-=q;capOut(amt+fee);st.netCash-=amt+fee;st.price*=1+impact;stFeed(`คุณซื้อคืน ${q} หุ้น`,1);}
 st.price=Math.max(1,st.price);st.hist.push(st.price);softPlay('coin');saveGame(true);}
function stockDialog(){const st=S.stock;if(!st||!st.listed){const ok=S.level>=IPO_LV&&S.money>=IPO_FEE;const p=fairPrice();
  openModal(`<div class="sheethead"><h2>เปิดหุ้นร้าน</h2><button class="btn plain" data-c="1">ปิด</button></div><p>นำ${esc(S.shopName)}เข้าตลาด มีบอทนักลงทุนมาซื้อขาย ราคาหุ้นขึ้นลงตามกำไร เงินทุน ชื่อเสียง และแรงซื้อขาย</p>
  <table class="ledger"><tbody><tr><td>ค่าเปิดระบบ</td><td>${fmt(IPO_FEE)}</td></tr><tr><td>ต้องมีเลเวลร้าน</td><td>${IPO_LV} (ตอนนี้ ${S.level})</td></tr><tr><td>จำนวนหุ้น</td><td>${ST_SHARES.toLocaleString('en-US')} หุ้น</td></tr><tr><td>ราคาเปิดโดยประมาณ</td><td>${fmt(p)}</td></tr><tr><td>คุณถือ</td><td>${(ST_SHARES*(1-ST_FLOAT)).toLocaleString('en-US')} หุ้น</td></tr><tr><td>กระจายให้นักลงทุนตอนเปิด</td><td>${(ST_SHARES*ST_FLOAT).toLocaleString('en-US')} หุ้น</td></tr></tbody></table>
  <div class="row"><button class="btn gold" data-ipo="1" ${ok?'':'disabled'}>จ่าย ${fmt(IPO_FEE)} เปิดหุ้น</button></div><p class="note">หุ้นและนักลงทุนเป็นระบบจำลองในเกม ไม่ใช่การลงทุนจริง</p>`);
  const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;m.querySelector('[data-ipo]').onclick=()=>{if(S.money<IPO_FEE)return;spend('ipo',IPO_FEE);const price=fairPrice();const fl=ST_SHARES*ST_FLOAT;const bots={};ST_BOTS.forEach(b=>bots[b.n]=Math.floor(fl/ST_BOTS.length));S.stock={listed:true,price,mine:ST_SHARES-fl,pool:0,bots,netCash:0,hist:[price],feed:[],t:0};S.stock.pool=fl-Object.values(bots).reduce((a,x)=>a+x,0);toast(`หักค่าเปิดหุ้น ${fmt(IPO_FEE)} แล้ว`);softPlay('buy');log(`${S.shopName} เปิดหุ้นแล้ว`,'g');saveGame(true);stockDialog();renderRail();};return;}
 const fair=fairPrice(),val=st.mine*st.price;const first=st.hist[0];
 openModal(`<div class="sheethead"><h2>หุ้น${esc(S.shopName)}</h2><span class="price">${fmt(S.money)}</span><button class="btn plain" data-c="1">ปิด</button></div>
 <div class="monthhead"><div><small>ราคาหุ้น</small><b>${fmt(st.price)}</b></div><div><small>มูลค่าตามธุรกิจ</small><b>${fmt(fair)}</b></div><div><small>คุณถือ</small><b>${st.mine.toLocaleString('en-US')}</b></div><div><small>มูลค่าหุ้นของคุณ</small><b>${fmt(val)}</b></div></div>
 ${lineChart(st.hist.map((_,i)=>String(i+1)),[{name:'ราคาหุ้น',values:st.hist.map(x=>+x.toFixed(2))}],'ราคาหุ้น')}
 <div class="two"><div><h3>ถอนเป็นเงิน / ซื้อคืน</h3><div class="row">${[100,500,1000].map(q=>`<button class="btn green" data-sell="${q}" ${st.mine>=q?'':'disabled'}>ขาย ${q}</button>`).join('')}<button class="btn green" data-sell="${st.mine}" ${st.mine?'':'disabled'}>ขายทั้งหมด</button></div>
  <div class="row">${[100,500].map(q=>`<button class="btn" data-buy="${q}" ${st.pool>=q&&S.money>=q*st.price*1.1?'':'disabled'}>ซื้อคืน ${q}</button>`).join('')}<span class="note">หุ้นในตลาด ${st.pool.toLocaleString('en-US')}</span></div>
  <p class="note">ยิ่งขายทีละมาก ราคายิ่งร่วง ค่าธรรมเนียม 0.25% · เงินจากหุ้นไม่นับเป็นกำไรร้าน · ระบบจำลองในเกม ไม่ใช่การลงทุนจริง</p></div>
 <div><h3>นักลงทุนบอท</h3><div class="feed">${st.feed.map(f=>`<div class="${f.up?'g':'r'}">${esc(f.t)}</div>`).join('')||'<span class="mini">รอการซื้อขาย</span>'}</div></div></div>`,{wide:true});
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;wireCharts();
 m.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{stockTrade(true,+b.dataset.sell);stockDialog();renderRail();});
 m.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{stockTrade(false,+b.dataset.buy);stockDialog();renderRail();});}

/* ===== ตั้งค่าเริ่มเกม ตั้งชื่อตอนจ้าง ===== */
function cleanName(v,max){return String(v).replace(/[<>&"']/g,'').trim().slice(0,max);}
function setupDialog(){let g=S.owner.gender;const draw=()=>{const nm=$('#suOwner')?$('#suOwner').value:S.owner.name,sh=$('#suShop')?$('#suShop').value:S.shopName;
 openModal(`<div class="sheethead"><h2>สร้างร้านของคุณ</h2></div><div class="row gpick">${[['m','od1f','ชาย'],['f','od2f','หญิง']].map(x=>`<button type="button" class="item col ${g===x[0]?'owned':''}" data-g="${x[0]}">${sprHTML(x[1],110)}<b>เจ้าของร้าน${x[2]}</b></button>`).join('')}</div>
 <form id="suForm" class="suform"><label for="suOwner">ชื่อเจ้าของร้าน</label><input id="suOwner" class="nameinput" maxlength="20" autocomplete="off"><label for="suShop">ชื่อร้าน</label><input id="suShop" class="nameinput" maxlength="24" autocomplete="off"><button class="btn gold">เริ่มเกม</button></form>`,{lock:true});
 $('#suOwner').value=nm;$('#suShop').value=sh;$('#modal').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{g=b.dataset.g;draw();});
 $('#suForm').onsubmit=e=>{e.preventDefault();S.owner={gender:g,name:cleanName($('#suOwner').value,20)||'เจ้าของร้าน'};S.shopName=cleanName($('#suShop').value,24)||'Social Eyewear';saveGame(true);closeModal();welcome();renderRail();};};draw();}
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
function watchdog(dt){wdT+=dt;if(wdT<2)return;wdT=0;const p=G.player,mine=new Set();[p.task,...p.tasks].forEach(t=>{if(t&&t.c)mine.add(t.c);if(t&&t.j)mine.add(t.j);});
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
function fillAll(){const plan=fillPlan();let n=0,c=0,short=false;plan.forEach(x=>{const q=Math.min(x.need,Math.floor(Math.max(0,S.money)/x.unit));if(q<x.need)short=true;if(q<=0)return;spend(x.led,q*x.unit);x.add(q);n+=q;c+=q*x.unit;});
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

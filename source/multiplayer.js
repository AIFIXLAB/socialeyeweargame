/* ===== เล่นกับเพื่อน: ต่างคนต่างขาย แข่งเป้าเดียวกัน โยนการ์ดโจมตีกันได้ ===== */
const MP_MAX=5,YEAR_DAYS=120,MP_WAIT_END=600;
const net={ /* รับส่งผ่าน Vercel หรือฐานข้อมูลของการ์ด */
 async create(c,meta){if(cloud.kind==='db'){const r=cloud.db.doc('rooms/'+c),d=await r.get();if(d.exists)return false;await this.wipe(c);await r.set(meta);return true;}const x=await(await this.post({a:'create',code:c,meta})).json();return !!x.ok;},
 async wipe(c){const r=cloud.db.doc('rooms/'+c);for(const n of ['players','events']){const q=await r.collection(n).get();for(const d of q.docs)await r.collection(n).doc(d.id).delete();}},
 async close(c){if(cloud.kind==='db'){await this.wipe(c);return cloud.db.doc('rooms/'+c).delete();}const x=await this.post({a:'close',code:c});if(!x.ok)throw new Error('http');},
 post(b){return fetch('/api/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),signal:AbortSignal.timeout(8000)});},
 async get(c){if(cloud.kind==='db'){const r=cloud.db.doc('rooms/'+c),m=await r.get();const ps=await r.collection('players').get(),es=await r.collection('events').orderBy('at').limit(1000).get();const players={};ps.docs.forEach(d=>players[d.id]=d.data());return{meta:m.exists?m.data():null,players,events:es.docs.map(d=>d.data())};}const x=await fetch('/api/room?code='+c,{signal:AbortSignal.timeout(8000)});if(!x.ok)throw new Error('http');return x.json();},
 async meta(c,meta){if(cloud.kind==='db')return cloud.db.doc('rooms/'+c).set(meta);return this.post({a:'meta',code:c,meta});},
 async player(c,id,data){if(cloud.kind==='db')return cloud.db.doc('rooms/'+c).collection('players').doc(id).set(data);return this.post({a:'player',code:c,id,data});},
 async event(c,e){e.at=Date.now();e.id=Math.random().toString(36).slice(2,10);if(cloud.kind==='db')return cloud.db.doc('rooms/'+c).collection('events').doc(e.id).set(e);return this.post({a:'event',code:c,event:e});}
};
function mpReady(){return cloud.kind==='api'||cloud.kind==='db';}
function mpIdKey(c){return 'socialeyewear.mp.'+c;}
function mpMyId(c){let i=store.get(mpIdKey(c));if(!i){i=Math.random().toString(36).slice(2,10).replace(/[^a-z0-9]/g,'x').padEnd(6,'x');store.set(mpIdKey(c),i);}return i;}
function ruleText(r){return r.type==='years'?`เล่นครบ ${r.years} ปี ใครเงินมากสุดชนะ`:`ใครมีเงินถึง ${fmt(r.goal)} ก่อนชนะ`;}

/* ---------- เมนูและห้อง ---------- */
async function mpMenu(){await cloud.init();
 if(!mpReady()){openModal(`<div class="sheethead"><h2>โหมด VS</h2><button class="btn plain" data-c="1">ปิด</button></div><p>โหมดนี้ต้องต่อฐานข้อมูลก่อน ทุกเครื่องจึงจะคุยกันได้ ทำครั้งเดียวบน Vercel:</p><table class="ledger"><tbody><tr><td>1. เปิดโปรเจกต์ แล้วไปที่แท็บ Storage</td><td></td></tr><tr><td>2. สร้าง Redis ของ Upstash และเชื่อมกับโปรเจกต์นี้</td><td></td></tr><tr><td>3. กด Redeploy แล้วเปิดเกมใหม่</td><td></td></tr></tbody></table>`);$('#modal [data-c]').onclick=closeModal;return;}
 openModal(`<div class="sheethead"><h2>โหมด VS</h2><button class="btn plain" data-c="1">ปิด</button></div><p>2-5 คน ต่างคนต่างขายที่หน้าจอตัวเอง แข่งเป้าหมายเดียวกัน ทุกคนจั่วการ์ด 1 ใบเมื่อจบเดือน ถือได้ 3 ใบ</p><div class="evchoices"><button class="btn gold" data-host="1">ตั้งห้อง</button><button class="btn green" data-join="1">เข้าห้องด้วยรหัส</button></div>`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;m.querySelector('[data-host]').onclick=()=>mpForm(true);m.querySelector('[data-join]').onclick=()=>mpForm(false);}
function mpForm(host){let g='m',rule={type:'years',years:1},dayLen=60,max=3;const lastN=store.get('socialeyewear.mp.name')||'';
 openModal(`<div class="sheethead"><h2>${host?'ตั้งห้อง':'เข้าห้อง'}</h2><button class="btn plain" data-c="1">กลับ</button></div>
 <div class="row gpick">${[['m','od1f','ชาย'],['f','od2f','หญิง']].map(x=>`<button type="button" class="item col ${g===x[0]?'owned':''}" data-g="${x[0]}">${sprHTML(x[1],76)}<b>${x[2]}</b></button>`).join('')}</div>
 <form id="mpF" class="suform"><label for="mpCode">รหัสห้อง 4 หลัก</label><input id="mpCode" class="nameinput" inputmode="numeric" maxlength="4" autocomplete="off" value="${host?String(1000+Math.floor(Math.random()*9000)):''}">
 <label for="mpOwner">ชื่อคุณ</label><input id="mpOwner" class="nameinput" maxlength="20" autocomplete="off" value="${esc(lastN)}"><label for="mpShop">ชื่อร้าน</label><input id="mpShop" class="nameinput" maxlength="24" autocomplete="off">
 ${host?`<label>จำนวนผู้เล่นสูงสุด</label><div class="row">${[2,3,4,5].map(n=>`<button type="button" class="tab" data-mx="${n}">${n} คน</button>`).join('')}</div><label>เงื่อนไขชนะ: เล่นครบกี่ปี</label><div class="row">${[1,3,5].map(y=>`<button type="button" class="tab" data-yr="${y}">${y} ปี</button>`).join('')}</div>
 <label>หรือ ใครมีเงินถึงก่อน</label><div class="row">${[1000000,5000000,10000000,50000000].map(n=>`<button type="button" class="tab" data-gl="${n}">${fmt(n)}</button>`).join('')}</div>
 <label>ความยาว 1 วันในเกม</label><div class="row">${[30,60,90,150].map(n=>`<button type="button" class="tab" data-dl="${n}">${n} วินาที</button>`).join('')}</div><p class="note" id="mpEst"></p>`:''}
 <p class="err" id="mpErr" role="alert"></p><button class="btn gold">${host?'สร้างห้อง':'เข้าห้อง'}</button></form>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-c]').onclick=mpMenu;
 m.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{g=b.dataset.g;m.querySelectorAll('[data-g]').forEach(x=>x.classList.toggle('owned',x===b));});
 const paint=()=>{m.querySelectorAll('[data-mx]').forEach(x=>x.classList.toggle('on',+x.dataset.mx===max));m.querySelectorAll('[data-yr]').forEach(x=>x.classList.toggle('on',rule.type==='years'&&+x.dataset.yr===rule.years));m.querySelectorAll('[data-gl]').forEach(x=>x.classList.toggle('on',rule.type==='money'&&+x.dataset.gl===rule.goal));m.querySelectorAll('[data-dl]').forEach(x=>x.classList.toggle('on',+x.dataset.dl===dayLen));const e=$('#mpEst');if(e)e.textContent=rule.type==='years'?`เวลาเล่นรวมประมาณ ${(rule.years*YEAR_DAYS*dayLen/3600).toFixed(1)} ชั่วโมง ออกแล้วกลับมาเล่นต่อได้ · ค่าเช่าและเงินเดือนปรับตามความยาววัน`:'ค่าเช่าและเงินเดือนปรับตามความยาววัน';};
 if(host){m.querySelectorAll('[data-mx]').forEach(b=>b.onclick=()=>{max=+b.dataset.mx;paint();});m.querySelectorAll('[data-yr]').forEach(b=>b.onclick=()=>{rule={type:'years',years:+b.dataset.yr};paint();});m.querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>{rule={type:'money',goal:+b.dataset.gl};paint();});m.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>{dayLen=+b.dataset.dl;paint();});paint();}
 $('#mpF').onsubmit=async e=>{e.preventDefault();const err=$('#mpErr'),code=$('#mpCode').value.trim();if(!/^\d{4}$/.test(code)){err.textContent='ใส่รหัสตัวเลข 4 หลัก';return;}
  const me={name:cleanName($('#mpOwner').value,20)||'ผู้เล่น',shop:cleanName($('#mpShop').value,24)||'ร้านของ '+(cleanName($('#mpOwner').value,20)||'ผู้เล่น'),gender:g};store.set('socialeyewear.mp.name',me.name);err.textContent='กำลังเชื่อมต่อ…';
  try{const id=mpMyId(code);
   if(host){const ok=await net.create(code,{code,host:id,rule,dayLen,max,status:'lobby'});if(!ok){err.textContent=`รหัส ${code} มีคนใช้แล้ว เปลี่ยนรหัสใหม่`;return;}}
   const st=await net.get(code);if(!st.meta){err.textContent=`ไม่พบห้องรหัส ${code}`;return;}
   const inRoom=!!st.players[id];
   if(st.meta.status!=='lobby'&&!inRoom){err.textContent='ห้องนี้เริ่มเล่นไปแล้ว';return;}
   if(!inRoom&&Object.keys(st.players).length>=(st.meta.max||MP_MAX)){err.textContent=`ห้องเต็ม ${st.meta.max||MP_MAX} คนแล้ว`;return;}
   if(st.meta.status==='playing'&&inRoom){return mpEnter(st,code,id,st.players[id]);}
   await net.player(code,id,Object.assign(me,{net:15000,day:1,level:1,rep:3,seen:Date.now()}));lobby(code,id,me);
  }catch(x){err.textContent='เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง';}};}
let lobbyT=0;
function lobby(code,id,me){clearInterval(lobbyT);const tick=async()=>{let st;try{st=await net.get(code);}catch(e){return;}if(!st.meta){clearInterval(lobbyT);closeModal();toast('ห้องนี้ถูกปิดแล้ว');return;}
  if(st.meta.status==='playing'){clearInterval(lobbyT);return mpEnter(st,code,id,me);}
  const ps=Object.entries(st.players),host=st.meta.host===id;
  openModal(`<div class="sheethead"><h2>ห้อง ${code}</h2></div><div class="monthhead"><div><small>บอกรหัสนี้ให้เพื่อน</small><b>${code}</b></div><div><small>กติกา</small><b class="rl">${ruleText(st.meta.rule)}</b></div></div>
  <h3>ผู้เล่น ${ps.length}/${st.meta.max||MP_MAX}</h3><table class="ledger"><tbody>${ps.map(([k,p])=>`<tr class="${k===id?'hl':''}"><td>${esc(p.name)}${k===st.meta.host?' (เจ้าของห้อง)':''}</td><td>${esc(p.shop)}</td></tr>`).join('')}</tbody></table>
  ${host?`<div class="row"><button class="btn gold" data-st="1" ${ps.length<2?'disabled':''}>เริ่มเกมพร้อมกัน</button></div>${ps.length<2?'<p class="note">รอเพื่อนเข้าห้องอย่างน้อย 1 คน</p>':''}`:'<p class="note">รอเจ้าของห้องกดเริ่มเกม</p>'}<div class="row">${host?'<button class="btn red" data-cl="1">ปิดห้อง</button>':''}<button class="btn plain" data-lv="1">ออกจากห้อง</button></div>`,{lock:true});
  const m=$('#modal');m.querySelector('[data-lv]').onclick=()=>{clearInterval(lobbyT);closeModal();};const cb=m.querySelector('[data-cl]');if(cb)cb.onclick=async()=>{clearInterval(lobbyT);try{await net.close(code);closeModal();toast('ปิดห้องแล้ว');}catch(e){toast('ปิดห้องไม่สำเร็จ ลองใหม่อีกครั้ง');lobbyT=setInterval(tick,2500);}};const sb=m.querySelector('[data-st]');if(sb)sb.onclick=async()=>{sb.disabled=true;st.meta.status='playing';st.meta.startAt=Date.now();await net.meta(code,st.meta);clearInterval(lobbyT);mpEnter(st,code,id,me);};};
 tick();lobbyT=setInterval(tick,2500);}
function mpEnter(st,code,id,me){closeModal();const sc='MP'+code;const local=store.get(KEY(sc));
 if(local){try{applySave(sc,local);}catch(e){S=null;}}
 if(!S||!S.mp||S.mp.room!==code||S.mp.startAt!==st.meta.startAt){S=fresh(sc);S.owner={gender:me.gender||'m',name:me.name||'ผู้เล่น'};S.shopName=me.shop||'ร้านของฉัน';S.mp={room:code,id,rule:st.meta.rule,dayLen:st.meta.dayLen||60,ev:0,hand:[],startAt:st.meta.startAt};S.mpDays={};}
 startPlay(true);mpBanner(ruleText(S.mp.rule));mpStartPoll();}

/* ---------- สำรับ VS: เพิ่มการ์ดใหม่ที่ตารางนี้ ---------- */
const EXAM_KEYS=['auto','phoro','slit','fundus','oct'],LAB_KEYS=['edger','lmeter','ultra','uv'];
function fxAdd(k,sec){G.mpT=G.mpT||{};G.mpT[k]=Math.max(G.mpT[k]||0,sec);}
function mpMul(k){const on=G&&G.mpT&&G.mpT[k]>0;if(k==='spawn')return on?1.6:1;if(k==='exam'||k==='lab')return on||(G&&G.mpT&&G.mpT.power>0)?1.5:1;return 1;}
function priceBan(){return S&&S.mpDays&&S.mpDays.ban>0?.5:1;}
function breakFrom(keys){const a=keys.filter(own);if(!a.length)return'แต่ร้านยังไม่มีเครื่องให้ทำลาย';const k=pick(a);delete S.owned[k];return `${SHOPBY[k].name} พังหายไป`;}
function loseStaff(){if(!S.staff.length)return'แต่ร้านยังไม่มีพนักงาน';const k=pick(S.staff),n=staffNameOf(k);S.staff=S.staff.filter(x=>x!==k);const w=G.workers.find(x=>x.key===k);if(w&&w.task){if(w.task.c)w.task.c.owner=null;if(w.task.j)w.task.j.owner=null;}G.workers=G.workers.filter(x=>x.key!==k);return `${n} ลาออกไป`;}
const fxRep=n=>()=>{S.rep=clamp(S.rep-n,1,5);return `ชื่อเสียงลด ${n}`;};
const fxCash=n=>()=>{spend('incident',n);return `เสียเงิน ${fmt(n)}`;};
const fxPct=(p,cap)=>()=>{const n=Math.round(clamp(S.money*p,0,cap));if(n)spend('incident',n);return `เสียเงิน ${fmt(n)}`;};
const fxSteal=(p,cap)=>e=>{const n=Math.round(clamp(S.money*p,0,cap));if(n){spend('incident',n);mpSend({type:'_pay',to:e.from,amt:n});}return `ถูกขโมย ${fmt(n)}`;};
const halfFrames=()=>{Object.keys(S.frames).forEach(k=>{S.frames[k]=Math.floor(frameStock(k)/2);});},halfLens=()=>{Object.values(S.lens).forEach(l=>{l.stock=Math.floor(l.stock/2);});},halfCt=()=>{Object.keys(S.ct).forEach(k=>{S.ct[k]=Math.floor(S.ct[k]/2);});};
const fxCust=n=>()=>{G.forceQ=Array(n).fill('c11');G.extra=n;G.spawn=.5;return `ลูกค้าใจร้อน ${n} คนกำลังมา`;};
const ATK={
 rumor:{n:'รีวิวปลอม',c:'rep',d:'ชื่อเสียง -0.4',run:fxRep(.4)},
 fakelens:{n:'ข่าวลือเลนส์ปลอม',c:'rep',d:'ชื่อเสียง -0.6',run:fxRep(.6)},
 drama:{n:'ดราม่าโซเชียล',c:'rep',d:'ชื่อเสียง -0.8',run:fxRep(.8)},
 expose:{n:'เพจดังแฉร้าน',c:'rep',d:'ชื่อเสียง -0.5 ลูกค้าน้อยลง 60 วินาที',run:()=>{S.rep=clamp(S.rep-.5,1,5);fxAdd('spawn',60);return'ชื่อเสียงลดและลูกค้าน้อยลง';}},
 leak:{n:'ท่อน้ำแตก',c:'cash',d:'เสียเงิน ฿20,000',run:fxCash(20000)},
 tax:{n:'แจ้งตรวจภาษี',c:'cash',d:'เสีย 8% ของเงินสด สูงสุด ฿100,000',run:fxPct(.08,100000)},
 fine:{n:'ค่าปรับเทศบาล',c:'cash',d:'เสียเงิน ฿15,000',run:fxCash(15000)},
 spy:{n:'จารกรรมบัญชี',c:'cash',d:'ขโมยเงินสด 5% สูงสุด ฿50,000 มาเป็นของเรา',run:fxSteal(.05,50000)},
 bill:{n:'ค่าไฟพุ่ง',c:'cash',d:'เสียเงิน ฿30,000',run:fxCash(30000)},
 sue:{n:'ฟ้องร้อง',c:'cash',d:'เสีย 12% ของเงินสด สูงสุด ฿150,000',run:fxPct(.12,150000)},
 scam:{n:'แก๊งหลอกโอนเงิน',c:'cash',d:'ขโมยเงินสด 8% สูงสุด ฿80,000 มาเป็นของเรา',run:fxSteal(.08,80000)},
 thief:{n:'ขโมยกรอบ',c:'stock',d:'สต็อกกรอบหายครึ่งหนึ่ง',run:()=>{halfFrames();return'กรอบหายครึ่งหนึ่ง';}},
 badlot:{n:'เลนส์ล็อตเสีย',c:'stock',d:'สต็อกเลนส์หายครึ่งหนึ่ง',run:()=>{halfLens();return'เลนส์เสียครึ่งหนึ่ง';}},
 supply:{n:'ตัดซัพพลาย',c:'stock',d:'ของที่สั่งมาช้า 3 เท่า 3 วัน',run:()=>{S.mpDays.slow=3;return'ของมาช้า 3 เท่า 3 วัน';}},
 termite:{n:'ปลวกกินชั้นกรอบ',c:'stock',d:'กรอบหายครึ่งหนึ่ง และเสียเงิน ฿5,000',run:()=>{halfFrames();spend('incident',5000);return'กรอบหายและเสียค่าซ่อม';}},
 expired:{n:'คอนแทคหมดอายุ',c:'stock',d:'สต็อกคอนแทคหายครึ่งหนึ่ง',run:()=>{halfCt();return'คอนแทคหายครึ่งหนึ่ง';}},
 fire:{n:'ไฟไหม้โกดัง',c:'stock',d:'กรอบ เลนส์ และคอนแทคหายครึ่งหนึ่ง',run:()=>{halfFrames();halfLens();halfCt();return'สต็อกหายครึ่งหนึ่งทุกอย่าง';}},
 breakOne:{n:'ทำลายเครื่องวัดตา',c:'machine',d:'เครื่องวัดตา 1 เครื่องพัง',run:()=>breakFrom(EXAM_KEYS)},
 breakAll:{n:'ทำลายเครื่องทุกร้าน',c:'machine',all:1,d:'คู่แข่งทุกร้านเสียเครื่องวัดตาร้านละ 1 เครื่อง',run:()=>breakFrom(EXAM_KEYS)},
 virus:{n:'ไวรัสคอมพิวเตอร์',c:'machine',d:'งานช้าลง 120 วินาที',run:()=>{fxAdd('power',120);return'งานช้าลง 120 วินาที';}},
 breakLab:{n:'ทำลายเครื่องช่าง',c:'machine',d:'เครื่องในห้องช่าง 1 เครื่องพัง',run:()=>breakFrom(LAB_KEYS)},
 poach:{n:'ซื้อตัวพนักงาน',c:'staff',d:'พนักงาน 1 คนลาออก',run:()=>loseStaff()},
 strike:{n:'ยุพนักงานประท้วง',c:'staff',d:'พนักงานหยุดงาน 45 วินาที',run:()=>{fxAdd('strike',45);return'พนักงานหยุดงาน 45 วินาที';}},
 flu:{n:'ไข้หวัดระบาด',c:'staff',d:'พนักงานหยุดงาน 90 วินาที',run:()=>{fxAdd('strike',90);return'พนักงานหยุดงาน 90 วินาที';}},
 promo:{n:'ลดราคาแย่งลูกค้า',c:'traffic',d:'ลูกค้าเข้าน้อยลง 90 วินาที',run:()=>{fxAdd('spawn',90);return'ลูกค้าน้อยลง 90 วินาที';}},
 road:{n:'ปิดถนนหน้าร้าน',c:'traffic',d:'ลูกค้าเข้าน้อยลง 150 วินาที',run:()=>{fxAdd('spawn',150);return'ลูกค้าน้อยลง 150 วินาที';}},
 grumpy:{n:'ส่งลูกค้าใจร้อน',c:'traffic',d:'ลูกค้าใจร้อนบุก 3 คน',run:fxCust(3)},
 karen:{n:'ฝูงลูกค้าเจ้าปัญหา',c:'traffic',d:'ลูกค้าใจร้อนบุก 5 คน',run:fxCust(5)},
 ban:{n:'แช่แข็งกำไร',c:'law',d:'ขายได้ครึ่งราคา 10 วัน',run:()=>{S.mpDays.ban=10;return'ขายได้ครึ่งราคา 10 วัน';}},
 close:{n:'สั่งปิดร้าน',c:'law',d:'ร้านปิด 2 วันนับจากวันถัดไป',run:()=>{S.closed=(S.closed||0)+2;return'ร้านจะปิด 2 วัน';}}
};
/* m = หมวดหรือรหัสการ์ดโจมตีที่กันได้ · fx: block กัน, reflect สะท้อน, counter กันและปรับคนโยน, cash กันและได้เงิน, rep กันและได้ชื่อเสียง */
const DEF={
 lawyer:{n:'ทนายเพจ',m:['rep'],fx:'block',d:'กันการโจมตีชื่อเสียง'},
 pr:{n:'ทีมประชาสัมพันธ์',m:['rep'],fx:'reflect',d:'สะท้อนการโจมตีชื่อเสียงกลับ'},
 realrev:{n:'รีวิวจากลูกค้าจริง',m:['rep'],fx:'rep',v:.2,d:'กันการโจมตีชื่อเสียง และชื่อเสียง +0.2'},
 reporter:{n:'นักข่าวคนสนิท',m:['rumor','fakelens','expose'],fx:'cash',v:10000,d:'กันข่าวปลอม และได้ ฿10,000'},
 insure:{n:'ประกันธุรกิจ',m:['cash'],fx:'block',d:'กันการเสียเงินทุกแบบ'},
 account:{n:'นักบัญชีมือโปร',m:['tax','fine','bill'],fx:'cash',v:5000,d:'กันภาษี ค่าปรับ ค่าไฟ และได้ ฿5,000'},
 safe:{n:'ตู้เซฟดิจิทัล',m:['spy','scam'],fx:'block',d:'กันการขโมยเงิน'},
 sueback:{n:'ฟ้องกลับ',m:['sue','tax','fine'],fx:'counter',v:30000,d:'กันการฟ้องและภาษี คนโยนเสีย ฿30,000'},
 plumber:{n:'ช่างประจำตึก',m:['leak','termite'],fx:'block',d:'กันท่อน้ำแตกและปลวก'},
 cctv:{n:'กล้องวงจรปิด',m:['thief','breakOne','breakLab'],fx:'block',d:'กันขโมยกรอบและการทำลายเครื่อง'},
 stockins:{n:'ประกันสินค้า',m:['stock'],fx:'block',d:'กันการโจมตีสต็อกทุกแบบ'},
 backup:{n:'ซัพพลายเออร์สำรอง',m:['supply'],fx:'cash',v:8000,d:'กันการตัดซัพพลาย และได้ ฿8,000'},
 qc:{n:'ทีมตรวจคุณภาพ',m:['badlot','expired'],fx:'block',d:'กันเลนส์เสียและคอนแทคหมดอายุ'},
 sprinkler:{n:'ระบบดับเพลิง',m:['fire','termite'],fx:'block',d:'กันไฟไหม้โกดังและปลวก'},
 maint:{n:'ประกันเครื่องมือ',m:['machine'],fx:'block',d:'กันการโจมตีเครื่องมือทุกแบบ'},
 antivirus:{n:'แอนตี้ไวรัส',m:['virus'],fx:'reflect',d:'สะท้อนไวรัสกลับ'},
 guard:{n:'รปภ. 24 ชั่วโมง',m:['breakOne','breakAll','breakLab','thief'],fx:'counter',v:20000,d:'กันการทำลายและขโมย คนโยนเสีย ฿20,000'},
 contract:{n:'สัญญาจ้างผูกมัด',m:['poach'],fx:'cash',v:15000,d:'กันการซื้อตัว และได้ค่าปรับ ฿15,000'},
 welfare:{n:'สวัสดิการดีเยี่ยม',m:['staff'],fx:'block',d:'กันการโจมตีพนักงานทุกแบบ'},
 vaccine:{n:'วัคซีนทั้งร้าน',m:['flu'],fx:'block',d:'กันไข้หวัดระบาด'},
 union:{n:'หัวหน้าทีมคนเก่ง',m:['strike','poach'],fx:'reflect',d:'สะท้อนการประท้วงและการซื้อตัวกลับ'},
 booking:{n:'แอปจองคิว',m:['grumpy','karen'],fx:'block',d:'กันลูกค้าใจร้อนบุก'},
 adfight:{n:'โฆษณาสู้กลับ',m:['promo','road'],fx:'block',d:'กันการแย่งลูกค้าและปิดถนน'},
 loyal:{n:'ฐานลูกค้าประจำ',m:['traffic'],fx:'block',d:'กันการโจมตีลูกค้าทุกแบบ'},
 pricewar:{n:'โปรแรงสวนกลับ',m:['promo'],fx:'reflect',d:'สะท้อนการลดราคากลับ'},
 corplaw:{n:'ทนายบริษัท',m:['law'],fx:'block',d:'กันแช่แข็งกำไรและสั่งปิดร้าน'},
 license:{n:'ใบอนุญาตครบ',m:['close','fine','tax'],fx:'rep',v:.1,d:'กันสั่งปิด ค่าปรับ ภาษี และชื่อเสียง +0.1'},
 connect:{n:'เส้นสายผู้ใหญ่',m:['ban','close'],fx:'reflect',d:'สะท้อนแช่แข็งกำไรและสั่งปิดร้านกลับ'},
 shield:{n:'โล่เหล็ก',m:['*'],fx:'block',d:'กันการโจมตีครั้งถัดไปได้ทุกแบบ'},
 mirror:{n:'กระจกวิเศษ',m:['*'],fx:'reflect',d:'สะท้อนการโจมตีครั้งถัดไปได้ทุกแบบ'}
};
const HAND_MAX=3;
function mpSend(e){e.from=S.mp.id;e.fromName=S.shopName;return net.event(S.mp.room,e).catch(()=>{toast('ส่งการ์ดไม่สำเร็จ');});}
function hand(){return S.mp.hand||(S.mp.hand=[]);}
function cardOf(k){return ATK[k]||DEF[k];}
function cardHTML(k,attr){const c=cardOf(k),a=!!ATK[k];return `<${attr?'button':'div'} class="vcard ${a?'atk':'dfn'}" ${attr||''}><small>${a?'โจมตี':'ป้องกันอัตโนมัติ'}</small><b>${c.n}</b><span>${c.d}</span></${attr?'button':'div'}>`;}
function vsPick(){const a=Object.keys(ATK),d=Object.keys(DEF);return pick(Math.random()<.5?a:d);}
function vsDraw(then){const k=vsPick(),h=hand();softPlay('buy');
 if(h.length<HAND_MAX){h.push(k);saveGame(true);openModal(`<div class="sheethead"><h2>จั่วการ์ดสิ้นเดือน</h2></div><div class="cards">${cardHTML(k)}</div><p class="note">ในมือ ${h.length}/${HAND_MAX} ใบ</p><div class="row"><button class="btn gold" data-d="1">เก็บไว้</button></div>`,{lock:true});$('#modal [data-d]').onclick=()=>{closeModal();renderRail();then();};return;}
 openModal(`<div class="sheethead"><h2>มือเต็ม ${HAND_MAX} ใบ</h2></div><p>การ์ดใหม่:</p><div class="cards">${cardHTML(k)}</div><p>เลือกใบที่จะทิ้งเพื่อรับการ์ดใหม่ หรือไม่รับ</p><div class="cards">${h.map((x,i)=>cardHTML(x,`data-rp="${i}"`)).join('')}</div><div class="row"><button class="btn plain" data-d="1">ไม่รับการ์ดใหม่</button></div>`,{lock:true,wide:true});
 const m=$('#modal');m.querySelectorAll('[data-rp]').forEach(b=>b.onclick=()=>{h[+b.dataset.rp]=k;saveGame(true);closeModal();renderRail();then();});m.querySelector('[data-d]').onclick=()=>{closeModal();then();};}
let mpAtkTo=null;
function attackDialog(){const others=Object.entries(mpLast.players||{}).filter(([k])=>k!==S.mp.id);if(!others.some(x=>x[0]===mpAtkTo))mpAtkTo=others[0]&&others[0][0];const h=hand();
 openModal(`<div class="sheethead"><h2>การ์ดในมือ ${h.length}/${HAND_MAX}</h2><button class="btn plain" data-c="1">ปิด</button></div>
 <h3>เลือกร้านเป้าหมาย</h3><div class="tabs">${others.map(([k,p])=>`<button class="tab ${k===mpAtkTo?'on':''}" data-to="${k}">${esc(p.shop)} · ${fmt(p.net)}</button>`).join('')||'<span class="mini">รอข้อมูลคู่แข่ง</span>'}</div>
 <div class="cards">${h.map((k,i)=>ATK[k]?cardHTML(k,`data-play="${i}" ${mpAtkTo?'':'disabled'}`):cardHTML(k)).join('')||'<p class="mini">ยังไม่มีการ์ด ทุกคนจั่วได้ 1 ใบเมื่อจบเดือน</p>'}</div>
 <p class="note">กดการ์ดโจมตีเพื่อโยนใส่ร้านที่เลือก การ์ดป้องกันทำงานเองทันทีเมื่อโดนการโจมตีที่ตรงเงื่อนไข แล้วการ์ดจะหายไป</p>`,{wide:true});
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;m.querySelectorAll('[data-to]').forEach(b=>b.onclick=()=>{mpAtkTo=b.dataset.to;attackDialog();});
 m.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{const i=+b.dataset.play,k=h[i],c=ATK[k];h.splice(i,1);mpSend({type:k,to:c.all?'*':mpAtkTo});softPlay('bad');log(`โยนการ์ด ${c.n}`,'g');saveGame(true);attackDialog();renderRail();});}
function findDef(k){const c=ATK[k];return hand().findIndex(x=>DEF[x]&&(DEF[x].m.includes('*')||DEF[x].m.includes(k)||DEF[x].m.includes(c.c)));}
function applyEvent(e){const me=S.mp.id;
 if(e.type==='_pay'){if(e.to===me){earn('reward',e.amt);mpBanner(`ขโมยสำเร็จ ได้ ${fmt(e.amt)}`);softPlay('coin');}return;}
 if(e.type==='_fine'){if(e.to===me){spend('incident',e.amt);mpBanner(`${e.fromName} ใช้ ${e.card} สวนกลับ คุณเสีย ${fmt(e.amt)}`,1);softPlay('bad');}return;}
 if(e.type==='_note'){if(e.to===me)mpBanner(e.text,e.bad);return;}
 const c=ATK[e.type];if(!c||e.from===me||!(e.to===me||e.to==='*'))return;
 let i=findDef(e.type);if(i>=0&&e.back&&DEF[hand()[i]].fx==='reflect'){i=hand().findIndex(x=>DEF[x]&&DEF[x].fx!=='reflect'&&(DEF[x].m.includes('*')||DEF[x].m.includes(e.type)||DEF[x].m.includes(c.c)));}
 if(i>=0){const dk=hand().splice(i,1)[0],d=DEF[dk];softPlay('buy');
  if(d.fx==='reflect'){mpSend({type:e.type,to:e.from,back:1});mpBanner(`${d.n} สะท้อน "${c.n}" กลับไปหา ${e.fromName}`);}
  else{if(d.fx==='cash')earn('reward',d.v);if(d.fx==='rep')S.rep=clamp(S.rep+d.v,1,5);if(d.fx==='counter')mpSend({type:'_fine',to:e.from,amt:d.v,card:d.n});else mpSend({type:'_note',to:e.from,text:`${S.shopName} ใช้ ${d.n} กัน "${c.n}" ไว้ได้`,bad:1});mpBanner(`${d.n} กัน "${c.n}" จาก ${e.fromName} ไว้ได้`);}
  log(`การ์ดป้องกันทำงาน: ${d.n}`,'g');saveGame(true);renderRail();return;}
 const t=c.run(e);mpBanner(`${e.fromName} โจมตี: ${c.n} · ${t}`,1);log(`ถูกโจมตี: ${c.n}`,'r');softPlay('bad');saveGame(true);renderRail();}
let bannerT=0;function mpBanner(t,bad){const b=$('#mpBanner');b.textContent=t;b.classList.toggle('bad',!!bad);b.hidden=false;clearTimeout(bannerT);bannerT=setTimeout(()=>b.hidden=true,5000);}

/* ---------- ซิงก์และจบเกม ---------- */
let mpTimer=0,mpLast={},mpFail=0,mpBusy=false;
function mpStartPoll(){clearInterval(mpTimer);mpPoll();mpTimer=setInterval(mpPoll,3000);}
function mpDayOver(){const r=S.mp.rule;return r.type==='years'&&S.day>r.years*YEAR_DAYS;}
async function mpPoll(){if(!S||!S.mp||!G||screen!=='play'||mpBusy)return;mpBusy=true;const sm=S.mp;try{
  const st=await net.get(sm.room);if(!S||S.mp!==sm)return;if(!st.meta){mpClosed();return;}
  await net.player(sm.room,sm.id,{name:S.owner.name,shop:S.shopName,gender:S.owner.gender,net:Math.round(netWorth()),rev:Math.round(S.stats.total),day:S.day,level:S.level,rep:+S.rep.toFixed(1),seen:Date.now(),done:sm.done||0,won:sm.won||0});
  mpLast=st;mpFail=0;
  const ev=st.events||[];while(sm.ev<ev.length){const e=ev[sm.ev++];try{applyEvent(e);}catch(x){console.error(x);}}
  if(sm.rule.type==='money'&&!sm.won&&netWorth()>=sm.rule.goal){sm.won=Date.now();saveGame(true);const me=st.players[sm.id]=Object.assign(st.players[sm.id]||{},{won:sm.won,net:Math.round(netWorth())});await net.player(sm.room,sm.id,me);}
  mpCheckEnd();renderRail();
 }catch(e){mpFail++;console.warn(e);}finally{mpBusy=false;}}
function mpFinish(){if(!S.mp.done){S.mp.done=Date.now();saveGame(true);}mpPoll();mpWait();}
function mpWait(){const ps=Object.values(mpLast.players||{});openModal(`<div class="sheethead"><h2>คุณเล่นครบแล้ว</h2></div><p>รอผู้เล่นคนอื่นจบเกม เกมจะประกาศผลเมื่อทุกคนครบ หรืออีกไม่เกิน ${MP_WAIT_END/60} นาที</p><table class="ledger"><tbody>${ps.map(p=>`<tr><td>${esc(p.shop)} · วันที่ ${p.day}</td><td>${fmt(p.net)}</td></tr>`).join('')}</tbody></table>`,{lock:true});S.mp.waiting=true;}
function mpCheckEnd(){const sm=S.mp;if(sm.over)return;const ps=Object.entries(mpLast.players||{});if(!ps.length)return;let end=false;
 if(sm.rule.type==='money')end=ps.some(([,p])=>p.won)||!!sm.won;
 else{const dn=ps.map(([,p])=>p.done).filter(Boolean);end=dn.length===ps.length||(dn.length>0&&Date.now()-Math.min(...dn)>MP_WAIT_END*1000);if(!end&&sm.waiting&&$('#modal').querySelector('h2')&&$('#modal').querySelector('h2').textContent==='คุณเล่นครบแล้ว')mpWait();}
 if(end)mpResult(ps);}
function mpClosed(){if(S.mp.over)return;mpResult(Object.entries(mpLast.players||{}),true);}
function mpResult(ps,closed){const sm=S.mp;sm.over=true;const rows=ps.map(([k,p])=>Object.assign({k},p));if(sm.rule.type==='money'&&!closed){rows.sort((a,b)=>(a.won||9e15)-(b.won||9e15)||b.net-a.net);}else rows.sort((a,b)=>b.net-a.net);
 if(!rows.some(r=>r.k===sm.id))rows.push({k:sm.id,shop:S.shopName,name:S.owner.name,net:netWorth()});const win=rows[0],iWin=win.k===sm.id;if(iWin&&!closed&&!S.won){S.won=S.day;checkTrophies();}saveGame(true);clearInterval(mpTimer);softPlay(iWin?'buy':'bad');
 openModal(`<div class="sheethead"><h2>${closed?`ห้องถูกปิด · ${iWin?'คุณ':esc(win.shop)}นำอยู่`:iWin?'คุณชนะ!':`${esc(win.shop)} ชนะ`}</h2></div><div class="say">${sprHTML('e_podium',100)}<p>${closed?'เจ้าของห้องปิดห้องก่อนจบเกม อันดับนี้ใช้ยอดล่าสุดที่แต่ละเครื่องส่งมา':ruleText(sm.rule)}</p></div><table class="ledger"><tbody><tr><td><b>อันดับ ร้าน</b></td><td><b>เงินสุทธิ · ยอดขาย</b></td></tr>${rows.map((r,i)=>`<tr class="${r.k===sm.id?'hl':''}"><td>${i+1}. ${esc(r.shop)} (${esc(r.name)})</td><td>${fmt(r.net)} · ${fmt(r.rev||0)}</td></tr>`).join('')}</tbody></table><div class="row"><button class="btn gold" data-endm="1">กลับเมนูหลัก</button></div>`,{lock:true});
 $('#modal [data-endm]').onclick=()=>{closeModal();showTitle();};}
function mpTick(dt){if(!S.mp)return;if(G.mpT)Object.keys(G.mpT).forEach(k=>{if(G.mpT[k]>0)G.mpT[k]-=dt;});}
function mpNewDay(){if(!S.mp||!S.mpDays)return;Object.keys(S.mpDays).forEach(k=>{if(S.mpDays[k]>0)S.mpDays[k]--;});}
function mpLine(){if(!S.mp)return'';const ps=Object.entries(mpLast.players||{}).sort((a,b)=>b[1].net-a[1].net);const r=S.mp.rule;return `<div class="mpbox"><b>ห้อง ${S.mp.room}</b> · ${r.type==='years'?`ปี ${Math.ceil(S.day/YEAR_DAYS)}/${r.years}`:`เป้า ${fmt(r.goal)}`}${mpFail>2?' · <span class="neg">ขาดการเชื่อมต่อ</span>':''}${ps.map(([k,p],i)=>`<div class="statrow ${k===S.mp.id?'hlm':''}"><span>${i+1}. ${esc(p.shop)}</span><span>${fmt(p.net)}</span></div>`).join('')}${S.mpDays&&S.mpDays.ban>0?`<div class="penalty">แช่แข็งกำไรอีก ${S.mpDays.ban} วัน</div>`:''}</div>`;}

function isHost(){return !!(S&&S.mp&&mpLast.meta&&mpLast.meta.host===S.mp.id);}
function closeRoomDialog(){openModal(`<div class="sheethead"><h2>ปิดห้อง ${S.mp.room}</h2></div><p>เกมของทุกคนจะจบทันทีพร้อมสรุปอันดับตอนนี้ และห้องจะถูกลบ ย้อนกลับไม่ได้</p><p class="err" id="crErr"></p><div class="row"><button class="btn red" data-cr="1">ปิดห้องเลย</button><button class="btn plain" data-c="1">ยกเลิก</button></div>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;m.querySelector('[data-cr]').onclick=async e=>{e.target.disabled=true;try{await net.close(S.mp.room);closeModal();mpClosed();}catch(x){$('#crErr').textContent='ปิดห้องไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองใหม่';e.target.disabled=false;}};}

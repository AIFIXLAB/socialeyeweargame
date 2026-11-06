/* ===== โหมด PARTY: ร้านเดียวกัน 3-5 คน เครื่องเจ้าของห้องรันเกม เครื่องอื่นต่อตรงผ่าน WebRTC ===== */
let PT=null;
const PROLE={od:'นักทัศนมาตร',sales:'พนักงานขาย',tech:'ช่าง'};
const PKEYS={od:['od1','od2','od3'],sales:['sl2','sl1','sl3'],tech:['te1','te2','te3']};
const RTC_CFG={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
function gatherDone(pc){return new Promise(r=>{if(pc.iceGatheringState==='complete')return r();const t=setTimeout(r,2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);r();}});});}
function partyReady(){return cloud.kind==='api'&&!!window.RTCPeerConnection;}
function psend(id,m){if(!PT)return;if(id===PT.id){onMsg(id,m);return;}const p=PT.peers[id];if(p&&p.dc&&p.dc.readyState==='open'&&p.dc.bufferedAmount<512000){try{p.dc.send(JSON.stringify(m));}catch(e){}}}
function pcast(m,skipMe){if(!PT)return;Object.keys(PT.peers).forEach(id=>psend(id,m));if(!skipMe&&PT.host)onMsg(PT.id,m);}
function toHost(m){if(!PT)return;if(PT.host){onAction(PT.id,m);return;}if(PT.dc&&PT.dc.readyState==='open')PT.dc.send(JSON.stringify(m));}
function onMsg(id,m){if(PT.host&&id!==PT.id)return onAction(id,m);clientMsg(m);}

/* ---------- เมนูและฟอร์ม ---------- */
async function partyMenu(){await cloud.init();
 if(!partyReady()){openModal(`<div class="sheethead"><h2>โหมด PARTY</h2><button class="btn plain" data-c="1">ปิด</button></div><p>โหมดนี้เล่นผ่านเว็บเกมบน Vercel ที่ต่อ Upstash แล้วเท่านั้น และทุกเครื่องควรอยู่เน็ตเดียวกัน</p>`);$('#modal [data-c]').onclick=closeModal;return;}
 openModal(`<div class="sheethead"><h2>โหมด PARTY</h2><button class="btn plain" data-c="1">ปิด</button></div><div class="say">${sprHTML('btn_party',90)}<p>3-5 คนช่วยกันเปิดร้านเดียวกัน คนละตำแหน่ง ไม่มีการ์ดโจมตี ทุกเครื่องควรอยู่เน็ตเดียวกัน</p></div><div class="evchoices"><button class="btn gold" data-host="1">ตั้งห้อง</button><button class="btn green" data-join="1">เข้าห้องด้วยรหัส</button></div>`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;m.querySelector('[data-host]').onclick=()=>partyForm(true);m.querySelector('[data-join]').onclick=()=>partyForm(false);}
function partyForm(host){let g='m',rule={type:'money',goal:5000000},dayLen=90;const last=store.get('socialeyewear.mp.name')||'';
 openModal(`<div class="sheethead"><h2>${host?'ตั้งห้อง PARTY':'เข้าห้อง PARTY'}</h2><button class="btn plain" data-c="1">กลับ</button></div>
 <div class="row gpick">${[['m','ชาย'],['f','หญิง']].map(x=>`<button type="button" class="tab ${g===x[0]?'on':''}" data-g="${x[0]}">${x[1]}</button>`).join('')}</div>
 <form id="ptF" class="suform"><label for="ptCode">รหัสห้อง 4 หลัก</label><input id="ptCode" class="nameinput" inputmode="numeric" maxlength="4" autocomplete="off" value="${host?String(1000+Math.floor(Math.random()*9000)):''}">
 <label for="ptName">ชื่อคุณ</label><input id="ptName" class="nameinput" maxlength="20" autocomplete="off" value="${esc(last)}">
 ${host?`<label for="ptShop">ชื่อร้าน</label><input id="ptShop" class="nameinput" maxlength="24" autocomplete="off" value="Social Eyewear">
 <label>เป้าหมายทีม</label><div class="row">${[1000000,5000000,10000000].map(n=>`<button type="button" class="tab" data-gl="${n}">เงิน ${fmt(n)}</button>`).join('')}${[1,3].map(y=>`<button type="button" class="tab" data-yr="${y}">ครบ ${y} ปี</button>`).join('')}</div>
 <label>ความยาว 1 วัน</label><div class="row">${[60,90,150].map(n=>`<button type="button" class="tab" data-dl="${n}">${n} วินาที</button>`).join('')}</div>`:''}
 <p class="err" id="ptErr" role="alert"></p><button class="btn gold">${host?'สร้างห้อง':'เข้าห้อง'}</button></form>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-c]').onclick=partyMenu;m.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{g=b.dataset.g;m.querySelectorAll('[data-g]').forEach(x=>x.classList.toggle('on',x===b));});
 const paint=()=>{m.querySelectorAll('[data-gl]').forEach(x=>x.classList.toggle('on',rule.type==='money'&&+x.dataset.gl===rule.goal));m.querySelectorAll('[data-yr]').forEach(x=>x.classList.toggle('on',rule.type==='years'&&+x.dataset.yr===rule.years));m.querySelectorAll('[data-dl]').forEach(x=>x.classList.toggle('on',+x.dataset.dl===dayLen));};
 if(host){m.querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>{rule={type:'money',goal:+b.dataset.gl};paint();});m.querySelectorAll('[data-yr]').forEach(b=>b.onclick=()=>{rule={type:'years',years:+b.dataset.yr};paint();});m.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>{dayLen=+b.dataset.dl;paint();});paint();}
 $('#ptF').onsubmit=async e=>{e.preventDefault();const err=$('#ptErr'),code=$('#ptCode').value.trim();if(!/^\d{4}$/.test(code)){err.textContent='ใส่รหัสตัวเลข 4 หลัก';return;}
  const name=cleanName($('#ptName').value,20)||'ผู้เล่น';store.set('socialeyewear.mp.name',name);err.textContent='กำลังเชื่อมต่อ…';const id=mpMyId(code);
  try{if(host){const shop=cleanName($('#ptShop').value,24)||'Social Eyewear';let ok=await net.create(code,{code,mode:'party',host:id,rule,dayLen,status:'lobby'});let meta={rule,dayLen,status:'lobby'};
     if(!ok){const st=await net.get(code);if(!st.meta||st.meta.mode!=='party'||st.meta.host!==id){err.textContent=`รหัส ${code} มีคนใช้แล้ว เปลี่ยนรหัสใหม่`;return;}meta=st.meta;}
     hostStart(code,id,name,g,shop,meta);}
   else{const st=await net.get(code);if(!st.meta||st.meta.mode!=='party'){err.textContent=`ไม่พบห้อง PARTY รหัส ${code}`;return;}joinRoom(code,id,name,g);}
  }catch(x){err.textContent='เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง';}};}

/* ---------- เชื่อมต่อ ---------- */
function hostStart(code,id,name,g,shop,meta){partyStop();PT={host:true,code,id,name,peers:{},seen:{},meta,shop,started:meta.status==='playing',players:{[id]:{name,gender:g,role:null,conn:true}}};
 const sc='PT'+code,raw=store.get(KEY(sc));if(PT.started&&raw){try{const o=JSON.parse(raw);if(o.ptPlayers){PT.players=o.ptPlayers;Object.keys(PT.players).forEach(k=>{PT.players[k].conn=k===id;});}applySave(sc,raw);DAY_LEN=meta.dayLen;PT.started=true;beginGame(true);}catch(e){PT.started=false;}}
 hostSignal();PT.sigT=setInterval(()=>{hostSignal();checkPeers();},2000);if(!PT.started)lobbyShow();}
async function hostSignal(){if(!PT||!PT.host)return;if(PT.started&&(PT.sigN=(PT.sigN||0)+1)%5)return;let st;try{st=await net.get(PT.code);}catch(e){return;}if(!PT||!st.meta)return;
 for(const[id,p]of Object.entries(st.players||{})){if(id===PT.id||!p.offer||PT.seen[id]===p.offer)continue;PT.seen[id]=p.offer;
  try{const pc=new RTCPeerConnection(RTC_CFG);pc.ondatachannel=e=>wire(id,pc,e.channel);await pc.setRemoteDescription({type:'offer',sdp:p.offer});await pc.setLocalDescription(await pc.createAnswer());await gatherDone(pc);await net.event(PT.code,{type:'answer',to:id,oid:p.oid,sdp:pc.localDescription.sdp});}catch(e){console.warn(e);}}}
function wire(id,pc,dc){dc.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}if(!PT)return;const pr=PT.peers[id];if(pr&&pr.dc===dc)pr.seen=Date.now();if(m.a!=='ping')onAction(id,m);};dc.onclose=()=>peerGone(id,dc);pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))peerGone(id,dc);};PT.peers[id]={pc,dc,seen:Date.now()};}
function checkPeers(){if(!PT||!PT.host)return;const now=Date.now();Object.entries(PT.peers).forEach(([id,p])=>{if(now-p.seen>6000)peerGone(id,p.dc);});}
function peerGone(id,dc){if(!PT||!PT.peers[id]||PT.peers[id].dc!==dc)return;const old=PT.peers[id];delete PT.peers[id];try{old.pc.close();}catch(e){}const p=PT.players[id];if(p)p.conn=false;delete PT.seen[id];const a=G&&G.avatars&&G.avatars.find(x=>x.id===id);if(a)relTask(a);pushLobby();}
async function joinRoom(code,id,name,g,retry){partyStop(true);PT={host:false,code,id,name,gender:g,started:false,retry:!!retry};
 if(!retry)openModal(`<div class="sheethead"><h2>กำลังเชื่อมต่อห้อง ${code}</h2></div><p>รอเครื่องเจ้าของห้องตอบรับ</p><div class="row"><button class="btn plain" data-c="1">ยกเลิก</button></div>`,{lock:true});
 const cb=$('#modal [data-c]');if(cb)cb.onclick=()=>{partyStop();closeModal();};
 const me=PT;const pc=new RTCPeerConnection(RTC_CFG);me.pc=pc;const dc=pc.createDataChannel('game',{ordered:true});me.dc=dc;
 dc.onopen=()=>{clearTimeout(me.failT);dc.send(JSON.stringify({a:'hello',name,gender:g}));me.pingT=setInterval(()=>{if(dc.readyState==='open')dc.send('{"a":"ping"}');},2000);};pc.onconnectionstatechange=()=>{if(PT===me&&!me.over&&['failed','closed'].includes(pc.connectionState))lostHost(me);};dc.onmessage=e=>{if(PT!==me)return;let m;try{m=JSON.parse(e.data);}catch(x){return;}clientMsg(m);};
 dc.onclose=()=>{if(PT===me&&!me.over)lostHost(me);};
 await pc.setLocalDescription(await pc.createOffer());await gatherDone(pc);const oid=Math.random().toString(36).slice(2,9);await net.player(code,id,{name,offer:pc.localDescription.sdp,oid,seen:Date.now()});
 me.failT=setTimeout(()=>{if(PT===me&&dc.readyState!=='open')lostHost(me,true);},20000);
 const poll=async()=>{if(PT!==me||dc.readyState==='open'||pc.remoteDescription)return;try{const st=await net.get(code);if(PT!==me)return;if(!st.meta){me.over=true;partyStop();closeModal();showTitle();toast('ห้องนี้ถูกปิดแล้ว');return;}const a=(st.events||[]).filter(e=>e.type==='answer'&&e.to===id&&e.oid===oid).pop();if(a){await pc.setRemoteDescription({type:'answer',sdp:a.sdp});return;}}catch(e){}setTimeout(poll,1500);};poll();}
function lostHost(me,fail){if(me.lost)return;me.lost=1;clearInterval(me.pingT);const{code,id,name,gender}=me;try{me.pc.close();}catch(e){}openModal(`<div class="sheethead"><h2>${fail?'ต่อเครื่องเจ้าของห้องไม่สำเร็จ':'การเชื่อมต่อหลุด'}</h2></div><p>${fail?'ตรวจว่าทุกเครื่องอยู่เน็ตเดียวกัน และเจ้าของห้องเปิดเกมอยู่ เกมกำลังลองใหม่':'เจ้าของห้องอาจหลุดหรือปิดเกม เกมกำลังลองต่อใหม่'}</p><div class="row"><button class="btn plain" data-lv="1">ออกจากห้อง</button></div>`,{lock:true});$('#modal [data-lv]').onclick=()=>{partyStop();closeModal();showTitle();};
 const t=setTimeout(()=>{if(PT===me)joinRoom(code,id,name,gender,true);},5000);me.retryT=t;}
function partyStop(keep){if(!PT)return;clearInterval(PT.sigT);clearInterval(PT.snapT);clearTimeout(PT.failT);clearTimeout(PT.retryT);if(PT.host)Object.values(PT.peers).forEach(p=>{try{p.pc.close();}catch(e){}});else{const o=PT;o.over=true;clearInterval(o.pingT);try{o.pc&&o.pc.close();}catch(e){}}PT=null;}
window.addEventListener('pagehide',()=>{if(PT&&!PT.host&&PT.pc){try{PT.pc.close();}catch(e){}}});

/* ---------- ล็อบบี้ ---------- */
function canPick(r,id){const ps=PT.players,oth=Object.entries(ps).filter(([k,p])=>k!==id&&p.role);const taken=new Set(oth.map(([,p])=>p.role));return !taken.has(r)||taken.size>=3;}
function pushLobby(){if(!PT||!PT.host)return;const m={t:'lobby',players:PT.players,code:PT.code,rule:PT.meta.rule};Object.keys(PT.peers).forEach(k=>psend(k,m));if(!PT.started)lobbyShow();}
function lobbyShow(){const ps=PT.players,me=ps[PT.id]||{},ls=Object.entries(ps),rc=new Set(ls.map(([,p])=>p.role).filter(Boolean)),ready=ls.length>=3&&rc.size===3&&ls.every(([,p])=>p.role);
 openModal(`<div class="sheethead"><h2>ห้อง PARTY ${PT.code}</h2></div><p class="mini">บอกรหัสนี้ให้เพื่อน · 3-5 คน · สามตำแหน่งแรกห้ามซ้ำ คนที่ 4-5 เลือกซ้ำได้</p>
 <h3>เลือกตำแหน่งของคุณ</h3><div class="row">${Object.keys(PROLE).map(r=>{const ok=canPick(r,PT.id)||me.role===r;return `<button class="item col ${me.role===r?'owned':''}" data-r="${r}" ${ok?'':'disabled'}>${sprHTML(PKEYS[r][0]+'f',70)}<b>${PROLE[r]}</b></button>`;}).join('')}</div>
 <table class="ledger"><tbody>${ls.map(([k,p])=>`<tr class="${k===PT.id?'hl':''}"><td>${esc(p.name)}${k===(PT.hostId||(PT.host?PT.id:''))?' (เจ้าของห้อง)':''}</td><td>${p.role?PROLE[p.role]:'ยังไม่เลือก'}</td></tr>`).join('')}</tbody></table>
 ${PT.host?`<div class="row"><button class="btn gold" data-st="1" ${ready?'':'disabled'}>เริ่มเปิดร้าน</button><button class="btn red" data-cl="1">ปิดห้อง</button></div>${ready?'':'<p class="note">ต้องมีอย่างน้อย 3 คน และครบทั้ง 3 ตำแหน่ง</p>'}`:`<p class="note">รอเจ้าของห้องกดเริ่ม</p><div class="row"><button class="btn plain" data-lv="1">ออกจากห้อง</button></div>`}`,{lock:true});
 const m=$('#modal');m.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>toHost({a:'role',r:b.dataset.r}));
 const st=m.querySelector('[data-st]');if(st)st.onclick=()=>hostBegin();const cl=m.querySelector('[data-cl]');if(cl)cl.onclick=()=>closeParty();const lv=m.querySelector('[data-lv]');if(lv)lv.onclick=()=>{partyStop();closeModal();showTitle();};}
async function closeParty(){const code=PT.code;pcast({t:'over',closed:1,text:'เจ้าของห้องปิดห้องแล้ว'},true);try{await net.close(code);}catch(e){}partyStop();closeModal();showTitle();toast('ปิดห้องแล้ว');}
async function hostBegin(){PT.started=true;PT.meta.status='playing';try{await net.meta(PT.code,Object.assign({code:PT.code,mode:'party',host:PT.id},PT.meta));}catch(e){}
 const me=PT.players[PT.id];S=fresh('PT'+PT.code);S.owner={gender:me.gender,name:me.name};S.shopName=PT.shop;S.party=1;S.partyDay=PT.meta.dayLen;S.goal=PT.meta.rule.type==='money'?PT.meta.rule.goal:0;S.ptPlayers=PT.players;S.lens.hilux.stock=20;S.frames.basic=20;
 closeModal();beginGame();Object.keys(PT.peers).forEach(k=>psend(k,startMsg(k)));}
function startMsg(id){return{t:'start',role:PT.players[id].role,dayLen:S.partyDay,S:snapS()};}
function beginGame(){S.party=1;startPlay(true);S.ptPlayers=PT.players;G.avatars=[];Object.keys(PT.players).forEach(makeAvatar);$('#rail').classList.add('locked');clearInterval(PT.snapT);PT.snapT=setInterval(hostSnap,100);mpBanner(`เปิดร้านแล้ว ตำแหน่งคุณ: ${PROLE[PT.players[PT.id].role]}`);}
function makeAvatar(id){if(G.avatars.some(a=>a.id===id))return;const p=PT.players[id];if(!p||!p.role)return;const used=G.avatars.filter(a=>a.role===p.role).length;G.avatars.push({id,role:p.role,name:p.name,key:PKEYS[p.role][used%3],x:SPOT.home.x+used*50,y:SPOT.home.y,dir:'f',flip:false,t:0,task:null,done:0});}

/* ---------- เครื่องเจ้าของห้อง: รับคำสั่ง ---------- */
function onAction(id,m){if(!PT||!PT.host)return;const ps=PT.players;
 if(m.a==='hello'){if(ps[id]){ps[id].conn=true;ps[id].name=m.name;if(PT.started&&G&&S){makeAvatar(id);psend(id,{t:'lobby',players:ps,code:PT.code});psend(id,startMsg(id));return;}}else{if(PT.started)return psend(id,{t:'reject',why:'ห้องนี้เริ่มเล่นไปแล้ว'});if(Object.keys(ps).length>=5)return psend(id,{t:'reject',why:'ห้องเต็ม 5 คนแล้ว'});ps[id]={name:m.name,gender:m.gender,role:null,conn:true};}pushLobby();return;}
 if(m.a==='role'){if(!PT.started&&ps[id]&&canPick(m.r,id)){ps[id].role=m.r;pushLobby();}return;}
 if(!G||!S||!PT.started)return;const a=G.avatars.find(x=>x.id===id);if(!a)return;
 if(m.a==='claim')return claim(a,m);if(m.a==='done')return doneTask(a,m);if(m.a==='release')return relTask(a);}
function deny(a,t){psend(a.id,{t:'toast',text:t});}
const NEED={exam:'od',lens:'sales',frame:'sales',contact:'sales',repair:'sales',pay:'sales'};
function claim(a,m){if(a.task)return deny(a,'ทำงานที่รับไว้ให้เสร็จก่อน');
 if(m.lab){if(a.role!=='tech')return deny(a,'โต๊ะช่างเป็นงานของช่าง');const j=G.jobs.find(j=>!j.owner);if(!j)return deny(a,'ยังไม่มีงานที่โต๊ะช่าง');j.owner='p:'+a.id;a.task={kind:'lab',j,x:SPOT.lab.x,y:SPOT.lab.y};return;}
 const c=G.cust.find(x=>x.id===m.cid);if(!c||c.owner)return deny(a,'มีคนรับลูกค้าคนนี้แล้ว');if(c.phase!=='idle'&&c.phase!=='atChair'&&c.phase!=='counter')return;const st=step(c);const need=NEED[st];if(!need)return;if(need!==a.role)return deny(a,`งานนี้ของ${PROLE[need]}`);
 if(st==='exam'){if(c.phase==='idle'&&!toExam(c))return;c.owner='p:'+a.id;const ch=CHAIRS[c.chair];a.task={kind:'exam',c,x:ch.sx,y:ch.sy,ready:()=>c.phase==='atChair'};return;}
 if(st==='pay'){if(c.phase==='idle'&&!toCounter(c))return deny(a,'คิวเคาน์เตอร์เต็ม');c.owner='p:'+a.id;a.task={kind:'cash',c,x:SPOT.cash.x,y:SPOT.cash.y,ready:()=>c.phase==='counter'&&G.queue[0]===c};return;}
 c.owner='p:'+a.id;if(st==='lens')a.task={kind:'lens',c,follow:1};if(st==='repair')a.task={kind:'repair',c,follow:1};if(st==='frame')a.task={kind:'frame',c,x:SPOT.frames.x,y:SPOT.frames.y};if(st==='contact')a.task={kind:'contact',c,x:SPOT.contact.x,y:SPOT.contact.y};}
function relTask(a){const t=a.task;if(!t)return;if(t.c&&t.c.owner==='p:'+a.id)t.c.owner=null;if(t.j&&t.j.owner==='p:'+a.id)t.j.owner=null;a.task=null;}
function finishWork(a){relTask(a);a.done++;}
function openFor(a,t){const c=t.c;t.opened=true;const d={t:'open',kind:t.kind};
 if(t.kind==='lab'){const u=t.j.c;d.ticket={name:u.name,repair:u.steps.includes('repair'),lens:u.chosenLens&&LENSES[u.chosenLens].name,rx:u.rx,frame:FRAME_CATS[u.frCat].name};d.jid=1;}
 else{d.cid=c.id;d.k=c.k;d.q=c.q;d.lens=c.lens;d.frCat=c.frCat;d.ctType=c.ctType;d.ctPow=c.ctPow;d.type=c.type;d.bill=c.bill.reduce((x,b)=>x+b.amount,0);d.tried=c.tried||0;}
 if(t.kind==='exam')d.rxT=c.rxT||(c.rxT={r:-(Math.floor(rnd(1,20))*.25),l:-(Math.floor(rnd(1,20))*.25)});
 psend(a.id,d);}
function doneTask(a,m){const t=a.task;if(!t||t.kind!==m.kind)return;const c=t.c;
 if(t.kind==='lab'){const j=t.j;if(!G.jobs.includes(j))return relTask(a);j.c.sat+=((m.score||0)-.5)*1.5;completeJob(j);return finishWork(a);}
 if(!c||!G.cust.includes(c))return relTask(a);
 if(t.kind==='exam'){const score=clamp(m.score||0,0,1);c.rx=m.rx;c.sat+=(score-.6)*2;completeExam(c);return finishWork(a);}
 if(t.kind==='lens'){if(m.appt){makeAppt(c);return finishWork(a);}if(!(lensState(m.id).stock>0)){t.opened=false;deny(a,'เลนส์นี้หมดแล้ว');return;}chooseLens(c,m.id);return finishWork(a);}
 if(t.kind==='frame'){if(frameStock(m.cat)<1){t.opened=false;deny(a,'กรอบนี้หมดแล้ว');return;}a.task={kind:'dlvF',c,cat:m.cat,follow:1,auto:1};return;}
 if(t.kind==='contact'){if(ctStock(m.ctk,m.pow)<1){t.opened=false;deny(a,'คอนแทคนี้หมดแล้ว');return;}a.task={kind:'dlvC',c,ctk:m.ctk,pow:m.pow,follow:1,auto:1};return;}
 if(t.kind==='cash'){c.deal=m.deal==null?0:m.deal;completeCash(c);return finishWork(a);}}
function partyTick(dt){const sp=moveSpeed()*(W/MW);G.avatars.forEach(a=>{const t=a.task;if(!t){a.moving=false;return;}
  if(t.c&&(!G.cust.includes(t.c)||t.c.phase==='leaving'||t.c.phase==='angry')){psend(a.id,{t:'cancel'});relTask(a);return;}if(t.j&&!G.jobs.includes(t.j)){psend(a.id,{t:'cancel'});relTask(a);return;}
  if(t.opened)return;const tx=t.follow?t.c.x+50:t.x,ty=t.follow?t.c.y+6:t.y;if(!navWalk(a,tx,ty,sp,dt))return;a.moving=false;if(t.ready&&!t.ready())return;
  if(t.kind==='repair'){startRepair(t.c);return finishWork(a);}if(t.kind==='dlvF'){chooseFrame(t.c,t.cat);return finishWork(a);}if(t.kind==='dlvC'){chooseContact(t.c,t.ctk,t.pow);return finishWork(a);}openFor(a,t);});
 const r=PT.meta.rule;if(!PT.ended&&r.type==='years'&&S.day>r.years*YEAR_DAYS&&G.summary)partyEnd(`เล่นครบ ${r.years} ปี`);
 if(!PT.ended&&S.won)partyEnd(`ถึงเป้าหมาย ${fmt(S.goal)} แล้ว`);}
function partyEnd(text){PT.ended=1;const ls=(G.avatars||[]).slice().sort((a,b)=>b.done-a.done);pcast({t:'over',text,money:Math.round(netWorth()),rev:Math.round(S.stats.total),day:S.day,rank:ls.map(a=>[a.name,PROLE[a.role],a.done])},true);showOver({text,money:Math.round(netWorth()),rev:Math.round(S.stats.total),day:S.day,rank:ls.map(a=>[a.name,PROLE[a.role],a.done])});}
function snapS(){return Object.assign({},S,{history:[],daily:[],ptPlayers:null});}
function hostSnap(){if(!PT||!G||!S)return;PT.tick=(PT.tick||0)+1;const m={t:'s',c:G.cust.map(c=>({id:c.id,k:c.k,x:Math.round(c.x),y:Math.round(c.y),dir:c.dir,flip:c.flip,moving:c.moving,phase:c.phase,st:step(c)||null,pat:Math.round(c.pat),type:c.type||null,own:c.owner?1:0})),a:G.avatars.map(a=>({id:a.id,key:a.key,name:a.name,role:a.role,x:Math.round(a.x),y:Math.round(a.y),dir:a.dir,flip:a.flip,moving:a.moving})),q:G.queue.map(c=>c.id),j:G.jobs.map(j=>({own:j.owner?1:0})),fx:G.fx.map(f=>({x:f.x,y:f.y,t:f.t,text:f.text,col:f.col,big:f.big})),closing:G.closing,summary:!!G.summary,today:G.today,feed:G.feed};
 if(PT.tick%10===1)m.S=snapS();Object.keys(PT.peers).forEach(k=>psend(k,m));S.ptPlayers=PT.players;}

/* ---------- เครื่องผู้เล่น ---------- */
function clientMsg(m){
 if(m.t==='lobby'){PT.players=m.players;PT.hostId=null;if(!PT.started)lobbyShow();return;}
 if(m.t==='reject'){const w=m.why;partyStop();closeModal();showTitle();toast(w);return;}
 if(m.t==='start'){PT.started=true;PT.role=m.role;closeModal();S=m.S;S.party=1;S.mp=null;startPlay(true);S=m.S;DAY_LEN=m.dayLen||90;G.ents={};G.avatars=[];G.spawn=1e9;$('#rail').classList.add('locked');mpBanner(`เปิดร้านแล้ว ตำแหน่งคุณ: ${PROLE[m.role]}`);return;}
 if(m.t==='s'){if(!G||!PT.started)return;applySnap(m);return;}
 if(m.t==='toast'){toast(m.text);softPlay('bad');return;}
 if(m.t==='cancel'){if(PT.dlg){PT.dlg=null;closeModal();toast('ลูกค้าคนนี้ไม่รอแล้ว');}return;}
 if(m.t==='open'){showTask(m);return;}
 if(m.t==='over'){if(PT.host&&!m.rank)return;showOver(m);return;}}
function ent(o,id){const e=G.ents[id]||(G.ents[id]={x:o.x,y:o.y,t:0,fade:1,si:0});return e;}
function applySnap(m){const seen={};G.cust=m.c.map(o=>{const e=ent(o,'c'+o.id);seen['c'+o.id]=1;Object.assign(e,{id:o.id,k:o.k,tx:o.x,ty:o.y,dir:o.dir,flip:o.flip,moving:o.moving,phase:o.phase,steps:[o.st],pat:o.pat,type:o.type,owner:o.own?'x':null});return e;});
 G.avatars=m.a.map(o=>{const e=ent(o,'a'+o.id);seen['a'+o.id]=1;Object.assign(e,{id:o.id,key:o.key,name:o.name,role:o.role,tx:o.x,ty:o.y,dir:o.dir,flip:o.flip,moving:o.moving});return e;});
 Object.keys(G.ents).forEach(k=>{if(!seen[k])delete G.ents[k];});G.queue=m.q.map(id=>G.cust.find(c=>c.id===id)).filter(Boolean);G.jobs=m.j.map(j=>({owner:j.own?1:null,t:0,dur:1}));G.fx=m.fx;G.closing=m.closing;G.today=m.today;G.feed=m.feed;
 if(m.S){m.S.party=1;S=m.S;}
 if(m.summary!==G.summary){G.summary=m.summary;if(m.summary){if(!PT.dlg)waitDay();}else if(PT.waiting){PT.waiting=false;closeModal();}}}
function waitDay(){PT.waiting=true;const t=G.today||{};openModal(`<div class="sheethead"><h2>ปิดร้านแล้ว</h2></div><table class="ledger"><tbody><tr><td>ขายได้วันนี้</td><td>${fmt((t.rev||0)+(t.tip||0))}</td></tr><tr><td>บริการ</td><td>${t.served||0} คน</td></tr><tr><td>ลูกค้าเดินออก</td><td>${t.left||0} คน</td></tr></tbody></table><p class="note">รอเจ้าของห้องเติมของและกดเปิดร้าน</p>`,{lock:true});}
function partyLerp(dt){[...G.cust,...G.avatars].forEach(e=>{if(e.tx==null)return;e.x+=(e.tx-e.x)*Math.min(1,dt*12);e.y+=(e.ty-e.y)*Math.min(1,dt*12);e.t=(e.t||0)+dt;});G.fx.forEach(f=>f.t-=dt);G.fx=G.fx.filter(f=>f.t>0);}
function myRole(){return PT&&(PT.host?(PT.players[PT.id]||{}).role:PT.role);}
function partyClick(p){if(!PT||!PT.started)return;const c=hitCust(p);if(c){const n=NEED[step(c)];if(n&&n!==myRole()){toast(`งานนี้ของ${PROLE[n]}`);return;}if(!c.owner)toHost({a:'claim',cid:c.id});return;}
 if(inZone(p,ZONE.lab)){if(myRole()==='tech')toHost({a:'claim',lab:1});return;}}
function partyHint(){if(!PT||!PT.started)return'';if(G.summary)return PT.host?'เติมของให้พร้อม แล้วกดเปิดร้านด้านขวา':'รอเจ้าของห้องเปิดร้าน';const r=myRole();if(r==='tech')return G.jobs.some(j=>!j.owner)?'มีงานรอ คลิกโต๊ะช่าง':'รองานประกอบแว่น';const c=G.cust.find(c=>!c.owner&&(c.phase==='idle'||c.phase==='atChair'||c.phase==='counter')&&NEED[step(c)]===r);return c?(r==='od'?'คลิกลูกค้าที่ขึ้นคลิปบอร์ดเพื่อวัดตา':'คลิกลูกค้าที่รอคุณ'):'รองานของคุณ';}
function isMine(c){return PT&&!c.owner&&(c.phase==='idle'||c.phase==='atChair'||c.phase==='counter')&&NEED[step(c)]===myRole();}
function drawAvatars(list){(G.avatars||[]).forEach(a=>list.push({y:a.y,fn:()=>{drawActor(a,a.key,1);label(a.x,a.y+18,a.name,a.id===PT.id?'#f08a12':'#16204a','#fff',15);}}));}
function ptPanel(){if(!PT||!PT.players)return'';const ps=Object.values(PT.players);return `<div class="mpbox"><b>ห้อง PARTY ${PT.code}</b><div class="mini">ตำแหน่งคุณ: ${PROLE[myRole()]||''}</div>${ps.map(p=>`<div class="statrow"><span>${esc(p.name)} · ${PROLE[p.role]||''}</span><span class="${p.conn===false?'neg':''}">${p.conn===false?'หลุด':'ออนไลน์'}</span></div>`).join('')}<div class="row" style="margin-top:6px"><button class="btn plain" data-ptl="1">ออกจากเกม</button>${PT.host?'<button class="btn red" data-ptc="1">ปิดห้อง</button>':''}</div></div>`;}
function ptPanelClick(e){const b=e.target.closest('button');if(!b)return;if(b.dataset.ptl){if(PT.host)saveGame(true);partyStop();showTitle();}if(b.dataset.ptc)closeParty();}
function showOver(m){if(PT)PT.over=1;if(PT&&PT.dlg)PT.dlg=null;softPlay('buy');openModal(`<div class="sheethead"><h2>${m.closed?'ห้องถูกปิด':'จบเกม PARTY'}</h2></div><div class="say">${sprHTML('e_podium',90)}<p>${esc(m.text||'')}</p></div>${m.rank?`<table class="ledger"><tbody><tr><td>เงินสุทธิของร้าน</td><td>${fmt(m.money)}</td></tr><tr><td>ยอดขายรวม</td><td>${fmt(m.rev)}</td></tr><tr><td>จบในวันที่</td><td>${m.day}</td></tr>${m.rank.map((r,i)=>`<tr class="${i?'':'hl'}"><td>${i?'':'MVP · '}${esc(r[0])} · ${r[1]}</td><td>${r[2]} งาน</td></tr>`).join('')}</tbody></table>`:''}<div class="row"><button class="btn gold" data-e="1">กลับเมนูหลัก</button></div>`,{lock:true});
 $('#modal [data-e]').onclick=async()=>{const h=PT&&PT.host,c=PT&&PT.code;if(h){try{await net.close(c);}catch(e){}store.del(KEY('PT'+c));}partyStop();closeModal();showTitle();};}

/* ---------- หน้าต่างงานของแต่ละตำแหน่ง ---------- */
function sendDone(kind,o){PT.dlg=null;closeModal();toHost(Object.assign({a:'done',kind},o));}
function sendRel(){PT.dlg=null;closeModal();toHost({a:'release'});}
function showTask(d){PT.dlg=d;softPlay('pick');({lens:pLens,frame:pFrame,contact:pContact,exam:pExam,lab:pLab,cash:pCash}[d.kind])(d);}
function headSay(d,t){return `<div class="say">${sprHTML(d.k+'f',78)}<p>${t}</p></div>`;}
function pLens(d){const ok=bestLensFor(d.lens);const cards=Object.keys(LENSES).filter(lensAvailable).filter(id=>S.lens[id]&&S.lens[id].stock>0).map(id=>`<button class="item col" data-p="${id}"><span class="tx"><b>${LENSES[id].name}</b><small>${LENSES[id].desc}</small></span><span class="row"><span class="price">${fmt(lensPrice(id))}</span><span class="tag ok">มี ${S.lens[id].stock}</span></span></button>`).join('');
 openModal(`<div class="sheethead"><h2>แนะนำเลนส์</h2><button class="btn plain" data-l="1">ไว้ก่อน</button></div>${headSay(d,esc(d.q))}${ok?'':`<div class="apptbox"><span>ไม่มีเลนส์ที่ตรงกับลูกค้า นัดกลับมาอีก ${APPT_DAYS} วัน เจ้าของห้องต้องสั่งให้ทัน</span><button class="btn gold" data-a="1">นัดอีก ${APPT_DAYS} วัน</button></div>`}<div class="grid">${cards||'<p class="mini">ไม่มีเลนส์ในสต็อก</p>'}</div>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-l]').onclick=sendRel;m.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>sendDone('lens',{id:b.dataset.p}));const a=m.querySelector('[data-a]');if(a)a.onclick=()=>sendDone('lens',{appt:1});}
function pFrame(d){const w=FRAME_CATS[d.frCat];const cards=Object.keys(FRAME_CATS).filter(frameUnlocked).filter(k=>frameStock(k)>0).map(k=>`<button class="item col" data-p="${k}"><span class="row">${FRAME_CATS[k].sprites.slice(0,4).map(x=>sprHTML(x,28)).join('')}</span><b>${FRAME_CATS[k].name}</b><span class="row"><span class="price">${fmt(FRAME_CATS[k].price*repMul())}</span><span class="tag ok">มี ${frameStock(k)}</span></span></button>`).join('');
 openModal(`<div class="sheethead"><h2>หยิบกรอบ</h2><button class="btn plain" data-l="1">ไว้ก่อน</button></div>${headSay(d,`อยากได้${esc(w.wish)}${d.type==='picky'?`<br><small>ลองแล้ว ${d.tried}/3</small>`:''}`)}<div class="grid">${cards||'<p class="mini">กรอบหมด</p>'}</div>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-l]').onclick=sendRel;m.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>sendDone('frame',{cat:b.dataset.p}));}
function pContact(d){const rows=ctList().map(k=>`<div class="ctrow">${sprHTML(CT[k].spr,54)}<span class="tx"><b>${CT[k].brand}</b><small>${CTTYPE[CT[k].type]}</small></span><span class="ctpow">${CTPOW.filter(p=>ctStock(k,p)>0).map(p=>`<button class="tab" data-p="${k}|${p}">${p}<small> ${ctStock(k,p)}</small></button>`).join('')}</span></div>`).join('');
 openModal(`<div class="sheethead"><h2>จ่ายคอนแทคเลนส์</h2><button class="btn plain" data-l="1">ไว้ก่อน</button></div>${headSay(d,`ขอ<b>${CTTYPE[d.ctType]}</b> ค่าสายตา <b>${d.ctPow}</b>`)}<div class="ctlist">${rows}</div>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-l]').onclick=sendRel;m.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const[k,p]=b.dataset.p.split('|');sendDone('contact',{ctk:k,pow:p});});}
function pCash(d){if(d.type!=='bargain')return sendDone('cash',{deal:0});const sub=d.bill;const offers=[[0,.2],[.05,.5],[.1,.8],[.2,1]];const draw=()=>{openModal(`<div class="sheethead"><h2>เจรจาราคา</h2></div>${headSay(d,`ลดให้หน่อยได้ไหม บิลนี้ ${fmt(sub)}`)}<div class="evchoices">${offers.map((o,i)=>`<button class="btn ${o[0]?'':'green'}" data-o="${i}">${o[0]?'ลด '+o[0]*100+'%':'ยืนราคา'}</button>`).join('')}</div>`,{lock:true});$('#modal').querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const o=offers[+b.dataset.o];if(Math.random()<o[1])sendDone('cash',{deal:o[0]});else{toast('ลูกค้าไม่ยอม เสนอใหม่');softPlay('bad');}});};draw();}
/* มินิเกมเพื่อความบันเทิง ไม่ใช่การตรวจสายตาจริง */
function pExam(d){let eye='r',val={r:0,l:0},rx={};const run=()=>{const T=d.rxT[eye],dv=Math.abs(val[eye]-T),blur=Math.min(9,dv*2.2);
 openModal(`<div class="sheethead"><h2>วัดตา${eye==='r'?'ขวา':'ซ้าย'}</h2></div>${headSay(d,'หมุนค่าเลนส์จนตัวอักษรคมชัดที่สุด แล้วยืนยัน')}<div class="chartbox2"><span class="chartE" id="exE" style="font-size:44px;filter:blur(${blur}px)">E F P T O Z</span></div>
 <div class="row dial"><button class="btn" data-v="-1">− 1.00</button><button class="btn" data-v="-.25">− 0.25</button><b id="exV">${val[eye].toFixed(2)}</b><button class="btn" data-v=".25">+ 0.25</button><button class="btn" data-v="1">+ 1.00</button></div><div class="row"><button class="btn gold" data-ok="1">ยืนยันค่า</button></div><p class="note">เกมจำลองเพื่อความบันเทิง ไม่ใช่การตรวจสายตาจริง</p>`,{lock:true});
 const m=$('#modal');m.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{val[eye]=clamp(val[eye]+ +b.dataset.v,-8,2);$('#exV').textContent=val[eye].toFixed(2);$('#exE').style.filter=`blur(${Math.min(9,Math.abs(val[eye]-T)*2.2)}px)`;softPlay('pick');});
 m.querySelector('[data-ok]').onclick=()=>{rx[eye]=val[eye];if(eye==='r'){eye='l';run();}else finish();};};
 const finish=()=>{const miss=Math.abs(rx.r-d.rxT.r)+Math.abs(rx.l-d.rxT.l);const dirs=[['บน',270],['ล่าง',90],['ซ้าย',180],['ขวา',0]],q=pick(dirs);openModal(`<div class="sheethead"><h2>ยืนยันผล</h2></div><p>ขาตัว E หันไปทางไหน</p><div class="chartbox2"><span class="chartE" style="font-size:44px;transform:rotate(${q[1]}deg)">E</span></div><div class="railbtns menu4">${dirs.map(x=>`<button class="btn" data-d="${x[0]}">${x[0]}</button>`).join('')}</div>`,{lock:true});
  $('#modal').querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const good=b.dataset.d===q[0];const score=clamp(1-miss*.4-(good?0:.2),0,1);toast(score>=.8?'วัดตาแม่นมาก':score>=.5?'พอใช้':'ค่าคลาดเคลื่อน');sendDone('exam',{score,rx});});};run();}
function pLab(d){const tk=d.ticket;const rxTxt=tk.rx?`R ${tk.rx.r.toFixed(2)} / L ${tk.rx.l.toFixed(2)}`:'ไม่มีใบวัด';let score=1,timer=0;
 const paper=`<div class="ticket"><b>ใบงาน: ${esc(tk.name||'ลูกค้า')}</b><span>${tk.repair?'ซ่อมและดัดแว่น':`เลนส์ ${esc(tk.lens||'-')} · ${rxTxt}`}</span><span>กรอบ ${esc(tk.frame||'-')}</span></div>`;
 const axis=()=>{const tg=20+Math.floor(Math.random()*140);openModal(`<div class="sheethead"><h2>ขั้น 3 ตั้งแกนเลนส์</h2></div>${paper}<p>เลื่อนให้แกนตรงเป้า ${tg}°</p><label class="vh" for="axR">แกนเลนส์</label><input id="axR" class="axr" type="range" min="0" max="180" value="90"><p class="mini" id="axV">90°</p><div class="row"><button class="btn gold" data-ok="1">ส่งงาน</button></div>`,{lock:true});const r=$('#axR');r.oninput=()=>$('#axV').textContent=r.value+'°';$('#modal [data-ok]').onclick=()=>{const miss=Math.abs(+r.value-tg);if(miss>4){score-=.15;softPlay('bad');toast('แกนยังไม่ตรง');return;}softPlay('ok');sendDone('lab',{score:clamp(score,0,1)});};};
 const grind=()=>{let pos=0,dir=1,tries=0;const z0=25+Math.floor(Math.random()*50);openModal(`<div class="sheethead"><h2>ขั้น 2 ฝนเลนส์</h2></div>${paper}<p>กดหยุดเมื่อเข็มอยู่ในช่วงสีเขียว</p><div class="gauge"><i class="zone" style="left:${z0}%;width:16%"></i><i class="needle" id="gN"></i></div><div class="row"><button class="btn gold" data-ok="1">หยุดเครื่อง</button></div>`,{lock:true});clearInterval(timer);timer=setInterval(()=>{const n=$('#gN');if(!n){clearInterval(timer);return;}pos+=dir*3.2;if(pos>=100||pos<=0)dir=-dir;n.style.left=pos+'%';},30);$('#modal [data-ok]').onclick=()=>{if(pos>=z0&&pos<=z0+16){clearInterval(timer);softPlay('ok');axis();}else{tries++;score-=.15;softPlay('bad');toast('ยังไม่ตรง ลองอีกครั้ง');if(tries>=4){clearInterval(timer);axis();}}};};
 if(tk.repair)return grind();const pw=tk.rx?tk.rx.r:-2;const pool=[[tk.lens,pw,1],[tk.lens,pw-.75,0],[tk.lens,pw+.5,0],[Object.values(LENSES).map(l=>l.name).find(n=>n!==tk.lens),pw,0]].sort(()=>Math.random()-.5);
 openModal(`<div class="sheethead"><h2>ขั้น 1 หยิบเลนส์</h2></div>${paper}<p>เลือกเลนส์ให้ตรงใบงาน</p><div class="grid">${pool.map((x,i)=>`<button class="item col" data-t="${i}"><b>${esc(x[0]||'-')}</b><small>ค่าสายตา ${x[1].toFixed(2)}</small></button>`).join('')}</div>`,{lock:true});
 $('#modal').querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{if(pool[+b.dataset.t][2]){softPlay('ok');grind();}else{score-=.2;softPlay('bad');toast('หยิบผิด ดูใบงานอีกครั้ง');}});}

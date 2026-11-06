'use strict';
/* ===== Social Eyewear Game — ร้านแว่นตาจำลอง ===== */
const GAME_VERSION='1.6';
const W=900,H=680,SCALE=2;
const $=s=>document.querySelector(s);
const fmt=n=>'฿'+Math.round(n).toLocaleString('en-US');
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- catalog ---------- */
const LENSES={
 hilux:{name:'Hilux 1.50',desc:'เลนส์มาตรฐาน คุ้มราคา',cost:350,price:1100,fee:0,pack:5,tag:'ประหยัด'},
 blue:{name:'BlueControl',desc:'ลดแสงสีฟ้าจากจอ',cost:950,price:2500,fee:4000,pack:5,tag:'จอคอม'},
 nulux:{name:'Nulux 1.60',desc:'บางเบา สำหรับค่าสายตาสูง',cost:800,price:2100,fee:3000,pack:5,tag:'เลนส์บาง'},
 long:{name:'Hi-Vision LongLife',desc:'เคลือบแข็ง ทนรอยขีดข่วน',cost:1100,price:2900,fee:5000,pack:5,tag:'ทนทาน'},
 sensity:{name:'Sensity',desc:'เปลี่ยนสีเมื่อโดนแดด',cost:1500,price:3900,fee:8000,pack:4,tag:'เปลี่ยนสี'},
 myo:{name:'MiYOSMART',desc:'ชะลอสายตาสั้นในเด็ก',cost:4200,price:9500,fee:15000,pack:3,tag:'เด็ก',need:'phoro'},
 prog:{name:'Hoyalux iD',desc:'โปรเกรสซีฟ มองใกล้-ไกลในเลนส์เดียว',cost:5500,price:13500,fee:22000,pack:3,tag:'สูงวัย',need:'slit'}
};
const LENS_Q={
 hilux:['ขอแว่นใส่ทั่วไปครับ งบไม่เยอะ เอาแบบคุ้มๆ','เพิ่งเริ่มใส่แว่นครั้งแรก เอาเลนส์ธรรมดาที่ราคาย่อมเยาพอ'],
 blue:['นั่งหน้าคอมทั้งวัน ตาล้ามมากเลย มีเลนส์ช่วยไหม','เล่นเกมดึกทุกคืน ปวดตาจากจอ ควรใช้เลนส์อะไรดี'],
 nulux:['ค่าสายตาสูง แว่นเก่าเลนส์หนามาก อยากได้บางลง','ไม่ชอบเลนส์หนาหนัก มีแบบบางเบาไหม'],
 long:['ใช้งานหนัก เลนส์เป็นรอยตลอด อยากได้ที่ทนๆ','ออกกำลังกายบ่อย แว่นเก่ารอยเต็มเลย'],
 sensity:['อยู่กลางแดดบ่อย ไม่อยากพกแว่นกันแดดอีกอัน','ขับรถทุกวัน อยากได้เลนส์ที่เข้มเองเวลาโดนแดด'],
 myo:['ลูกสายตาสั้นเพิ่มทุกปีเลย มีเลนส์ช่วยชะลอไหม','หมอบอกให้ควบคุมสายตาสั้นของลูก ควรใช้เลนส์อะไร'],
 prog:['อายุเยอะแล้ว มองใกล้ไม่ชัด ไม่อยากถอดแว่นเข้าออก','อยากมองทั้งไกลทั้งใกล้ในแว่นอันเดียว']
};
const FRAME_CATS={
 basic:{name:'กรอบเหลี่ยมคลาสสิก',wish:'กรอบเหลี่ยมสีดำ ดูเรียบร้อย',price:900,cost:300,sprites:['fr0_0','fr0_1','fr1_0','fr1_1','fr2_0','fr2_1','fr0_9','fr0_7'],free:1},
 color:{name:'กรอบสีแฟชั่น',wish:'กรอบสีสด แดงหรือน้ำเงินก็ได้',price:1500,cost:520,sprites:['fr0_5','fr0_6','fr1_5','fr1_6','fr2_5','fr2_6','fr1_8','fr2_8'],shelf:'disp1'},
 round:{name:'กรอบกลมเรโทร',wish:'กรอบกลมๆ สไตล์วินเทจ',price:2200,cost:780,sprites:['fr0_2','fr0_4','fr1_2','fr1_4','fr2_2','fr2_4','fr0_10','fr1_10'],shelf:'cab'},
 metal:{name:'กรอบโลหะไทเทเนียม',wish:'กรอบโลหะน้ำหนักเบา',price:3400,cost:1250,sprites:['fr0_3','fr1_3','fr2_3','fr0_8','fr2_9','fr1_9','fr2_10','fr1_7'],shelf:'glass'},
 sun:{name:'แว่นกันแดด',wish:'แว่นกันแดดเท่ๆ',price:2800,cost:1000,sprites:['fr3_1','fr3_4','fr3_5','fr4_0','fr4_4','fr5_1','fr5_4','fr5_5','fr3_0','fr4_8'],shelf:'spin'},
 fun:{name:'ดีไซเนอร์คอลเลกชัน',wish:'ทรงแปลกไม่ซ้ำใคร ของดีไซเนอร์',price:5200,cost:2000,sprites:['fr1_11','fr2_11','fr4_7','fr3_3','fr4_2','fr5_3','fr4_1','fr3_2'],shelf:'disp4'}
};
/* item: cat, id, name, desc, price, sprite, effect text */
const SHOP=[
 {id:'auto',cat:'exam',name:'Auto Refractor',spr:'auto',price:18000,fx:'วัดเร็วขึ้น 20% · ค่าบริการ +฿150',fee:150,lv:1},
 {id:'phoro',cat:'exam',name:'ชุด Phoropter',spr:'phoro',price:38000,fx:'ค่าบริการ +฿250 · ลูกค้าครอบครัวเริ่มมา',fee:250,lv:2},
 {id:'slit',cat:'exam',name:'Slit Lamp',spr:'slit',price:62000,fx:'ค่าบริการ +฿350 · ผู้สูงอายุเริ่มมา',fee:350,lv:3},
 {id:'fundus',cat:'exam',name:'กล้องถ่ายจอตา',spr:'fundus',price:110000,fx:'ตรวจจอตาได้ ค่าบริการ +฿600',fee:600,lv:4},
 {id:'oct',cat:'exam',name:'เครื่อง OCT',spr:'oct',price:190000,fx:'ตรวจเชิงลึก ค่าบริการ +฿1,000',fee:1000,lv:5},
 {id:'chair2',cat:'exam',name:'ห้องตรวจห้องที่ 2',spr:'chair',price:32000,fx:'วัดพร้อมกันได้ 2 คน'},
 {id:'edger',cat:'lab',name:'เครื่องฝนเลนส์อัตโนมัติ',spr:'edger',price:16000,fx:'ประกอบแว่นเร็วขึ้น 30%'},
 {id:'lmeter',cat:'lab',name:'Lens Meter',spr:'lmeter',price:14000,fx:'ความแม่นยำสูง ทิปเพิ่ม 5%'},
 {id:'ultra',cat:'lab',name:'เครื่องล้างอัลตราโซนิก',spr:'ultra',price:9000,fx:'ส่งมอบแว่นใสกิ๊ง ทิปเพิ่ม 5%'},
 {id:'uv',cat:'lab',name:'เตาอบเคลือบเลนส์',spr:'uv',price:42000,fx:'ประกอบแว่นเร็วขึ้นอีก 25%'},
 {id:'disp1',cat:'frame',name:'ตู้โชว์กรอบสีแฟชั่น',spr:'disp1',price:7000,fx:'ปลดล็อกกรอบสีแฟชั่น ฿1,500'},
 {id:'cab',cat:'frame',name:'ตู้กรอบกลมเรโทร',spr:'cab',price:14000,fx:'ปลดล็อกกรอบกลม ฿2,200'},
 {id:'spin',cat:'frame',name:'ชั้นหมุนแว่นกันแดด',spr:'spin',price:20000,fx:'ปลดล็อกแว่นกันแดด ฿2,800 · สายแฟชั่นเริ่มมา'},
 {id:'glass',cat:'frame',name:'ตู้กระจกไทเทเนียม',spr:'glass',price:34000,fx:'ปลดล็อกกรอบโลหะ ฿3,400'},
 {id:'disp4',cat:'frame',name:'ตู้ดีไซเนอร์',spr:'disp4',price:75000,fx:'ปลดล็อกดีไซเนอร์ ฿5,200'},
 {id:'seat1',cat:'shop',name:'โซฟาแถวที่สอง',spr:'sofa',price:8000,fx:'ที่นั่งรอจาก 3 เป็น 6'},
 {id:'seat2',cat:'shop',name:'เก้าอี้เสริม',spr:'arm',price:11000,fx:'ที่นั่งรอเพิ่มเป็น 8'},
 {id:'water',cat:'shop',name:'มุมน้ำดื่ม',spr:'water',price:3500,fx:'ลูกค้ารอได้นานขึ้น 10%'},
 {id:'plant',cat:'shop',name:'ต้นไม้ในร้าน',spr:'plant',price:2500,fx:'ลูกค้ารอได้นานขึ้น 5%'},
 {id:'mirror',cat:'shop',name:'กระจกลองแว่น',spr:'mirror',price:4500,fx:'เลือกกรอบตรงใจ ทิปเพิ่ม 5%'},
 {id:'shoe1',cat:'shop',name:'รองเท้าวิ่งรุ่น 1',spr:'ic_star',price:5000,fx:'คุณเดินเร็วขึ้น 25%'},
 {id:'shoe2',cat:'shop',name:'รองเท้าวิ่งรุ่น 2',spr:'ic_star',price:15000,fx:'คุณเดินเร็วขึ้นอีก 25%',req:'shoe1'},
 {id:'cnt2',cat:'shop',name:'เคาน์เตอร์หินอ่อน',spr:'cnt2',price:26000,fx:'คิดเงินเร็วขึ้น 40%'},
 {id:'cnt3',cat:'shop',name:'เคาน์เตอร์ไม้พรีเมียม',spr:'cnt3',price:60000,fx:'คิดเงินเร็วขึ้น 70% · ทิปเพิ่ม 5%',req:'cnt2'},
 {id:'van',cat:'shop',name:'สัญญาจัดส่งด่วน Hoya',spr:'ic_gift',price:12000,fx:'เลนส์ส่งถึงร้านเร็วขึ้นครึ่งหนึ่ง'}
];
const SHOPBY=Object.fromEntries(SHOP.map(s=>[s.id,s]));
const FLOORS=['ร้านเปิดใหม่','ไม้อบอุ่น','หินอ่อนหรู','อิฐลอฟต์','เทาพาสเทล','ไม้ก้างปลา','เทอร์ราซโซ','ฟ้าสดใส','ค่ำคืนโทนเข้ม','ครีมคลาสสิก','ตารางฟ้า','ม่วงบูทีค'];
const STAFF={
 od1:{role:'od',name:'หมอต้น',salary:2600,hire:9000,speed:1},
 od2:{role:'od',name:'หมอแพรว',salary:3000,hire:15000,speed:1.2},
 od3:{role:'od',name:'อาจารย์หมอวิทย์',salary:3800,hire:26000,speed:1.5},
 sl1:{role:'sales',name:'น้องเจมส์',salary:1300,hire:4000,speed:.9,acc:.75},
 sl2:{role:'sales',name:'น้องมิว',salary:1600,hire:7000,speed:1,acc:.85},
 sl3:{role:'sales',name:'พี่เกด',salary:2100,hire:12000,speed:1.15,acc:.95},
 te1:{role:'tech',name:'ช่างบิว',salary:1400,hire:5000,speed:1},
 te2:{role:'tech',name:'ช่างฝน',salary:1800,hire:9000,speed:1.25},
 te3:{role:'tech',name:'ช่างใหญ่',salary:2500,hire:16000,speed:1.6}
};
const ROLE={od:'นักทัศนมาตร (OD)',sales:'พนักงานขาย',tech:'ช่างประกอบแว่น'};
const ROLECAP={od:2,sales:2,tech:2};
/* who walks in, what they need */
const CUST=[
 {k:'c1',name:'หนุ่มออฟฟิศ',lens:['blue','nulux'],fr:['basic','metal','color'],req:null},
 {k:'c2',name:'สาวออฟฟิศ',lens:['blue','sensity'],fr:['color','round','metal'],req:null},
 {k:'c3',name:'นักศึกษา',lens:['hilux','blue'],fr:['basic','round'],req:null},
 {k:'c4',name:'นักศึกษาหญิง',lens:['hilux','nulux'],fr:['color','basic'],req:null},
 {k:'c9',name:'สายเกม',lens:['blue'],fr:['basic','color'],req:{day:2}},
 {k:'c7',name:'สายกีฬา',lens:['long','sensity'],fr:['sun','metal'],req:{own:'auto'}},
 {k:'c8',name:'สายแฟชั่น',lens:['sensity','nulux'],fr:['sun','fun','round'],req:{own:'spin'}},
 {k:'c10',name:'พ่อพาลูกมา',lens:['myo'],fr:['color','basic'],req:{own:'phoro'}},
 {k:'c5',name:'คุณลุง',lens:['prog','nulux'],fr:['metal','basic'],req:{own:'slit'}},
 {k:'c6',name:'คุณป้า',lens:['prog','long'],fr:['round','metal'],req:{own:'slit'}}
];
const DAY_LEN=150;

/* ---------- world layout (900x680) ---------- */
const SPOT={door:{x:450,y:330},frames:{x:180,y:372},lab:{x:730,y:372},home:{x:450,y:395},
 cash:{x:745,y:432},counter:{x:745,y:610}};
const CHAIRS=[{x:92,y:500,sx:165,sy:510},{x:92,y:640,sx:165,sy:650}];
const QUEUE=[{x:745,y:610},{x:650,y:630},{x:590,y:662}];
const SEATS=[{x:375,y:480},{x:450,y:480},{x:525,y:480},{x:375,y:610},{x:450,y:610},{x:525,y:610},{x:300,y:540},{x:600,y:540}];
const ZONE={exam:{x:20,y:400,w:240,h:280},counter:{x:600,y:430,w:300,h:250},lab:{x:590,y:170,w:290,h:220},frames:{x:30,y:170,w:290,h:220}};

/* ---------- state ---------- */
let S=null;              // saved state
let G=null;              // live, non-saved
let ATLAS=null;
const IMG={};
let ctx,cv;
let paused=0;
let last=0;
let dragging=null;
let screen='title';
let hover=null;

function fresh(code){return{v:5,layout:{},frames:{basic:12},rel:{},quests:{},lastRandom:0,minigame:true,kit:{},hosp:{done:{},last:{},best:{},called:{},reports:[],sched:null},rev:0,xp:0,level:1,ledger:blankLedger(),history:[],daily:[],accComm:0,dayStart:0,dayHits:0,staffData:{},areas:1,branches:[],trophies:{},ev:{beat:{},last:{},wins:0,bronze:0,silver:0,gold:0},stats:{exams:0,veryHappy:0,total:0,sales:0,lensSold:0,frameSold:0,premium:0,blue:0,kinds:{},fashion:0,sun:0,sport:0,computer:0,kids:0,seniors:0,families:0,vip:0,topItem:0,satSum:0,satN:0,dayMax:0,targetHit:0,streak:0,bestStreak:0,profitKing:0,events:0},code,money:15000,rep:3,day:1,dayT:0,owned:{},lens:{hilux:{listed:true,stock:8}},staff:[],floor:0,floors:{0:true},served:0,earned:0,sound:true};}
function newLive(){return{cust:[],jobs:[],player:{key:'od1',x:SPOT.home.x,y:SPOT.home.y,dir:'f',flip:false,tasks:[],task:null,prog:0,t:0},workers:[],deliveries:[],fx:[],spawn:3,seq:0,event:null,chairs:[null,null],queue:[],today:blankDay(),closing:false,summary:false,feed:[],seen:{},saveT:0};}
function blankDay(){return{rev:0,lens:0,frame:0,exam:0,tip:0,cost:0,served:0,left:0,buy:0};}
function own(id){return !!(S&&S.owned[id]);}
function seatCount(){return 3+(own('seat1')?3:0)+(own('seat2')?2:0);}
function chairCount(){return own('chair2')?2:1;}
function moveSpeed(){return 200*(1+(own('shoe1')?.25:0)+(own('shoe2')?.25:0));}
function patMul(){let m=1;if(own('water'))m*=1.1;if(own('plant'))m*=1.05;m*=1+Object.keys(S.floors).length*.01;return m;}
function examTime(sp){let t=7*((G&&G.dayFx&&G.dayFx.exam)||1);if(own('auto'))t*=.8;if(own('phoro'))t*=.92;return t/(sp||1);}
function labTime(sp){let t=8;if(own('edger'))t*=.7;if(own('uv'))t*=.75;return t/(sp||1);}
function cashTime(sp){let t=1.6;if(own('cnt2'))t*=.6;if(own('cnt3'))t*=.5;return t/(sp||1);}
function tipBonus(){return (own('lmeter')?.05:0)+(own('ultra')?.05:0)+(own('mirror')?.05:0)+(own('cnt3')?.05:0);}
function repMul(){return .85+S.rep*.05;}
function frameUnlocked(c){const f=FRAME_CATS[c];return f.free||own(f.shelf);}
function lensState(id){return S.lens[id]||(S.lens[id]={listed:false,stock:0});}
function lensAvailable(id){const l=LENSES[id];return (!l.need||own(l.need))&&(!l.course||courseDone(l.course));}

/* ---------- sprites ---------- */
function spr(key,dx,dy,dw,dh,flip){const a=ATLAS.pos[key];if(!a)return;
 if(flip){ctx.save();ctx.translate(dx+dw,dy);ctx.scale(-1,1);ctx.drawImage(IMG.atlas,a[0],a[1],a[2],a[3],0,0,dw,dh);ctx.restore();}
 else ctx.drawImage(IMG.atlas,a[0],a[1],a[2],a[3],dx,dy,dw,dh);}
function sprFeet(key,x,y,h,flip){const a=ATLAS.pos[key];if(!a)return;const w=a[2]/a[3]*h;spr(key,x-w/2,y-h,w,h,flip);}
function sprHTML(key,h,cls){const a=ATLAS.pos[key];if(!a)return'';const r=h/a[3];
 return `<span class="spr ${cls||''}" aria-hidden="true" style="display:inline-block;flex:none;width:${(a[2]*r).toFixed(1)}px;height:${h}px;background-position:-${(a[0]*r).toFixed(1)}px -${(a[1]*r).toFixed(1)}px;background-size:${(IMG.atlas.naturalWidth*r).toFixed(1)}px ${(IMG.atlas.naturalHeight*r).toFixed(1)}px"></span>`;}

/* ---------- audio ---------- */
function beep(type){softPlay(type);}

/* ---------- storage ---------- */
const KEY=c=>'socialeyewear.save.'+c, LAST='socialeyewear.last';
const store={ok:true,
 get(k){try{return localStorage.getItem(k);}catch(e){this.ok=false;return null;}},
 set(k,v){try{localStorage.setItem(k,v);return true;}catch(e){this.ok=false;return false;}},
 del(k){try{localStorage.removeItem(k);}catch(e){}},
 used(){let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=(k.length+(localStorage.getItem(k)||'').length)*2;}}catch(e){}return n;}};
/* เซฟกลาง: การ์ดเกมใช้ฐานข้อมูลของ artifact, Vercel ใช้ /api/save, ที่อื่นเก็บในเครื่อง */
const cloud={kind:null,db:null,ready:null,rev:0,conflict:false,conflictShown:false,readOnly:false,state:'',busy:null,pending:null,
 init(){return this.ready||(this.ready=(async()=>{
   for(let i=0;i<15&&!window.claude&&window!==window.top;i++)await new Promise(r=>setTimeout(r,100));
   try{if(window.claude&&window.claude.use){this.db=await window.claude.use('db');if(this.db){this.kind='db';return;}}}catch(e){}
   try{if(/^https?:/.test(location.protocol)){const r=await fetch('/api/save?ping=1',{signal:AbortSignal.timeout(6000)});if(r.ok&&(await r.json()).ok){this.kind='api';return;}}}catch(e){}
   this.kind='local';})());},
 async get(code){
  if(this.kind==='db'){const d=await this.db.doc('saves/'+code).get();return d.exists?d.data().json:null;}
  const r=await fetch('/api/save?code='+code,{signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('http');return (await r.json()).json;},
 async put(code,json,rev,force){
  if(this.kind==='db'){const ref=this.db.doc('saves/'+code);if(!force){const d=await ref.get();if(d.exists&&(d.data().rev||0)>=rev)return{conflict:true};}await ref.set({json,rev,at:Date.now()});return{ok:true};}
  const r=await fetch('/api/save',{method:'POST',keepalive:json.length<60000,headers:{'Content-Type':'application/json'},body:JSON.stringify({code,json,force:!!force})});
  if(r.status===409)return{conflict:true};if(!r.ok)throw new Error('http');return{ok:true};},
 async del(code){if(this.kind==='db')await this.db.doc('saves/'+code).delete();else if(this.kind==='api')await fetch('/api/save?code='+code,{method:'DELETE'});},
 send(code,obj,force){if(this.kind==='local'||!this.kind)return Promise.resolve();if(this.conflict&&!force)return Promise.resolve();
  this.pending={code,obj,force};if(!this.busy)this.busy=this.drain().finally(()=>{this.busy=null;});return this.busy;},
 async drain(){while(this.pending){const{code,obj,force}=this.pending;this.pending=null;const rev=this.rev+1;
   try{const r=await this.put(code,JSON.stringify(Object.assign({},obj,{rev})),rev,force);
    if(r.conflict){this.conflict=true;this.state='conflict';this.pending=null;return;}
    this.rev=rev;this.conflict=false;this.conflictShown=false;this.state='saved';}
   catch(e){this.state=e&&e.code==='invalid_argument'?'readonly':'offline';this.readOnly=this.state==='readonly';}}},
 flush(){return this.busy||Promise.resolve();},
 label(){if(this.kind==='local'||!this.kind)return'เซฟในเครื่องนี้เท่านั้น';return{conflict:'มีเครื่องอื่นเซฟรหัสนี้ใหม่กว่า',offline:'เซฟกลางไม่สำเร็จ เก็บไว้ในเครื่องก่อน',readonly:'ลิงก์นี้ดูเซฟได้ แต่บันทึกกลางไม่ได้'}[this.state]||'เซฟกลาง โหลดจากเครื่องไหนก็ได้';}
};
async function hasSave(code){await cloud.init();if(cloud.kind!=='local'){await cloud.flush();if(await cloud.get(code))return true;}return !!store.get(KEY(code));}
function saveGame(quiet,force){if(!S)return false;S.savedAt=Date.now();const code=S.code,obj=JSON.parse(JSON.stringify(S));
 const ok=store.set(KEY(code),JSON.stringify(Object.assign({},obj,{rev:cloud.rev})));if(ok)store.set(LAST,code);
 const done=cloud.send(code,obj,force);
 if(!quiet){if(cloud.kind==='local'||!cloud.kind)toast(ok?`บันทึกในเครื่องนี้แล้ว · รหัส ${code}`:'บันทึกไม่ได้ เบราว์เซอร์นี้ปิดพื้นที่เก็บข้อมูล');
  else done.then(()=>{if(cloud.state==='saved')toast(`เซฟกลางแล้ว · ใส่รหัส ${code} โหลดได้ทุกเครื่อง`);else toast(cloud.label());});}
 return ok;}
function applySave(code,raw){const o=JSON.parse(raw);S=Object.assign(fresh(code),o);S.code=code;migrate();cloud.rev=o.rev||0;cloud.conflict=false;cloud.conflictShown=false;cloud.state='';store.set(KEY(code),raw);store.set(LAST,code);}
/* คืนค่า ok | none | error */
async function loadGame(code){await cloud.init();await cloud.flush();const local=store.get(KEY(code));
 cloud.needUpload=false;
 try{
  if(cloud.kind==='local'){if(!local)return'none';applySave(code,local);return'ok';}
  const raw=await cloud.get(code);
  if(raw){applySave(code,raw);return'ok';}
  if(local){applySave(code,local);cloud.rev=0;cloud.needUpload=true;return'ok';}
  return'none';
 }catch(e){if(e instanceof SyntaxError)return'corrupt';if(local){try{applySave(code,local);}catch(x){return'corrupt';}cloud.state='offline';toast('เชื่อมเซฟกลางไม่ได้ ใช้เซฟล่าสุดในเครื่องนี้');return'ok';}return'error';}}
function exportSave(){return btoa(unescape(encodeURIComponent(JSON.stringify(S))));}
function importSave(txt){const o=JSON.parse(decodeURIComponent(escape(atob(txt.trim()))));if(!o||typeof o.money!=='number'||!/^\d{4}$/.test(o.code))throw 0;return o;}

/* ---------- UI helpers ---------- */
let toastT=0;
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2400);}
function log(m,c){if(!G)return;G.feed.unshift({m,c});G.feed=G.feed.slice(0,4);renderRail(true);}
function openModal(html,opts){const m=$('#modal');m.innerHTML=`<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;m.hidden=false;m.firstChild.classList.toggle('wide',!!(opts&&opts.wide));m._o=opts||{};if(!m._p){paused++;m._p=true;}m.querySelector('.sheet').scrollTop=0;}
function closeModal(){const m=$('#modal');m.hidden=true;m.innerHTML='';if(m._p){paused=Math.max(0,paused-1);m._p=false;}const f=m._o&&m._o.onClose;m._o={};if(f)f();}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden&&!$('#modal')._o.lock)closeModal();});

/* ---------- title & code flow ---------- */
function showTitle(){screen='title';paused=0;S=null;G=null;closeModal();$('#play').hidden=true;const t=$('#title');t.hidden=false;
 const last=store.get(LAST);
 t.innerHTML=`<img class="scene" src="${IMG.title.src}" alt="หน้าร้าน Social Eyewear พร้อมทีมงานและลูกค้า">
 <nav aria-label="เมนูหลัก">
  <button class="imgbtn" id="bStart" title="${last?'เล่นต่อรหัส '+last:'เริ่มเล่น'}">${sprHTML('btn_start',150)}<span class="vh">START เล่นต่อ</span></button>
  <button class="imgbtn" id="bNew">${sprHTML('btn_new',80)}<span class="vh">NEW GAME เกมใหม่</span></button>
  <button class="imgbtn" id="bLoad">${sprHTML('btn_load',80)}<span class="vh">LOAD GAME โหลดเซฟ</span></button>
  <button class="imgbtn" id="bOpt">${sprHTML('btn_opt',80)}<span class="vh">OPTION ตั้งค่า</span></button>
  <span class="mini verline">เวอร์ชัน ${GAME_VERSION}</span>
 </nav>`;
 $('#bStart').onclick=async()=>{if(!last)return pinDialog('new');toast('กำลังโหลดเซฟ…');const r=await loadGame(last);if(r==='ok')startPlay();else if(r==='corrupt'){toast('เซฟรหัสนี้เสีย อ่านไม่ได้ เกมไม่ได้เขียนทับข้อมูลเดิม');}else pinDialog(r==='error'?'load':'new');};
 $('#bNew').onclick=()=>pinDialog('new');
 $('#bLoad').onclick=()=>pinDialog('load');
 $('#bOpt').onclick=()=>optionDialog();
}
function pinDialog(mode){let pin='';
 const title=mode==='new'?'ตั้งรหัสเซฟ 4 หลัก':'ใส่รหัสเซฟ 4 หลัก';
 const sub=mode==='new'?'ใครใส่รหัสนี้ก็โหลดเซฟนี้ได้ จึงควรเลือกเลขที่เดายาก และบอกเฉพาะคนที่เล่นด้วยกัน':'ใส่รหัสเดียวกัน แล้วเล่นเซฟเดียวกันต่อได้';
 const draw=(err)=>{openModal(`<div class="sheethead"><h2>${title}</h2></div><p class="note">${sub}</p>
  <div class="pin">${[0,1,2,3].map(i=>`<span>${pin[i]||''}</span>`).join('')}</div>
  <p class="err" role="alert">${err||''}</p>
  <div class="pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="btn plain" data-n="${n}">${n}</button>`).join('')}<button class="btn red" data-x="1">ลบ</button><button class="btn plain" data-n="0">0</button><button class="btn green" data-go="1">ตกลง</button></div>
  <div class="row"><button class="btn plain" data-c="1">ยกเลิก</button></div>`);
  const m=$('#modal');
  m.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{if(pin.length<4){pin+=b.dataset.n;draw();}});
  m.querySelector('[data-x]').onclick=()=>{pin=pin.slice(0,-1);draw();};
  m.querySelector('[data-c]').onclick=()=>closeModal();
  m.querySelector('[data-go]').onclick=()=>{
   if(pin.length<4)return draw('ใส่ให้ครบ 4 หลัก');
   draw('กำลังตรวจรหัส…');const box=$('#modal');box.querySelectorAll('button').forEach(x=>x.disabled=true);
   (async()=>{
    if(mode==='new'){let e;try{e=await hasSave(pin);}catch(x){return draw('เชื่อมเซฟกลางไม่ได้ ลองใหม่อีกครั้ง');}
     if(e)return draw(`รหัส ${pin} มีเซฟอยู่แล้ว เปลี่ยนรหัส หรือกด LOAD GAME`);
     S=fresh(pin);cloud.rev=0;cloud.conflict=false;cloud.state='';closeModal();startPlay(true);}
    else{const r=await loadGame(pin);
     if(r==='none')return draw(`ไม่พบเซฟรหัส ${pin}`);if(r==='corrupt')return draw(`เซฟรหัส ${pin} เสีย อ่านไม่ได้ เกมไม่ได้เขียนทับข้อมูลเดิม`);if(r==='error')return draw('เชื่อมเซฟกลางไม่ได้ ลองใหม่อีกครั้ง');
     closeModal();startPlay();}
   })();
  };};
 draw();
}
function optionDialog(){
 const kb=store.used()/1024;
 const inGame=!!S;
 openModal(`<div class="sheethead"><h2>ตั้งค่า</h2><button class="btn plain" data-c="1">ปิด</button></div>
 <div class="row"><button class="btn" id="oMusic">เพลง: ${SND.on.music?'เปิด':'ปิด'}</button><button class="btn" id="oSfx">เสียงกด: ${SND.on.sfx?'เปิด':'ปิด'}</button>${inGame?`<button class="btn" id="oMini">มินิเกมวัดตา: ${S.minigame===false?'ปิด':'เปิด'}</button>`:''}</div>
 <div class="card"><h3>เซฟของเกมนี้</h3>
  <p class="mini">สถานะ: ${cloud.label()}</p>
  <p class="note">${cloud.kind==='local'||!cloud.kind?'เว็บนี้ยังไม่ได้ต่อฐานข้อมูล เซฟจึงอยู่ในเบราว์เซอร์นี้ ใช้ไป '+kb.toFixed(1)+' KB':'ใครใส่รหัสเดียวกันก็โหลดและเล่นต่อเซฟเดียวกันได้ รหัส 4 หลักไม่ใช่รหัสผ่าน มีเพียง 10,000 แบบ คนอื่นอาจเดาถูกได้'}</p></div>
 <div class="card"><h3>สำรองเซฟเป็นข้อความ</h3>
 ${inGame?`<p class="note">คัดลอกเก็บไว้ หรือนำไปวางบนเว็บเกมอีกชุด</p><textarea id="oExp" readonly aria-label="ข้อความเซฟ">${exportSave()}</textarea><div class="row"><button class="btn" id="oCopy">คัดลอก</button></div>`:''}
 <p class="note">วางข้อความเซฟที่คัดลอกมา</p><textarea id="oImp" aria-label="วางข้อความเซฟ"></textarea><div class="row"><button class="btn green" id="oImpB">นำเข้าเซฟ</button></div><p class="err" id="oErr"></p></div>
 ${inGame?`<div class="row"><button class="btn red" id="oDel">ลบเซฟรหัส ${S.code}</button></div>`:''}`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;
 $('#oMusic').onclick=()=>{setAudio('music',!SND.on.music);closeModal();optionDialog();};$('#oSfx').onclick=()=>{setAudio('sfx',!SND.on.sfx);closeModal();optionDialog();};
 if(inGame){$('#oMini').onclick=()=>{S.minigame=S.minigame===false;closeModal();optionDialog();};
  $('#oCopy').onclick=()=>{const t=$('#oExp');t.select();try{navigator.clipboard.writeText(t.value).then(()=>toast('คัดลอกแล้ว')).catch(()=>toast('เลือกข้อความไว้แล้ว กดคัดลอกเองได้เลย'));}catch(e){}};
  $('#oDel').onclick=()=>{const b=$('#oDel');if(b.dataset.a){const c=S.code;cloud.del(c).catch(()=>{});store.del(KEY(c));store.del(LAST);S=null;showTitle();}else{b.dataset.a=1;b.textContent='กดอีกครั้งเพื่อยืนยันการลบ';}};}
 $('#oImpB').onclick=()=>{try{const o=importSave($('#oImp').value);showTitleThen(o);}catch(e){$('#oErr').textContent='ข้อความเซฟไม่ถูกต้อง ลองคัดลอกใหม่อีกครั้ง';}};
}
async function showTitleThen(o){closeModal();await cloud.init();await cloud.flush();applySave(o.code,JSON.stringify(o));startPlay(false,true);toast(`นำเข้าเซฟรหัส ${o.code} แล้ว`);}

/* ---------- start ---------- */
function startPlay(isNew,force){screen='play';railKey='';paused=0;G=newLive();$('#title').hidden=true;$('#play').hidden=false;
 S.staff.forEach(addWorker);if(isNew||force||cloud.needUpload)saveGame(true,force);cloud.needUpload=false;sdOf('owner');applyLayout();refreshQuests();checkTrophies();renderRail();
 if(isNew)welcome();else toast(`ยินดีต้อนรับกลับ · วันที่ ${dayInMonth(S.day)} เดือน ${monthOf(S.day)}`);}
function welcome(){openModal(`<div class="sheethead"><h2>เปิดร้านวันแรก</h2></div>
 <div class="say">${sprHTML('od1f',96)}<p>รหัสเซฟของคุณคือ <b>${S.code}</b> วันนี้คุณทำทุกอย่างเองก่อน พอมีเงินค่อยจ้างคนและซื้อเครื่องเพิ่ม</p></div>
 <table class="ledger"><tbody>
 <tr><td>1. คลิกลูกค้า</td><td>ถ้าขึ้นคลิปบอร์ด ลากไปห้องตรวจเพื่อวัดตา</td></tr>
 <tr><td>2. ขึ้นเครื่องหมาย ?</td><td>คุยแล้วแนะนำเลนส์ให้ตรงอาการ ถ้าไม่มีของ สั่งจาก Hoya</td></tr>
 <tr><td>3. ขึ้นรูปแว่น</td><td>วิ่งไปชั้นวาง เลือกกรอบที่ลูกค้าอยากได้</td></tr>
 <tr><td>4. ขึ้นรูปประแจ</td><td>คลิกโต๊ะช่าง แล้วประกอบแว่น</td></tr>
 <tr><td>5. ขึ้นเหรียญ</td><td>ลากลูกค้าไปเคาน์เตอร์ แล้วคลิกเพื่อคิดเงิน</td></tr>
 </tbody></table><p class="note">1 เดือนในเกมมี ${MONTH_DAYS} วัน สิ้นเดือนต้องจ่ายค่าเช่า ค่าน้ำค่าไฟ เงินเดือน และค่าคอม เปิดแผนที่แข่งเพื่อท้าแข่งร้านอื่น</p><div class="row"><button class="btn gold" data-c="1">เปิดร้าน</button></div>`);
 $('#modal [data-c]').onclick=closeModal;}

/* ---------- customers ---------- */
function eligibleCustomers(){return CUST.filter(c=>{const r=c.req;if(!r)return true;if(r.own&&!own(r.own))return false;if(r.day&&S.day<r.day)return false;return true;});}
function maxExamLv(){let n=0;SHOP.forEach(s=>{if(s.cat==='exam'&&s.lv&&own(s.id))n=Math.max(n,s.lv);});return n;}
function spawnCustomer(){
 const free=[];for(let i=0;i<seatCount();i++)if(!G.cust.some(c=>c.seat===i))free.push(i);
 if(!free.length){G.today.left++;log('ที่นั่งเต็ม ลูกค้าเดินกลับไป','r');return;}
 const pool=eligibleCustomers();const t=pick(pool.flatMap(x=>Array(1+relLv(x.k)).fill(x)));
 const lensId=pick(t.lens.filter(l=>lensAvailable(l)).concat(t.lens.includes('hilux')?['hilux']:[]))||'hilux';
 let frCats=t.fr.filter(frameUnlocked); if(!frCats.length)frCats=['basic'];
 const frCat=Math.random()<.92?pick(frCats):pick(t.fr);
 const r=G.forceRepair?.99:Math.random();G.forceRepair=0;
 let steps;
 if(r<.42)steps=['exam','lens','frame','lab','pay'];
 else if(r<.72)steps=['lens','frame','lab','pay'];
 else if(r<.86)steps=['exam','pay'];
 else if(r<.95)steps=['frame','pay'];
 else steps=['repair','lab','pay'];
 const lv=Math.floor(rnd(0,maxExamLv()+1));
 const c={id:++G.seq,k:t.k,name:t.name,x:SPOT.door.x,y:SPOT.door.y,dir:'f',flip:false,steps,si:0,lens:lensId,frCat,examLv:lv,seat:free[0],pat:100,
  rate:(100/(rnd(80,110)+Math.max(0,8-S.day)*3))/patMul()/((G.dayFx&&G.dayFx.pat)||1),vip:!!G.forceVip||(S.rep>=3.2&&Math.random()<.08+relLv(t.k)*.01),sold:[],comm:0,bill:[],sat:0,phase:'walk',tx:0,ty:0,fade:0,q:pick(LENS_Q[lensId]),owner:null,t:Math.random()*5};
 const seat=SEATS[c.seat];c.tx=seat.x;c.ty=seat.y;G.cust.push(c);G.forceVip=0;if(relLv(t.k)>0)G.fx.push({x:c.x,y:c.y-110,t:1.4,text:REL[relLv(t.k)][0],col:'#6a3fc4'});beep('door');
}
function step(c){return c.steps[c.si];}
function sendSeat(c){const s=SEATS[c.seat];c.tx=s.x;c.ty=s.y;c.phase='walk';}
function leave(c,happy){if(c.chair!=null){G.chairs[c.chair]=null;c.chair=null;}
 const qi=G.queue.indexOf(c);if(qi>=0){G.queue.splice(qi,1);reQueue();}
 G.jobs=G.jobs.filter(j=>j.c!==c);
 c.seat=-1;c.tx=SPOT.door.x;c.ty=SPOT.door.y-10;c.phase=happy?'leaving':'angry';c.owner=null;
 if(!happy){G.today.left++;S.rep=clamp(S.rep-.12,1,5);log(`${c.name} รอไม่ไหว เดินออกจากร้าน`,'r');beep('bad');G.fx.push({x:c.x,y:c.y-100,t:1.6,text:'ไม่รอแล้ว!',col:'#d8324a'});}}
function dropOwner(c,who){if(c.owner===who)c.owner=null;}

/* --- actions --- */
function toExam(c){if(c.phase!=='idle'||step(c)!=='exam')return false;
 const i=[0,1].slice(0,chairCount()).find(n=>!G.chairs[n]);
 if(i===undefined){toast('ห้องตรวจไม่ว่าง รออีกนิด');return false;}
 G.chairs[i]=c;c.chair=i;c.tx=CHAIRS[i].x;c.ty=CHAIRS[i].y+22;c.phase='walk';c.then='atChair';beep('ok');
 if(!G.workers.some(w=>w.role==='od'))assignExamPlayer(c);
 return true;}
function assignExamPlayer(c){if(c.owner)return;c.owner='player';const chair=CHAIRS[c.chair];
 pushTask({kind:'exam',c,x:chair.sx,y:chair.sy,dur:examTime(1),label:'วัดสายตา'});}
function toCounter(c){if(c.phase!=='idle'||step(c)!=='pay')return false;
 if(G.queue.length>=QUEUE.length){toast('คิวเคาน์เตอร์เต็ม');return false;}
 G.queue.push(c);reQueue();beep('ok');return true;}
function reQueue(){G.queue.forEach((c,i)=>{c.tx=QUEUE[i].x;c.ty=QUEUE[i].y;c.phase='walk';c.then='counter';});}
function pushTask(t){const p=G.player;if(p.tasks.length>=6){toast('งานในมือเต็ม ทำของเดิมให้เสร็จก่อน');if(t.c)dropOwner(t.c,'player');return false;}p.tasks.push(t);return true;}

function onCustomerClick(c){
 if(c.phase==='counter'){if(G.queue[0]!==c){toast('คิดเงินคนหน้าก่อน');return;}
  if(!c.owner){c.owner='player';pushTask({kind:'cash',c,x:SPOT.cash.x,y:SPOT.cash.y,dur:cashTime(1)});}return;}
 if(c.phase==='atChair'){if(!c.owner)assignExamPlayer(c);return;}
 if(c.phase!=='idle'||c.owner)return;
 const st=step(c);
 if(st==='exam')toExam(c);
 else if(st==='pay')toCounter(c);
 else if(st==='lens'){c.owner='player';pushTask({kind:'lens',c,x:c.x+50,y:c.y+6,dur:.2});}
 else if(st==='frame'){c.owner='player';pushTask({kind:'frame',c,x:SPOT.frames.x,y:SPOT.frames.y,dur:.3});}
 else if(st==='repair'){c.owner='player';pushTask({kind:'repairTalk',c,x:c.x+50,y:c.y+6,dur:.3});}
}
function onLabClick(){const j=G.jobs.find(j=>!j.owner);if(!j){toast('ยังไม่มีงานที่โต๊ะช่าง');return;}j.owner='player';pushTask({kind:'lab',j,x:SPOT.lab.x,y:SPOT.lab.y});}

function bill(c,kind,label,amount,stat){c.bill.push({label,amount,stat});G.today[stat]=(G.today[stat]||0)+amount;}
function completeExam(c,who){S.stats.exams++;staffXp(who);const base=250;let fee=base;SHOP.forEach(s=>{if(s.cat==='exam'&&s.lv&&own(s.id)&&s.lv<=Math.max(1,c.examLv))fee+=s.fee;});
 bill(c,'exam','ค่าตรวจวัดสายตา',fee,'exam');if(who&&who.key)workerComm(c,who,fee*COMM.od);G.fx.push({x:c.x,y:c.y-100,t:1.2,text:'ค่าตรวจ '+fmt(fee),col:'#2f6fe0'});
 if(c.chair!=null){G.chairs[c.chair]=null;c.chair=null;}
 sendSeat(c);c.then='idle';c.si++;c.owner=null;c.pat=Math.min(100,c.pat+15);
 if(c.si>=c.steps.length)leave(c,true);beep('ok');}
function workerComm(c,who,amount){if(who&&who.key)c.comm=(c.comm||0)+amount;}
function chooseLens(c,id,who){const l=LENSES[id],ls=lensState(id);ls.stock--;const ok=lensKind(id)===c.lens;
 const price=lensPrice(id)*(c.vip?1.5:1);bill(c,'lens','เลนส์ '+l.name,price,'lens');c.sold.push({t:'lens',id});
 if(who&&who.role==='sales')workerComm(c,who,price*COMM.sales);
 c.sat+=(ok?1.2:-1)+satBonus()*.5+(ok&&l.premium?.3:0);c.chosenLens=id;
 G.fx.push({x:c.x,y:c.y-100,t:1.3,text:ok?'ตรงใจเลย!':'ไม่ค่อยตรงที่ต้องการ…',col:ok?'#2f9e3f':'#d8324a'});
 if(!ok){c.pat=Math.max(5,c.pat-20);S.rep=clamp(S.rep-.05,1,5);}
 c.si++;c.owner=null;c.phase='idle';beep(ok?'ok':'bad');}
function chooseFrame(c,cat,who){const f=FRAME_CATS[cat];const ok=cat===c.frCat;const price=f.price*repMul()*(c.vip?1.5:1);
 bill(c,'frame','กรอบ '+f.name,price,'frame');c.sold.push({t:'frame',cat});S.stats.frameSold++;S.frames[cat]=Math.max(0,frameStock(cat)-1);c.sat+=ok?1:-.6;
 if(who&&who.role==='sales')workerComm(c,who,price*COMM.sales);
 G.fx.push({x:SPOT.frames.x,y:SPOT.frames.y-90,t:1.2,text:ok?'ถูกใจกรอบนี้!':'ก็ใส่ได้นะ…',col:ok?'#2f9e3f':'#d8324a'});
 beep(ok?'ok':'bad');c.owner=null;c.si++;
 if(step(c)==='lab'){G.jobs.push({c,t:0,dur:labTime(1),owner:null});c.phase='busy';}else c.phase='idle';}
function startRepair(c){bill(c,'frame','ค่าซ่อม/ดัดแว่น',250,'frame');c.si++;c.owner=null;G.jobs.push({c,t:0,dur:labTime(1)*.5,owner:null});c.phase='busy';}
function completeJob(j,who){G.jobs=G.jobs.filter(x=>x!==j);const c=j.c;if(!G.cust.includes(c))return;staffXp(who);if(who&&who.key)workerComm(c,who,COMM.tech);c.si++;c.phase='idle';c.pat=Math.min(100,c.pat+20);c.owner=null;
 G.fx.push({x:SPOT.lab.x,y:SPOT.lab.y-110,t:1.1,text:'แว่นเสร็จแล้ว',col:'#2f9e3f'});beep('ok');if(c.si>=c.steps.length)leave(c,true);}
function staffXp(who){addStaffXp(who&&who.key?who.key:'owner',10);}
function completeCash(c,who){staffXp(who);const total=c.bill.reduce((a,b)=>a+b.amount,0);
 const rate=clamp(.02+c.pat/100*.1+c.sat*.04+tipBonus()+(c.vip?.1:0)+relLv(c.k)*.015,0,.45);const tip=total*rate;
 c.bill.forEach(b=>earn(b.stat,b.amount));earn('tip',tip);S.accComm+=c.comm||0;
 S.earned+=total+tip;S.served++;S.stats.total+=total;G.today.rev+=total;G.today.tip+=tip;G.today.served++;
 S.stats.dayMax=Math.max(S.stats.dayMax,G.today.served);const score=recordSale(c);const sl=satLabel(score);if(score>=85)S.stats.veryHappy++;if(score>=50)S.rel[c.k]=(S.rel[c.k]||0)+1;G.today.satSum=(G.today.satSum||0)+score;addXp(8+Math.round(total/400)+(score>=85?4:0));eventAdd(total,score);G.fx.push({x:c.x,y:c.y-132,t:1.5,text:sl[0],col:sl[1]});
 const dRep=(c.sat>=1?.08:c.sat>=0?.03:-.04)+(c.pat>50?.03:0);S.rep=clamp(S.rep+dRep,1,5);
 G.fx.push({x:c.x,y:c.y-104,t:1.5,text:'+'+fmt(total+tip),col:'#2f9e3f',big:true});beep('coin');
 log(`${c.name}${c.vip?' (VIP)':''} จ่าย ${fmt(total)} + ทิป ${fmt(tip)}`,'g');
 G.queue.shift();c.si=c.steps.length;leave(c,true);reQueue();checkTrophies();checkQuests();renderRail();}

/* ---------- entity movement ---------- */
function walkEntity(e,tx,ty,speed,dt){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
 if(d<3){e.x=tx;e.y=ty;e.moving=false;return true;}
 const st=Math.min(d,speed*dt);e.x+=dx/d*st;e.y+=dy/d*st;e.moving=true;e.t=(e.t||0)+dt;
 if(Math.abs(dx)>Math.abs(dy)){e.dir='s';e.flip=dx>0;}else{e.dir=dy>0?'f':'b';e.flip=false;}return false;}

function runPlayerTask(dt){const p=G.player;if(keyMove(dt))return;
 if(!p.task&&p.tasks.length){p.task=p.tasks.shift();p.prog=0;}
 const t=p.task;if(!t){if(!p.stay)navWalk(p,SPOT.home.x,SPOT.home.y,moveSpeed()*.7,dt);else p.moving=false;return;}
 if(t.c&&!G.cust.includes(t.c)){if(t.kind==='deliver')p.carry=null;p.task=null;return;}
 if(t.c&&t.kind==='lens'){t.x=t.c.x+50;t.y=t.c.y+6;}
 p.stay=false;if(!navWalk(p,t.x,t.y,moveSpeed()*(KEYS.shift?1.5:1),dt))return;
 p.dir=t.kind==='cash'?'f':p.dir;
 const dur=t.kind==='lab'?t.j.dur:t.dur;
 if(t.kind==='lab'){if(!G.jobs.includes(t.j)){p.task=null;return;}t.j.t+=dt;if(t.j.t>=t.j.dur){completeJob(t.j);p.task=null;}return;}
 if(t.kind==='exam'&&t.c.phase!=='atChair')return;
 p.prog+=dt;
 if(p.prog>=dur){p.task=null;p.prog=0;finishTask(t);}
}
function finishTask(t){const c=t.c;
 switch(t.kind){
  case 'exam':examMinigame(c,()=>{if(G.cust.includes(c))completeExam(c);});break;
  case 'deliver':G.player.carry=null;chooseFrame(c,t.cat);renderRail();break;
  case 'cash':completeCash(c);break;
  case 'lens':lensDialog(c);break;
  case 'frame':frameDialog(c);break;
  case 'repairTalk':startRepair(c);break;
 }}

/* --- staff AI --- */
function addWorker(key){const d=STAFF[key];sdOf(key);G.workers.push({key,role:d.role,get speed(){return d.speed*levelSpeed(key);},acc:d.acc||1,x:SPOT.door.x,y:SPOT.door.y,dir:'f',flip:false,task:null,prog:0,t:Math.random()*5});}
function workerTick(w,dt){
 if(isTraining(w.key))return;
 if(w.task){const t=w.task;
  if(t.c&&!G.cust.includes(t.c)){w.task=null;return;}
  if(t.j&&!G.jobs.includes(t.j)){w.task=null;return;}
  if(!navWalk(w,t.x,t.y,170*w.speed,dt))return;
  if(t.kind==='lab'){t.j.t+=dt*w.speed;if(t.j.t>=t.j.dur){completeJob(t.j,w);w.task=null;}return;}
  if(t.kind==='exam'&&t.c.phase!=='atChair')return;
  w.prog+=dt;if(w.prog<t.dur)return;w.prog=0;w.task=null;const c=t.c;
  if(t.kind==='exam')completeExam(c,w);
  else if(t.kind==='cash')completeCash(c,w);
  else if(t.kind==='lens'){const others=Object.keys(S.lens).filter(k=>lensKind(k)!==c.lens&&S.lens[k].listed&&S.lens[k].stock>0&&lensAvailable(k));let id=bestLensFor(c.lens);const acc=Math.min(1,w.acc+sdOf(w.key).courses.length*.03);if(others.length&&(!id||Math.random()>acc))id=pick(others);if(id)chooseLens(c,id,w);else c.owner=null;}
  else if(t.kind==='frame'){let cat=c.frCat;if(!frameUnlocked(cat)||Math.random()>w.acc)cat=frameUnlocked(c.frCat)&&Math.random()<.5?c.frCat:'basic';if(frameStock(cat)<1)cat=Object.keys(FRAME_CATS).find(k=>frameUnlocked(k)&&frameStock(k)>0);if(cat)chooseFrame(c,cat,w);else c.owner=null;}
  else if(t.kind==='repairTalk')startRepair(c);
  return;}
 const idle=()=>navWalk(w,w.hx,w.hy,120,dt);
 if(w.role==='od'){w.hx=CHAIRS[0].sx;w.hy=CHAIRS[0].sy-70;
  const seated=G.cust.find(c=>c.phase==='atChair'&&!c.owner);
  if(seated){seated.owner=w;const ch=CHAIRS[seated.chair];w.task={kind:'exam',c:seated,x:ch.sx,y:ch.sy,dur:examTime(w.speed)};return;}
  const waiter=G.cust.find(c=>c.phase==='idle'&&step(c)==='exam'&&!c.owner);
  if(waiter&&[0,1].slice(0,chairCount()).some(n=>!G.chairs[n])){toExam(waiter);}
 }else if(w.role==='tech'){w.hx=SPOT.lab.x-30;w.hy=SPOT.lab.y+6;
  const j=G.jobs.find(j=>!j.owner);if(j){j.owner=w;w.task={kind:'lab',j,x:SPOT.lab.x+rnd(-40,40),y:SPOT.lab.y};return;}
 }else{w.hx=SPOT.cash.x-95;w.hy=SPOT.cash.y;
  const front=G.queue[0];
  if(front&&front.phase==='counter'&&!front.owner){front.owner=w;w.task={kind:'cash',c:front,x:SPOT.cash.x,y:SPOT.cash.y,dur:cashTime(w.speed)};return;}
  const payer=G.cust.find(c=>c.phase==='idle'&&step(c)==='pay'&&!c.owner);if(payer&&G.queue.length<QUEUE.length){toCounter(payer);return;}
  const ask=G.cust.find(c=>c.phase==='idle'&&!c.owner&&step(c)==='lens'&&bestLensFor(c.lens));
  if(ask){ask.owner=w;w.task={kind:'lens',c:ask,x:ask.x-50,y:ask.y+6,dur:1.6/w.speed};return;}
  const fr=Object.keys(FRAME_CATS).some(k=>frameUnlocked(k)&&frameStock(k)>0)&&G.cust.find(c=>c.phase==='idle'&&!c.owner&&step(c)==='frame');
  if(fr){fr.owner=w;w.task={kind:'frame',c:fr,x:SPOT.frames.x+50,y:SPOT.frames.y,dur:2/w.speed};return;}
  const rp=G.cust.find(c=>c.phase==='idle'&&!c.owner&&step(c)==='repair');
  if(rp){rp.owner=w;w.task={kind:'repairTalk',c:rp,x:rp.x-50,y:rp.y+6,dur:.8};return;}
 }
 idle();
}

/* ---------- main update ---------- */
function update(dt){
 tickRandom();
 G.saveT+=dt;if(G.saveT>30){G.saveT=0;saveGame(true);}
 if(G.event)tickEvent(dt);
 if(!G.closing||G.event){if(!G.event)S.dayT+=dt;
  G.spawn-=dt;
  if(G.spawn<=0&&(S.dayT<DAY_LEN||G.event)){spawnCustomer();const base=Math.max(6,17-S.day*.7-(S.rep-3)*1.4-Object.keys(S.owned).length*.12);G.spawn=(G.extra>0?(G.extra--,1.5):rnd(base*.75,base*1.25)*(G.event?.55:1)*((G.dayFx&&G.dayFx.spawn)||1));}
  if(S.dayT>=DAY_LEN&&!G.event&&!G.closing){G.closing=true;log('ปิดรับลูกค้าใหม่ ดูแลคนที่เหลือให้เสร็จ');}
 }
 G.cust.forEach(c=>{c.t+=dt;c.fade=Math.min(1,c.fade+dt*2);
  const arrive=(c.phase==='walk'||c.phase==='leaving'||c.phase==='angry')?navWalk(c,c.tx,c.ty,c.phase==='angry'?210:130,dt):true;
  if(c.phase==='walk'&&arrive){
   if(c.then==='atChair'){c.phase='atChair';c.then=null;c.dir='f';}
   else if(c.then==='counter'){c.phase='counter';c.dir='b';}
   else{c.phase=step(c)==='lab'?'busy':'idle';c.dir='f';c.flip=false;}
  }
  if(c.phase==='leaving'||c.phase==='angry'){if(arrive)c.gone=true;return;}
  const mult=c.phase==='busy'?.4:c.owner?.5:c.phase==='counter'?.7:1;
  c.pat-=c.rate*mult*dt;
  if(c.pat<=0&&c.phase!=='walk')leave(c,false);
 });
 G.cust=G.cust.filter(c=>!c.gone);
 runPlayerTask(dt);
 G.workers.forEach(w=>workerTick(w,dt));
 G.deliveries.forEach(d=>d.t-=dt);
 const arrived=G.deliveries.filter(d=>d.t<=0);
 if(arrived.length){arrived.forEach(d=>{lensState(d.id).stock+=d.qty;log(`${lensBrand(d.id)} ส่ง ${LENSES[d.id].name} ${d.qty} คู่ ถึงร้านแล้ว`,'g');});beep('buy');G.deliveries=G.deliveries.filter(d=>d.t>0);renderRail();}
 G.fx.forEach(f=>f.t-=dt);G.fx=G.fx.filter(f=>f.t>0);
 if(G.closing&&!G.event&&!G.cust.length&&!G.summary&&!paused){G.summary=true;endDay();}
}

/* ---------- draw ---------- */
function floorDraw(){const i=S.floor,fw=ATLAS.FW,fh=ATLAS.FH,c=i%4,r=Math.floor(i/4);
 ctx.imageSmoothingEnabled=false;ctx.drawImage(IMG.floors,c*fw,r*fh,fw,fh,0,0,W,H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';}
function draw(){
 ctx.setTransform(SCALE,0,0,SCALE,0,0);
 floorDraw();
 const list=[];
 let ox=0,oy=0;const setG=g=>{[ox,oy]=gOff(g);};const add=(k,x,y,h)=>{const X=x+ox,Y=y+oy;list.push({y:Y,fn:()=>sprFeet(k,X,Y,h)});};
 // door — floor 0 already has its own
 if(S.floor!==0)add('door',450,322,170);
 add('mat',450,370,38);
 setG('frames');
 add('disp2',95,332,112);
 if(own('disp1'))add('disp1',212,332,112);
 if(own('cab'))add('cab',322,334,108);
 if(own('spin'))add('spin',26,345,112);
 if(own('glass'))add('glass',603,340,112);
 if(own('disp4'))add('disp4',300,405,84);
 setG('exam');
 add('chart',36,470,120);
 add('chair',92,516,104);
 if(own('chair2')){add('chart',36,610,120);add('chair',92,656,104);}
 const EQ=[['auto',230,470],['phoro',255,590],['slit',215,665],['fundus',322,480],['oct',310,662]];
 EQ.forEach(([k,x,y])=>{if(own(k))add(k,x,y,k==='phoro'?110:88);});
 setG('lab');
 add('desk2',730,332,120);
 add(own('edger')?'edger':'bench',615,350,own('edger')?76:64);
 if(own('lmeter'))add('lmeter',858,350,76);
 if(own('ultra'))add('ultra',808,362,50);
 if(own('uv'))add('uv',640,405,50);
 setG('wait');
 add('sofa',450,445,76);
 if(own('seat1'))add('sofa',450,575,76);
 if(own('seat2')){add('arm',300,505,66);add('arm',600,505,66);}
 ox=oy=0;if(own('water'))add('water',875,470,80);
 if(own('plant'))add('plant',880,640,70);
 if(own('mirror'))add('mirror',590,440,84);
 setG('counter');
 const cnt=own('cnt3')?'cnt3':own('cnt2')?'cnt2':'cnt1';
 add(cnt,745,540,106);
 ox=oy=0;
 G.cust.forEach(c=>list.push({y:c.y,fn:()=>drawActor(c,c.k,c.fade)}));
 const p=G.player;list.push({y:p.y,fn:()=>drawActor(p,'od1',1,true)});
 G.workers.filter(w=>!isTraining(w.key)).forEach(w=>list.push({y:w.y,fn:()=>drawActor(w,w.key,1)}));
 list.sort((a,b)=>a.y-b.y).forEach(o=>o.fn());
 // labels: zones when dragging
 if(dragging&&dragging.moved){const st=step(dragging.c);const z=st==='exam'?ZONE.exam:st==='pay'?ZONE.counter:null;
  if(z){ctx.save();ctx.strokeStyle='#f6b21b';ctx.lineWidth=4;ctx.setLineDash([12,8]);ctx.lineDashOffset=-performance.now()/40;ctx.fillStyle='rgba(246,178,27,.18)';ctx.fillRect(z.x,z.y,z.w,z.h);ctx.strokeRect(z.x,z.y,z.w,z.h);ctx.restore();
   label(z.x+z.w/2,z.y+22,st==='exam'?'วางที่นี่เพื่อวัดตา':'วางที่นี่เพื่อคิดเงิน','#16204a','#fff');}
  const c=dragging.c;ctx.globalAlpha=.8;sprFeet(c.k+'f',dragging.x,dragging.y+40,94);ctx.globalAlpha=1;}
 // lab job badges
 if(G.jobs.length){const j=G.jobs.filter(j=>!j.owner).length;drawIcon('ic_tool',SPOT.lab.x,SPOT.lab.y-172,36);if(j)label(SPOT.lab.x+36,SPOT.lab.y-172,String(G.jobs.length),'#f08a12','#fff');
  const active=G.jobs.find(j=>j.owner);if(active)bar(SPOT.lab.x-40,SPOT.lab.y-146,80,8,active.t/active.dur,'#2f9e3f');}
 // HUD labels of stations
 if(!editLayout)label(ZONE.frames.x+115,ZONE.frames.y-10,'ชั้นวางกรอบ','#16204a','#fff');
 if(!editLayout)label(ZONE.lab.x+145,ZONE.lab.y-10,'โต๊ะช่าง','#16204a','#fff');
 if(!editLayout)label(ZONE.exam.x+145,ZONE.exam.y-8,'ห้องตรวจ','#16204a','#fff');
 drawEventHud();if(editLayout)drawLayoutEdit();
 G.fx.forEach(f=>{ctx.globalAlpha=clamp(f.t,0,1);label(f.x,f.y-(1.5-f.t)*22,f.text,f.col,'#fff',f.big?19:15);ctx.globalAlpha=1;});
}
function drawActor(a,key,alpha,isPlayer){const moving=a.moving;
 const bob=moving?Math.abs(Math.sin(a.t*11))*5:0;const lean=moving?Math.sin(a.t*11)*.05:0;
 ctx.save();ctx.globalAlpha=alpha;
 ctx.fillStyle='rgba(20,20,40,.22)';ctx.beginPath();ctx.ellipse(a.x,a.y-1,24,7,0,0,Math.PI*2);ctx.fill();
 ctx.translate(a.x,a.y);ctx.rotate(lean);
 const dir=a.dir||'f';const k=key+dir;const pos=ATLAS.pos[k];const h=key==='c10'?100:92;const w=pos[2]/pos[3]*h;
 const flip=dir==='s'&&a.flip;
 if(flip){ctx.scale(-1,1);}
 ctx.drawImage(IMG.atlas,pos[0],pos[1],pos[2],pos[3],-w/2,-h-bob,w,h);ctx.restore();
 if(isPlayer){const t=G.player.task;if(G.player.carry)drawIcon(G.player.carry,a.x,a.y-125-bob,46);
  ctx.fillStyle='#f6b21b';ctx.beginPath();ctx.moveTo(a.x-7,a.y-106-bob);ctx.lineTo(a.x+7,a.y-106-bob);ctx.lineTo(a.x,a.y-96-bob);ctx.fill();ctx.strokeStyle='#16204a';ctx.lineWidth=2;ctx.stroke();
  if(t&&t.kind!=='lab'&&t.dur>1&&G.player.prog>0)bar(a.x-30,a.y-120,60,8,G.player.prog/t.dur,'#3f7be0');
  if(G.player.tasks.length)label(a.x+30,a.y-110,'+'+G.player.tasks.length,'#f08a12','#fff',13);}
 else if(a.task&&a.task.kind!=='lab'&&a.task.dur&&a.prog>0)bar(a.x-30,a.y-120,60,8,a.prog/a.task.dur,'#3f7be0');
 if(a.steps){drawCustHud(a);}
}
function drawCustHud(c){if(c.phase==='leaving')return;if(c.phase==='angry'){drawIcon('ic_bang',c.x,c.y-110,30);return;}
 const y=c.y-98;
 const st=step(c);let k=null;
 if(c.phase==='counter')k=G.queue[0]===c?'ic_coin':'ic_dots';
 else if(c.phase==='atChair')k='ic_clip';
 else if(c.phase==='busy')k='ic_tool';
 else if(c.phase==='idle')k=st==='exam'?'ic_clip':st==='lens'?'ic_q':st==='frame'?'b_black':st==='pay'?'ic_coin':st==='repair'?'ic_tool':null;
 const pulse=(c.phase==='idle'||(c.phase==='counter'&&G.queue[0]===c))&&!c.owner?1+Math.sin(c.t*5)*.06:1;
 if(k)drawIcon(k,c.x,y-14,36*pulse);
 if(c.vip)label(c.x+32,y+9,'VIP','#f08a12','#fff',11);
 const col=c.pat>55?'#2f9e3f':c.pat>25?'#f08a12':'#d8324a';bar(c.x-26,y+6,52,7,c.pat/100,col);
 if(hover===c){ctx.strokeStyle='#f6b21b';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(c.x,c.y-1,30,10,0,0,Math.PI*2);ctx.stroke();}
}
function drawIcon(k,x,y,s){const a=ATLAS.pos[k];if(!a)return;const r=s/Math.max(a[2],a[3]);spr(k,x-a[2]*r/2,y-a[3]*r/2,a[2]*r,a[3]*r);}
function bar(x,y,w,h,v,col){ctx.fillStyle='#16204a';ctx.fillRect(x-2,y-2,w+4,h+4);ctx.fillStyle='#fff7e6';ctx.fillRect(x,y,w,h);ctx.fillStyle=col;ctx.fillRect(x,y,w*clamp(v,0,1),h);}
function label(x,y,t,bg,fg,size){const s=size||13;ctx.font=`500 ${s}px Mitr,"Noto Sans Thai",Tahoma,sans-serif`;const w=ctx.measureText(t).width+12;ctx.fillStyle=bg;ctx.beginPath();const h=s+9;ctx.roundRect?ctx.roundRect(x-w/2,y-h/2,w,h,5):ctx.rect(x-w/2,y-h/2,w,h);ctx.fill();ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y+.5);}

/* ---------- input ---------- */
function evPos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-cv.clientLeft)/(r.width-2*cv.clientLeft)*W,y:(e.clientY-r.top-cv.clientTop)/(r.height-2*cv.clientTop)*H};}
function hitCust(p){const a=[...G.cust].sort((x,y)=>y.y-x.y);return a.find(c=>c.phase!=='leaving'&&c.phase!=='angry'&&Math.abs(p.x-c.x)<34&&p.y<c.y+6&&p.y>c.y-128);}
function inZone(p,z){return p.x>=z.x&&p.x<=z.x+z.w&&p.y>=z.y&&p.y<=z.y+z.h;}
function initInput(){
 cv.addEventListener('pointerdown',e=>{if(editLayout){layoutDown(evPos(e));cv.setPointerCapture(e.pointerId);return;}if(paused||!G)return;const p=evPos(e);if(G.mobile){mobileClick(p);return;}const c=hitCust(p);
  if(c&&c.phase==='idle'&&!c.owner&&(step(c)==='exam'||step(c)==='pay')){dragging={c,x:p.x,y:p.y,sx:p.x,sy:p.y,moved:false};cv.setPointerCapture(e.pointerId);return;}
  if(c){onCustomerClick(c);return;}
  if(inZone(p,ZONE.lab)){onLabClick();return;}
  if(inZone(p,ZONE.counter)&&G.queue[0]){onCustomerClick(G.queue[0]);return;}
 });
 cv.addEventListener('pointermove',e=>{if(editLayout){layoutMove(evPos(e));return;}if(!G||G.mobile)return;const p=evPos(e);
  if(dragging){dragging.x=p.x;dragging.y=p.y;if(Math.hypot(p.x-dragging.sx,p.y-dragging.sy)>10)dragging.moved=true;return;}
  hover=hitCust(p)||null;cv.style.cursor=hover?(hover.phase==='idle'&&['exam','pay'].includes(step(hover))?'grab':'pointer'):(inZone(p,ZONE.lab)&&G.jobs.length?'pointer':'default');});
 const end=e=>{if(editLayout){editLayout.drag=null;return;}if(!dragging)return;const d=dragging;dragging=null;const c=d.c;if(!G.cust.includes(c)||c.phase!=='idle')return;
  if(!d.moved){onCustomerClick(c);return;}
  const st=step(c),p=evPos(e);
  if(st==='exam'&&inZone(p,ZONE.exam))toExam(c);
  else if(st==='pay'&&inZone(p,ZONE.counter))toCounter(c);
  else toast(st==='exam'?'ลากไปวางที่ห้องตรวจ':'ลากไปวางที่เคาน์เตอร์');};
 cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',()=>dragging=null);
}

/* ---------- dialogs ---------- */
function lensDialog(c){
 const cards=Object.keys(LENSES).filter(lensAvailable).sort((a,b)=>(lensState(b).stock>0)-(lensState(a).stock>0)).map(id=>{const l=LENSES[id],s=lensState(id);
  const n=s.stock>0;const pending=G.deliveries.filter(d=>d.id===id).reduce((a,d)=>a+d.qty,0);
  return n?`<button class="item col" data-pick="${id}"><span class="tx"><b>${l.name}</b><small>${l.desc}</small></span><span class="row"><span class="price">${fmt(lensPrice(id))}</span><span class="tag ok">มี ${s.stock} คู่</span>${l.premium?'<span class="tag">พรีเมียม</span>':''}</span></button>`
  :`<div class="item col off"><span class="tx"><b>${l.name}</b><small>${l.desc}</small></span><span class="row"><span class="tag no">${pending?`กำลังส่ง ${pending} คู่`:s.listed?'ของหมด':'ยังไม่มีในร้าน'}</span><button class="btn plain" data-hoya="${id}">ติดต่อ ${lensBrand(id)}</button></span></div>`;}).join('');
 openModal(`<div class="sheethead"><h2>แนะนำเลนส์</h2><button class="btn plain" data-later="1">ไว้ก่อน</button></div>
 <div class="say">${sprHTML(c.k+'f',84)}<p>${esc(c.q)}</p></div>
 <div class="grid">${cards}</div>
 <p class="note">แนะนำตรงอาการ ลูกค้าพอใจและให้ทิปมากขึ้น ถ้ายังไม่มีเลนส์ที่ตรง กดติดต่อบริษัทเลนส์แล้วกลับมาคุยใหม่เมื่อของถึง</p>`,{onClose:()=>{dropOwner(c,'player');}});
 const m=$('#modal');
 m.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{m._o={};closeModal();c.owner=null;chooseLens(c,b.dataset.pick);renderRail();});
 m.querySelectorAll('[data-hoya]').forEach(b=>b.onclick=()=>{m._o={};closeModal();c.owner=null;hoyaDialog(b.dataset.hoya);});
 m.querySelector('[data-later]').onclick=closeModal;
}
function frameDialog(c){
 const cats=Object.keys(FRAME_CATS);const want=FRAME_CATS[c.frCat];const sample=want.sprites[0];
 const cards=cats.filter(frameUnlocked).map(k=>{const f=FRAME_CATS[k];const sp=[...f.sprites].sort(()=>Math.random()-.5).slice(0,4);const n=frameStock(k);const row=`<span class="row">${sp.map(x=>sprHTML(x,30)).join('')}</span><span class="tx"><b>${f.name}</b></span>`;
  return n>0?`<button class="item col" data-cat="${k}">${row}<span class="row"><span class="price">${fmt(f.price*repMul())}</span><span class="tag ok">มี ${n} ชิ้น</span></span></button>`
  :`<div class="item col off">${row}<span class="row"><span class="tag no">หมดสต็อก</span><button class="btn plain" data-buyf="${k}" ${S.money<f.cost*5?'disabled':''}>สั่ง 5 ชิ้น ${fmt(f.cost*5)}</button></span></div>`;}).join('');
 const missing=!frameUnlocked(c.frCat);
 openModal(`<div class="sheethead"><h2>หยิบกรอบให้ลูกค้า</h2><button class="btn plain" data-later="1">ไว้ก่อน</button></div>
 <div class="say">${sprHTML(c.k+'f',84)}<p>อยากได้${esc(want.wish)}<br>${sprHTML(sample,34)}${missing?'<br><span class="tag no">ร้านยังไม่มีกรอบแบบนี้ ซื้อตู้โชว์เพิ่มได้ในร้านค้า</span>':''}</p></div>
 <div class="grid">${cards}</div><p class="note">หยิบแล้วตัวละครจะถือกรอบวิ่งกลับไปส่งให้ลูกค้า</p>`,{lock:true,onClose:()=>dropOwner(c,'player')});
 const m=$('#modal');m.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{m._o={};closeModal();G.player.carry=FRAME_CATS[b.dataset.cat].sprites[0];softPlay('pick');G.player.tasks.unshift({kind:'deliver',c,cat:b.dataset.cat,x:c.x+50,y:c.y+6,dur:.2});renderRail();});
 m.querySelectorAll('[data-buyf]').forEach(b=>b.onclick=()=>{if(buyFrames(b.dataset.buyf)){m._o={};frameDialog(c);renderRail();}});
 m.querySelector('[data-later]').onclick=closeModal;
}
function hoyaDialog(focus){
 const cards=Object.keys(LENSES).map(id=>{const l=LENSES[id],s=lensState(id),ok=lensAvailable(id);const cost=l.cost*l.pack;
  const need=!ok?`<span class="tag no">${l.course&&!courseDone(l.course)?'ต้องผ่าน '+COURSE[l.course].name:'ต้องมี '+SHOPBY[l.need].name}</span>`:'';
  const pend=G.deliveries.filter(d=>d.id===id).reduce((a,d)=>a+d.qty,0);
  const act=!ok?'':!s.listed?`<button class="btn gold" data-list="${id}" ${S.money<l.fee+cost?'disabled':''}>เปิดรายการ + สั่ง ${l.pack} คู่ ${fmt(l.fee+cost)}</button>`
   :`<button class="btn" data-order="${id}" ${S.money<cost?'disabled':''}>สั่ง ${l.pack} คู่ ${fmt(cost)}</button>`;
  return `<div class="item col ${focus===id?'owned':''} ${ok?'':'off'}"><span class="tx"><b>${l.name}</b><small>${l.desc}</small><small>${lensBrand(id)} · ทุน ${fmt(l.cost)}/คู่ · ขาย ${fmt(lensPrice(id))}</small></span>
  <span class="row"><span class="tag">สต็อก ${s.stock}${pend?` · ส่ง ${pend}`:''}</span>${need}</span>${act}</div>`;}).join('');
 openModal(`<div class="sheethead"><h2>สั่งสินค้า</h2><button class="btn plain" data-c="1">วางสาย</button></div>
 <p class="note">เงินในร้าน ${fmt(S.money)} · ส่งถึงร้านใน ${deliverTime()} วินาทีเกม · ราคาในเกมสมมติขึ้นเพื่อการเล่น ไม่ได้เกี่ยวข้องกับบริษัทเลนส์จริง</p>
 <h3>เลนส์</h3><div class="grid">${cards}</div><h3>กรอบแว่น</h3><div class="grid">${Object.keys(FRAME_CATS).filter(frameUnlocked).map(k=>{const f=FRAME_CATS[k];return `<div class="item">${sprHTML(f.sprites[0],26)}<span class="tx"><b>${f.name}</b><small>ทุน ${fmt(f.cost)} · ขาย ${fmt(f.price)} · มี ${frameStock(k)} ชิ้น</small></span><button class="btn" data-buyf="${k}" ${S.money<f.cost*5?'disabled':''}>สั่ง 5 ${fmt(f.cost*5)}</button></div>`;}).join('')}</div>`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;
 m.querySelectorAll('[data-buyf]').forEach(b=>b.onclick=()=>{buyFrames(b.dataset.buyf);hoyaDialog();renderRail();});
 m.querySelectorAll('[data-list]').forEach(b=>b.onclick=()=>order(b.dataset.list,true));
 m.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>order(b.dataset.order,false));
}
function deliverTime(){return (own('van')?7:14)*((G&&G.dayFx&&G.dayFx.deliver)||1);}
function order(id,list){const l=LENSES[id],s=lensState(id),cost=l.cost*l.pack+(list?l.fee:0);if(S.money<cost)return;
 spend('lensBuy',cost);G.today.buy+=cost;if(list)s.listed=true;G.deliveries.push({id,qty:l.pack,t:deliverTime()});beep('buy');
 log(`สั่ง ${l.name} ${l.pack} คู่ กับ ${lensBrand(id)}`);hoyaDialog(id);renderRail();}

let shopTab='exam';
function shopDialog(){
 const tabs=[['exam','เครื่องตรวจ'],['lab','ห้องช่าง'],['frame','ชั้นวางกรอบ'],['shop','ปรับปรุงร้าน'],['floor','พื้นร้าน']];
 let body='';
 if(shopTab==='floor'){body=`<div class="grid">${FLOORS.map((n,i)=>{const o=S.floors[i];const p=i===0?0:4000+i*1800;
   return `<button class="item ${o?'owned':''}" data-floor="${i}" ${!o&&S.money<p?'disabled':''}><span class="tx"><b>${n}</b><small>${S.floor===i?'ใช้อยู่':o?'กดเพื่อใช้':'ลูกค้ารอนานขึ้น 1%'}</small></span><span class="price">${o?'':fmt(p)}</span></button>`;}).join('')}</div>`;}
 else body=`<div class="grid">${SHOP.filter(s=>s.cat===shopTab).map(s=>{const o=own(s.id);const lock=s.req&&!own(s.req);
   return `<div class="item ${o?'owned':''} ${lock?'off':''}">${sprHTML(s.spr,58)}<span class="tx"><b>${s.name}</b><small>${s.fx}</small>${o?'<span class="tag ok">มีแล้ว</span>':lock?`<span class="tag no">ต้องมี ${SHOPBY[s.req].name}</span>`:`<button class="btn" data-buy="${s.id}" ${S.money<s.price?'disabled':''}>ซื้อ ${fmt(s.price)}</button>`}</span></div>`;}).join('')}</div>`;
 openModal(`<div class="sheethead"><h2>ซื้อของเข้าร้าน</h2><span class="price">${fmt(S.money)}</span><button class="btn plain" data-c="1">ปิด</button></div>
 <div class="tabs" role="tablist">${tabs.map(([k,n])=>`<button class="tab ${k===shopTab?'on':''}" data-tab="${k}" role="tab" aria-selected="${k===shopTab}">${n}</button>`).join('')}</div>${body}`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;
 m.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{shopTab=b.dataset.tab;shopDialog();});
 m.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const s=SHOPBY[b.dataset.buy];if(S.money<s.price)return;spend('equip',s.price);G.today.buy+=s.price;S.owned[s.id]=true;Object.keys(FRAME_CATS).forEach(k=>{if(FRAME_CATS[k].shelf===s.id)S.frames[k]=frameStock(k)+5;});beep('buy');log(`ซื้อ ${s.name} แล้ว`,'g');saveGame(true);shopDialog();renderRail();});
 m.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>{const i=+b.dataset.floor;const p=4000+i*1800;if(!S.floors[i]){if(S.money<p)return;spend('equip',p);G.today.buy+=p;S.floors[i]=true;beep('buy');}S.floor=i;saveGame(true);shopDialog();renderRail();});
}
function staffDialog(){
 const groups=['od','sales','tech'].map(r=>{const keys=Object.keys(STAFF).filter(k=>STAFF[k].role===r);const n=S.staff.filter(k=>STAFF[k].role===r).length;
  return `<h3>${ROLE[r]} <span class="mini">จ้างแล้ว ${n}/${ROLECAP[r]}</span></h3><div class="grid">${keys.map(k=>{const d=STAFF[k],h=S.staff.includes(k);
   return `<div class="item ${h?'owned':''}">${sprHTML(k+'f',74)}<span class="tx"><b>${d.name}</b><small>เงินเดือน ${fmt(monthlySalary(k))}/เดือน · ${STAFF_YEARS[k]} ปี · เร็ว x${d.speed}${d.acc?` · แม่น ${Math.round(d.acc*100)}%`:''}</small>
   ${h&&isTraining(k)?'<span class="tag no">หยุดงาน · กำลังอบรมหรือลาป่วย</span> ':''}${h?`<button class="btn plain" data-fire="${k}">เลิกจ้าง</button>`:`<button class="btn green" data-hire="${k}" ${S.money<d.hire||n>=ROLECAP[r]?'disabled':''}>จ้าง ${fmt(d.hire)}</button>`}</span></div>`;}).join('')}</div>`;}).join('');
 openModal(`<div class="sheethead"><h2>จ้างพนักงาน</h2><span class="price">${fmt(S.money)}</span><button class="btn plain" data-c="1">ปิด</button></div>
 <p class="note">ค่าจ้างเริ่มงานจ่ายครั้งเดียว ส่วนเงินเดือนและค่าคอมจ่ายทุกสิ้นเดือน · OD วัดตา ค่าคอม 10% ของค่าตรวจ · พนักงานขายคุยเลนส์ เลือกกรอบ คิดเงิน ค่าคอม 5% · ช่างประกอบแว่น ค่าคอม ฿30 ต่องาน</p>${groups}`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;
 m.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>{const k=b.dataset.hire,d=STAFF[k];if(S.money<d.hire)return;spend('hire',d.hire);G.today.buy+=d.hire;S.staff.push(k);addWorker(k);beep('buy');log(`${d.name} เริ่มงานแล้ว`,'g');saveGame(true);staffDialog();renderRail();});
 m.querySelectorAll('[data-fire]').forEach(b=>b.onclick=()=>{const k=b.dataset.fire;S.staff=S.staff.filter(x=>x!==k);const w=G.workers.find(w=>w.key===k);if(w&&w.task){const t=w.task;if(t.c)t.c.owner=null;if(t.j)t.j.owner=null;}G.workers=G.workers.filter(w=>w.key!==k);staffDialog();renderRail();});
}
function endDay(){const t=G.today;const net=sumIncome(S.ledger)-sumExpense(S.ledger)-S.dayStart;
 const target=dailyTarget(),hit=t.rev+t.tip>=target;if(hit){S.stats.targetHit++;S.stats.streak++;S.stats.bestStreak=Math.max(S.stats.bestStreak,S.stats.streak);}else S.stats.streak=0;
 S.daily.push({d:dayInMonth(S.day),p:net});tickTraining();
 const d=S.day;const monthEnd=d%MONTH_DAYS===0;S.day++;S.dayT=0;addXp(10);
 let rec=null;if(monthEnd)rec=closeMonth();S.dayStart=monthEnd?0:sumIncome(S.ledger)-sumExpense(S.ledger);checkTrophies();saveGame(true);
 openModal(`<div class="sheethead"><h2>สรุปวันที่ ${dayInMonth(d)}/${MONTH_DAYS} · เดือน ${monthOf(d)}</h2><span class="stars">${stars()}</span></div>
 <table class="ledger"><tbody>
 <tr><td>ลูกค้าจ่ายเงินแล้ว</td><td>${t.served} คน</td></tr>
 <tr><td>ลูกค้าเดินออก</td><td>${t.left} คน</td></tr>
 <tr><td>ยอดขาย + ทิป</td><td>${fmt(t.rev+t.tip)}</td></tr>
 <tr><td>เป้าหมายวันนี้</td><td>${fmt(target)} ${hit?'✓':'✗'}</td></tr>
 <tr class="t"><td>กำไรวันนี้ (ก่อนค่าใช้จ่ายสิ้นเดือน)</td><td>${fmt(net)}</td></tr>
 </tbody></table>
 <p class="note">บันทึกอัตโนมัติแล้ว รหัส ${S.code}${monthEnd?'':` · อีก ${MONTH_DAYS-dayInMonth(d)} วันถึงสิ้นเดือน`}</p>
 <div class="row">${monthEnd?'<button class="btn gold" data-month="1">ดูสรุปเดือนนี้</button>':`<button class="btn gold" data-next="1">เปิดร้านวันที่ ${dayInMonth(S.day)}</button>`}<button class="btn violet" data-more="1">จัดการร้านก่อน</button></div>`,{lock:true});
 const m=$('#modal');const go=()=>{closeModal();afterDayMenu();};
 const nx=m.querySelector('[data-next]');if(nx)nx.onclick=()=>{closeModal();openDay();};
 const mo=m.querySelector('[data-month]');if(mo)mo.onclick=()=>{closeModal();monthDialog(rec,afterDayMenu);};
 m.querySelector('[data-more]').onclick=()=>{if(rec){closeModal();monthDialog(rec,afterDayMenu);}else go();};
 renderRail();
}
function openDay(){G.today=blankDay();G.closing=false;G.summary=false;G.spawn=2;rollRandom();refreshQuests();renderRail();
 const sc=S.hosp.sched&&MISSION[S.hosp.sched];if(sc){if(missionReady(sc)){startMobile(sc);return;}S.hosp.sched=null;toast('ยกเลิกการออกหน่วย ทีมหรืออุปกรณ์ไม่ครบ');}
 hospitalCall();}
function absentNote(){const a=S.staff.filter(isTraining).map(k=>`${STAFF[k].name} ${G.dayFx&&G.dayFx.sick===k?'ลาป่วย':'อบรมอีก '+((S.staffData[k].training||{}).left||0)+' วัน'}`);return a.length?`ไม่อยู่ร้าน: ${a.join(', ')} · `:'';}
function afterDayMenu(){openModal(`<div class="sheethead"><h2>พร้อมเปิดร้านหรือยัง</h2></div><div class="railbtns menu"><button class="btn violet" data-a="shop">ซื้อของ</button><button class="btn green" data-a="staff">จ้างคน</button><button class="btn" data-a="train">อบรม</button><button class="btn" data-a="hoya">สั่งสินค้า</button><button class="btn" data-a="map">แผนที่</button><button class="btn red" data-a="hosp">โรงพยาบาล</button><button class="btn" data-a="acct">บัญชี</button></div><div class="row"><button class="btn gold" data-next="1">เปิดร้านวันที่ ${dayInMonth(S.day)}</button></div>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-next]').onclick=()=>{closeModal();openDay();};
 const f={shop:shopDialog,staff:staffDialog,train:trainDialog,hoya:()=>hoyaDialog(),acct:accountDialog,map:mapDialog,hosp:()=>hospitalDialog()};
 m.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{closeModal();f[b.dataset.a]();});}

/* ---------- side rail ---------- */
function stars(){const n=Math.round(S.rep*2)/2;let s='';for(let i=1;i<=5;i++)s+=n>=i?'★':n>=i-.5?'⯪':'☆';return s;}
function hintText(){if(G.mobile)return mobileHint();const idle=G.cust.filter(c=>c.phase==='idle'&&!c.owner);
 if(editLayout)return'ลากโซนไปวาง ชั้นวางใกล้ลูกค้าช่วยลดเวลาเดิน';if(G.summary)return'เตรียมร้านให้พร้อม แล้วกดปุ่มเปิดร้านด้านขวา';if(G.closing)return G.cust.length?'ปิดรับลูกค้าใหม่แล้ว ดูแลคนที่เหลือให้เสร็จ':'เลิกงาน!';
 const f=G.queue[0];if(f&&f.phase==='counter'&&!f.owner)return'คลิกลูกค้าที่เคาน์เตอร์เพื่อคิดเงิน';
 if(G.jobs.some(j=>!j.owner))return'คลิกโต๊ะช่างเพื่อประกอบแว่น';
 const c=idle[0];if(!c){const ch=G.cust.find(c=>c.phase==='atChair'&&!c.owner);if(ch)return'คลิกลูกค้าที่ห้องตรวจเพื่อเริ่มวัดตา';return G.cust.length?'รอลูกค้าเสร็จขั้นตอน…':'รอลูกค้าเข้าร้าน เปิดร้านค้าเพื่อซื้อของได้เลย';}
 return {exam:`ลาก${c.name}ไปที่ห้องตรวจ`,lens:`คลิก${c.name}เพื่อแนะนำเลนส์`,frame:`คลิก${c.name}เพื่อไปเลือกกรอบที่ชั้นวาง`,pay:`ลาก${c.name}ไปเคาน์เตอร์เพื่อคิดเงิน`,repair:`คลิก${c.name}เพื่อรับงานซ่อมแว่น`,lab:''}[step(c)]||'';}
let railKey='';
function setHTML(el,h){if(el._h!==h){el._h=h;el.innerHTML=h;}}
function renderRail(){if(!S||!G||screen!=='play')return;
 const r=$('#rail');
 if(railKey!==S.code||!r.firstChild){railKey=S.code;r.innerHTML=`<div class="card" id="rStat"></div>
 <button class="btn gold openbtn" id="rOpen" hidden></button>
 <div class="railbtns"><button class="btn violet" id="rShop">ซื้อของ</button><button class="btn green" id="rStaff">จ้างคน</button><button class="btn" id="rTrain">อบรม</button><button class="btn gold" id="rHoya">สั่งสินค้า</button><button class="btn" id="rMap">แผนที่แข่ง</button><button class="btn" id="rAcct">บัญชี</button><button class="btn" id="rTro">โทรฟี่</button><button class="btn red" id="rHosp">โรงพยาบาล</button><button class="btn" id="rSave">เซฟเกม</button><button class="btn" id="rQuest">ภารกิจ</button><button class="btn" id="rLay">จัดร้าน</button><button class="btn plain" id="rOpt">ตั้งค่า</button><button class="btn plain" id="rMenu">เมนูหลัก</button></div>
 <div class="card" id="rStock"></div><div class="card feed" id="rFeed" aria-live="polite"></div><div class="card mini" id="rDay"></div><div class="card mini" id="rCloud"></div><div class="mini verline">เวอร์ชัน ${GAME_VERSION}</div>`;
  $('#rOpen').onclick=()=>{closeModal();openDay();};$('#rQuest').onclick=questDialog;$('#rLay').onclick=layoutMode;$('#rHosp').onclick=()=>hospitalDialog();$('#rTrain').onclick=trainDialog;$('#rMap').onclick=mapDialog;$('#rAcct').onclick=accountDialog;$('#rTro').onclick=trophyDialog;$('#rShop').onclick=shopDialog;$('#rStaff').onclick=staffDialog;$('#rHoya').onclick=()=>hoyaDialog();$('#rSave').onclick=()=>saveGame();
  $('#rOpt').onclick=optionDialog;$('#rMenu').onclick=()=>{saveGame(true);railKey='';showTitle();};}
 const ob=$('#rOpen');const canOpen=!!G.summary&&!G.mobile&&!G.event;ob.hidden=!canOpen;if(canOpen)ob.textContent=`เปิดร้านวันที่ ${dayInMonth(S.day)}/${MONTH_DAYS}`;
 $('#hint').textContent=hintText();
 setHTML($('#rStat'),`<div class="statrow"><span class="money">${fmt(S.money)}</span><span class="stars" title="ชื่อเสียงร้าน ${S.rep.toFixed(1)}/5">${stars()}</span></div>
 <div class="statrow mini" style="margin-top:4px"><span>เดือน ${monthOf(S.day)} วันที่ ${dayInMonth(S.day)}/${MONTH_DAYS} · รหัส ${S.code}</span><span>${G.closing?'ปิดรับลูกค้า':'เหลือ '+Math.ceil(Math.max(0,DAY_LEN-S.dayT))+' วิ'}</span></div>
 <div class="timebar"><i style="width:${Math.min(100,S.dayT/DAY_LEN*100).toFixed(1)}%"></i></div><div class="statrow mini" style="margin-top:4px"><span>ร้าน Lv.${S.level} · EXP ${S.xp}/${xpNeed(S.level)}</span></div><div class="mini">เป้าวันนี้ ${fmt(G.today.rev+G.today.tip)}/${fmt(dailyTarget())}</div>`);
 const stock=Object.keys(S.lens).filter(k=>S.lens[k].listed).map(k=>`<span class="tag ${S.lens[k].stock<=1?'no':''}">${LENSES[k].name} ${S.lens[k].stock}</span>`).join(' ');
 setHTML($('#rStock'),`<div class="mini">สต็อกเลนส์ (คู่)</div><div class="row" style="gap:4px;margin-top:4px">${stock||'<span class="mini">ยังไม่มีเลนส์</span>'}</div>${G.deliveries.length?`<div class="mini">กำลังส่ง: ${G.deliveries.map(d=>`${LENSES[d.id].name} ${Math.ceil(d.t)} วิ`).join(' · ')}</div>`:''}`);
 setHTML($('#rFeed'),G.feed.length?G.feed.map(f=>`<div class="${f.c||''}">${esc(f.m)}</div>`).join(''):'<div class="mini">เหตุการณ์ในร้านจะแสดงที่นี่</div>');
 setHTML($('#rCloud'),`<span class="${cloud.state==='conflict'||cloud.state==='offline'||cloud.state==='readonly'?'tag no':'tag ok'}">${cloud.label()}</span>`);
 setHTML($('#rDay'),`วันนี้ขายได้ ${fmt(G.today.rev+G.today.tip)} · บริการ ${G.today.served} คน · รอคิว ${G.cust.length} คน · พอใจเฉลี่ย ${avgSat()}% · ${G.dayNote?G.dayNote+' · ':''}${absentNote()}พนักงาน ${S.staff.length} คน · โทรฟี่ ${Object.keys(S.trophies).length}/${TROPHIES.length}`);
}

/* ---------- loop ---------- */
let railT=0;
function conflictDialog(){cloud.conflictShown=true;const code=S.code;
 openModal(`<div class="sheethead"><h2>รหัส ${code} ถูกเล่นจากอีกเครื่อง</h2></div>
 <p>มีคนเซฟรหัสนี้ใหม่กว่าเกมที่เปิดอยู่ เลือกว่าจะใช้เซฟไหน ถ้าเซฟทับ ความคืบหน้าของอีกเครื่องจะหายไป</p>
 <div class="row"><button class="btn green" data-new="1">โหลดเซฟล่าสุด</button><button class="btn red" data-over="1">เซฟทับด้วยเกมนี้</button></div>`,{lock:true});
 const m=$('#modal');m.querySelector('[data-new]').onclick=async()=>{closeModal();const r=await loadGame(code);if(r==='ok'){startPlay();toast('โหลดเซฟล่าสุดแล้ว');}else{cloud.conflictShown=false;toast('โหลดไม่สำเร็จ ลองอีกครั้ง');}};
 m.querySelector('[data-over]').onclick=()=>{closeModal();saveGame(false,true);};}
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
 if(screen==='play'&&S&&G&&cloud.conflict&&!cloud.conflictShown&&$('#modal').hidden)conflictDialog();
 if(screen==='play'&&S&&G&&G.mobile){if(!paused)updateMobile(dt);if(G.mobile)drawMobile();railT+=dt;if(railT>.25){railT=0;renderRail();}}
 else if(screen==='play'&&S&&G){if(!paused)update(dt);draw();railT+=dt;if(railT>.25){railT=0;renderRail();}}
 requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&G)saveGame(true);});
window.addEventListener('pagehide',()=>{if(S&&G)saveGame(true);});

/* ---------- boot ---------- */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
async function boot(){ATLAS=window.ATLAS_DATA;
 [IMG.atlas,IMG.floors,IMG.title,IMG.map]=await Promise.all([loadImg(window.IMG_ATLAS),loadImg(window.IMG_FLOORS),loadImg(window.IMG_TITLE),loadImg(window.IMG_MAP)]);
 const st=document.createElement('style');st.textContent=`.spr{background-image:url(${window.IMG_ATLAS});background-repeat:no-repeat}`;document.head.appendChild(st);
 $('#layoutBar').onclick=endLayout;
 cv=$('#stage');cv.width=W*SCALE;cv.height=H*SCALE;ctx=cv.getContext('2d');initInput();
 if(document.fonts&&document.fonts.load)document.fonts.load('500 14px Mitr').catch(()=>{});
 cloud.init();showTitle();requestAnimationFrame(frame);}
boot();
window.__g={showRandom,setRand:v=>{RAND_ON=v;},layoutMode,endLayout,layoutOk,findPath,freePoint,interact,keyMove,questDialog,rollRandom,examMinigame,refreshQuests,checkQuests,startMobile,MISSIONS,updateMobile,endMobile,finishMobile,hospitalDialog,hospitalCall,SND,openDay,get S(){return S;},get G(){return G;},onCustomerClick,toExam,toCounter,onLabClick,spawnCustomer,saveGame,loadGame,store,closeModal,update,cloud,startEvent,finishEvent,RIVALS,TROPHIES,checkTrophies,trainDialog,accountDialog,mapDialog,closeMonth,addXp,tickTraining,COURSES};

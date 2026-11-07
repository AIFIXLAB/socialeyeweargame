/* ===== เสียง: เพลงเบาๆ สร้างสดด้วย WebAudio และเสียงกดนุ่มๆ ===== */
const SND={ctx:null,music:null,sfx:null,on:{music:true,sfx:true},timer:0,next:0,step:0,fast:false};
try{const o=JSON.parse(localStorage.getItem('socialeyewear.audio')||'{}');if(typeof o.music==='boolean')SND.on.music=o.music;if(typeof o.sfx==='boolean')SND.on.sfx=o.sfx;}catch(e){}
function saveAudio(){try{localStorage.setItem('socialeyewear.audio',JSON.stringify(SND.on));}catch(e){}}
function audioStart(){try{
 if(!SND.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=SND.ctx=new A();
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;lp.connect(c.destination);
  SND.music=c.createGain();SND.music.gain.value=SND.on.music?1:0;SND.music.connect(lp);
  SND.sfx=c.createGain();SND.sfx.gain.value=SND.on.sfx?.8:0;SND.sfx.connect(lp);
  SND.next=c.currentTime+.1;SND.timer=setInterval(musicTick,150);}
 if(SND.ctx.state==='suspended')SND.ctx.resume();}catch(e){}}
function tone(dest,f,t,d,vol,type){const c=SND.ctx,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.02);}
const hz=m=>440*Math.pow(2,(m-69)/12);
/* คอร์ด C G Am F เมโลดี้เพนทาโทนิก เล่นวนสลับ 2 ท่อน */
const CHORDS=[[48,64,67,72],[43,62,67,71],[45,64,69,72],[41,65,69,72]];
const TUNE=[[76,0,79,0,84,0,79,76],[74,0,79,0,83,0,79,74],[72,0,76,0,81,0,76,72],[77,0,76,0,74,0,72,0],[84,0,83,79,76,0,79,0],[83,0,79,74,71,0,74,0],[81,0,79,76,72,0,76,0],[74,76,77,79,76,0,72,0]];
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;if(document.hidden)return;
 const beat=(SND.fast?118:88);const eighth=30/beat;
 while(SND.next<c.currentTime+.4){const t=SND.next,s=SND.step,bar=Math.floor(s/8)%8,pos=s%8,ch=CHORDS[bar%4];
  if(pos===0){tone(SND.music,hz(ch[0]),t,eighth*7,.12,'triangle');ch.slice(1).forEach(n=>tone(SND.music,hz(n),t,eighth*7.5,.022));}
  if(pos===4)tone(SND.music,hz(ch[0]+12),t,eighth*3,.05,'triangle');
  const n=TUNE[bar][pos];if(n){tone(SND.music,hz(n),t,.5,.05);tone(SND.music,hz(n+12),t,.16,.012);}
  if(SND.fast&&pos%2===0)tone(SND.music,hz(84+(pos===4?7:0)),t,.05,.008,'triangle');
  SND.next+=eighth;SND.step++;}}
function softClick(){if(!SND.ctx||!SND.on.sfx)return;const t=SND.ctx.currentTime;tone(SND.sfx,880,t,.11,.07);tone(SND.sfx,1320,t+.018,.1,.028);}
const SOFT={coin:[[1046,.22,.09],[1568,.32,.07]],ok:[[784,.16,.07],[1046,.24,.06]],bad:[[330,.22,.06],[262,.26,.05]],door:[[880,.2,.04],[698,.28,.04]],buy:[[659,.16,.06],[784,.18,.06],[1046,.3,.06]],pick:[[988,.1,.06]]};
function softPlay(type){if(!SND.ctx||!SND.on.sfx)return;let t=SND.ctx.currentTime;(SOFT[type]||SOFT.pick).forEach(([f,d,v])=>{tone(SND.sfx,f,t,d,v);t+=d*.42;});}
function setAudio(k,v){SND.on[k]=v;saveAudio();audioStart();if(SND[k])SND[k].gain.value=v?(k==='music'?1:.8):0;}
document.addEventListener('pointerdown',e=>{audioStart();if(e.target.closest&&e.target.closest('button'))softClick();},true);
document.addEventListener('keydown',audioStart,{once:true});
document.addEventListener('visibilitychange',()=>{if(!SND.ctx)return;if(document.hidden)SND.ctx.suspend().catch(()=>{});else{SND.ctx.resume().catch(()=>{});SND.next=SND.ctx.currentTime+.1;}});

/* ===== ภารกิจโรงพยาบาล: เพิ่มอุปกรณ์และภารกิจใหม่ที่ตาราง ===== */
const KIT={
 chart:{name:'แผ่นวัดสายตา',spr:'k_chart',price:1500},
 tlens:{name:'ชุดเลนส์ทดสอบ',spr:'k_tlens',price:6000},
 trial:{name:'กรอบทดสอบ',spr:'k_trial',price:3500},
 table:{name:'โต๊ะบันทึกผล',spr:'k_table',price:2500},
 seats:{name:'เก้าอี้ผู้รอตรวจ',spr:'k_seats',price:4000},
 tent:{name:'เต็นท์หน่วยตรวจ',spr:'k_tent',price:8000},
 auto:{name:'เครื่องวัดสายตาพกพา',spr:'k_auto',price:28000,fx:'วัดเร็วขึ้น 20%',speed:.8},
 slit:{name:'Slit Lamp ภาคสนาม',spr:'k_slit',price:45000,fx:'วัดเร็วขึ้น 10%',speed:.9},
 fundus:{name:'กล้องจอตาพกพา',spr:'k_fundus',price:80000,fx:'วัดเร็วขึ้น 10%',speed:.9},
 laptop:{name:'แล็ปท็อปบันทึกผล',spr:'k_laptop',price:12000,fx:'ได้โบนัสรายงาน 5%'},
 water:{name:'มุมน้ำดื่ม',spr:'k_water',price:2000,fx:'ประชาชนรอได้นานขึ้น 15%'},
 truck:{name:'รถ Mobile Eye Care',spr:'k_truck',price:150000,fx:'มีเวลาเพิ่ม 20 วินาที'}
};
const MISSIONS=[
 {id:'m1',hospital:'โรงพยาบาลชุมชน',name:'ตรวจสายตาประชาชน',target:50,time:180,sales:25000,od:2,sl:1,kit:['chart','tlens','trial','table','seats','tent'],xp:300,money:60000,rep:.4,say:'เราอยากให้ Social Eyewear ออกหน่วยตรวจสายตาประชาชน 50 คนใน 1 วัน พร้อมส่งผลให้โรงพยาบาลด้วยครับ'},
 {id:'m2',hospital:'โรงพยาบาลจังหวัด',name:'คัดกรองสายตาผู้สูงอายุ',target:70,time:200,sales:60000,od:2,sl:1,kit:['chart','tlens','trial','table','seats','tent','auto','laptop'],xp:700,money:160000,rep:.5,req:'m1',say:'ผลงานครั้งก่อนดีมาก ครั้งนี้ขอคัดกรองผู้สูงอายุ 70 คน ต้องมีเครื่องวัดสายตาพกพาและแล็ปท็อปบันทึกผล'},
 {id:'school',hospital:'โรงเรียนในเมือง',name:'ตรวจสายตานักเรียน',target:60,time:190,sales:30000,od:2,sl:1,noHosp:1,crowd:[0,1],kit:['chart','tlens','trial','table','seats','tent'],xp:400,money:80000,rep:.4,req:'m1',say:'ทางโรงเรียนขอเชิญมาตรวจสายตานักเรียน 60 คน'},
 {id:'factory',hospital:'โรงงานอุตสาหกรรม',name:'ตรวจสายตาพนักงานโรงงาน',target:65,time:190,sales:50000,od:2,sl:1,noHosp:1,crowd:[2,3,9],kit:['chart','tlens','trial','table','seats','tent','auto'],xp:500,money:120000,rep:.4,req:'school',say:'โรงงานอยากให้ตรวจสายตาพนักงาน 65 คนก่อนเริ่มกะ'},
 {id:'park',hospital:'เทศกาลในสวนสาธารณะ',name:'ตรวจสายตาชุมชน',target:75,time:200,sales:70000,od:2,sl:1,noHosp:1,crowd:[4,5,6,7,8],kit:['chart','tlens','trial','table','seats','tent','auto','water'],xp:800,money:200000,rep:.5,req:'factory',say:'งานเทศกาลชุมชนอยากมีจุดตรวจสายตา คาดว่ามีคนมาตรวจ 75 คน'},
 {id:'m3',hospital:'ศูนย์จักษุโรงพยาบาลใหญ่',name:'คัดกรองโรคตาระดับเมือง',target:90,time:220,sales:110000,od:2,sl:1,kit:['chart','tlens','trial','table','seats','tent','auto','laptop','slit','fundus'],xp:1500,money:400000,rep:.6,req:'m2',say:'ขอเชิญเป็นหน่วยร่วมคัดกรองโรคตา 90 คน ต้องมี Slit Lamp และกล้องจอตาพร้อมใช้งาน'}
];
const MISSION=Object.fromEntries(MISSIONS.map(m=>[m.id,m]));
const FINDING={normal:'ปกติ',glasses:'ตัดแว่น',refer:'ส่งต่อจักษุแพทย์'};
function hasKit(k){return !!S.kit[k];}
function missionOpen(m){return !m.req||S.hosp.done[m.req];}
function teamFor(m){const free=k=>!isTraining(k);const od=S.staff.filter(k=>STAFF[k].role==='od'&&free(k)),sl=S.staff.filter(k=>STAFF[k].role==='sales'&&free(k));return{od:od.slice(0,m.od),sl:sl.slice(0,m.sl)};}
function missionReady(m){const t=teamFor(m);return t.od.length>=m.od&&t.sl.length>=m.sl&&m.kit.every(hasKit);}
function hospCool(m){return S.hosp.lastM===monthOf(S.day)?MONTH_DAYS-dayInMonth(S.day)+1:0;}
function hospitalCall(){if(window.__qaNoCall||S.mp||S.party)return false;const mo=monthOf(S.day);if(S.day<3||S.hosp.callM===mo||S.hosp.lastM===mo)return false;const open=MISSIONS.filter(missionOpen);const m=open.find(x=>!S.hosp.done[x.id])||pick(open);if(!m)return false;S.hosp.callM=mo;saveGame(true);softPlay('buy');
 openModal(`<div class="sheethead"><h2>${m.hospital} ติดต่อมา</h2></div><div class="say">${sprHTML('h_hosp',100)}<p>${m.say}</p></div>
 <div class="row"><button class="btn gold" data-see="1">ดูเงื่อนไขภารกิจ</button><button class="btn plain" data-c="1">ไว้ก่อน</button></div>`);
 const b=$('#modal');b.querySelector('[data-c]').onclick=closeModal;b.querySelector('[data-see]').onclick=()=>hospitalDialog(m.id);return true;}
let hospFocus=null;
function hospitalDialog(id){if(id)hospFocus=id;const open=MISSIONS.filter(missionOpen);let m=MISSION[hospFocus];if(!m||!missionOpen(m))m=open[open.length-1];hospFocus=m.id;
 const t=teamFor(m);const ok=x=>x?'yes':'no',mk=x=>x?'✓':'✗';const ready=missionReady(m),cool=hospCool(m);const best=S.hosp.best[m.id];
 const canNow=!G.mobile&&!G.event&&!G.cust.length&&!cool;const sched=S.hosp.sched===m.id;
 openModal(`<div class="sheethead"><h2>ออกหน่วยตรวจสายตา</h2><span class="price">${fmt(S.money)}</span><button class="btn plain" data-c="1">ปิด</button></div>
 <div class="tabs">${MISSIONS.map(x=>`<button class="tab ${x===m?'on':''}" ${missionOpen(x)?`data-m="${x.id}"`:'disabled'}>${missionOpen(x)?x.hospital:'ล็อก · ทำภารกิจก่อนหน้าให้สำเร็จ'}</button>`).join('')}</div>
 <div class="say">${sprHTML(m.id==='m1'?'h_special':'h_collab',70)}<p>${m.name}<br><small>ตรวจ ${m.target} คน ใน ${m.time} วินาที · เป้ายอดขาย ${fmt(m.sales)}${best?` · แรงค์ดีสุด ${best}`:''}</small></p></div>
 <div class="two"><div><h3>ทีมที่ต้องพาไป</h3><ul class="check big">
  <li class="${ok(t.od.length>=m.od)}">${mk(t.od.length>=m.od)} พนักงานตรวจสายตา ${t.od.length}/${m.od} คน</li>
  <li class="${ok(t.sl.length>=m.sl)}">${mk(t.sl.length>=m.sl)} พนักงานขาย ${t.sl.length}/${m.sl} คน</li></ul>
  ${t.od.length<m.od||t.sl.length<m.sl?'<button class="btn green" data-hire="1">ไปจ้างคนเพิ่ม</button>':''}
  <h3>รางวัลเมื่อสำเร็จ</h3><ul class="check big"><li>เงินทุนสูงสุด ${fmt(m.money*1.5)} ตามแรงค์</li><li>EXP ร้าน ${m.xp}</li><li>ชื่อเสียงร้าน +${m.rep}</li><li>โทรฟี่ Mobile Eye Care</li><li>${MISSIONS.filter(x=>x.req===m.id).map(x=>'ปลดล็อก '+x.hospital).join(', ')||'ภารกิจระดับสูงสุด'}</li></ul></div>
 <div><h3>อุปกรณ์ที่ต้องเตรียม</h3><div class="kitlist">${m.kit.map(kitRow).join('')}</div>
 <h3>เสริมเพื่อช่วยงาน</h3><div class="kitlist">${Object.keys(KIT).filter(k=>!m.kit.includes(k)&&KIT[k].fx).map(kitRow).join('')}</div></div></div>
 ${cool?`<p class="err">ออกหน่วยได้เดือนละ 1 ครั้ง รับได้อีกครั้งใน ${cool} วัน</p>`:''}
 <div class="row"><button class="btn gold" data-sched="1" ${!ready||cool?'disabled':''}>${sched?'นัดไว้แล้ว · ออกหน่วยวันถัดไป':'นัดออกหน่วยวันถัดไป'}</button><button class="btn" data-now="1" ${!ready||!canNow?'disabled':''} title="ทำได้เมื่อไม่มีลูกค้าในร้าน">ออกหน่วยตอนนี้</button></div>
 <p class="note">ออกหน่วยได้เดือนละ 1 ครั้ง · การออกหน่วยใช้เวลาทั้งวัน ร้านจะไม่รับลูกค้าในวันนั้น โรงพยาบาลและผลตรวจในเกมเป็นเรื่องสมมติ ไม่ใช่คำแนะนำทางการแพทย์</p>`,{wide:true});
 const b=$('#modal');b.querySelector('[data-c]').onclick=closeModal;
 b.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>hospitalDialog(x.dataset.m));
 b.querySelectorAll('[data-kit]').forEach(x=>x.onclick=()=>{const k=KIT[x.dataset.kit];if(S.money<k.price)return;spend('equip',k.price);S.kit[x.dataset.kit]=1;softPlay('buy');saveGame(true);hospitalDialog();renderRail();});
 const hb=b.querySelector('[data-hire]');if(hb)hb.onclick=()=>{closeModal();staffDialog();};
 b.querySelector('[data-sched]').onclick=()=>{S.hosp.sched=m.id;saveGame(true);log(`นัดออกหน่วย ${m.hospital} วันถัดไป`,'g');hospitalDialog();renderRail();};
 b.querySelector('[data-now]').onclick=()=>{closeModal();startMobile(m);};
}
function kitRow(k){const d=KIT[k],o=hasKit(k);return `<div class="kit ${o?'owned':''}">${sprHTML(d.spr,34)}<span class="tx">${d.name}${d.fx?`<small>${d.fx}</small>`:''}</span>${o?'<span class="tag ok">พร้อม</span>':`<button class="btn plain" data-kit="${k}" ${S.money<d.price?'disabled':''}>${fmt(d.price)}</button>`}</div>`;}

/* ---------- ฉากจับเวลา ---------- */
const MSEATS=[];for(let r=0;r<2;r++)for(let c=0;c<5;c++)MSEATS.push({x:130+c*160,y:r?632:482});
function startMobile(m){S.hosp.sched=null;const t=teamFor(m);if(!t.od[0]||!t.od[1]||!t.sl[0]){log(`ยกเลิกออกหน่วย ${m.hospital} ทีมงานไม่ครบ`,'r');toast('ยกเลิกออกหน่วย เพราะทีมงานไม่ครบ');return;}S.hosp.last[m.id]=S.day;S.hosp.lastM=monthOf(S.day);G.cust=[];G.queue=[];G.jobs=[];G.chairs=[null,null];G.workers.forEach(w=>{w.task=null;w.prog=0;});G.returning=[];G.event=null;G.player.carry=null;G.player.tasks=[];G.player.task=null;
 const mk=(key,role,x,y)=>({key,role,x,y,hx:x,hy:y,dir:'f',flip:false,t:0,q:[],task:null,prog:0,moving:false});
 const staff=[mk(t.od[0],'od',235,345),mk(t.od[1],'od',665,345),mk(t.sl[0],'sales',450,338)];
 G.mobile={m,t:m.time+(hasKit('truck')?20:0),staff,seats:Array(10).fill(null),sel:null,spawned:0,spawnT:.2,recs:[],sales:0,missed:0,advice:0,started:false,count:3,fx:[]};
 SND.fast=true;log(`ออกหน่วยกับ ${m.hospital}`,'g');$('#rail').classList.add('locked');renderRail();}
const M_NAMES=['นักเรียนชาย','นักเรียนหญิง','คนงานก่อสร้าง','ช่างเทคนิค','พนักงานออฟฟิศ','คุณแม่กับลูก','คุณลุง','คุณป้า','พระคุณเจ้า','เจ้าหน้าที่'];
function genRecord(i){const old=i===6||i===7||i===8;const age=old?Math.round(rnd(55,82)):i===0||i===1?Math.round(rnd(12,18)):Math.round(rnd(22,50));const r=Math.random();
 if(r<.3)return{age,va:pick(['20/20','20/25']),note:'มองชัด ไม่มีอาการ',ans:'normal'};
 if(r<.75)return{age,va:pick(['20/40','20/50','20/70','20/100']),note:pick(['มองไกลไม่ชัด แก้ไขด้วยเลนส์ได้ชัด','มองใกล้ไม่ชัด แก้ไขด้วยเลนส์ได้ชัด','ปวดตาเวลาใช้จอ แก้ไขด้วยเลนส์ได้ชัด']),ans:'glasses'};
 return{age,va:pick(['20/70','20/200','20/100']),note:pick(['ลองเลนส์แล้วยังไม่ชัด สงสัยต้อกระจก','ความดันตาสูงผิดปกติ','เห็นจุดดำลอยมาก เป็นเบาหวาน','ปวดตาแดงเฉียบพลัน']),ans:'refer'};}
function examSeconds(){let t=5;Object.keys(S.kit).forEach(k=>{if(KIT[k]&&KIT[k].speed)t*=KIT[k].speed;});return t;}
function updateMobile(dt){const g=G.mobile,m=g.m;if(g.ended)return;
 if(!g.started){g.count-=dt;if(g.count<=0)g.started=true;return;}
 g.t-=dt;g.spawnT-=dt;
 if(g.spawnT<=0){const free=g.seats.map((p,i)=>p?-1:i).filter(i=>i>=0);if(free.length){const i=pick(free),k=m.crowd?pick(m.crowd):Math.floor(Math.random()*10);g.seats[i]={seat:i,k,name:M_NAMES[k],need:'exam',pat:100,rate:100/(rnd(32,44)*(hasKit('water')?1.15:1)),wantAdvice:Math.random()<.42,staff:null,t:0};g.spawned++;softPlay('door');}g.spawnT=rnd(.8,1.8);}
 g.seats.forEach((p,i)=>{if(!p)return;p.t+=dt;p.pat-=p.rate*dt*(p.staff?.25:1);if(p.pat<=0){if(p.need==='exam')g.missed++;removePerson(g,p);g.fx.push({x:MSEATS[i].x,y:MSEATS[i].y-110,t:1.2,text:p.need==='exam'?'รอไม่ไหว':'ไม่รอฟังแล้ว',col:'#d8324a'});}});
 g.staff.forEach(s=>staffStep(g,s,dt));
 g.fx.forEach(f=>f.t-=dt);g.fx=g.fx.filter(f=>f.t>0);
 if(g.t<=0||(g.recs.length>=m.target&&g.sales>=m.sales))endMobile();}
function removePerson(g,p){g.seats[p.seat]=null;g.staff.forEach(s=>{s.q=s.q.filter(x=>x!==p);if(s.task===p){s.task=null;s.prog=0;}});}
function staffStep(g,s,dt){if(!s.task&&s.q.length)s.task=s.q.shift(),s.prog=0;
 if(!s.task){walkEntity(s,s.hx,s.hy,300,dt);return;}
 const p=s.task,seat=MSEATS[p.seat];const lv=levelSpeed(s.key)*STAFF[s.key].speed;
 if(!walkEntity(s,seat.x+58,seat.y+6,430,dt))return;
 const dur=(p.need==='exam'?examSeconds():2.6)/lv;s.prog+=dt;if(s.prog<dur)return;s.prog=0;s.task=null;p.staff=null;
 if(p.need==='exam'){addStaffXp(s.key,6);const r=genRecord(p.k);r.k=p.k;r.name=p.name;g.recs.push(r);softPlay('ok');g.fx.push({x:seat.x,y:seat.y-110,t:1,text:'บันทึกผลแล้ว',col:'#1f5fd0'});
  if(p.wantAdvice){p.need='advice';p.pat=Math.min(100,p.pat+40);}else removePerson(g,p);}
 else{const v=Math.round(rnd(1500,5000)*(1+MISSIONS.indexOf(g.m)*.5));g.sales+=v;g.advice++;earn('lens',v);S.accComm+=v*COMM.sales;S.stats.total+=v;G.today.rev+=v;addStaffXp(s.key,6);softPlay('coin');g.fx.push({x:seat.x,y:seat.y-110,t:1.2,text:'+'+fmt(v),col:'#2f9e3f'});removePerson(g,p);}}
function mobileClick(pos0){const k=H/MH;const pos={x:(pos0.x-(W-MW*k)/2)/k,y:pos0.y/k};const g=G.mobile;if(!g.started||g.ended)return;
 const hitP=()=>g.seats.find((q,i)=>q&&Math.abs(pos.x-MSEATS[i].x)<62&&pos.y<MSEATS[i].y+8&&pos.y>MSEATS[i].y-125);
 const hitS=()=>g.staff.find(s=>Math.abs(pos.x-s.x)<40&&pos.y<s.y+8&&pos.y>s.y-100);
 let p=g.sel?hitP():null;if(!p){const st=hitS();if(st){g.sel=st;softPlay('pick');return;}p=hitP();}if(!p)return;
 const need=p.need==='exam'?'od':'sales';if(p.staff){toast('มีคนรับงานนี้แล้ว');return;}
 let s=g.sel&&g.sel.role===need?g.sel:null;
 if(!s){const c=g.staff.filter(x=>x.role===need);s=c.find(x=>!x.task&&!x.q.length)||c.sort((a,b)=>a.q.length-b.q.length)[0];}
 if(s.q.length>=3){const o=g.staff.filter(x=>x.role===need&&x.q.length<3)[0];if(!o){toast('คิวของพนักงานเต็ม รออีกนิด');return;}s=o;}p.staff=s;s.q.push(p);softPlay('pick');}
function drawMobile(){const g=G.mobile,m=g.m;const k=H/MH;ctx.setTransform(SCALE*k,0,0,SCALE*k,SCALE*(W-MW*k)/2,0);
 ctx.fillStyle='#a9dcf5';ctx.fillRect(-300,0,MW+600,170);ctx.fillStyle='#bfe3a0';ctx.fillRect(-300,170,MW+600,140);ctx.fillStyle='#e9dfc9';ctx.fillRect(-300,300,MW+600,380);ctx.fillStyle='#d9ccb0';for(let y=300;y<MH;y+=40)ctx.fillRect(-300,y,MW+600,1);
 if(!m.noHosp)sprFeet('h_hosp',135,300,270);else{sprFeet('plant',60,300,120);sprFeet('h_flag',170,300,120);}if(hasKit('truck'))sprFeet('k_truck',770,312,200);else sprFeet('h_flag',780,300,120);
 sprFeet('k_tent',450,300,230);sprFeet('k_table',450,316,84);sprFeet('k_chart',310,305,110);sprFeet('h_free',600,308,90);
 if(hasKit('auto'))sprFeet('k_auto',235,350,80);if(hasKit('water'))sprFeet('k_water',860,380,90);
 const list=[];g.seats.forEach((p,i)=>{if(p)list.push({y:MSEATS[i].y,fn:()=>drawPerson(g,p,i)});else list.push({y:MSEATS[i].y-1,fn:()=>{ctx.globalAlpha=.5;sprFeet('k_chair',MSEATS[i].x,MSEATS[i].y,62);ctx.globalAlpha=1;}});});
 g.staff.forEach(s=>list.push({y:s.y,fn:()=>{if(g.sel===s){ctx.strokeStyle='#f6b21b';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(s.x,s.y-1,32,12,0,0,Math.PI*2);ctx.stroke();}
  drawActor(s,s.key,1);label(s.x,s.y+13,s.role==='od'?'ตรวจตา':'แนะนำเลนส์',s.role==='od'?'#1f5fd0':'#c2345f','#fff',11);
  if(s.task){const dur=(s.task.need==='exam'?examSeconds():2.6)/(levelSpeed(s.key)*STAFF[s.key].speed);if(s.prog>0)bar(s.x-30,s.y-112,60,8,s.prog/dur,'#3f7be0');}
  if(s.q.length)label(s.x+32,s.y-100,'+'+s.q.length,'#f08a12','#fff',12);}}));
 list.sort((a,b)=>a.y-b.y).forEach(o=>o.fn());
 ctx.fillStyle='rgba(22,32,74,.92)';ctx.fillRect(170,6,560,52);ctx.textBaseline='middle';ctx.textAlign='center';ctx.font='500 22px Mitr,"Noto Sans Thai",Tahoma,sans-serif';ctx.fillStyle=g.t<20?'#ff8a8a':'#ffd34d';ctx.fillText(`${Math.max(0,Math.ceil(g.t))} วิ`,225,32);
 ctx.font='400 14px Mitr,"Noto Sans Thai",Tahoma,sans-serif';ctx.textAlign='left';ctx.fillStyle='#fff';ctx.fillText(`ตรวจแล้ว ${g.recs.length}/${m.target} คน`,285,22);ctx.fillText(`ยอดขาย ${fmt(g.sales)}/${fmt(m.sales)}`,285,44);ctx.fillText(`รอไม่ไหว ${g.missed} คน`,520,22);ctx.fillText(m.hospital,520,44);
 g.fx.forEach(f=>{ctx.globalAlpha=clamp(f.t,0,1);label(f.x,f.y-(1.2-f.t)*20,f.text,f.col,'#fff',14);ctx.globalAlpha=1;});
 if(!g.started){ctx.fillStyle='rgba(22,32,74,.72)';ctx.fillRect(-300,0,MW+600,MH);ctx.textAlign='center';ctx.fillStyle='#ffd34d';ctx.font='500 110px Mitr,"Noto Sans Thai",Tahoma,sans-serif';ctx.fillText(Math.ceil(g.count),MW/2,MH/2-30);ctx.font='400 22px Mitr,"Noto Sans Thai",Tahoma,sans-serif';ctx.fillStyle='#fff';ctx.fillText('กดพนักงาน แล้วกดคนที่รอ ให้ทันเวลา',MW/2,MH/2+50);}}
function drawPerson(g,p,i){const s=MSEATS[i];const a=ATLAS.pos['s'+p.k];const pop=clamp(p.t*5,0,1);const h=118*pop;if(h>2)sprFeet('s'+p.k,s.x,s.y,h);
 if(pop<1)return;const k=p.need==='exam'?'ic_clip':'ic_q';drawIcon(k,s.x,s.y-128,34*(p.staff?1:1+Math.sin(p.t*5)*.07));const col=p.pat>55?'#2f9e3f':p.pat>25?'#f08a12':'#d8324a';bar(s.x-30,s.y-106,60,7,p.pat/100,col);}
function mobileHint(){const g=G.mobile;if(!g.started)return'เตรียมตัว…';return g.sel?(g.sel.role==='od'?'เลือกพนักงานตรวจตาแล้ว กดคนที่ขึ้นคลิปบอร์ด':'เลือกพนักงานขายแล้ว กดคนที่ขึ้น ?'):'กดพนักงาน แล้วกดคนที่รอ คลิปบอร์ด = วัดตา, ? = แนะนำเลนส์';}

/* ---------- จัดผลส่งโรงพยาบาล ---------- */
function endMobile(){const g=G.mobile;g.ended=true;softPlay('buy');
 const n=Math.min(12,g.recs.length);g.sample=[...g.recs].sort(()=>Math.random()-.5).slice(0,n);g.sample.forEach(r=>r.pick=null);reportDialog();}
function reportDialog(){const g=G.mobile,m=g.m,done=g.sample.filter(r=>r.pick).length;
 openModal(`<div class="sheethead"><h2>จัดผลส่ง${m.hospital}</h2><span class="tag">${done}/${g.sample.length} รายการ</span></div>
 <div class="row">${sprHTML('h_report',54)}<p class="note" style="flex:1;min-width:200px">ตรวจไป ${g.recs.length} คน เลือกกลุ่มให้แบบฟอร์มที่สุ่มตรวจ ก่อนส่ง: <b>ปกติ</b> = มองชัด · <b>ตัดแว่น</b> = แก้ไขด้วยเลนส์ได้ · <b>ส่งต่อจักษุแพทย์</b> = มีอาการหรือสงสัยโรคตา (เกมสมมติ ไม่ใช่เกณฑ์ทางการแพทย์)</p></div>
 <div class="reclist">${g.sample.map((r,i)=>`<div class="rec">${sprHTML('s'+r.k,44)}<span class="tx"><b>${r.name} อายุ ${r.age} · VA ${r.va}</b><small>${r.note}</small></span><span class="row rc">${Object.keys(FINDING).map(k=>`<button class="tab ${r.pick===k?'on':''}" data-i="${i}" data-k="${k}">${FINDING[k]}</button>`).join('')}</span></div>`).join('')||'<p class="note">ไม่มีผลตรวจให้ส่ง</p>'}</div>
 <div class="row"><button class="btn gold" data-send="1" ${done<g.sample.length?'disabled':''}>ส่งผลให้โรงพยาบาล</button></div>`,{lock:true,wide:true});
 const b=$('#modal');const top=b.querySelector('.sheet').scrollTop;b.querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>{const s=b.querySelector('.sheet').scrollTop;g.sample[+x.dataset.i].pick=x.dataset.k;reportDialog();b.querySelector('.sheet').scrollTop=s;});
 b.querySelector('[data-send]').onclick=()=>finishMobile();}
function finishMobile(){const g=G.mobile,m=g.m;const right=g.sample.filter(r=>r.pick===r.ans).length;const acc=g.sample.length?right/g.sample.length:0;
 const examPct=Math.min(1,g.recs.length/m.target),salesPct=Math.min(1,g.sales/m.sales);const score=Math.round(examPct*50+salesPct*20+acc*30)+(hasKit('laptop')?5:0);
 const pass=g.recs.length>=m.target&&g.sales>=m.sales;const rank=!pass?(score>=60?'C':'D'):score>=95?'S':score>=85?'A':'B';
 const mult={S:1.5,A:1.25,B:1,C:.35,D:.15}[rank];const first=pass&&!S.hosp.done[m.id];const money=m.money*mult*(pass&&!first?.6:1);
 earn('prize',money);
 if(pass){S.hosp.done[m.id]=1;S.rep=clamp(S.rep+m.rep,1,5);addXp(first?m.xp:Math.round(m.xp*.4));}else addXp(Math.round(m.xp*.2));
 const order=['D','C','B','A','S'];if(!S.hosp.best[m.id]||order.indexOf(rank)>order.indexOf(S.hosp.best[m.id]))S.hosp.best[m.id]=rank;
 const cnt={normal:0,glasses:0,refer:0};g.recs.forEach(r=>cnt[r.ans]++);S.stats.mobileExams=(S.stats.mobileExams||0)+g.recs.length;
 S.hosp.reports.push({m:m.id,day:S.day,exam:g.recs.length,sales:g.sales,rank,acc:Math.round(acc*100),cnt});if(S.hosp.reports.length>30)S.hosp.reports.shift();
 G.today.served+=g.recs.length;G.mobile=null;G.chairs=[null,null];SND.fast=false;$('#rail').classList.remove('locked');checkTrophies();saveGame(true);
 const next=MISSIONS.filter(x=>x.req===m.id).map(x=>x.hospital).join(', ');softPlay(pass?'buy':'bad');
 openModal(`<div class="sheethead"><h2>ผลออกหน่วย: แรงค์ ${rank}</h2></div>
 <div class="monthhead"><div><small>แรงค์</small><b class="${pass?'pos':'neg'}">${rank}</b></div><div><small>เงินรางวัล</small><b>${fmt(money)}</b></div><div><small>คะแนน</small><b>${score}</b></div></div>
 <table class="ledger"><tbody><tr><td>ตรวจสายตา</td><td>${g.recs.length}/${m.target} คน ${g.recs.length>=m.target?'✓':'✗'}</td></tr><tr><td>ยอดขาย</td><td>${fmt(g.sales)}/${fmt(m.sales)} ${g.sales>=m.sales?'✓':'✗'}</td></tr><tr><td>จัดผลถูกต้อง</td><td>${right}/${g.sample.length} รายการ</td></tr><tr><td>สรุปส่งโรงพยาบาล</td><td>ปกติ ${cnt.normal} · ตัดแว่น ${cnt.glasses} · ส่งต่อ ${cnt.refer}</td></tr></tbody></table>
 ${first&&next?`<p class="tag ok">ปลดล็อก ${next} แล้ว</p>`:''}${pass?'':'<p class="err">ยังไม่ถึงเป้า จึงได้ค่าตอบแทนบางส่วน และยังไม่ปลดล็อกภารกิจถัดไป</p>'}
 <div class="row"><button class="btn gold" data-ok="1">จบวัน</button></div>`,{lock:true});
 $('#modal [data-ok]').onclick=()=>{closeModal();G.closing=true;S.dayT=DAY_LEN;G.summary=false;renderRail();};}

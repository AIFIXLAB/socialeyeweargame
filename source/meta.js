/* ===== ระบบเดือน บัญชี แผนที่ แข่งขัน อบรม โทรฟี่ =====
 เพิ่มหลักสูตร บริษัท ร้านคู่แข่ง หรือโทรฟี่ใหม่ได้โดยเพิ่มข้อมูลในตาราง ไม่ต้องแก้ระบบหลัก */
const MONTH_DAYS=10;
const INCOME={exam:'ค่าตรวจวัดสายตา',lens:'ขายเลนส์',frame:'ขายกรอบ/งานซ่อม',tip:'ทิป',prize:'เงินรางวัลแข่งขัน',branch:'กำไรจากสาขา',reward:'รางวัลโทรฟี่',depInt:'ดอกเบี้ยเงินฝาก'};
const EXPENSE={rent:'ค่าเช่าร้าน',util:'ค่าน้ำค่าไฟ',salary:'เงินเดือนพนักงาน',comm:'ค่าคอมมิชชัน',lensBuy:'สั่งเลนส์',frameCost:'ต้นทุนกรอบ',equip:'ซื้ออุปกรณ์/ตกแต่ง',hire:'ค่าจ้างเริ่มงาน',train:'ค่าอบรม',incident:'เหตุการณ์ไม่คาดคิด',loanInt:'ดอกเบี้ยเงินกู้',ipo:'ค่าเปิดหุ้น',attack:'การ์ดโจมตีและป้องกัน'};
const COMM={sales:.05,od:.10,tech:30};
function blankLedger(){const o={};Object.keys(INCOME).forEach(k=>o[k]=0);Object.keys(EXPENSE).forEach(k=>o[k]=0);return o;}
function sumIncome(l){return Object.keys(INCOME).reduce((a,k)=>a+(l[k]||0),0);}
function sumExpense(l){return Object.keys(EXPENSE).reduce((a,k)=>a+(l[k]||0),0);}
function earn(k,n){S.money+=n;S.ledger[k]=(S.ledger[k]||0)+n;}
function spend(k,n){S.money-=n;S.ledger[k]=(S.ledger[k]||0)+n;}
function monthOf(d){return Math.floor((d-1)/MONTH_DAYS)+1;}
function dayInMonth(d){return (d-1)%MONTH_DAYS+1;}
function costK(){return DAY_LEN/150;}
function monthlySalary(k){return Math.round(STAFF[k].salary*MONTH_DAYS*costK());}
function rentFee(){return Math.round((25000+(own('chair2')?5000:0)+(own('seat2')?3000:0)+S.branches.length*4000)*costK());}
function utilFee(){return Math.round((5000+Object.keys(S.owned).length*450+S.staff.length*600)*costK());}
function salaryFee(){return S.staff.reduce((a,k)=>a+monthlySalary(k),0);}
function dailyTarget(){return Math.round((9000+S.day*700)*costK());}

/* ---------- พนักงาน: เลเวล ประสบการณ์ ---------- */
const STAFF_YEARS={od1:1,od2:3,od3:8,sl1:.5,sl2:2,sl3:5,te1:.5,te2:2,te3:6};
const STAFF_LV={od1:2,od2:2,od3:3,sl1:1,sl2:2,sl3:3,te1:1,te2:2,te3:3};
const MAX_STAFF_LV=5;
function sdOf(k){if(!S.staffData[k])S.staffData[k]={lv:k==='owner'?2:STAFF_LV[k]||1,xp:0,years:k==='owner'?1:STAFF_YEARS[k]||0,courses:[],training:null};return S.staffData[k];}
function staffName(k){return k==='owner'?`${S.owner.name} (เจ้าของร้าน)`:staffNameOf(k);}
function staffSprite(k){return k==='owner'?playerKey()+'f':k+'f';}
function addStaffXp(k,n){const d=sdOf(k);if(d.lv>=MAX_STAFF_LV)return;d.xp+=n;const need=d.lv*100;if(d.xp>=need){d.xp-=need;d.lv++;log(`${staffName(k)} เลื่อนเป็น Lv.${d.lv}`,'g');}}
function levelSpeed(k){return 1+(sdOf(k).lv-1)*.06;}

/* ---------- Skill Tree: เพิ่มหลักสูตรใหม่ที่ตารางนี้ ---------- */
const COURSES=[
 {id:'base',brand:'SocialEyewear',name:'หลักสูตรพื้นฐานของร้าน',spr:'a_home',tier:0,req:{years:0,lv:1,courses:[]},cost:3000,days:1,fx:'ปูพื้นฐาน เป็นเงื่อนไขของทุกหลักสูตร',sat:.05},
 {id:'hoya',brand:'Hoya',name:'HOYA Basic',spr:'a_hoya',tier:1,req:{years:1,lv:2,courses:['base']},cost:12000,days:1,fx:'ปลดล็อก Sensity Dark · ยอดขายเลนส์ Hoya +10%',bonus:.1,sat:.1,scene:'sc_hoya'},
 {id:'nikon',brand:'Nikon',name:'Nikon Lens Training',spr:'a_nikon',tier:1,req:{years:1,lv:2,courses:['base']},cost:14000,days:1,fx:'ปลดล็อก Nikon SeeMax · ยอดขายเลนส์ Nikon +10%',bonus:.1,sat:.1},
 {id:'tokai',brand:'Tokai',name:'Tokai Lens Academy',spr:'a_tokai',tier:1,req:{years:1,lv:2,courses:['base']},cost:14000,days:1,fx:'ปลดล็อกเลนส์ Tokai · ยอดขายเลนส์ Tokai +10%',bonus:.1,sat:.1},
 {id:'mitsui',brand:'Mitsui',name:'Mitsui Lens Academy',spr:'a_mitsui',tier:1,req:{years:1,lv:2,courses:['base']},cost:14000,days:1,fx:'ปลดล็อกเลนส์ Mitsui · ยอดขายเลนส์ Mitsui +10%',bonus:.1,sat:.1},
 {id:'transitions',brand:'Transitions',name:'Transitions Academy',spr:'a_transitions',tier:2,req:{years:1,lv:3,courses:['hoya']},cost:22000,days:2,fx:'ปลดล็อก Transitions GEN S · ยอดขาย +12%',bonus:.12,sat:.1},
 {id:'zeiss',brand:'ZEISS',name:'ZEISS Advanced',spr:'a_zeiss',tier:2,req:{years:1.5,lv:3,courses:['hoya']},cost:30000,days:2,fx:'ปลดล็อกเลนส์ ZEISS Premium · ยอดขาย +15%',bonus:.15,sat:.15,scene:'sc_zeiss'},
 {id:'essilor',brand:'Essilor',name:'Essilor Expert',spr:'a_essilor',tier:2,req:{years:1.5,lv:3,courses:['nikon']},cost:30000,days:2,fx:'ปลดล็อกโปรเกรสซีฟ Varilux · ยอดขาย +15%',bonus:.15,sat:.15,scene:'sc_essilor'},
 {id:'shamir',brand:'Shamir',name:'Shamir Vision Training',spr:'a_shamir',tier:2,req:{years:1.5,lv:3,courses:['tokai']},cost:28000,days:2,fx:'ปลดล็อก Shamir Autograph · ยอดขาย +12%',bonus:.12,sat:.1},
 {id:'rodenstock',brand:'Rodenstock',name:'Rodenstock Master',spr:'a_rodenstock',tier:3,req:{years:2,lv:4,courses:['zeiss','essilor']},cost:60000,days:3,fx:'ปลดล็อกเลนส์เฉพาะบุคคลระดับสูงสุด · ยอดขาย +20%',bonus:.2,sat:.2,scene:'sc_rodenstock'},
 {id:'leica',brand:'Leica',name:'Leica Eyewear Training',spr:'a_leica',tier:3,req:{years:2,lv:4,courses:['zeiss']},cost:50000,days:3,fx:'ปลดล็อกเลนส์ Leica · ยอดขาย +20%',bonus:.2,sat:.2}
];
const COURSE=Object.fromEntries(COURSES.map(c=>[c.id,c]));
/* สินค้าที่ปลดล็อกจากหลักสูตร: kind บอกว่าตรงกับความต้องการแบบไหน */
Object.assign(LENSES,{
 hoya_dark:{name:'Sensity Dark',brand:'Hoya',kind:'sensity',course:'hoya',desc:'เปลี่ยนสีเข้มเป็นพิเศษ',cost:1800,price:4700,fee:0,pack:4,premium:1},
 nikon_see:{name:'Nikon SeeMax',brand:'Nikon',kind:'nulux',course:'nikon',desc:'บางคมชัดจากขอบถึงกลางเลนส์',cost:1500,price:3900,fee:0,pack:4,premium:1},
 tokai_blue:{name:'Tokai Blue Plus',brand:'Tokai',kind:'blue',course:'tokai',desc:'ลดแสงสีฟ้า เคลือบใสพิเศษ',cost:1400,price:3700,fee:0,pack:4,premium:1},
 mitsui_thin:{name:'Mitsui MR Series',brand:'Mitsui',kind:'nulux',course:'mitsui',desc:'วัสดุดัชนีหักเหสูง บางเบา',cost:1300,price:3500,fee:0,pack:4,premium:1},
 trans_gen:{name:'Transitions GEN S',brand:'Transitions',kind:'sensity',course:'transitions',desc:'เปลี่ยนสีไว หลายเฉดสี',cost:2300,price:5800,fee:0,pack:4,premium:1},
 zeiss_blue:{name:'ZEISS Blue Protect',brand:'ZEISS',kind:'blue',course:'zeiss',desc:'เคลือบลดแสงสีฟ้าระดับพรีเมียม',cost:2500,price:6200,fee:0,pack:3,premium:1},
 zeiss_drive:{name:'ZEISS DriveSafe',brand:'ZEISS',kind:'long',course:'zeiss',desc:'เหมาะกับคนขับรถ เคลือบทนทาน',cost:3000,price:7400,fee:0,pack:3,premium:1},
 zeiss_photo:{name:'ZEISS PhotoFusion',brand:'ZEISS',kind:'sensity',course:'zeiss',desc:'เปลี่ยนสีรุ่นพรีเมียม',cost:3200,price:7900,fee:0,pack:3,premium:1},
 essilor_var:{name:'Essilor Varilux',brand:'Essilor',kind:'prog',course:'essilor',desc:'โปรเกรสซีฟ มองทุกระยะ',cost:7500,price:18000,fee:0,pack:2,premium:1,need:'slit'},
 shamir_auto:{name:'Shamir Autograph',brand:'Shamir',kind:'prog',course:'shamir',desc:'โปรเกรสซีฟออกแบบเฉพาะตัว',cost:7000,price:17000,fee:0,pack:2,premium:1,need:'slit'},
 leica_pro:{name:'Leica Premium',brand:'Leica',kind:'prog',course:'leica',desc:'เลนส์ระดับสูงสำหรับสายตาเฉพาะทาง',cost:10000,price:24000,fee:0,pack:2,premium:1,need:'slit'},
 roden_top:{name:'Rodenstock Individual',brand:'Rodenstock',kind:'prog',course:'rodenstock',desc:'ออกแบบเฉพาะบุคคล ระดับสูงสุดของร้าน',cost:13000,price:32000,fee:0,pack:2,premium:1,need:'slit'}
});
function lensKind(id){return LENSES[id].kind||id;}
function lensBrand(id){return LENSES[id].brand||'Hoya';}
function courseDone(id){return Object.values(S.staffData).some(d=>d.courses.includes(id));}
function saleBonus(id){return COURSES.reduce((a,c)=>a+(c.bonus&&c.brand===lensBrand(id)&&courseDone(c.id)?c.bonus:0),0);}
function satBonus(){return COURSES.reduce((a,c)=>a+(courseDone(c.id)?(c.sat||0):0),0);}
function lensPrice(id){return LENSES[id].price*repMul()*(1+saleBonus(id));}
function bestLensFor(kind){const a=Object.keys(LENSES).filter(id=>lensKind(id)===kind&&lensAvailable(id)&&lensState(id).stock>0);a.sort((x,y)=>LENSES[y].price-LENSES[x].price);return a[0]||null;}
function courseReqs(c,k){const d=sdOf(k);return[
 {ok:d.years>=c.req.years,t:`ประสบการณ์ทำงาน ${c.req.years} ปีขึ้นไป (มี ${d.years.toFixed(1)} ปี)`},
 {ok:d.lv>=c.req.lv,t:`พนักงาน Lv.${c.req.lv} ขึ้นไป (ตอนนี้ Lv.${d.lv})`},
 ...c.req.courses.map(x=>({ok:d.courses.includes(x),t:`ผ่าน ${COURSE[x].name}`}))];}
let trainWho='owner';
function trainDialog(){
 const people=['owner',...S.staff];if(!people.includes(trainWho))trainWho='owner';const d=sdOf(trainWho);
 const tiers=[0,1,2,3].map(t=>{const cs=COURSES.filter(c=>c.tier===t);return `<h3>${['พื้นฐาน','ระดับต้น','ระดับสูง','ระดับเชี่ยวชาญ'][t]}</h3><div class="grid">${cs.map(c=>{const done=d.courses.includes(c.id),reqs=courseReqs(c,trainWho),ok=reqs.every(r=>r.ok),busy=d.training;
  return `<div class="item col ${done?'owned':ok?'':'off'}"><span class="row" style="flex-wrap:nowrap">${sprHTML(c.spr,54)}<span class="tx"><b>${c.name}</b><small>${c.fx}</small></span></span>
  <ul class="check">${reqs.map(r=>`<li class="${r.ok?'yes':'no'}">${r.ok?'✓':'✗'} ${r.t}</li>`).join('')}</ul>
  ${done?'<span class="tag ok">ผ่านแล้ว · มีใบประกาศ</span>':`<button class="btn" data-train="${c.id}" ${!ok||busy||S.money<c.cost?'disabled':''}>สมัคร ${fmt(c.cost)} · ${c.days} วัน</button>`}</div>`;}).join('')}</div>`;}).join('');
 openModal(`<div class="sheethead"><h2>อบรมพนักงาน</h2><span class="price">${fmt(S.money)}</span><button class="btn plain" data-c="1">ปิด</button></div>
 <div class="tabs">${people.map(k=>`<button class="tab ${k===trainWho?'on':''}" data-who="${k}">${staffName(k)}</button>`).join('')}</div>
 <div class="say">${sprHTML(staffSprite(trainWho),74)}<p>${staffName(trainWho)} · Lv.${d.lv} · ประสบการณ์ ${d.years.toFixed(1)} ปี · ใบประกาศ ${d.courses.length}/${COURSES.length}${d.training?`<br><span class="tag">กำลังอบรม ${COURSE[d.training.id].name} อีก ${d.training.left} วัน</span>`:''}</p></div>
 ${tiers}<p class="note">เกมสมมติ ไม่ได้เกี่ยวข้องหรือรับรองโดยบริษัทเลนส์ ใบประกาศใช้ในเกมเท่านั้น โบนัสไม่ใช่ผลลัพธ์ทางธุรกิจจริง · พนักงานจะหยุดงานระหว่างอบรม</p>`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;
 m.querySelectorAll('[data-who]').forEach(b=>b.onclick=()=>{trainWho=b.dataset.who;trainDialog();});
 m.querySelectorAll('[data-train]').forEach(b=>b.onclick=()=>{const c=COURSE[b.dataset.train];if(S.money<c.cost)return;spend('train',c.cost);d.training={id:c.id,left:c.days};
  if(trainWho!=='owner'){const w=G.workers.find(w=>w.key===trainWho);if(w&&w.task){const t=w.task;if(t.c)t.c.owner=null;if(t.j)t.j.owner=null;w.task=null;}}
  beep('buy');log(`${staffName(trainWho)} เริ่มอบรม ${c.name}`);saveGame(true);trainDialog();renderRail();});
}
function tickTraining(){Object.keys(S.staffData).forEach(k=>{const d=S.staffData[k];if(!d.training)return;d.training.left--;if(d.training.left<=0){const c=COURSE[d.training.id];d.courses.push(c.id);d.training=null;addStaffXp(k,60);log(`${staffName(k)} ผ่าน ${c.name} แล้ว`,'g');}});}
function isTraining(k){if(G&&G.mpT&&G.mpT.strike>0&&k!=='owner')return true;if(G&&G.dayFx&&G.dayFx.sick===k)return true;const d=S.staffData[k];return !!(d&&d.training&&k!=='owner');}

/* ---------- สต็อกและยอดขาย ---------- */
function recordSale(c){const st=S.stats;(c.sold||[]).forEach(x=>{
  if(x.t==='lens'){st.lensSold++;st.kinds[lensKind(x.id)]=1;if(LENSES[x.id].premium)st.premium++;if(lensKind(x.id)==='blue')st.blue++;
   const top=Math.max(...Object.keys(LENSES).filter(lensAvailable).map(i=>LENSES[i].price));if(LENSES[x.id].price>=top&&top>=9000)st.topItem=1;}
  if(x.t==='frame'){if(x.cat==='color'||x.cat==='fun')st.fashion++;if(x.cat==='sun')st.sun++;if(c.k==='c7')st.sport++;}
 });
 st.sales+=1;
 if(c.lens==='blue')st.computer++;
 if(c.k==='c10'){st.families++;st.kids++;}
 if(c.k==='c3'||c.k==='c4')st.kids++;
 if(c.k==='c5'||c.k==='c6')st.seniors++;
 if(c.vip)st.vip++;
 const score=clamp(55+c.sat*20+c.pat*.25,0,100);st.satSum+=score;st.satN++;return score;
}

/* ---------- เลเวลร้าน ---------- */
function xpNeed(l){return 60+l*12;}
function addXp(n){S.xp+=n;while(S.level<99&&S.xp>=xpNeed(S.level)){S.xp-=xpNeed(S.level);S.level++;log(`ร้านขึ้น Level ${S.level}`,'g');beep('buy');}}

/* ---------- ร้านคู่แข่งและแผนที่: เพิ่มร้านใหม่ที่ตารางนี้ ---------- */
const AREAS=[{name:'ย่านกลางเมือง'},{name:'ย่านริมน้ำ'},{name:'ย่านธุรกิจ'}];
const RIVALS=[
 {id:'vision',name:'VisionPlus',spr:'r_vision',area:0,x:16.5,y:30,pace:45,prize:15000,branch:150000,income:18000,say:'ร้านแว่นเจ้าถิ่น ราคาจับต้องได้'},
 {id:'eyestyle',name:'EyeStyle',spr:'r_eyestyle',area:0,x:82,y:53,pace:70,prize:25000,branch:220000,income:26000,say:'เน้นกรอบแฟชั่น ลูกค้าวัยรุ่นเยอะ'},
 {id:'lens',name:'LensWorld',spr:'r_lens',area:1,x:22,y:69,pace:100,prize:40000,branch:320000,income:38000,say:'เลนส์ครบทุกแบบ บริการไว'},
 {id:'optic',name:'OpticPro',spr:'r_optic',area:1,x:88,y:76,pace:140,prize:70000,branch:450000,income:52000,say:'ทีมช่างฝีมือ งานละเอียด'},
 {id:'clear',name:'ClearView',spr:'r_clear',area:2,x:87,y:29,pace:190,prize:120000,branch:650000,income:75000,say:'ร้านใหญ่ เครื่องมือครบ'},
 {id:'mega',name:'MegaOptic',spr:'r_mega',area:2,x:30,y:19,pace:260,prize:250000,branch:1000000,income:110000,say:'เชนใหญ่ที่สุดในเมือง แชมป์เก่า'}
];
const RIVAL=Object.fromEntries(RIVALS.map(r=>[r.id,r]));
const EVENT_LEN=90,EVENT_COOL=2;
function rivalOpen(r){const i=RIVALS.indexOf(r);if(r.area>=S.areas)return false;return i===0||S.ev.beat[RIVALS[i-1].id]||RIVALS[i-1].area<r.area;}
function coolLeft(r){const d=S.ev.last[r.id];return d==null?0:Math.max(0,d+EVENT_COOL-S.day);}
function cityRows(){const m=monthOf(S.day);const rows=RIVALS.map(r=>({name:r.name,spr:r.spr,v:Math.round(r.pace*170*m*(S.ev.beat[r.id]?.8:1)),me:false}));rows.push({name:S.shopName,spr:'r_home',v:Math.round(S.stats.total),me:true});return rows.sort((a,b)=>b.v-a.v);}
function cityRank(){return cityRows().findIndex(r=>r.me)+1;}
let mapTab='map';
function mapDialog(){
 const tabs=`<div class="tabs"><button class="tab ${mapTab==='map'?'on':''}" data-t="map">แผนที่เมือง</button><button class="tab ${mapTab==='rank'?'on':''}" data-t="rank">อันดับยอดขายในเมือง</button></div>`;
 let body='';
 if(mapTab==='map'){
  body=`<div class="citymap" id="cmap"><img src="${IMG.map.src}" alt="แผนที่เมือง มีร้านแว่นของเราอยู่ตรงกลาง และร้านคู่แข่งรอบเมือง">
  ${RIVALS.map(r=>{const o=rivalOpen(r),b=S.ev.beat[r.id],br=S.branches.includes(r.id);return `<button class="mpin ${o?'':'locked'} ${b?'beat':''}" style="left:${r.x}%;top:${r.y}%" data-r="${r.id}" ${o?'':'aria-disabled="true"'}>${sprHTML(r.spr,64)}<span>${o?r.name:'ล็อก'}${br?' · สาขา':b?' ✓':''}</span></button>`;}).join('')}
  <div class="mpin me" style="left:52%;top:45%"><span>ร้านของเรา</span></div>
  <div id="traveler" hidden>${sprHTML('od1s',44)}</div></div>
  <div class="row">${AREAS.map((a,i)=>`<span class="tag ${i<S.areas?'ok':'no'}">${a.name}${i<S.areas?'':' · ล็อก'}</span>`).join('')}</div>
  <p class="note">ชนะร้านเพื่อปลดล็อกร้านถัดไป ชนะครบทุกร้านในย่านเพื่อเปิดย่านใหม่</p>`;
 }else{const rows=cityRows();body=`<div class="say">${sprHTML('e_rank',70)}<p>อันดับยอดขายสะสมทั้งเมือง คุณอยู่อันดับ ${cityRank()}</p></div>
  <table class="ledger"><tbody>${rows.map((r,i)=>`<tr class="${r.me?'hl':''}"><td>${i+1}. ${r.name}</td><td>${fmt(r.v)}</td></tr>`).join('')}</tbody></table>
  <h3>ประวัติการแข่ง</h3>${(S.ev.hist||[]).length?`<table class="ledger"><tbody>${[...S.ev.hist].reverse().slice(0,10).map(h=>`<tr><td>${h.r} · ${EVMODES[h.m].name}</td><td>อันดับ ${h.k}</td></tr>`).join('')}</tbody></table>`:'<p class="note">ยังไม่เคยแข่ง</p>'}`;}
 openModal(`<div class="sheethead"><h2>แผนที่นอกร้าน</h2><span class="note">${leagueName()} · ชนะแล้ว ${S.ev.wins} ครั้ง</span><button class="btn plain" data-c="1">กลับร้าน</button></div>${tabs}${body}`,{wide:true});
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;
 m.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{mapTab=b.dataset.t;mapDialog();});
 m.querySelectorAll('.mpin[data-r]').forEach(b=>b.onclick=()=>{const r=RIVAL[b.dataset.r];if(rivalOpen(r))rivalDialog(r);else toast('ยังไม่ปลดล็อก ชนะร้านก่อนหน้าก่อน');});
}
let evMode='sales';
function rivalDialog(r){
 const b=S.ev.beat[r.id],cool=coolLeft(r),prize=eventPrize(r),own_=S.branches.includes(r.id);
 const blocked=G.event?'กำลังแข่งอยู่':G.closing?'ร้านปิดรับลูกค้าแล้ว รอเปิดวันใหม่':cool?`แข่งร้านนี้ได้อีกครั้งใน ${cool} วัน`:'';
 openModal(`<div class="sheethead"><h2>${r.name}</h2><button class="btn plain" data-back="1">กลับแผนที่</button></div>
 <div class="say">${sprHTML(r.spr,110)}<p>${r.say}<br><span class="tag">${AREAS[r.area].name}</span> ${b?'<span class="tag ok">เคยชนะแล้ว</span>':''}</p></div>
 <table class="ledger"><tbody><tr><td>เวลาแข่ง</td><td>${EVENT_LEN} วินาที</td></tr><tr><td>อันดับ 1</td><td>${fmt(prize)}</td></tr><tr><td>อันดับ 2</td><td>${fmt(prize*.3)}</td></tr><tr><td>อันดับ 3</td><td>${fmt(prize*.1)}</td></tr></tbody></table>
 <p class="note">เกมจะพาคุณกลับมาขายในร้านของตัวเอง ระหว่างแข่งลูกค้าเข้าเยอะขึ้น และนับยอดจากบิลที่จ่ายเงินแล้วเท่านั้น</p>
 <div class="tabs">${Object.keys(EVMODES).map(k=>`<button class="tab ${k===evMode?'on':''}" data-mode="${k}">${EVMODES[k].name}</button>`).join('')}</div><p class="note">${EVMODES[evMode].say}</p>
 <div class="row"><button class="btn gold" data-go="1" ${blocked?'disabled':''}>เดินทางไปท้าแข่ง</button>
 ${b&&!own_?`<button class="btn green" data-branch="1" ${S.money<r.branch?'disabled':''}>ซื้อเป็นสาขา ${fmt(r.branch)} · กำไร ${fmt(r.income)}/เดือน</button>`:''}${own_?'<span class="tag ok">เป็นสาขาของเราแล้ว</span>':''}</div>${blocked?`<p class="err">${blocked}</p>`:''}`);
 const m=$('#modal');m.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{evMode=b.dataset.mode;rivalDialog(r);});m.querySelector('[data-back]').onclick=mapDialog;
 const br=m.querySelector('[data-branch]');if(br)br.onclick=()=>{spend('equip',r.branch);S.branches.push(r.id);beep('buy');log(`เปิดสาขา ${r.name} แล้ว`,'g');checkTrophies();saveGame(true);rivalDialog(r);renderRail();};
 m.querySelector('[data-go]').onclick=()=>travelTo(r);
}
function eventPrize(r){return S.ev.beat[r.id]?r.prize*.5:r.prize;}
function travelTo(r){mapTab='map';mapDialog();const m=$('#modal');m._o.lock=true;m.querySelectorAll('button').forEach(b=>b.disabled=true);
 const t=$('#traveler');t.hidden=false;t.style.left='52%';t.style.top='45%';const go=()=>{t.style.left=r.x+'%';t.style.top=r.y+'%';};requestAnimationFrame(()=>requestAnimationFrame(go));
 setTimeout(()=>{closeModal();startEvent(r);},1300);}
function startEvent(r){
 const i=RIVALS.indexOf(r);const others=RIVALS.filter(x=>x!==r&&Math.abs(RIVALS.indexOf(x)-i)<=2).slice(0,2);
 G.event={id:r.id,mode:evMode,t:EVENT_LEN,me:0,rows:[{id:r.id,name:r.name,sales:0,pace:r.pace},...others.map(o=>({id:o.id,name:o.name,sales:0,pace:r.pace*.72}))]};
 G.spawn=Math.min(G.spawn,1);S.stats.events++;S.ev.last[r.id]=S.day;checkTrophies();log(`เริ่มแข่งยอดขายกับ ${r.name}`);beep('buy');}
function tickEvent(dt){const e=G.event;e.t-=dt;e.rows.forEach(x=>{x.sales+=x.pace*dt*rnd(.75,1.25);});if(e.t<=0)finishEvent();}
function eventRank(){const e=G.event;return e.rows.filter(x=>x.sales>e.me).length+1;}
function finishEvent(){const e=G.event,r=RIVAL[e.id];G.event=null;
 const rows=[...e.rows,{name:S.shopName,sales:e.me,me:true}].sort((a,b)=>b.sales-a.sales);const rank=rows.findIndex(x=>x.me)+1;
 const base=eventPrize(r),prize=rank===1?base:rank===2?base*.3:rank===3?base*.1:0;
 if(prize)earn('prize',prize);const st=S.ev;(st.hist=st.hist||[]).push({r:r.name,m:e.mode,k:rank});if(st.hist.length>40)st.hist.shift();
 if(rank===3)st.bronze=1;if(rank===2)st.silver=1;
 let unlocked='';
 if(rank===1){st.gold=1;st.wins++;const first=!st.beat[r.id];st.beat[r.id]=1;addXp(first?120:40);
  const areaDone=RIVALS.filter(x=>x.area===r.area).every(x=>st.beat[x.id]);
  if(first&&areaDone&&S.areas<AREAS.length&&r.area===S.areas-1){S.areas++;unlocked=`ปลดล็อก ${AREAS[S.areas-1].name} แล้ว`;}
  else if(first){const nx=RIVALS[RIVALS.indexOf(r)+1];if(nx&&rivalOpen(nx))unlocked=`ปลดล็อกร้าน ${nx.name} แล้ว`;}}
 checkTrophies();saveGame(true);beep(rank===1?'buy':'bad');
 openModal(`<div class="sheethead"><h2>ผลแข่งกับ ${r.name}</h2></div>
 <div class="say">${sprHTML('e_podium',76)}<p>${rank===1?'คุณชนะ!':`คุณได้อันดับ ${rank}`}${prize?` รับเงินรางวัล ${fmt(prize)}`:' รอบนี้ไม่ได้เงินรางวัล'}${unlocked?`<br><span class="tag ok">${unlocked}</span>`:''}</p></div>
 <table class="ledger"><tbody>${rows.map((x,i)=>`<tr class="${x.me?'hl':''}"><td>${i+1}. ${x.name}</td><td>${evFmt(e.mode,x.sales)}</td></tr>`).join('')}</tbody></table>
 <div class="row"><button class="btn gold" data-c="1">กลับไปขายต่อ</button></div>`,{lock:true});
 $('#modal [data-c]').onclick=closeModal;renderRail();}
function drawEventHud(){const e=G.event;if(!e)return;ctx.save();ctx.scale(1.4,1.4);const rows=[...e.rows.map(x=>({n:x.name,v:x.sales})),{n:'ร้านเรา',v:e.me,me:1}].sort((a,b)=>b.v-a.v);
 const x=(W/1.4-400)/2,y=8,w=400,h=26+rows.length*22;ctx.fillStyle='rgba(22,32,74,.92)';ctx.fillRect(x,y,w,h);
 ctx.font='500 15px Mitr,"Noto Sans Thai",Tahoma,sans-serif';ctx.fillStyle='#ffd34d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`${EVMODES[e.mode].name} · เหลือ ${Math.ceil(e.t)} วินาที`,x+w/2,y+14);
 const mx=Math.max(1,...rows.map(r=>r.v));rows.forEach((r,i)=>{const yy=y+28+i*22;ctx.textAlign='left';ctx.font='400 13px Mitr,"Noto Sans Thai",Tahoma,sans-serif';ctx.fillStyle=r.me?'#ffd34d':'#fff';ctx.fillText(`${i+1}. ${r.n}`,x+10,yy+7);
  ctx.fillStyle='#3a4678';ctx.fillRect(x+130,yy+1,170,12);ctx.fillStyle=r.me?'#f6b21b':'#6fa3ff';ctx.fillRect(x+130,yy+1,170*r.v/mx,12);ctx.textAlign='right';ctx.fillStyle='#fff';ctx.fillText(evFmt(e.mode,r.v),x+w-10,yy+7);});ctx.restore();}

/* ---------- บัญชีและกราฟเส้น ---------- */
function lineChart(labels,series,title){
 const W_=720,H_=280,L=78,R=34,T=16,B=34;const all=series.flatMap(s=>s.values);if(!all.length)return'<p class="note">ยังไม่มีข้อมูล เล่นจบวันแรกแล้วกราฟจะเริ่มแสดง</p>';
 const mn=Math.min(0,...all);let mx=Math.max(0,...all);if(mn===mx)mx=1;const raw=(mx-mn)/4,p10=Math.pow(10,Math.floor(Math.log10(raw))),st=[1,2,2.5,5,10].map(k=>k*p10).find(k=>k>=raw);
 const bot=Math.floor(mn/st)*st,top=Math.ceil(mx/st)*st;const n=labels.length;
 const X=i=>L+(n===1?(W_-L-R)/2:i*(W_-L-R)/(n-1)),Y=v=>T+(top-v)/(top-bot)*(H_-T-B);
 const ticks=[];for(let v=bot;v<=top+st/2;v+=st)ticks.push(v);const short=v=>Math.abs(v)>=1e6?(v/1e6).toFixed(1)+'M':Math.abs(v)>=1000?Math.round(v/1000)+'k':Math.round(v);
 const step=Math.max(1,Math.ceil(n/10));
 const svg=`<svg viewBox="0 0 ${W_} ${H_}" class="chart" role="img" aria-label="${esc(title)}">
 ${ticks.map(t=>`<line x1="${L}" x2="${W_-R}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${L-8}" y="${Y(t)+4}" text-anchor="end" class="ax">${short(t)}</text>`).join('')}
 <line x1="${L}" x2="${W_-R}" y1="${Y(0)}" y2="${Y(0)}" class="zero"/>
 ${labels.map((l,i)=>i%step===0||i===n-1?`<text x="${X(i)}" y="${H_-10}" text-anchor="middle" class="ax">${esc(l)}</text>`:'').join('')}
 ${series.map((s,si)=>`<polyline fill="none" stroke="var(--chart${si+1})" stroke-width="2" stroke-linejoin="round" points="${s.values.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)).join(' ')}"/>
  <g>${s.values.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="var(--chart${si+1})" stroke="#fff7e6" stroke-width="2"/>`).join('')}</g>`).join('')}
 <g>${labels.map((l,i)=>`<rect class="hit" data-i="${i}" x="${X(i)-Math.max(12,(W_-L-R)/Math.max(1,n)/2)}" y="0" width="${Math.max(24,(W_-L-R)/Math.max(1,n))}" height="${H_}" fill="transparent"/>`).join('')}</g></svg>`;
 const data=encodeURIComponent(JSON.stringify({labels,series:series.map(s=>({name:s.name,values:s.values}))}));
 return `<div class="chartbox" data-chart="${data}"><div class="legend">${series.map((s,i)=>`<span><i style="background:var(--chart${i+1})"></i>${s.name}</span>`).join('')}</div>${svg}<div class="tip" hidden></div></div>`;
}
function wireCharts(){document.querySelectorAll('#modal .chartbox').forEach(b=>{const d=JSON.parse(decodeURIComponent(b.dataset.chart)),tip=b.querySelector('.tip');
 b.querySelectorAll('.hit').forEach(h=>{const show=()=>{const i=+h.dataset.i;tip.hidden=false;tip.innerHTML=`<b>${esc(d.labels[i])}</b>`+d.series.map(s=>`<div>${s.name}: ${fmt(s.values[i])}</div>`).join('');
   const r=h.getBoundingClientRect(),br=b.getBoundingClientRect();tip.style.left=clamp(r.left-br.left+r.width/2-70,0,br.width-150)+'px';};
  h.addEventListener('pointerenter',show);h.addEventListener('pointerdown',show);h.addEventListener('pointerleave',()=>tip.hidden=true);});});}
function ledgerTable(l,fixedPreview){const rows=(o)=>Object.keys(o).filter(k=>l[k]).map(k=>`<tr><td>${o[k]}</td><td>${fmt(l[k])}</td></tr>`).join('');
 const inc=sumIncome(l),exp=sumExpense(l);const pv=fixedPreview||0;
 return `<div class="two"><div><h3>รายรับ</h3><table class="ledger"><tbody>${rows(INCOME)||'<tr><td>ยังไม่มี</td><td>฿0</td></tr>'}<tr class="t"><td>รวม</td><td>${fmt(inc)}</td></tr></tbody></table></div>
 <div><h3>รายจ่าย</h3><table class="ledger"><tbody>${rows(EXPENSE)||'<tr><td>ยังไม่มี</td><td>฿0</td></tr>'}<tr class="t"><td>รวม</td><td>${fmt(exp)}</td></tr></tbody></table></div></div>${l.capIn||l.capOut?`<p class="note">เงินกู้ เงินฝาก และหุ้น ไม่นับเป็นกำไร: เข้า ${fmt(l.capIn||0)} · ออก ${fmt(l.capOut||0)}</p>`:''}`;}
let acctTab='now';
function accountDialog(){
 const l=S.ledger;const fixed=rentFee()+utilFee()+salaryFee()+S.accComm;const net=sumIncome(l)-sumExpense(l);
 const tabs=[['now','เดือนนี้'],['hist','กราฟรายเดือน']];let body='';
 if(acctTab==='now'){body=`<div class="card"><h3>ต้องจ่ายสิ้นเดือน (อีก ${MONTH_DAYS-dayInMonth(S.day)+1} วัน)</h3><table class="ledger"><tbody>
  <tr><td>ค่าเช่าร้าน</td><td>${fmt(rentFee())}</td></tr><tr><td>ค่าน้ำค่าไฟ</td><td>${fmt(utilFee())}</td></tr><tr><td>เงินเดือนพนักงาน ${S.staff.length} คน</td><td>${fmt(salaryFee())}</td></tr><tr><td>ค่าคอมที่สะสมแล้ว</td><td>${fmt(S.accComm)}</td></tr>
  <tr class="t"><td>รวมต้องจ่าย</td><td>${fmt(fixed)}</td></tr></tbody></table>
  <p class="note">ค่าคอม: พนักงานขาย 5% ของเลนส์และกรอบที่ขายเอง · OD 10% ของค่าตรวจ · ช่าง ฿30 ต่องาน นับเมื่อลูกค้าจ่ายเงินแล้ว</p></div>
  ${ledgerTable(l)}<div class="statrow"><b>ยอดระหว่างเดือนก่อนจ่ายสิ้นเดือน</b><b>${fmt(net)}</b></div>
  <h3>กำไรรายวันเดือนนี้ (ยังไม่หักค่าใช้จ่ายสิ้นเดือน)</h3>${lineChart(S.daily.map(d=>'วัน '+d.d),[{name:'กำไรรายวัน',values:S.daily.map(d=>Math.round(d.p))}],'กำไรรายวันเดือนนี้')}`;}
 else body=historyBlock();
 openModal(`<div class="sheethead"><h2>บัญชีร้าน · เดือนที่ ${monthOf(S.day)}</h2><span class="price">${fmt(S.money)}</span><button class="btn plain" data-c="1">ปิด</button></div>
 <div class="tabs">${tabs.map(([k,n])=>`<button class="tab ${k===acctTab?'on':''}" data-t="${k}">${n}</button>`).join('')}</div>${body}`);
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;m.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{acctTab=b.dataset.t;accountDialog();});wireCharts();
}
function historyBlock(){const h=S.history;return `${lineChart(h.map(x=>'เดือน '+x.m),[{name:'กำไรขาดทุน',values:h.map(x=>Math.round(x.profit))},{name:'เงินคงเหลือ',values:h.map(x=>Math.round(x.balance))}],'กำไรขาดทุนและเงินคงเหลือรายเดือน')}
 ${h.length?`<div class="tablewrap"><table class="ledger"><tbody><tr><td><b>เดือน</b></td><td><b>รายรับ</b></td><td><b>รายจ่าย</b></td><td><b>กำไร/ขาดทุน</b></td><td><b>คงเหลือ</b></td></tr>${[...h].reverse().map(x=>`<tr><td>${x.m}</td><td>${fmt(x.income)}</td><td>${fmt(x.expense)}</td><td class="${x.profit<0?'neg':''}">${fmt(x.profit)}</td><td>${fmt(x.balance)}</td></tr>`).join('')}</tbody></table></div>`:''}`;}
function closeMonth(){const m=monthOf(S.day-1),l=S.ledger;
 const branch=S.branches.reduce((a,id)=>a+RIVAL[id].income,0);if(branch)earn('branch',branch);
 financeMonth();spend('rent',rentFee());spend('util',utilFee());spend('salary',salaryFee());spend('comm',S.accComm);S.accComm=0;
 const income=sumIncome(l),expense=sumExpense(l),profit=income-expense;
 const rec={m,income,expense,profit,balance:S.money,l:Object.assign({},l)};S.history.push(rec);if(S.history.length>120)S.history.shift();S.history.slice(0,-24).forEach(x=>delete x.l);
 if(profit>Math.max(...RIVALS.filter(rivalOpen).map(r=>r.pace*1400)))S.stats.profitKing=1;
 Object.keys(S.staffData).forEach(k=>{S.staffData[k].years+=1/12;});
 S.ledger=blankLedger();S.daily=[];return rec;}
function monthDialog(rec,then){
 openModal(`<div class="sheethead"><h2>สรุปเดือนที่ ${rec.m}</h2><span class="stars">${stars()}</span></div>
 <div class="monthhead"><div><small>${rec.profit>=0?'กำไรเดือนนี้':'ขาดทุนเดือนนี้'}</small><b class="${rec.profit<0?'neg':'pos'}">${fmt(rec.profit)}</b></div><div><small>เงินคงเหลือ</small><b>${fmt(rec.balance)}</b></div></div>
 ${rec.balance<0?'<p class="err">เงินติดลบ ซื้อของไม่ได้จนกว่าจะขายจนกลับมาเป็นบวก ลองลดพนักงานเพื่อลดเงินเดือน</p>':''}
 ${ledgerTable(rec.l)}${historyBlock()}
 <div class="row"><button class="btn gold" data-ok="1">ไปต่อ</button></div>`,{lock:true,wide:true});
 $('#modal [data-ok]').onclick=()=>{closeModal();if(window.__qaNoCall)return then();bankMonth(()=>cardDialog('ก่อนเริ่มเดือนใหม่',S.mp?()=>vsDraw(then):then));};wireCharts();}

/* ---------- โทรฟี่: เพิ่มโทรฟี่ใหม่ที่ตารางนี้ ---------- */
const CATS=['เส้นทางเจ้าของร้าน','ยอดขายและการบริหาร','ผู้เชี่ยวชาญด้านเลนส์','การแข่งขันและการขยายร้าน','ความสำเร็จพิเศษ'];
const TIER={b:{n:'Bronze',money:500,xp:30},s:{n:'Silver',money:2000,xp:80},g:{n:'Gold',money:8000,xp:200},d:{n:'Diamond',money:30000,xp:500},l:{n:'Legendary',money:200000,xp:2000}};
const brands=()=>new Set(Object.values(S.staffData).flatMap(d=>d.courses).filter(c=>c!=='base').map(c=>COURSE[c].brand)).size;
const certStaff=()=>Object.keys(S.staffData).filter(k=>k!=='owner'&&S.staff.includes(k)&&S.staffData[k].courses.length).length;
const pct=(v,n)=>[Math.min(v,n),n];
const TROPHIES=[
 [0,'First Day','เปิดร้านวันแรก',9,'b',()=>pct(1,1)],
 [0,'First Customer','ให้บริการลูกค้าคนแรก',18,'b',()=>pct(S.served,1)],
 [0,'First Sale','ขายแว่นชิ้นแรกสำเร็จ',15,'b',()=>pct(S.stats.lensSold+S.stats.frameSold,1)],
 [0,'Busy Shop','ให้บริการลูกค้า 10 คนในวันเดียว',6,'s',()=>pct(S.stats.dayMax,10)],
 [0,'Popular Store','ให้บริการลูกค้าสะสม 100 คน',17,'g',()=>pct(S.served,100)],
 [0,'Neighborhood Favorite','คะแนนความพึงพอใจเฉลี่ย 90% (ลูกค้า 30 คนขึ้นไป)',19,'g',()=>[S.stats.satN>=30?Math.min(Math.round(S.stats.satSum/S.stats.satN),90):0,90]],
 [0,'Store Level 10','ร้านถึง Level 10',25,'s',()=>pct(S.level,10)],
 [0,'Store Level 25','ร้านถึง Level 25',23,'g',()=>pct(S.level,25)],
 [0,'Store Level 50','ร้านถึง Level 50',29,'g',()=>pct(S.level,50)],
 [0,'Optical Empire','ร้านถึง Level 99',30,'d',()=>pct(S.level,99)],
 [1,'First 1,000','ยอดขายสะสม ฿1,000',14,'b',()=>pct(S.stats.total,1000)],
 [1,'Money Maker','ยอดขายสะสม ฿10,000',12,'b',()=>pct(S.stats.total,10000)],
 [1,'Sales Master','ยอดขายสะสม ฿100,000',13,'s',()=>pct(S.stats.total,100000)],
 [1,'Millionaire','ยอดขายสะสม ฿1,000,000',5,'d',()=>pct(S.stats.total,1000000)],
 [1,'Perfect Day','ทำยอดขายถึงเป้าหมายประจำวัน',10,'b',()=>pct(S.stats.targetHit,1)],
 [1,'Sales Streak','ถึงเป้าหมาย 7 วันติดต่อกัน',11,'d',()=>pct(S.stats.bestStreak,7)],
 [1,'Big Spender','ขายเลนส์ราคาแพงที่สุดในร้าน (฿9,000 ขึ้นไป)',4,'s',()=>pct(S.stats.topItem,1)],
 [1,'VIP Customer','ให้บริการลูกค้า VIP สำเร็จ',20,'s',()=>pct(S.stats.vip,1)],
 [1,'Profit King','กำไรเดือนสูงกว่าทุกร้านในเมือง',24,'g',()=>pct(S.stats.profitKing,1)],
 [1,'Tycoon','มีเงินทุนถึง ฿10,000,000',1,'d',()=>pct(Math.max(0,S.money),10000000)],
 [2,'Lens Beginner','ขายเลนส์สำเร็จ 10 คู่',44,'b',()=>pct(S.stats.lensSold,10)],
 [2,'Lens Collector','ขายเลนส์ครบ 5 ประเภท',7,'s',()=>pct(Object.keys(S.stats.kinds).length,5)],
 [2,'HOYA Graduate','ผ่านหลักสูตร HOYA',31,'s',()=>pct(+courseDone('hoya'),1)],
 [2,'ZEISS Specialist','ผ่านหลักสูตร ZEISS',32,'g',()=>pct(+courseDone('zeiss'),1)],
 [2,'Essilor Expert','ผ่านหลักสูตร Essilor',33,'g',()=>pct(+courseDone('essilor'),1)],
 [2,'Rodenstock Master','ผ่านหลักสูตร Rodenstock',34,'g',()=>pct(+courseDone('rodenstock'),1)],
 [2,'Lens Academy','ผ่านการอบรม 5 บริษัท',8,'d',()=>pct(brands(),5)],
 [2,'Certified Optician','พนักงานได้รับใบรับรอง 3 คน',39,'g',()=>pct(certStaff(),3)],
 [2,'Premium Seller','ขายเลนส์พรีเมียม 100 คู่',36,'d',()=>pct(S.stats.premium,100)],
 [2,'Optical Professor','พนักงานหนึ่งคนผ่านทุกหลักสูตร',40,'d',()=>pct(Math.max(0,...Object.values(S.staffData).map(d=>d.courses.length)),COURSES.length)],
 [3,'First Competition','เข้าร่วมอีเวนต์แข่งขันครั้งแรก',35,'b',()=>pct(S.stats.events,1)],
 [3,'Bronze Seller','ได้อันดับ 3 ในการแข่งขัน',3,'b',()=>pct(S.ev.bronze,1)],
 [3,'Silver Seller','ได้อันดับ 2 ในการแข่งขัน',2,'s',()=>pct(S.ev.silver,1)],
 [3,'Gold Seller','ได้อันดับ 1 ในการแข่งขัน',37,'g',()=>pct(S.ev.gold,1)],
 [3,'Champion','ชนะการแข่งขัน 5 ครั้ง',28,'g',()=>pct(S.ev.wins,5)],
 [3,'City Legend','ชนะการแข่งขัน 10 ครั้ง',27,'d',()=>pct(S.ev.wins,10)],
 [3,'Rival Crusher','เอาชนะร้านคู่แข่ง 5 ร้าน',16,'g',()=>pct(Object.keys(S.ev.beat).length,5)],
 [3,'Business Expansion','ปลดล็อกพื้นที่ใหม่',22,'s',()=>pct(S.areas-1,1)],
 [3,'Multi-Store Owner','เป็นเจ้าของร้าน 3 สาขา',21,'d',()=>pct(S.branches.length,3)],
 [3,'City Dominator','ชนะครบทุกร้านและครองอันดับ 1 ในเมือง',38,'d',()=>pct(+(cityRank()===1&&RIVALS.every(r=>S.ev.beat[r.id])),1)],
 [4,'Blue Light Guardian','ขายเลนส์กรองแสงสีฟ้า 100 คู่',41,'g',()=>pct(S.stats.blue,100)],
 [4,'Digital Eye Care','ให้บริการลูกค้าที่ใช้คอมพิวเตอร์ 100 คน',42,'g',()=>pct(S.stats.computer,100)],
 [4,'Fashion Icon','ขายกรอบแฟชั่น 100 ชิ้น',26,'g',()=>pct(S.stats.fashion,100)],
 [4,'Sunglasses Expert','ขายแว่นกันแดด 100 ชิ้น',43,'g',()=>pct(S.stats.sun,100)],
 [4,'Young Vision','ให้บริการลูกค้าเด็กและนักเรียน 50 คน',45,'s',()=>pct(S.stats.kids,50)],
 [4,'Senior Care','ให้บริการลูกค้าสูงวัย 50 คน',46,'s',()=>pct(S.stats.seniors,50)],
 [4,'Family Optician','ให้บริการครอบครัว 20 ครอบครัว',47,'s',()=>pct(S.stats.families,20)],
 [4,'Sports Vision','ขายแว่นให้สายกีฬา 50 ชิ้น',48,'s',()=>pct(S.stats.sport,50)],
 [4,'Diamond Collector','ปลดล็อกโทรฟี่ระดับ Diamond 10 ชิ้น',49,'g',()=>pct(TROPHIES.filter(t=>t[4]==='d'&&S.trophies[t[1]]).length,10)],
 [4,'SocialEyewear Legend','ปลดล็อกโทรฟี่ครบทั้ง 49 ชิ้นก่อนหน้า',50,'l',()=>pct(Object.keys(S.trophies).filter(n=>n!=='SocialEyewear Legend'&&n!=='Mobile Eye Care'&&n!=='เป้าหมายสำเร็จ').length,49)],
 [4,'เป้าหมายสำเร็จ','มีเงินถึงเป้าหมายที่ตั้งไว้ตอนเริ่มเกม','e_podium','l',()=>pct(S.won?1:0,1)],
 [4,'Mobile Eye Care','ออกหน่วยตรวจสายตาประชาชนสำเร็จ','h_special','g',()=>pct(S.hosp.done.m1?1:0,1)]
];
function troIcon(t){return typeof t[3]==='string'?t[3]:'t'+String(t[3]).padStart(2,'0');}
let popQ=[],popT=0;
function showPop(){const el=$('#trophyPop');if(popT||!popQ.length)return;const t=popQ.shift();el.innerHTML=`${sprHTML(troIcon(t),56)}<span><small>ปลดล็อกโทรฟี่ · ${TIER[t[4]].n}</small><b>${t[1]}</b><small>+${fmt(TIER[t[4]].money)} · +${TIER[t[4]].xp} EXP</small></span>`;el.hidden=false;
 popT=setTimeout(()=>{el.hidden=true;popT=0;showPop();},3000);}
function checkTrophies(){if(!S)return;let hit=true;while(hit){hit=false;for(const t of TROPHIES){if(S.trophies[t[1]])continue;const[v,n]=t[5]();if(v>=n){S.trophies[t[1]]=S.day;hit=true;const r=TIER[t[4]];earn('reward',r.money);addXp(r.xp);popQ.push(t);log(`ได้โทรฟี่ ${t[1]}`,'g');}}}
 if(popQ.length){beep('buy');showPop();}checkQuests();}
let troTab=0;
function trophyDialog(){const done=Object.keys(S.trophies).length;const list=TROPHIES.filter(t=>t[0]===troTab);
 openModal(`<div class="sheethead"><h2>โทรฟี่ ${done}/${TROPHIES.length}</h2><button class="btn plain" data-c="1">ปิด</button></div>
 <div class="tabs">${CATS.map((c,i)=>`<button class="tab ${i===troTab?'on':''}" data-t="${i}">${c}</button>`).join('')}</div>
 <div class="grid">${list.map(t=>{const got=S.trophies[t[1]],[v,n]=t[5]();return `<div class="item ${got?'owned':'off'}"><span class="${got?'':'lockicon'}">${sprHTML(troIcon(t),60)}</span><span class="tx"><b>${t[1]}</b><small>${t[2]}</small><span class="tag">${TIER[t[4]].n}</span> ${got?`<span class="tag ok">ได้เมื่อวันที่ ${got}</span>`:`<span class="tag">${Math.floor(v).toLocaleString('en-US')}/${n.toLocaleString('en-US')}</span>`}</span></div>`;}).join('')}</div>`,{wide:true});
 const m=$('#modal');m.querySelector('[data-c]').onclick=closeModal;m.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{troTab=+b.dataset.t;trophyDialog();});}
function _trophyWallRemoved(){const names=Object.keys(S.trophies).slice(-5);names.forEach((n,i)=>{const t=TROPHIES.find(x=>x[1]===n);if(t)drawIcon(troIcon(t),640+i*48,120,44);});}

/* ---------- เซฟเก่า ---------- */
function migrate(){S.layout={};if(S.stock&&S.stock.listed){S.money+=S.stock.mine*S.stock.price;S._refund=S.stock.mine*S.stock.price;}S.stock=null;if(S.frames===undefined)S._newFrames=1;const f=fresh(S.code);Object.keys(f).forEach(k=>{if(S[k]===undefined)S[k]=f[k];});S.stats=Object.assign(f.stats,S.stats);S.ev=Object.assign(f.ev,S.ev);S.ledger=Object.assign(blankLedger(),S.ledger);if(S.stats.total===0&&S.earned)S.stats.total=S.earned;if(S._newFrames){delete S._newFrames;Object.keys(FRAME_CATS).forEach(k=>{if(frameUnlocked(k))S.frames[k]=(S.frames[k]||0)+(k==='basic'?0:6);});}
 /* โทรฟี่ City Dominator ที่ได้จากเงื่อนไขเดิมซึ่งง่ายเกินไป */ if(S.trophies['City Dominator']&&!RIVALS.every(r=>S.ev.beat[r.id]))delete S.trophies['City Dominator'];}

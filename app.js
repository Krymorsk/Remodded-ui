const KEY='FORM_functional_v1';
const modes={normal:{name:'Normal',plan:'Push Day',subtitle:'Chest · Shoulders · Triceps',mins:45,kcal:320},bulk:{name:'Bulk',plan:'Push Day',subtitle:'Chest · Shoulders · Triceps',mins:55,kcal:420},comeback:{name:'Comeback',plan:'Rebuild Session',subtitle:'Full body · Core · Walking',mins:30,kcal:220}};
const defaultState={mode:'normal',height:null,weights:[],workouts:[],completed:{}};
let state=load(), activePage='home', sessionIndex=0, sessionWeight=60, timer=null, timerSeconds=80, paused=false;

const $=id=>document.getElementById(id);
const todayISO=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const fmtDate=d=>new Date(d+'T00:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'});
function load(){try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaultState}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function dayLabel(){return new Date().toLocaleDateString(undefined,{weekday:'long'}).toUpperCase()}
function workoutDates(){return new Set(state.workouts.map(w=>w.date))}
function currentStreak(){let n=0,d=new Date();const set=workoutDates();while(set.has(d.toISOString().slice(0,10))){n++;d.setDate(d.getDate()-1)}return n}
function bestStreak(){const days=[...workoutDates()].sort();let best=0,run=0,prev=null;for(const ds of days){const d=new Date(ds),p=new Date(d);p.setDate(p.getDate()-1);if(prev&&d-pPrev===86400000)run++;else run=1;best=Math.max(best,run);pPrev=d;prev=ds}return best}
function lastWeight(){return state.weights.at(-1)?.value??null}
function weightChange(){if(state.weights.length<2)return null;return +(state.weights.at(-1).value-state.weights.at(-2).value).toFixed(1)}
function weeklyConsistency(){const now=new Date();let count=0;for(let i=0;i<7;i++){const d=new Date(now);d.setDate(d.getDate()-i);if(workoutDates().has(d.toISOString().slice(0,10)))count++}return Math.round(count/7*100)}
function exercises(){return state.mode==='comeback'?[{name:'Knee Push-ups',muscle:'Chest',sets:3,reps:10},{name:'Plank',muscle:'Core',sets:3,reps:30},{name:'Walking',muscle:'Cardio',sets:1,reps:'20 min'}]:[{name:'Bench Press',muscle:'Chest',sets:3,reps:10},{name:'Dumbbell Shoulder Press',muscle:'Shoulders',sets:3,reps:10},{name:'Tricep Pushdown',muscle:'Triceps',sets:3,reps:12}]}

function showPage(p){
  activePage=p;['home','workout','progress','more'].forEach(x=>$('page'+x[0].toUpperCase()+x.slice(1)).classList.toggle('hidden',x!==p));
  document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
  renderAll();
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderHome(){
  $('dayLabel').textContent=dayLabel();
  const m=modes[state.mode]; $('heroText').textContent=state.mode==='comeback'?'Rebuild the basics. Move well. Stack clean wins.':state.mode==='bulk'?'Train hard, eat well, recover, repeat.':'Small steps. Consistent effort. Big results.';
  $('planTitle').textContent=m.plan;$('planSubtitle').textContent=m.subtitle;$('planMinutes').textContent=m.mins;$('planKcal').textContent=m.kcal;
  $('dashStreak').textContent=currentStreak()+' days'; $('dashStreakHint').textContent=currentStreak()?'Keep it going':'Start today';
  const w=lastWeight();$('dashWeight').textContent=w?`${w.toFixed(1)} kg`:'—';$('dashWeightHint').textContent=w?(weightChange()==null?'latest':`${weightChange()>0?'+':''}${weightChange()} kg`):'Add weight';
  $('dashWorkouts').textContent=state.workouts.length;
  const pc=weeklyConsistency();$('homeProgress').textContent=pc+'%';$('homeRing').style.setProperty('--p',pc+'%');$('spark').setAttribute('d',state.weights.length>1?chartPath(state.weights.map(x=>x.value),100):'M0 82 C80 80 90 72 150 70 S250 78 310 58 S430 52 500 38 S560 31 600 20');
}
function renderWorkout(){
  const ex=exercises(); const done=state.completed[todayISO()]||{};
  $('workoutPlanName').textContent=modes[state.mode].plan;
  $('workoutSubtitle').textContent=modes[state.mode].subtitle+' · follow the plan.';
  $('sessionDone').textContent=Object.values(done).filter(Boolean).length+'/'+ex.length;
  $('exerciseList').innerHTML=ex.map((x,i)=>`<article class="exercise"><div class="exercise-art"></div><div><h3>${x.name}</h3><p>${x.muscle} · ${x.sets} sets · ${x.reps} reps</p></div><button class="done-btn ${done[i]?'done':''}" data-complete="${i}">${done[i]?'✓':'→'}</button></article>`).join('');
}
function renderProgress(){
  const w=lastWeight();$('progressWeight').textContent=w?`${w.toFixed(1)} kg`:'—';
  const ch=weightChange();$('progressChange').textContent=ch==null?'No history yet':`${ch>0?'+':''}${ch} kg since last log`;
  $('progressWorkouts').textContent=state.workouts.length;$('progressBestStreak').textContent=bestStreak();$('progressMinutes').textContent=state.workouts.reduce((a,x)=>a+(x.minutes||0),0)+'m';
  const vals=state.weights.map(x=>x.value); if(vals.length>1){const d=chartPath(vals,220);$('weightLine').setAttribute('d',d);$('weightArea').setAttribute('d',d+' L600 220 L0 220 Z')}else{$('weightLine').setAttribute('d','');$('weightArea').setAttribute('d','')}
}
function renderMore(){
  $('modeValue').textContent=modes[state.mode].name;$('heightValue').textContent=state.height?state.height+' cm':'Not set';
}
function renderAll(){renderHome();renderWorkout();renderProgress();renderMore()}

function chartPath(vals,h){
  const min=Math.min(...vals),max=Math.max(...vals),span=(max-min)||1,pad=12;
  return vals.map((v,i)=>{const x=pad+(i/(vals.length-1))*(600-pad*2);const y=15+(max-v)/span*(h-40);return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ');
}
function addWorkout(){state.workouts.push({id:Date.now(),date:todayISO(),minutes:modes[state.mode].mins});save();renderAll()}
function markDone(i){state.completed[todayISO()]??={};state.completed[todayISO()][i]=!state.completed[todayISO()][i];if(state.completed[todayISO()][i]){const ex=exercises()[i];state.workouts.push({id:Date.now()+i,date:todayISO(),minutes:Math.round(modes[state.mode].mins/exercises().length)});save()}renderAll()}
function openSession(i=0){sessionIndex=i;sessionWeight=60;timerSeconds=80;paused=false;renderSession();$('sessionDialog').showModal()}
function renderSession(){const ex=exercises()[sessionIndex];$('sessionKicker').textContent=`${modes[state.mode].plan.toUpperCase()} · ${sessionIndex+1}/${exercises().length}`;$('sessionExercise').textContent=ex.name;$('sessionMuscle').textContent=ex.muscle;$('sessionWeight').textContent=sessionWeight;$('sessionSets').textContent=ex.sets;$('sessionReps').textContent=ex.reps}
function startRest(){clearInterval(timer);$('restArea').classList.remove('hidden');timer=setInterval(()=>{if(paused)return;if(timerSeconds>0){timerSeconds--;$('restTimer').textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,'0')}:${String(timerSeconds%60).padStart(2,'0')}`}else{clearInterval(timer)}},1000)}
function resetTimer(){clearInterval(timer);timerSeconds=80;paused=false;$('restTimer').textContent='01:20';$('pauseRest').textContent='Pause';$('restArea').classList.add('hidden')}
function updateMode(m){state.mode=m;save();$('modeDialog').close();renderAll()}

$('startPlan').onclick=()=>openSession(0);
$('addQuickBtn').onclick=()=>openSession(0);
$('addWeightBtn').onclick=()=>{$('weightInput').value=lastWeight()||'';$('weightDialog').showModal()};
$('weightForm').addEventListener('submit',e=>{e.preventDefault();const v=Number($('weightInput').value);if(v){state.weights.push({date:todayISO(),value:v});state.weights.sort((a,b)=>a.date.localeCompare(b.date));save();$('weightDialog').close();renderAll()}});
$('heightBtn').onclick=()=>{$('heightInput').value=state.height||'';$('heightDialog').showModal()};
$('heightForm').addEventListener('submit',e=>{e.preventDefault();const v=Number($('heightInput').value);if(v){state.height=v;save();$('heightDialog').close();renderAll()}});
$('modeBtn').onclick=()=>$('modeDialog').showModal();
document.querySelectorAll('.mode-option').forEach(b=>b.onclick=()=>updateMode(b.dataset.mode));
$('resetBtn').onclick=()=>{if(confirm('Reset all FORM data?')){state={...defaultState};save();renderAll()}};
$('closeSession').onclick=()=>{resetTimer();$('sessionDialog').close()};
$('plusWeight').onclick=()=>{sessionWeight+=2.5;renderSession()};$('minusWeight').onclick=()=>{sessionWeight=Math.max(0,sessionWeight-2.5);renderSession()};
$('completeSet').onclick=()=>{startRest();$('completeSet').textContent='✓ Set complete · Resting';setTimeout(()=>{$('completeSet').textContent='✓ Mark set complete'},500)};
$('skipRest').onclick=()=>{resetTimer();if(sessionIndex<exercises().length-1){sessionIndex++;renderSession()}else{$('sessionDialog').close();addWorkout()}};
$('pauseRest').onclick=()=>{paused=!paused;$('pauseRest').textContent=paused?'Resume':'Pause'};

document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>showPage(b.dataset.action==='workout'?'workout':b.dataset.action==='progress'?'progress':b.dataset.action==='nutrition'?'more':'more'));
$('profileBtn').onclick=()=>showPage('more');
$('exerciseList').addEventListener('click',e=>{const b=e.target.closest('[data-complete]');if(b)markDone(Number(b.dataset.complete))});
renderAll();

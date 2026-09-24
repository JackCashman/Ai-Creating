const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const curriculumScope={module:{exports:{}}};vm.createContext(curriculumScope);vm.runInContext(fs.readFileSync('public/curriculum.js','utf8'),curriculumScope);const {COURSES,recommend,nextLevelEvidence,writingFeedback}=curriculumScope.module.exports;
assert.equal(new Set(COURSES.map(c=>c.type)).size,5);assert.equal(new Set(COURSES.map(c=>c.id)).size,COURSES.length);
for(const c of COURSES){assert.match(c.video,/^[\w-]{11}$/);assert.equal(c.phrases.length,5);assert.equal(c.questions.length,3);assert.equal(c.checks.length,3)}
assert.equal(recommend({listen:0,speak:0,write:0},{},'全部').id,'intro');assert.equal(recommend({listen:4,speak:1,write:2},{},'TED').id,'habit');assert.equal(recommend({listen:3,speak:3,write:3},{},'新闻').id,'news');
const now=Date.now(),a={at:now,ratings:{listen:2},hinted:false,evidence:{listen:true},profile:{listen:2}};
assert.equal(nextLevelEvidence({habit:{attempts:[a]},nature:{attempts:[{...a,at:now-86400000}]}},{listen:2},'listen'),true);
assert.equal(nextLevelEvidence({habit:{attempts:[a,a]}},{listen:2},'listen'),false);
assert.equal(nextLevelEvidence({habit:{attempts:[a]},nature:{attempts:[{...a,hinted:true,at:now-86400000}]}},{listen:2},'listen'),false);
assert.equal(nextLevelEvidence({habit:{attempts:[a]},nature:{attempts:[{...a,profile:{listen:0},at:now-86400000}]}},{listen:2},'listen'),false);
assert.match(writingFeedback('Hello. I enjoy reading.',[true,false,true]),/第 2 项/);
class Element{constructor(tag='div'){this.tag=tag;this.children=[];this.value='';this.dataset={};this.style={};this.hidden=false;this.checked=false;this.disabled=false;this.classList={toggle(){}};}append(...es){this.children.push(...es)}replaceChildren(...es){this.children=es}setAttribute(){}removeAttribute(){}pause(){}showModal(){}close(){}}
const ids=new Map(),html=fs.readFileSync('public/index.html','utf8');for(const m of html.matchAll(/id="([^"]+)"/g)){assert(!ids.has(m[1]),'Duplicate ID '+m[1]);ids.set(m[1],new Element())}
const doc={getElementById:id=>ids.get(id)||null,createElement:tag=>new Element(tag),createTextNode:t=>t,querySelectorAll:()=>[],head:new Element()};
// Register dynamically created IDs as a real document does.
const old=doc.createElement;doc.createElement=tag=>{const e=old(tag);Object.defineProperty(e,'id',{set(v){ids.set(v,e)},get(){return [...ids].find(x=>x[1]===e)?.[0]}});return e};
ids.get('levelFilter').value='all';const persisted={};const ctx={document:doc,window:{scrollTo(){},addEventListener(){}},navigator:{},localStorage:{getItem:k=>persisted[k]||null,setItem:(k,v)=>persisted[k]=v,removeItem:k=>delete persisted[k]},setInterval(){},confirm:()=>true,console,Date,URL,Blob,location:{origin:'https://example.test'}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/curriculum.js','utf8'),ctx);vm.runInContext(fs.readFileSync('public/learner.js','utf8'),ctx);const run=s=>vm.runInContext(s,ctx);
assert.equal(ids.get('courseGrid').children.length,8);
run("openCourse('habit')");ids.get('listenNotes').value='One small change can be manageable.';ids.get('listenNotes').oninput();ids.get('draft').value='I want to practise daily. I will write three sentences.';ids.get('draft').oninput();ids.get('revision').value='I will write three sentences after dinner each day. On busy days, I will write one.';ids.get('revision').oninput();ids.get('transferNotes').value='I will practise for five minutes.';ids.get('transferNotes').oninput();ids.get('rating-listen').value='2';ids.get('rating-speak').value='2';ids.get('rating-write').value='2';ids.get('support').value='independent';ids.get('noHints').checked=true;ids.get('finish').onclick();
assert.equal(run("app.records.habit.attempts[0].ratings.speak"),-1,'Text must not become speaking assessment');assert.equal(run("app.records.habit.attempts[0].ratings.write"),2);
run("openCourse('news')");assert.equal(ids.get('draft').value,'');run("openCourse('habit')");assert.match(ids.get('draft').value,/practise daily/);
for(let i=0;i<3;i++){ids.get('sceneAnswer').value='My answer '+i;ids.get('send').onclick()}assert.equal(ids.get('send').disabled,true);assert.equal(run("app.records.habit.chat.length"),6);
ids.get('newRound').onclick();assert.equal(run("app.records.habit.attempts.length"),1,'History retained');assert.equal(ids.get('draft').value,'');assert.equal(run("app.records.habit.round"),0);
ids.get('record').onclick();assert.match(ids.get('recordStatus').textContent,/无法录音/);
run('renderReview()');assert(ids.get('reviewList').children.length>0);assert(persisted.sceneEnglishV2);
console.log('Passed: curriculum coverage, level recommendations, evidence guards, feedback, lesson switching, persistence, chat progression, new round, microphone fallback.');
// New practice UI uses the same persistent course records.
Element.prototype.addEventListener=function(){};Element.prototype.scrollIntoView=function(){};Element.prototype.click=function(){};
doc.addEventListener=()=>{};
const gradeButtons=['again','hard','good','easy'].map(grade=>{const e=new Element('button');e.dataset.grade=grade;return e});
const dictButtons=['oxford','collins'].map(dictionary=>{const e=new Element('button');e.dataset.dictionary=dictionary;return e});
doc.querySelectorAll=s=>s==='[data-grade]'?gradeButtons:s==='[data-dictionary]'?dictButtons:[];
doc.querySelector=s=>gradeButtons.find(b=>s.includes('"'+b.dataset.grade+'"'));
ctx.crypto={randomUUID:()=>String(Math.random())};ctx.setTimeout=()=>{};ctx.AbortController=AbortController;ctx.fetch=async()=>({ok:true,json:async()=>({ai:false,oxford:false,collins:false})});
vm.runInContext(fs.readFileSync('public/review-engine.js','utf8'),ctx);vm.runInContext(fs.readFileSync('public/practice.js','utf8'),ctx);
run("openCourse('intro')");assert.equal(ids.get('send').disabled,true,'Unconfigured AI must not act as a fake chat');
run("openExpression({phrase:'work with',theme:'Work',meaning:'do something together',grade:'A'})");
ids.get('expressionForm').onsubmit({preventDefault(){}});assert.equal(run('bank.cards.length'),1);assert(persisted.sceneEnglishBankV1);
run("openExpression({phrase:'WORK WITH',theme:'work',meaning:'duplicate'})");ids.get('expressionForm').onsubmit({preventDefault(){}});assert.equal(run('bank.cards.length'),1,'Deduplicate same theme');
ids.get('bankGrade').value='all';run('renderBank()');ids.get('bankNav').onclick();assert.equal(ids.get('lessonView').hidden,true);assert.equal(ids.get('bankView').hidden,false);
assert(run('bank.cards[0].due')>Date.now()+23*3600000,'First review is tomorrow');run('bank.cards[0].due=0');ids.get('startReview').onclick();assert.equal(ids.get('recallSolution').hidden,true);ids.get('revealAnswer').onclick();assert.equal(gradeButtons[2].disabled,true,'Blank recall cannot be scored independent');
gradeButtons[0].onclick();assert.equal(run('bank.cards[0].stage'),0);assert.equal(run('bank.cards[0].reviews'),1);assert.equal(ids.get('recallPanel').hidden,true);
run("bank.cards[0].due=0;nextRecall()");ids.get('recallAnswer').value='I work with teachers.';ids.get('revealAnswer').onclick();assert.equal(gradeButtons[2].disabled,false);assert.equal(ids.get('recallAnswer').readOnly,true);gradeButtons[2].onclick();assert.equal(run('bank.cards[0].stage'),1);
run("openCourse('habit');recordFor('habit').ai.messages=[{role:'user',content:'My habit is walking.'}]");ids.get('newRound').onclick();assert.equal(run("recordFor('habit').aiArchive.length"),1);assert.equal(run("recordFor('habit').ai.messages.length"),0);
console.log('Passed: expression CRUD persistence/deduplication, bank navigation, hidden recall and evidence guards, AI unavailable state, archived contexts. DOM harness only, not microphone/browser QA.');

vm.runInContext(fs.readFileSync('public/unit.js','utf8'),ctx);
run("openCourse('intro')");ids.get('unitSave').onclick();assert.equal(run('unitState().history.length'),0,'Empty task cannot be completed');
ids.get('unitHide').onclick();assert.equal(ids.get('unitCards').hidden,true);ids.get('unitRecall').value='I work in education.';ids.get('unitRecall').oninput();ids.get('unitReveal').onclick();assert.equal(ids.get('unitRecall').readOnly,true);
for(const [id,value] of [['unitOutput','I work with teachers.'],['unitRevision','I work with teachers to help children learn.']]){ids.get(id).value=value;ids.get(id).oninput()}
run("openCourse('habit');openCourse('intro')");assert.equal(ids.get('unitOutput').value,'I work with teachers.','Draft survives course changes');
ids.get('unitSave').onclick();assert.equal(run('unitState().history.length'),1);assert.equal(run('unitState().history[0].unitRecall'),'I work in education.');assert.equal(run('unitState().draft.unitOutput'),undefined);
ids.get('unitHide').onclick();ids.get('unitRecall').value='remember';ids.get('unitRecall').oninput();ids.get('unitStudy').onclick();assert.equal(run('unitState().draft.assisted'),true,'Returning to answers preserves hint evidence');
console.log('Passed: micro-unit completion guards, hidden recall, immutable first attempt, course draft isolation and assistance evidence.');

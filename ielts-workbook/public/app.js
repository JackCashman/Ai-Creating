import {mountPaper} from './paper.js';
import {practice,playWords} from './dictation.js';
import {trackPanel} from './tracks.js';
import {setupTutor} from './tutor.js';
import {countUnits,paginate,validateBook,validateBackup} from './core.js';
import {get,put} from './store.js';
const $=s=>document.querySelector(s), el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
let book,records={},pages=[],index=0,mode='reflow',selected,activeReading,readIndex=0,saveQueue=Promise.resolve();
const demo={version:1,id:'demo-v1',title:'交互示例 · 非教材',pages:[{id:'sample',sourcePage:1,blocks:[{id:'reading',kind:'reading',text:'A small community library opens every morning. Visitors bring books, share ideas and practise English together. '.repeat(5)}],exercises:[{id:'q1',type:'choice',prompt:'1. Where do the visitors meet?',options:['At a library','At a station'],multiple:false},{id:'q2',type:'fill',prompt:'2. Visitors share ______ together.'},{id:'q3',type:'match',prompt:'3. Match the words.',left:['library','morning'],right:['早晨','图书馆']},{id:'q4',type:'writing',prompt:'4. Write about a place where you enjoy learning.'}]}]};
const refreshTrack=trackPanel();
const openTutor=setupTutor(()=>book);
$('#tutor').onclick=()=>{
 const page=pages[index],source=book.pages[page.sourceIndex];
 const qs=(mode==='original'?source.exercises:page.exercises)||[];
 const context=qs.map(q=>[q.prompt,...q.options||[],records.answers?.[source.id+':'+q.id]||''].join(' '));
 openTutor('chat',[...context,...page.blocks.map(b=>b.text)].join(' '));
};
$('#translate').onclick=()=>{if(selected)openTutor('translate',selected.text);};
$('#startDictation').onclick=()=>practice($('#wordList'),records.words||[],book?.clips,records.dictation??={},save);
$('#undoMain').onclick=()=>{if(records.lines?.length){records.lines.pop();render();}};
function status(s){$('#status').textContent=s;}
async function save(){const key='records:'+book.id,value=structuredClone(records);saveQueue=saveQueue.catch(()=>{}).then(()=>put(key,value));try{await saveQueue;status('已保存到此设备');}catch{status('保存失败，请立即导出记录备份');}}
function questionGroups(p){const groups=[];let group=[],used=0;for(const q of p.exercises||[]){const n=countUnits([q.prompt,...q.options||[],...q.left||[],...q.right||[]].join(' '));if(used+n>300){groups.push(group);group=[];used=0;}group.push(q);used+=n;}if(group.length)groups.push(group);return groups;}
function buildPages(){pages=[];book.pages.forEach((p,sourceIndex)=>{let blocks=[],used=0;const initial=pages.length;const flush=()=>{if(blocks.length){pages.push({sourceIndex,blocks});blocks=[];used=0;}};const legacy=(p.legacyBlocks||[]).filter(b=>(records.lines||[]).some(line=>line.page===p.id&&line.block===b.id));for(const b of [...p.blocks,...legacy]){if(b.kind==='reading'&&countUnits(b.text)>100){flush();pages.push({sourceIndex,blocks:[{...b,entry:true,start:0}]});continue;}for(const part of paginate(b.text)){const n=countUnits(part.text);if(used+n>300)flush();blocks.push({...b,...part});used+=n;}}flush();for(const group of questionGroups(p)){
 const last=pages.at(-1);
 const size=group.reduce((total,q)=>total+countUnits([q.prompt,...q.options||[],...q.left||[],...q.right||[]].join(' ')),0);
 if(last?.sourceIndex===sourceIndex&&!last.exercises&&!last.blocks.some(b=>b.entry)&&last.blocks.reduce((n,b)=>n+countUnits(b.text),0)+size<=300)last.exercises=group;
 else pages.push({sourceIndex,blocks:[],exercises:group});
}if(pages.length===initial)pages.push({sourceIndex,blocks:[]});});}
async function openBook(b,persist=true){validateBook(b);if(persist)await put('book',b);book=b;mode=b.pages.some(p=>p.image)?'original':'reflow';records=await get('records:'+b.id)||{};buildPages();index=Math.min(records.position||0,pages.length-1);$('#welcome').hidden=true;$('#reader').hidden=false;$('#title').textContent=book.title;$('#pageSelect').replaceChildren();book.pages.forEach((p,i)=>{const n=el('option',(p.printedPage?'书页 '+p.printedPage+' · ':'')+'扫描页 '+p.sourcePage);n.value=i;$('#pageSelect').append(n);});render();}
function render(){selected=null;$('#selection').hidden=true;const page=pages[index],source=book.pages[page.sourceIndex];refreshTrack(book,source);$('#pageSelect').value=page.sourceIndex;$('#position').textContent=`${index+1} / ${pages.length}`;$('#prev').disabled=index===0;$('#next').disabled=index===pages.length-1;$('#review').textContent=source.reviewStatus==='verified'?'本页文字已校对':'文字待校对 · 本页不自动判分';if(mode==='original'&&source.image){
 $('#position').textContent='扫描页 '+(page.sourceIndex+1)+' / '+book.pages.length;
 $('#prev').disabled=page.sourceIndex===0;$('#next').disabled=page.sourceIndex===book.pages.length-1;
}const paper=$('#paper');paper.replaceChildren();paper.classList.remove('flip');void paper.offsetWidth;paper.classList.add('flip');if(mode==='original'&&source.image){records.paper??={};mountPaper(paper,source,records.paper[source.id]??=[],save);
if(source.writingTask){
 const essay=source.exercises.find(q=>q.id===source.writingTask);
 if(essay)renderQuestions(paper,{...source,exercises:[essay]});
}
for(const block of source.blocks.filter(b=>b.related)){
 const btn=el('button','打开阅读材料与题目');btn.onclick=()=>openReading(block,source);paper.append(btn);
}}else{for(const block of page.blocks){if(block.entry){const btn=el('button',`打开阅读材料 · ${countUnits(block.text)} 计数单位`);btn.onclick=()=>openReading(block,source);paper.append(btn);}else paper.append(textBlock(block,source));}if(!page.blocks.some(b=>b.entry))renderQuestions(paper,{...source,exercises:page.exercises||[]});}
 records.position=index;save();}
function textBlock(b,p){const n=el('p');n.className='selectable';n.dataset.block=b.id;n.dataset.page=p.id;n.dataset.start=b.start||0;n.dataset.text=b.text;const start=b.start||0,ranges=(records.lines||[]).filter(x=>x.page===p.id&&x.block===b.id);const bounds=new Set([0,b.text.length]);ranges.forEach(r=>{bounds.add(Math.max(0,Math.min(b.text.length,r.start-start)));bounds.add(Math.max(0,Math.min(b.text.length,r.end-start)));});const sorted=[...bounds].sort((a,b)=>a-b);for(let i=0;i<sorted.length-1;i++){const a=sorted[i],z=sorted[i+1],text=b.text.slice(a,z);if(ranges.some(r=>r.start<=a+start&&r.end>=z+start))n.append(el('u',text));else n.append(document.createTextNode(text));}return n;}
function renderQuestions(parent,p){for(const q of p.exercises||[]){const wrap=el('div');wrap.className='question';wrap.append(el('p',q.prompt));const key=(q.sourceId||p.id)+':'+q.id;records.answers??={};const set=v=>{records.answers[key]=v;save();};if(q.type==='choice'){(q.options||[]).forEach((opt,i)=>{const label=el('label'),input=el('input');input.type=q.multiple?'checkbox':'radio';input.name=key+':'+parent.id;input.checked=(records.answers[key]||[]).includes(i);input.onchange=()=>{const old=records.answers[key]||[];set(q.multiple?(input.checked?[...new Set([...old,i])]:old.filter(v=>v!==i)):[i]);};label.append(input,document.createTextNode(opt));wrap.append(label);});}else if(q.type==='match'){const grid=el('div');grid.className='match';let left=null;for(let i=0;i<Math.max(q.left.length,q.right.length);i++){for(const side of ['left','right']){const btn=el('button',q[side][i]||'');btn.disabled=i>=q[side].length;btn.onclick=()=>{if(side==='left'){left=i;grid.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}else if(left!==null){set({...records.answers[key],[left]:i});show();left=null;}};grid.append(btn);}}const lines=el('p');function show(){lines.textContent=Object.entries(records.answers[key]||{}).map(([a,b])=>q.left[a]+' → '+q.right[b]).join('；');}show();wrap.append(grid,lines);}else{const input=el(q.type==='writing'?'textarea':'input');input.setAttribute('aria-label',q.prompt);input.value=records.answers[key]||'';input.oninput=()=>set(input.value);wrap.append(input);}parent.append(wrap);}}
function openReading(b,p){if(b.related)p={...p,exercises:b.related.flatMap(id=>(book.pages.find(page=>page.id===id)?.exercises||[]).map(q=>({...q,sourceId:id})))};activeReading={b,p,parts:paginate(b.text)};readIndex=0;renderReading();$('#reading').showModal();}
function questionImage(parent,source){
 const canvas=el('canvas');canvas.style.width='100%';canvas.setAttribute('role','img');
 canvas.setAttribute('aria-label','原书题目，书页 '+source.printedPage);
 const image=new Image();
 image.onload=()=>{
  const [x,y,right,bottom]=source.questionRegion;
  canvas.width=Math.max(1,Math.round((right-x)*image.width));canvas.height=Math.max(1,Math.round((bottom-y)*image.height));
  canvas.getContext('2d').drawImage(image,x*image.width,y*image.height,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
 };
 image.src=source.image;parent.append(canvas);
}
function renderReading(){const {b,p,parts}=activeReading;$('#passage').replaceChildren(textBlock({...b,...parts[readIndex]},p));$('#readPosition').textContent=`${readIndex+1} / ${parts.length}`;$('#readPrev').disabled=readIndex===0;$('#readNext').disabled=readIndex===parts.length-1;$('#questions').replaceChildren();
 if(b.questionPage){
   const source=book.pages.find(page=>page.id===b.questionPage);
   if(source?.questionRegion) questionImage($('#questions'),source);
 }
 const groups=questionGroups(p);let qi=activeReading.questionIndex||0;if(groups.length){const bar=el('div');bar.className='tools';const prev=el('button','上一组题'),next=el('button','下一组题');prev.disabled=qi===0;next.disabled=qi===groups.length-1;prev.onclick=()=>{activeReading.questionIndex=qi-1;renderReading();};next.onclick=()=>{activeReading.questionIndex=qi+1;renderReading();};bar.append(prev,el('span',`${qi+1} / ${groups.length}`),next);$('#questions').append(bar);renderQuestions($('#questions'),{...p,exercises:groups[qi]});}}
$('#readPrev').onclick=()=>{readIndex--;renderReading();};$('#readNext').onclick=()=>{readIndex++;renderReading();};
document.addEventListener('selectionchange',()=>{const s=getSelection();if(!s||s.isCollapsed||!s.rangeCount)return;const r=s.getRangeAt(0),node=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement,n=node.closest('.selectable');if(!n||!n.contains(r.endContainer))return;const before=r.cloneRange();before.selectNodeContents(n);before.setEnd(r.startContainer,r.startOffset);const start=Number(n.dataset.start)+before.toString().length;selected={page:n.dataset.page,block:n.dataset.block,start,end:start+r.toString().length,text:r.toString(),context:n.dataset.text};const toolbar=$('#selection');if($('#reading').open)$('#reading').append(toolbar);else document.body.append(toolbar);toolbar.hidden=false;});
$('#selection').onpointerdown=e=>e.preventDefault();
$('#underline').onclick=()=>{if(!selected)return;records.lines??=[];records.lines.push({...selected});save();getSelection().removeAllRanges();$('#selection').hidden=true;if($('#reading').open)renderReading();else render();};
$('#collect').onclick=()=>{if(!selected)return;records.words??=[];if(!records.words.some(w=>w.text===selected.text&&w.page===selected.page))records.words.push({...selected});save();$('#selection').hidden=true;status('已收入单词本');};
$('#undo').onclick=()=>{records.lines?.pop();save();renderReading();};
$('#words').onclick=()=>{if(!book){status('请先打开学习包');return;}const list=$('#wordList');list.replaceChildren();for(const w of records.words||[]){const n=el('div');const hear=el('button','听发音');hear.onclick=()=>playWords(w.text,book.clips).catch(e=>status(e.message));n.append(hear,el('strong',w.text),el('p',w.context),el('small','来源：'+w.page));list.append(n);}if(!list.childNodes.length)list.append(el('p','阅读时长按选择文字，收入单词本。'));$('#wordDialog').showModal();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());$('#reading').onclose=()=>{document.body.append($('#selection'));$('#selection').hidden=true;render();};
function turn(delta){
 const source=pages[index].sourceIndex;
 const dest=mode==='original'&&book.pages[source].image?pages.findIndex(p=>p.sourceIndex===source+delta):index+delta;
 if(dest>=0&&dest<pages.length){index=dest;render();}
}
$('#prev').onclick=()=>turn(-1);$('#next').onclick=()=>turn(1);$('#pageSelect').onchange=e=>{index=pages.findIndex(p=>p.sourceIndex===Number(e.target.value));render();};$('#original').onclick=()=>{mode='original';render();};$('#reflow').onclick=()=>{mode='reflow';render();};$('#library').onclick=()=>{$('#reader').hidden=true;$('#welcome').hidden=false;};$('#demo').onclick=()=>openBook(demo).catch(e=>status(e.message));
$('#import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>150*1024*1024)throw Error('学习包过大（上限150MB）');status('正在导入…');await openBook(JSON.parse(await f.text()));}catch(err){status('导入失败：'+err.message);}finally{e.target.value='';}};
$('#backup').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,bookId:book.id,records})],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='ielts-study-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#restore').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const restored=validateBackup(JSON.parse(await f.text()),book.id,book);await saveQueue.catch(()=>{});await put('records:'+book.id,restored);records=restored;index=Math.min(records.position||0,pages.length-1);render();}catch(err){status('恢复失败：'+err.message);}finally{e.target.value='';}};
get('book').then(b=>b&&openBook(b,false)).catch(()=>status('设备存储不可用，请检查浏览器设置'));

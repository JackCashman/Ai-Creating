'use strict';
const ReviewEngine=(()=>{
 const DAY=86400000,defaults=[1,3,7,14,30,60];
 function intervals(value){const list=typeof value==='string'?value.split(/[,，]/).map(Number):value;if(!Array.isArray(list)||list.length<2||list.length>10||list.some((n,i)=>!Number.isFinite(n)||n<.25||n>365||(i>0&&n<=list[i-1])))throw new Error('请输入2–10个递增的天数，每项在0.25–365之间。');return list;}
 function schedule(card,grade,at=Date.now(),steps=defaults){intervals(steps);if(!['again','hard','good','easy'].includes(grade))throw new Error('Invalid grade');let stage=Math.max(0,Math.min(steps.length,Number(card.stage)||0)),days;
 if(grade==='again'){stage=0;days=10/1440;}
 else if(grade==='hard'){days=Math.max(.25,steps[Math.min(stage,steps.length-1)]/2);}
 else{const index=Math.min(stage+(grade==='easy'?1:0),steps.length-1);days=steps[index];stage=Math.min(steps.length,index+1);}
 return {stage,due:at+Math.round(days*DAY),lastReview:at,reviews:(card.reviews||0)+1};}
 function due(cards,at=Date.now()){return cards.filter(c=>c.grade!=='C'&&c.due<=at).sort((a,b)=>a.due-b.due);}
 function key(phrase,theme){return phrase.trim().toLocaleLowerCase().replace(/\s+/g,' ')+'|'+theme.trim().toLocaleLowerCase();}
 function restore(data,existing){
 if(!data||!Array.isArray(data.cards)||data.cards.length>10000)throw new Error('备份格式不正确，最多恢复10000条表达。');
 const cards=data.cards.map(c=>{if(!c||typeof c.id!=='string'||!c.id||typeof c.phrase!=='string'||!c.phrase.trim()||typeof c.theme!=='string'||!c.theme.trim()||typeof c.meaning!=='string'||!c.meaning.trim()||!['A','B','C'].includes(c.grade)||!Number.isFinite(c.due)||Math.abs(c.due)>8640000000000000||!Number.isInteger(c.stage)||c.stage<0||!Number.isInteger(c.reviews)||c.reviews<0)throw new Error('备份含有无效表达或复习日期，未导入任何内容。');
 const out={id:c.id,phrase:c.phrase,theme:c.theme,meaning:c.meaning,grade:c.grade,due:c.due,stage:c.stage,reviews:c.reviews,history:[]};for(const k of ['example','source','url'])out[k]=typeof c[k]==='string'?c[k]:'';for(const k of ['created','lastReview'])if(Number.isFinite(c[k]))out[k]=c[k];
 if(c.history!==undefined){if(!Array.isArray(c.history)||c.history.some(h=>!h||!Number.isFinite(h.at)||!['again','hard','good','easy'].includes(h.grade)||typeof h.answer!=='string'))throw new Error('复习历史格式无效，未导入任何内容。');out.history=c.history.map(h=>({at:h.at,grade:h.grade,answer:h.answer}));}return out;});
 const merged=existing.slice(),ids=new Set(existing.map(c=>c.id)),keys=new Set(existing.map(c=>key(c.phrase,c.theme)));let added=0;for(const c of cards){const k=key(c.phrase,c.theme);if(ids.has(c.id)||keys.has(k))continue;merged.push(c);ids.add(c.id);keys.add(k);added++;}return {cards:merged,added,skipped:cards.length-added};
 }
 return {defaults,intervals,schedule,due,key,restore};
})();
if(typeof module!=='undefined')module.exports=ReviewEngine;

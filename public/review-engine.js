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
 return {defaults,intervals,schedule,due,key};
})();
if(typeof module!=='undefined')module.exports=ReviewEngine;

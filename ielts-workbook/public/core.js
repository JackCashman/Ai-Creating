export function countUnits(text){return (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[]).length+(text.match(/[^\p{L}\p{N}]/gu)||[]).length;}
export function paginate(text,limit=300){
 if(!Number.isInteger(limit)||limit<3)throw Error('Invalid page limit');
 let tokens=text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*|[^\p{L}\p{N}]/gu)||[];
 tokens=tokens.flatMap(t=>countUnits(t)>limit?Array.from(t):[t]);
 let out=[],chunk='',start=0,n=0;
 for(const token of tokens){const c=countUnits(token);if(n+c>limit&&chunk){out.push({text:chunk,start});start+=chunk.length;chunk='';n=0;}chunk+=token;n+=c;}
 if(chunk)out.push({text:chunk,start});return out;
}
export function validateBook(b){
 if(b?.version!==1||typeof b.id!=='string'||!Array.isArray(b.pages)||!b.pages.length||b.pages.length>500)throw Error('无效的学习包');
 const ids=new Set();for(const p of b.pages){if(typeof p.id!=='string'||ids.has(p.id)||!Array.isArray(p.blocks))throw Error('页编号重复或内容无效');ids.add(p.id);
 if(p.image&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.image))throw Error('书页图片必须内嵌');
 const bid=new Set();for(const t of p.blocks){if(typeof t.id!=='string'||bid.has(t.id)||typeof t.text!=='string'||t.text.length>100000)throw Error('文本块无效');bid.add(t.id);}
 const qids=new Set();if(p.exercises!==undefined&&!Array.isArray(p.exercises))throw Error('题目无效');for(const q of p.exercises||[]){if(!q||typeof q.id!=='string'||qids.has(q.id)||typeof q.prompt!=='string'||!['choice','fill','match','writing'].includes(q.type))throw Error('题目无效');qids.add(q.id);if(countUnits([q.prompt,...q.options||[],...q.left||[],...q.right||[]].join(' '))>300)throw Error('单题超过300，须先拆分学习包');for(const k of q.type==='match'?['left','right']:q.type==='choice'?['options']:[]){if(!Array.isArray(q[k])||!q[k].every(v=>typeof v==='string'))throw Error('题目选项无效');}}}
 return b;
}
export function validateBackup(b,bookId){
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
 if(b?.version!==1||b.bookId!==bookId||!obj(b.records))throw Error('备份与当前书籍不匹配');
 const r=b.records;
 if(r.position!==undefined&&(!Number.isInteger(r.position)||r.position<0))throw Error('进度无效');
 if(r.answers!==undefined&&(!obj(r.answers)||Object.values(r.answers).some(v=>typeof v!=='string'&&!Array.isArray(v)&&!obj(v))))throw Error('答案无效');
 for(const k of ['lines','words'])if(r[k]!==undefined){if(!Array.isArray(r[k]))throw Error('标记无效');for(const x of r[k])if(!x||typeof x.page!=='string'||typeof x.block!=='string'||typeof x.text!=='string'||!Number.isInteger(x.start)||!Number.isInteger(x.end)||x.start<0||x.end<=x.start)throw Error('选区无效');}
 return r;
}

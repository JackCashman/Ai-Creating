import {test} from 'node:test';
import assert from 'node:assert/strict';
import {countUnits,paginate,validateBook,validateBackup} from '../public/core.js';
test('counts words, punctuation and every space, not letters',()=>{
 assert.equal(countUnits('Hello, world!'),5);
 assert.equal(countUnits("don't re-read"),5);
 assert.equal(countUnits('a  b'),4);
});
test('pagination preserves exact text and never exceeds budget',()=>{
 const text='A long reading passage. '.repeat(150);
 const pages=paginate(text,300);
 assert.equal(pages.map(x=>x.text).join(''),text);
 assert.ok(pages.every(x=>countUnits(x.text)<=300));
 assert.equal(pages[1].start,pages[0].text.length);
});
test('rejects invalid imported content and active image URLs',()=>{
 assert.throws(()=>validateBook({pages:[{id:'x',image:'javascript:alert(1)'}]}));
 assert.throws(()=>validateBook({version:1,id:'b',pages:[{id:'p',blocks:[]},{id:'p',blocks:[]}]}));
 assert.doesNotThrow(()=>validateBook({version:1,id:'b',title:'Book',pages:[{id:'p',sourcePage:1,blocks:[{id:'b',text:'Hello'}]}]}));
});
test('backup must belong to this book before replacing records',()=>{
 assert.throws(()=>validateBackup({version:1,bookId:'other',records:{}},'book'));
 assert.throws(()=>validateBackup({version:1,bookId:'book',records:[]},'book'));
});
test('malformed backup collections cannot overwrite working records',()=>{
 for(const records of [{lines:{}},{words:'bad'},{answers:[]},{position:-1},{lines:[{page:'p',block:'b',start:3,end:1}]}])assert.throws(()=>validateBackup({version:1,bookId:'book',records},'book'));
});
test('malformed exercises are rejected before book persistence',()=>{
 assert.throws(()=>validateBook({version:1,id:'b',pages:[{id:'p',blocks:[],exercises:[{id:'q',type:'match',prompt:'Match'}]}]}));
});
test('pathological compound word cannot bypass page limit',()=>{const text='a-'.repeat(301)+'a';const pages=paginate(text);assert.equal(pages.map(x=>x.text).join(''),text);assert.ok(pages.every(p=>countUnits(p.text)<=300));});
import {decodeClip,normalize} from '../public/dictation.js';
test('decodes independent 8 kHz IMA clips in high-nibble-first order',()=>{
 assert.deepEqual(Array.from(decodeClip('d/8='),x=>x*32768),[11,41,-22,-158]);
 assert.equal(normalize('  Don’t   stop! '),"don't stop");
});
test('malformed paper marks, typed answers or missing related pages cannot replace study data',()=>{
 const book={version:1,id:'b',pages:[{id:'p',blocks:[],exercises:[{id:'q',type:'choice',prompt:'Pick',options:['a','b']}]}]};
 for(const records of [{paper:{p:[{}]}},{answers:{'p:q':{}}},{dictation:{hello:{attempts:1,correct:2}}}])assert.throws(()=>validateBackup({version:1,bookId:'b',records},'b',book));
 book.pages[0].blocks.push({id:'x',kind:'reading',text:'sample',related:['missing']});
 assert.throws(()=>validateBook(book));
});

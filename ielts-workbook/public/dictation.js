export const normalize = text => text.trim().toLowerCase().replaceAll('’',"'").replace(/[^a-z0-9']+/g,' ').trim();
export function decodeClip(base64) {
  const bytes = atob(base64);
  const steps = [7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,29794,32767];
  const indexDelta = [-1,-1,-1,-1,2,4,6,8];
  const samples = new Float32Array(bytes.length*2);
  let previous=0,stepIndex=0,offset=0;
  for(const char of bytes){
    const byte=char.charCodeAt(0);
    for(const nibble of [byte>>4,byte&15]){
      const step=steps[stepIndex];
      const difference=(step>>3)+((nibble&4)?step:0)+((nibble&2)?step>>1:0)+((nibble&1)?step>>2:0);
      previous=Math.max(-32768,Math.min(32767,previous+((nibble&8)?-difference:difference)));
      samples[offset++]=previous/32768;
      stepIndex=Math.max(0,Math.min(88,stepIndex+indexDelta[nibble&7]));
    }
  }
  return samples;
}
let audio;
export async function playWords(text, clips) {
  const keys = normalize(text).split(' ');
  if(!keys.every(key => typeof clips?.[key] === 'string')) throw Error('此段文字缺少离线发音，请选择完整英文单词，并导入新版学习包。');
  if(audio) await audio.close();
  audio = new AudioContext();
  await audio.resume();
  const all = keys.map(key => decodeClip(clips[key]));
  const length = all.reduce((n, samples) => n + samples.length + 600, 0);
  const sound = audio.createBuffer(1,length,8000);
  let offset = 0;
  for(const samples of all){sound.copyToChannel(samples,0,offset);offset += samples.length+600;}
  const source = audio.createBufferSource();
  source.buffer = sound; source.connect(audio.destination); source.start();
}
export function practice(container, words, clips, counts, save) {
  const queue = words.filter(w => normalize(w.text).split(' ').every(k => clips?.[k]));
  container.replaceChildren();
  if(!queue.length){container.textContent='请先在新版学习包中收藏完整的英文单词或短语。';return;}
  let index=0;
  function show(){
    container.replaceChildren();
    const word=queue[index].text;
    const title=document.createElement('p');title.textContent='听写 '+(index+1)+' / '+queue.length;
    const listen=document.createElement('button');listen.textContent='播放发音';
    const field=document.createElement('input');field.placeholder='输入听到的英文';field.autocomplete='off';field.spellcheck=false;
    const result=document.createElement('p');
    listen.onclick=()=>playWords(word,clips).catch(e=>result.textContent=e.message);
    const check=document.createElement('button');check.textContent='核对';
    const next=document.createElement('button');next.textContent=index+1===queue.length?'完成听写':'下一个';next.hidden=true;
    check.onclick=()=>{
      if(!field.value.trim())return;
      const ok=normalize(field.value)===normalize(word);
      result.textContent=ok?'正确':'正确拼写为 '+word;
      const key=normalize(word);const item=counts[key]??={attempts:0,correct:0};
      item.attempts++;if(ok)item.correct++;save();
      check.disabled=true;field.readOnly=true;next.hidden=false;
    };
    next.onclick=()=>{if(++index===queue.length){container.textContent='本轮听写完成';}else show();};
    container.append(title,listen,field,check,result,next);
  }
  show();
}

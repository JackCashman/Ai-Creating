import { glossary } from './glossary.js';
import { playWords } from './dictation.js';
export function setupTutor(getBook) {
  const dialog=document.querySelector('#tutorDialog');
  const input=dialog.querySelector('textarea'), result=dialog.querySelector('output');
  const log=dialog.querySelector('.chatlog'), send=dialog.querySelector('[data-send]');
  const mic=dialog.querySelector('[data-mic]'), read=dialog.querySelector('[data-speak]');
  const history=[];
  let worker=null,busy=false,recording=null,timer,context='',last='',mode='chat';
  function display(){log.textContent=history.map(m=>(m.role==='user'?'你':'助教')+'\n'+m.content).join('\n\n');}
  function finish(){busy=false;read.disabled=false;send.disabled=mic.disabled=false;clearTimeout(timer);}
  function run(data,done){
    if(busy)return;
    busy=true;read.disabled=send.disabled=mic.disabled=true;
    result.textContent='正在加载本机模型…';
    const fail=message=>{worker?.terminate();worker=null;finish();result.textContent=message;};
    try {
      worker ||= new Worker(new URL('./model-worker.js',import.meta.url),{type:'module'});
      worker.onerror=()=>fail('模型加载失败。请检查网络或设备可用内存。');
      worker.onmessage=({data})=>{
        if(data.status==='progress'){result.textContent=data.message;return;}
        if(data.status==='error'){fail(data.message);return;}
        finish();result.textContent='';done(data.text);
      };
      timer=setTimeout(()=>fail('模型等待超时，可重试。'),300000);
      worker.postMessage(data);
    }catch(error){fail(error.message);}
  }
  const translate=()=>{
    const text=input.value.trim();if(!text||busy)return;
    const definition=glossary.get(text.toLowerCase());
    if(definition){result.textContent='离线释义 · '+definition;return;}
    run({type:'translation',text},answer=>{result.textContent=answer;});
  };
  dialog.querySelector('[data-translate]').onclick=translate;
  send.onclick=()=>{
    if(mode==='translate'){translate();return;}
    const question=input.value.trim();if(!question)return;
    const messages=[{role:'system',content:mode==='translate'?'Translate the user text to natural Chinese. Only output the translation.':'You are an English learning partner. Answer briefly in English. For writing feedback give one correction and one follow-up question.'},...history.slice(-6),{role:'user',content:(context?'Reading excerpt: '+context+'\n':'')+question}];
    run({type:'chat',messages},text=>{history.push({role:'user',content:question},{role:'assistant',content:text});last=text;input.value='';display();});
  };
  read.onclick=async()=>{
    if(!last){result.textContent='先发送一条消息';return;}
    try{await playWords(last,getBook()?.clips);return;}catch{}
    const speaker=new AudioContext();await speaker.resume();
    run({type:'speak',text:last},audio=>{
      const buffer=speaker.createBuffer(1,audio.samples.length,audio.rate);
      buffer.copyToChannel(audio.samples,0);
      const source=speaker.createBufferSource();source.buffer=buffer;
      source.connect(speaker.destination);source.onended=()=>speaker.close();source.start();
    });
  };
  mic.onclick=async()=>{
    if(recording?.state==='recording'){recording.stop();return;}
    let stream;
    try {
      stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!dialog.open){stream.getTracks().forEach(t=>t.stop());return;}
      const rec=new MediaRecorder(stream),chunks=[];
      recording=rec;rec.ondataavailable=e=>chunks.push(e.data);
      rec.onstop=async()=>{
        stream.getTracks().forEach(t=>t.stop());recording=null;mic.textContent='英语语音输入';send.disabled=false;
        if(!dialog.open)return;
        let decoder;
        try {
          decoder=new AudioContext();
          const buffer=await decoder.decodeAudioData(await new Blob(chunks,{type:rec.mimeType}).arrayBuffer());
          const offline=new OfflineAudioContext(1,Math.ceil(buffer.duration*16000),16000);
          const source=offline.createBufferSource();source.buffer=buffer;source.connect(offline.destination);source.start();
          const mono=await offline.startRendering();
          run({type:'speech',samples:mono.getChannelData(0)},text=>{input.value=text;result.textContent='可修改识别文字后发送';});
        }catch(e){result.textContent=e.message;}finally{await decoder?.close();}
      };
      rec.start();mic.textContent='结束录音';send.disabled=true;
      setTimeout(()=>{if(rec.state==='recording')rec.stop();},30000);
    }catch(e){stream?.getTracks().forEach(t=>t.stop());result.textContent='无法录音：'+e.message;}
  };
  dialog.addEventListener('close',()=>{if(recording?.state==='recording')recording.stop();worker?.terminate();worker=null;finish();});
  return (task,excerpt='')=>{
    history.length=0;context=task==='chat'?excerpt.slice(0,1600):'';mode=task;last='';display();
    input.value=task==='translate'?excerpt:'';result.textContent='';
    dialog.showModal();if(task==='translate'&&glossary.has(excerpt.trim().toLowerCase()))translate();
  };
}

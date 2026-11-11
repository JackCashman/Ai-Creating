let runtime, generator, recognizer, voice, translator;
const progress = event => {
  if(event.status === 'progress') postMessage({status:'progress',message:'下载模型 '+event.file+' '+Math.round(event.progress||0)+'%'});
};
async function pipeline() {
  if(!runtime) {
    runtime = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.min.js');
    runtime.env.allowLocalModels = false;
    runtime.env.backends.onnx.wasm.numThreads = 1;
  }
  return runtime.pipeline;
}
self.onmessage = async ({data}) => {
  try {
    if(data.type==='speak'){
      const {KokoroTTS}=await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm');
      voice ||= await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'q8',device:'wasm',progress_callback:progress});
      const audio=await voice.generate(data.text,{voice:'af_heart'});
      postMessage({status:'done',text:{samples:audio.audio,rate:audio.sampling_rate}});
      return;
    }
    const load = await pipeline();
    if(data.type === 'translation') {
      translator ||= await load('translation','Xenova/opus-mt-en-zh',{device:'wasm',dtype:'q8',progress_callback:progress});
      const output=await translator(data.text,{max_new_tokens:Math.min(240,20+data.text.length*2),num_beams:3,no_repeat_ngram_size:3,repetition_penalty:1.15,early_stopping:true});
      postMessage({status:'done',text:output[0].translation_text});
    }else if(data.type === 'speech') {
      recognizer ||= await load('automatic-speech-recognition','Xenova/whisper-tiny.en',{device:'wasm',dtype:'q8',progress_callback:progress});
      const output = await recognizer(data.samples);
      postMessage({status:'done',text:output.text});
    } else {
      generator ||= await load('text-generation','onnx-community/Qwen2.5-0.5B-Instruct',{device:'wasm',dtype:'q4',progress_callback:progress});
      const result = await generator(data.messages,{max_new_tokens:180,do_sample:false,return_full_text:false});
      const value=result[0].generated_text;
      const answer=Array.isArray(value)?value.at(-1)?.content:value;
      if(typeof answer!=='string'||!answer.trim()) throw Error('模型未返回文字');
      postMessage({status:'done',text:answer.trim()});
    }
  } catch(error) {postMessage({status:'error',message:'模型不可用：'+error.message});}
};

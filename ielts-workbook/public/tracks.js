import {get,put} from './store.js';
export function trackPanel() {
  const input=document.querySelector('#trackFile');
  const player=document.querySelector('#trackPlayer');
  const label=document.querySelector('#trackLabel');
  let key='',url='';
  async function refresh(book,page) {
    const requested=book.id+':track:'+page.id;
    if(requested===key)return;
    key=requested;player.pause();player.removeAttribute('src');player.hidden=true;
    if(url)URL.revokeObjectURL(url);
    label.textContent='此页尚未导入原声音轨';
    try {
      const saved=await get(requested);
      if(key!==requested||!saved)return;
      url=URL.createObjectURL(saved);player.src=url;player.hidden=false;
      label.textContent=saved.name||'已导入本页音轨';
    } catch {label.textContent='无法读取此页音轨';}
  }
  input.onchange=async()=>{
    const file=input.files[0],target=key;if(!file||!target)return;
    try {
      await put(target,file);
      if(key===target){if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(file);player.src=url;player.hidden=false;label.textContent=file.name;}
    }catch{label.textContent='音轨保存失败，请检查设备空间';}
    input.value='';
  };
  return refresh;
}

let db;
export async function database(){if(db)return db;db=await new Promise((resolve,reject)=>{const req=indexedDB.open('ielts-private-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('data');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return db;}
export async function get(key){const d=await database();return new Promise((resolve,reject)=>{const q=d.transaction('data').objectStore('data').get(key);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}
export async function put(key,value){const d=await database();return new Promise((resolve,reject)=>{const tx=d.transaction('data','readwrite');tx.objectStore('data').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}

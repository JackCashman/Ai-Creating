"""Private OCR export. Never commit output; requires PyMuPDF and Tesseract."""
import argparse,base64,concurrent.futures,csv,io,json,os,subprocess,tempfile
import fitz
p=argparse.ArgumentParser();p.add_argument('pdf');p.add_argument('output');a=p.parse_args()
os.environ['OMP_THREAD_LIMIT']='1'
def page(i):
 doc=fitz.open(a.pdf);p=doc[i]
 image=p.get_pixmap(matrix=fitz.Matrix(1.5,1.5))
 with tempfile.TemporaryDirectory() as d:
  fn=d+'/page.png';image.save(fn)
  r=subprocess.run(['tesseract',fn,'stdout','--psm','3','tsv'],check=True,capture_output=True,text=True)
 blocks={}
 for w in csv.DictReader(io.StringIO(r.stdout),delimiter='\t',quoting=csv.QUOTE_NONE):
  if w.get('level')!='5' or not w.get('text','').strip():continue
  key=w['block_num'];b=blocks.setdefault(key,{'id':f'p{i+1}-b{key}','kind':'reading','text':'','bbox':[1,1,0,0],'reviewStatus':'unverified'})
  b['text']+=(' ' if b['text'] else '')+w['text']
  x,y,ww,hh=[int(w[k]) for k in ['left','top','width','height']]
  b['bbox']=[min(b['bbox'][0],x/image.width),min(b['bbox'][1],y/image.height),max(b['bbox'][2],(x+ww)/image.width),max(b['bbox'][3],(y+hh)/image.height)]
 low=p.get_pixmap(matrix=fitz.Matrix(1,1));jpg=low.tobytes('jpeg',jpg_quality=72)
 result={'id':f'p{i+1}','sourcePage':i+1,'reviewStatus':'unverified','image':'data:image/jpeg;base64,'+base64.b64encode(jpg).decode(),'blocks':list(blocks.values()),'exercises':[]}
 print(f'Extracted {i+1}',flush=True);return result
n=len(fitz.open(a.pdf))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:pages=list(pool.map(page,range(n)))
with open(a.output,'w') as f:json.dump({'version':1,'id':'ready-ielts-workbook-2018-v1','title':'Ready for IELTS · Workbook','pages':pages},f,ensure_ascii=False)
print('Saved',a.output,flush=True)

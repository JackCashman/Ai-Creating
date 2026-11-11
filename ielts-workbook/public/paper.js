// Coordinates are fractions of the original image, independent of zoom and orientation.
export function mountPaper(parent, page, marks, save) {
  let tool = 'view';
  const toolbar = document.createElement('div');
  toolbar.className = 'tools';
  const surface = document.createElement('div');
  surface.className = 'sheet';
  const picture = new Image();
  picture.src = page.image;
  picture.alt = '书页 ' + (page.printedPage ?? page.sourcePage);
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1698;
  const context = canvas.getContext('2d');
  const layer = document.createElement('div');
  layer.className = 'notes';
  const actions = new Map();
  function choose(value) {
    tool = value;
    canvas.style.pointerEvents = value === 'view' ? 'none' : 'auto';
    canvas.style.touchAction = value === 'pen' || value === 'line' ? 'none' : 'manipulation';
    for (const [key, button] of actions) button.setAttribute('aria-pressed', String(key === value));
  }
  for (const [key, label] of [['view','浏览'],['pen','手写 / 圈选'],['line','连线'],['text','填写文字']]) {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = () => choose(key);
    actions.set(key, button);
    toolbar.append(button);
  }
  const undo = document.createElement('button');
  undo.textContent = '撤销本页一笔';
  undo.onclick = () => { marks.pop(); draw(); save(); };
  toolbar.append(undo);
  function stroke(mark) {
    const points = mark.points;
    context.beginPath();
    context.strokeStyle = '#174ab5';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.moveTo(points[0][0] * canvas.width, points[0][1] * canvas.height);
    for (const [x,y] of points.slice(1)) context.lineTo(x * canvas.width, y * canvas.height);
    if (points.length === 1) context.lineTo(points[0][0]*canvas.width+1,points[0][1]*canvas.height+1);
    context.stroke();
  }
  function draw() {
    context.clearRect(0,0,canvas.width,canvas.height);
    layer.replaceChildren();
    undo.disabled = !marks.length;
    for (const mark of marks) {
      if (mark.type !== 'text') { stroke(mark); continue; }
      const note = document.createElement('button');
      note.className = 'paperNote';
      note.textContent = mark.text;
      note.style.left = (100 * mark.x) + '%';
      note.style.top = (100 * mark.y) + '%';
      note.onclick = () => edit(mark);
      layer.append(note);
    }
  }
  function edit(mark) {
    const dialog = document.createElement('dialog');
    const input = document.createElement('textarea');
    input.setAttribute('aria-label','原页答案');
    input.value = mark.text;
    const finish = document.createElement('button');
    finish.textContent = '保存答案';
    finish.onclick = () => {
      mark.text = input.value.trim();
      const previous = marks.indexOf(mark);
      if (!mark.text && previous >= 0) marks.splice(previous,1);
      if (mark.text && previous < 0) marks.push(mark);
      draw(); save(); dialog.close();
    };
    const cancel = document.createElement('button');
    cancel.textContent = '取消'; cancel.onclick = () => dialog.close();
    dialog.append(input,finish,cancel);
    dialog.onclose = () => dialog.remove();
    document.body.append(dialog); dialog.showModal(); input.focus();
  }
  let pending = null;
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    const clamp = value => Math.min(1, Math.max(0,value));
    return [clamp((event.clientX-rect.left)/rect.width),clamp((event.clientY-rect.top)/rect.height)];
  }
  canvas.onpointerdown = event => {
    if (!event.isPrimary || event.button !== 0) return;
    const [x,y] = point(event);
    if (tool === 'text') {edit({type:'text', x, y, text:''});return;}
    pending = {type:tool,points:[[x,y]]};
    canvas.setPointerCapture(event.pointerId);
  };
  canvas.onpointermove = event => {
    if (!pending || !event.isPrimary) return;
    if(tool === 'line') pending.points[1] = point(event);
    else pending.points.push(point(event));
    draw(); stroke(pending);
  };
  canvas.onpointerup = event => {
    if (!pending || !event.isPrimary) return;
    if(tool === 'line') pending.points[1] = point(event);
    marks.push(pending); pending = null; draw(); save();
  };
  canvas.onpointercancel = () => {pending=null; draw();};
  surface.append(picture,canvas,layer);
  parent.append(toolbar,surface);
  choose('view'); draw();
}

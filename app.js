(()=>{
const $=(s,r=document)=>r.querySelector(s),app=$('#app'),cred=$('#credits');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LET=['A','B','C','D'];
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const KIND={
 pix:{name:'Pixel Art Quiz',short:'pixel art',unit:'picture',data:()=>window.PIX.map(q=>({n:q.n,diff:q.diff,genre:q.genre,opts:q.opts}))},
 wri:{name:'Writing Quiz',short:'writing',unit:'passage',data:()=>window.WRT.map(q=>({n:q.n,diff:q.diff,genre:'',opts:[Object.assign({ai:false,text:q.real.text},q.real),Object.assign({ai:true,text:q.ai.text},q.ai)]}))},
 poe:{name:'Poem Quiz',short:'poems',unit:'poem',data:()=>window.POE.map(q=>({n:q.n,diff:q.diff,genre:q.form,opts:q.opts}))}
};
const ORDER=['pix','wri','poe'];
let S=null;
function shuf(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* ---------- mode picker ---------- */
function home(){
 S=null;document.title='AI Quiz · AI or real?';
 app.innerHTML=`<div class="hero"><h1 class="logo"><span class="a">AI</span> <span class="b">QUIZ</span></h1>
 <p class="sub">Three quizzes. Ten questions each, easy to hard. In every question exactly one piece is made by AI. The rest are made by people. Pick the AI.</p></div>
 <div class="modes">
  <button class="card" id="m-pix" type="button"><div class="prev"><img src="img/q7_r1.png" alt=""><img src="img/q7_a.png" alt=""><img src="img/q10_r1.png" alt=""></div><h2>Pixel art</h2><p>Ten genres, from sky backgrounds down to 16-pixel potions. Two choices at first, then three, then four.</p><span class="go">▶ Start the pixel quiz</span></button>
  <button class="card w" id="m-wri" type="button"><div class="prev"><div class="tx">“I remember him as if it were yesterday, as he came plodding to the inn door…”</div></div><h2>Writing</h2><p>Real passages from public-domain books next to AI-written ones in the same style. The early AI passages are easy to spot. The late ones are not.</p><span class="go">▶ Start the writing quiz</span></button>
  <button class="card p" id="m-poe" type="button"><div class="prev"><div class="tx">“Hope is the thing with feathers<br>That perches in the soul…”</div></div><h2>Poems</h2><p>Public-domain poems by Dickinson, Frost, Blake, Whitman and others. Each question has one poem written by AI. Two choices at first, then three, then four.</p><span class="go">▶ Start the poem quiz</span></button>
 </div>
 <p class="note">Score is shown at the end. After each answer you see which was which, plus the credit for every real piece.</p>`;
 ORDER.forEach(k=>$('#m-'+k).onclick=()=>start(k));
 window.scrollTo(0,0);
}
/* ---------- quiz ---------- */
function start(kind){
 const data=KIND[kind].data();
 S={kind,qs:data.map(q=>{const opts=shuf(q.opts);return {q,opts,aiIdx:opts.findIndex(o=>o.ai),pick:null}}),i:0,score:0};
 render();
}
function bar(){return `<div class="bar" aria-hidden="true">${S.qs.map((x,k)=>`<i class="${x.pick==null?(k===S.i?'cur':''):(x.pick===x.aiIdx?'ok':'no')}"></i>`).join('')}</div>`}
function render(){
 const x=S.qs[S.i],q=x.q,k=S.kind,N=x.opts.length;
 document.title=`${KIND[k].name} · Q${S.i+1}/10 · AI Quiz`;
 const body=x.opts.map((it,side)=>{
  const inner=k==='pix'?`<div class="frame"><img src="${it.file}" width="${it.w}" height="${it.h}" alt="Pixel art ${LET[side]}" data-w="${it.w}" data-h="${it.h}" draggable="false"></div>`:`<div class="txt ${k==='poe'?'poem':''}">${esc(it.text)}</div>`;
  return `<button type="button" class="pick" data-side="${side}" aria-label="Choose ${LET[side]} as the AI one"><span class="lab"><span>${LET[side]}</span></span>${inner}<span class="tag"></span></button>`}).join('');
 app.innerHTML=`<div class="top"><span class="qn">${KIND[k].name} · Q${S.i+1}/10</span><span><span class="chip ${q.diff}">${q.diff}</span> <span class="chip">${N} choices</span> <span class="chip">Score ${S.score}</span></span></div>${bar()}
 <h2 class="ask">Which one is <em>AI</em>?</h2>${q.genre?`<p class="genre">All ${N}: ${esc(q.genre.toLowerCase())}. Only one is AI.</p>`:`<p class="genre">One is AI. One is real.</p>`}<div class="pair n${N}" id="pair">${body}</div><div id="fb"></div><p class="keyhint">Tap a ${KIND[k].unit} to answer. Keys: ${LET.slice(0,N).join(', ')}, then Enter.</p>`;
 app.querySelectorAll('.pick').forEach(b=>b.onclick=()=>answer(+b.dataset.side));
 if(k==='pix')fit();
 window.scrollTo(0,0);
}
/* pixel layout: one integer scale shared by every piece in the question */
function fit(){
 const x=S&&S.qs[S.i];if(!x||S.kind!=='pix')return;
 const pair=$('#pair'),imgs=[...app.querySelectorAll('.pick img')];if(!pair||!imgs.length)return;
 const N=imgs.length,narrow=innerWidth<=760;
 const mw=Math.max(...imgs.map(i=>+i.dataset.w)),mh=Math.max(...imgs.map(i=>+i.dataset.h));
 const gap=narrow?10:18,pad=narrow?12:24,border=8;
 const W=pair.parentElement.clientWidth;
 const opts=N===2?[2,1]:N===3?[3,1]:[2,1];
 const availH=narrow?(N===2?380:240):Math.max(110,Math.min(460,innerHeight-380));
 const calc=c=>{const cw=(W-gap*(c-1))/c-pad-border;const rows=Math.ceil(N/c);const ch=narrow?availH:availH/rows;let s=Math.min(cw/mw,ch/mh);return s>=1?Math.min(14,Math.floor(s)):s};
 let cols=opts[0],s=calc(cols);
 if(narrow){const all=opts.map(c=>[c,calc(c)]);const good=all.find(a=>a[1]>=3);const best=all.reduce((m,a)=>a[1]>m[1]?a:m,all[0]);const pick=good||best;cols=pick[0];s=pick[1]}
 pair.style.setProperty('--cols',cols);pair.classList.toggle('stack',cols===1);
 imgs.forEach(i=>{i.style.width=Math.round(+i.dataset.w*s)+'px';i.style.height=Math.round(+i.dataset.h*s)+'px'});
 app.dataset.scale=s;app.dataset.cols=cols;
}
addEventListener('resize',fit);
function credit(o,k){
 if(k==='pix')return `<b>${esc(o.desc)}</b> by ${esc(o.artist)}. From “${esc(o.work)}”, ${esc(o.license)}. <a href="${o.url}" target="_blank" rel="noopener">Source page</a>. ${o.w}×${o.h}, ${o.colors} colors.`;
 if(k==='poe')return `<b>${esc(o.title)}</b> by ${esc(o.author)}, from <i>${esc(o.work)}</i>. <a href="${o.url}" target="_blank" rel="noopener">Project Gutenberg</a>, public domain.`;
 return `${esc(o.author)}, <i>${esc(o.work)}</i>. Excerpt from <a href="${o.url}" target="_blank" rel="noopener">Project Gutenberg</a>, public domain.`;
}
function answer(side){
 const x=S.qs[S.i];if(x.pick!=null)return;
 x.pick=side;const ok=side===x.aiIdx;if(ok)S.score++;
 const pair=$('#pair');pair.classList.add('revealed');
 pair.querySelectorAll('.pick').forEach(b=>{const s=+b.dataset.side,ai=s===x.aiIdx;b.disabled=true;b.classList.add(ai?'isai':'isreal');b.querySelector('.tag').textContent=ai?'AI':'Real';if(s===side)b.classList.add('chosen',ok?'good':'bad');if(ai&&!ok)b.classList.add('good')});
 const q=x.q,k=S.kind;let det='<dl>';
 x.opts.forEach((o,s)=>{
  if(!o.ai)det+=`<dt>${LET[s]} · Real</dt><dd>${credit(o,k)}</dd>`;
  else if(k==='pix')det+=`<dt>${LET[s]} · AI</dt><dd>${esc(o.desc)}. Generated as a detailed source image, then converted in code only (slight blur, nearest-neighbor downscale, limited palette, no dithering) to ${o.w}×${o.h} with ${o.colors} colors. Nothing was redrawn by hand.</dd>`;
  else det+=`<dt>${LET[s]} · AI</dt><dd>Written by AI for this quiz. <b>The tell:</b> ${esc(o.tell)}</dd>`;
 });
 det+='</dl>';
 if(k==='pix'){const a=x.opts[x.aiIdx];det+=`<div class="src"><img class="srcimg" src="${a.src}" alt="The AI source image before conversion" style="image-rendering:auto"><p class="keyhint">The AI image before conversion, shrunk to fit here.</p></div>`}
 const last=S.i===9;
 $('#fb').innerHTML=`<div class="fb ${ok?'good':'bad'}"><h3>${ok?'✔ Correct':'✘ Not this time'}: ${LET[x.aiIdx]} was the AI</h3>${det}<div class="row"><button class="btn" id="next" type="button">${last?'See my score':'Next question ▶'}</button></div></div>`;
 $('#next').onclick=next;$('#next').focus({preventScroll:true});
 $('#fb').scrollIntoView({block:'nearest',behavior:reduce()?'auto':'smooth'});
 const b=$('.bar');if(b)b.outerHTML=bar();
}
function next(){if(S.i<9){S.i++;render()}else result()}
function result(){
 const k=S.kind,sc=S.score,msg=sc<=3?'The machines fooled you most of the time.':sc<=6?'Somewhere in the middle. Some of them got you.':sc<=8?'Sharp eyes. Only a couple slipped past.':'You caught nearly every one.';
 document.title=`${sc}/10 · ${KIND[k].name} · AI Quiz`;
 const others=ORDER.filter(o=>o!==k);
 app.innerHTML=`<div class="res ${k==='wri'?'w':k==='poe'?'p':''}"><h2 class="sil">${KIND[k].name} · Your score</h2><div class="big">${sc}/10</div><p>${msg}</p>
 <div class="recap">${S.qs.map((x,n)=>{const ok=x.pick===x.aiIdx;return `<div class="${ok?'ok':'no'}"><b>Q${n+1} · ${x.q.diff}</b>${ok?'✔ Spotted the AI':'✘ Missed it'}<br><small>${x.opts.length} choices${x.q.genre?' · '+esc(x.q.genre.toLowerCase()):''}</small></div>`}).join('')}</div>
 <div class="row c"><button class="btn" id="again" type="button">Play again</button>${others.map((o,j)=>`<button class="btn pk" data-o="${o}" type="button">Try the ${KIND[o].short} quiz</button>`).join('')}<button class="btn ghost" id="menu" type="button">Main menu</button></div></div>`;
 $('#again').onclick=()=>start(k);app.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>start(b.dataset.o));$('#menu').onclick=home;window.scrollTo(0,0);
}
addEventListener('keydown',e=>{
 if(!S||e.metaKey||e.ctrlKey||e.altKey)return;const x=S.qs&&S.qs[S.i];if(!x||!$('#pair'))return;const key=e.key.toLowerCase();
 if(x.pick==null){const m={a:0,b:1,c:2,d:3,'1':0,'2':1,'3':2,'4':3}[key];if(m!=null&&m<x.opts.length)answer(m);else if(key==='arrowleft'&&x.opts.length===2)answer(0);else if(key==='arrowright'&&x.opts.length===2)answer(1)}
 else if(key==='enter'&&document.activeElement!==$('#next')){next()}
});
/* ---------- credits ---------- */
function credits(){
 const px=window.PIX.flatMap(q=>q.opts.filter(o=>!o.ai).map(o=>`<tr><td>${q.n}</td><td><img class="th" src="${o.file}" alt=""></td><td>${esc(o.desc)}<br><small>${esc(q.genre)} · ${o.w}×${o.h}, ${o.colors} colors</small></td><td>${esc(o.artist)}</td><td>${esc(o.license)}</td><td><a href="${o.url}" target="_blank" rel="noopener">${esc(o.work)}</a></td></tr>`)).join('');
 const po=window.POE.flatMap(q=>q.opts.filter(o=>!o.ai).map(o=>`<li>Q${q.n}: <b>${esc(o.title)}</b> by ${esc(o.author)}, from <i>${esc(o.work)}</i>. <a href="${o.url}" target="_blank" rel="noopener">Project Gutenberg</a>, public domain.</li>`)).join('');
 const wr=window.WRT.map(q=>`<li>Q${q.n}: ${esc(q.real.author)}, <i>${esc(q.real.work)}</i>. <a href="${q.real.url}" target="_blank" rel="noopener">Project Gutenberg</a>, public domain.</li>`).join('');
 cred.innerHTML=`<h2>Credits</h2><h2>Real pixel art (21 pieces)</h2><p>Every real piece is human-made and openly licensed, mostly from OpenGameArt.org and almost all uploaded before 2022. Pieces under CC BY or CC BY-SA are used with credit to the artists named below (<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>). The real pieces are shown unmodified, except that sprites are trimmed to their edges and a sprite taken from a sheet is cut from its frame. Two sheets that were stored at 4× size were reduced to their true pixel size.</p>
 <div class="scroll"><table><thead><tr><th>Q</th><th>Piece</th><th>What</th><th>Artist</th><th>License</th><th>Source</th></tr></thead><tbody>${px}</tbody></table></div>
 <h2>How the AI pixel art was made</h2><p>For each question we picked a subject that differs from the real pieces. Each AI piece was generated as a detailed source image, with several candidates per question, and the most convincing one was kept. It was then converted by code only: a slight blur, a nearest-neighbor downscale to the size of its real pieces, and a limited palette set near the real colour count, with dithering off. Sprites were cropped to their empty margins only. Nothing was redrawn or cleaned by hand.</p>
 <h2>Real poems (21 poems)</h2><ul>${po}</ul><p>The real poems are excerpts of the first lines (the sonnets are complete), taken from Project Gutenberg texts. Only typography was normalised, so the real and AI poems look alike: curly quotes became straight, double hyphens became dashes, drop-cap capitals and line indents were removed, and stanza breaks were laid out the same way. The words are unchanged. Every AI poem was written by an AI assistant for this quiz.</p>
 <h2>Real writing</h2><ul>${wr}</ul><p>Each real passage is an exact excerpt, with only the Gutenberg italic markers removed. Every AI passage was written by AI for this quiz, in the style of its real partner.</p>
 <p><a href="#" id="closeCred">Close credits</a></p>`;
 $('#closeCred').onclick=e=>{e.preventDefault();cred.hidden=true;window.scrollTo(0,0)};
}
$('#creditsLink').onclick=e=>{e.preventDefault();credits();cred.hidden=false;cred.scrollIntoView({behavior:reduce()?'auto':'smooth'})};
home();
})();

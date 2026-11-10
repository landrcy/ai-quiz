(()=>{
const $=(s,r=document)=>r.querySelector(s),app=$('#app'),cred=$('#credits');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KIND={pix:{name:'Pixel Art Quiz',data:()=>window.PIX},wri:{name:'Writing Quiz',data:()=>window.WRT}};
let S=null;
/* ---------- mode picker ---------- */
function home(){
 S=null;document.title='AI Quiz · AI or real?';
 app.innerHTML=`<div class="hero"><h1 class="logo"><span class="a">AI</span> <span class="b">QUIZ</span></h1>
 <p class="sub">Two quizzes. Ten questions each, easy to hard. In every question one piece is made by AI and one is made by a person. Pick the AI.</p></div>
 <div class="modes">
  <button class="card" id="m-pix" type="button"><div class="prev"><img src="img/q5_real.png" alt=""><img src="img/q5_ai.png" alt=""></div><h2>Pixel art</h2><p>Human-made pixel art from the internet next to AI art run through our pixel method. It starts with big pieces and shrinks to tiny sprites.</p><span class="go">▶ Start the pixel quiz</span></button>
  <button class="card w" id="m-wri" type="button"><div class="prev"><div class="tx">“I remember him as if it were yesterday, as he came plodding to the inn door…”</div></div><h2>Writing</h2><p>Real passages from public-domain books next to AI-written ones in the same style. The early AI passages are easy to spot. The late ones are not.</p><span class="go">▶ Start the writing quiz</span></button>
 </div>
 <p class="note">Score is shown at the end. After each answer you see which was which, plus the credit for the real piece.</p>`;
 $('#m-pix').onclick=()=>start('pix');$('#m-wri').onclick=()=>start('wri');
 window.scrollTo(0,0);
}
/* ---------- quiz ---------- */
function start(kind){
 const data=KIND[kind].data();
 S={kind,qs:data.map(q=>({q,aiSide:Math.random()<.5?0:1,pick:null})),i:0,score:0};
 render();
}
function bar(){return `<div class="bar" aria-hidden="true">${S.qs.map((x,k)=>`<i class="${x.pick==null?(k===S.i?'cur':''):(x.pick===x.aiSide?'ok':'no')}"></i>`).join('')}</div>`}
function render(){
 const x=S.qs[S.i],q=x.q,k=S.kind,L=['A','B'];
 document.title=`${KIND[k].name} · Q${S.i+1}/10 · AI Quiz`;
 const items=[0,1].map(side=>{const ai=side===x.aiSide;return ai?q.ai:q.real});
 const body=items.map((it,side)=>{
  const ai=side===x.aiSide;
  const inner=k==='pix'?`<div class="frame"><img src="${it.file}" width="${it.w}" height="${it.h}" alt="Pixel art ${L[side]}, ${it.w} by ${it.h} pixels" data-w="${it.w}" data-h="${it.h}" draggable="false"></div>`:`<div class="txt">${esc(it.text)}</div>`;
  return `<button type="button" class="pick ${ai?'isai':'isreal'}" data-side="${side}" aria-label="Choose ${L[side]} as the AI one"><span class="lab"><span>${L[side]}</span><span>${k==='pix'?`${it.w}×${it.h}`:`${it.words} words`}</span></span>${inner}<span class="tag">${ai?'AI':'Real'}</span></button>`}).join('');
 app.innerHTML=`<div class="top"><span class="qn">${KIND[k].name} · Q${S.i+1}/10</span><span><span class="chip ${q.diff}">${q.diff}</span> <span class="chip">Score ${S.score}</span></span></div>${bar()}
 <h2 class="ask">Which one is <em>AI</em>?</h2><div class="pair" id="pair">${body}</div><div id="fb"></div><p class="keyhint">Tap a ${k==='pix'?'picture':'passage'} to answer. Keys: A, B, then Enter.</p>`;
 app.querySelectorAll('.pick').forEach(b=>b.onclick=()=>answer(+b.dataset.side));
 if(k==='pix')fit();
 window.scrollTo(0,0);
}
function fit(){
 const x=S&&S.qs[S.i];if(!x||S.kind!=='pix')return;
 const imgs=[...app.querySelectorAll('.pick img')];if(!imgs.length)return;
 const stacked=innerWidth<=760,fr=imgs[0].parentElement,cs=getComputedStyle(fr);
 const availW=fr.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
 const availH=stacked?Math.max(120,(innerHeight-300)/2):Math.min(Math.max(240,innerHeight-360),460);
 const mw=Math.max(...imgs.map(i=>+i.dataset.w)),mh=Math.max(...imgs.map(i=>+i.dataset.h));
 let s=Math.min(availW/mw,availH/mh);s=s>=1?Math.min(14,Math.floor(s)):s; // integer scale whenever the piece fits; only a too-wide piece on a narrow phone is shrunk
 imgs.forEach(i=>{i.style.width=Math.round(+i.dataset.w*s)+'px';i.style.height=Math.round(+i.dataset.h*s)+'px'});
 app.dataset.scale=s;
}
addEventListener('resize',fit);
function answer(side){
 const x=S.qs[S.i];if(x.pick!=null)return;
 x.pick=side;const ok=side===x.aiSide;if(ok)S.score++;
 const pair=$('#pair');pair.classList.add('revealed');
 pair.querySelectorAll('.pick').forEach(b=>{b.disabled=true;const s=+b.dataset.side;if(s===side)b.classList.add('chosen',ok?'good':'bad');if(s===x.aiSide&&!ok)b.classList.add('good')});
 const L=['A','B'],q=x.q,k=S.kind;let det='';
 if(k==='pix'){const r=q.real,a=q.ai;
  det=`<dl><dt>Real</dt><dd><b>${esc(r.desc)}</b> by ${esc(r.artist)}. From “${esc(r.work)}”, ${esc(r.license)}. <a href="${r.url}" target="_blank" rel="noopener">Source page</a>. ${r.w}×${r.h}, ${r.colors} colors.</dd>
  <dt>AI</dt><dd>Generated as a detailed source image, then converted in code only (slight blur, nearest-neighbor downscale, limited palette, no dithering) to ${a.w}×${a.h} with a ${a.pal}-color palette (${a.colors} used). Nothing was redrawn by hand.</dd></dl>
  <div class="src"><img class="srcimg" src="${a.src}" alt="The AI source image before conversion" style="image-rendering:auto"><p class="keyhint">The AI image before conversion, shrunk to fit here.</p></div>`;
 }else{const r=q.real,a=q.ai;
  det=`<dl><dt>Real</dt><dd>${esc(r.author)}, <i>${esc(r.work)}</i>. Excerpt from <a href="${r.url}" target="_blank" rel="noopener">Project Gutenberg</a>, public domain.</dd>
  <dt>AI</dt><dd>Written by AI for this quiz, in the style of the real passage.</dd><dt>The tell</dt><dd>${esc(a.tell)}</dd></dl>`;}
 const last=S.i===9;
 $('#fb').innerHTML=`<div class="fb ${ok?'good':'bad'}"><h3>${ok?'✔ Correct':'✘ Not this time'}: ${L[x.aiSide]} was the AI</h3>${det}<div class="row"><button class="btn" id="next" type="button">${last?'See my score':'Next question ▶'}</button></div></div>`;
 $('#next').onclick=next;$('#next').focus({preventScroll:true});
 $('#fb').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 const b=$('.bar');if(b)b.outerHTML=bar();
}
function next(){if(S.i<9){S.i++;render()}else result()}
function result(){
 const k=S.kind,sc=S.score,msg=sc<=3?'The machines fooled you most of the time.':sc<=6?'Somewhere in the middle. Some of them got you.':sc<=8?'Sharp eyes. Only a couple slipped past.':'You caught nearly every one.';
 document.title=`${sc}/10 · ${KIND[k].name} · AI Quiz`;
 app.innerHTML=`<div class="res ${k==='wri'?'w':''}"><h2 class="sil">${KIND[k].name} · Your score</h2><div class="big">${sc}/10</div><p>${msg}</p>
 <div class="recap">${S.qs.map((x,n)=>{const ok=x.pick===x.aiSide;return `<div class="${ok?'ok':'no'}"><b>Q${n+1} · ${x.q.diff}</b>${ok?'✔ Spotted the AI':'✘ Missed it'}${k==='pix'?`<br>${x.q.real.w}×${x.q.real.h}`:''}</div>`}).join('')}</div>
 <div class="row c"><button class="btn" id="again" type="button">Play again</button><button class="btn pk" id="other" type="button">${k==='pix'?'Try the writing quiz':'Try the pixel art quiz'}</button><button class="btn ghost" id="menu" type="button">Main menu</button></div></div>`;
 $('#again').onclick=()=>start(k);$('#other').onclick=()=>start(k==='pix'?'wri':'pix');$('#menu').onclick=home;window.scrollTo(0,0);
}
addEventListener('keydown',e=>{
 if(!S||e.metaKey||e.ctrlKey||e.altKey)return;const x=S.qs&&S.qs[S.i];if(!x||!$('#pair'))return;const key=e.key.toLowerCase();
 if(x.pick==null){if(key==='a'||key==='1'||key==='arrowleft')answer(0);else if(key==='b'||key==='2'||key==='arrowright')answer(1)}
 else if(key==='enter'&&document.activeElement!==$('#next')){next()}
});
/* ---------- credits ---------- */
function credits(){
 const px=window.PIX.map(q=>`<tr><td>${q.n}</td><td><img class="th" src="${q.real.file}" alt=""></td><td>${esc(q.real.desc)}<br><small>${q.real.w}×${q.real.h}</small></td><td>${esc(q.real.artist)}</td><td>${esc(q.real.license)}</td><td><a href="${q.real.url}" target="_blank" rel="noopener">${esc(q.real.work)}</a></td></tr>`).join('');
 const wr=window.WRT.map(q=>`<li>Q${q.n}: ${esc(q.real.author)}, <i>${esc(q.real.work)}</i>. <a href="${q.real.url}" target="_blank" rel="noopener">Project Gutenberg</a>, public domain.</li>`).join('');
 cred.innerHTML=`<h2>Credits</h2><h2>Real pixel art</h2><p>All ten real pieces are human-made and openly licensed. Pieces by Luis Zuno (ansimuz) come from OpenGameArt.org. “Battle Background – Hazy Hills” is CC BY 3.0 (credit: Luis Zuno, ansimuz.com; <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">license</a>). The real pieces are shown unmodified, except that sprites are trimmed to their edges. The Dungeon Crawl Stone Soup tiles are CC0.</p>
 <div class="scroll"><table><thead><tr><th>Q</th><th>Piece</th><th>What</th><th>Artist</th><th>License</th><th>Source</th></tr></thead><tbody>${px}</tbody></table></div>
 <h2>How the AI pixel art was made</h2><p>Each AI piece was generated as a detailed 16/32-bit style source image. Then it was converted by code only: a slight blur, a nearest-neighbor downscale to the size of the real piece it is paired with, and a limited palette with dithering off. Easy questions keep more colors so the AI texture shows. Hard ones use small palettes. Nothing was redrawn or cleaned by hand. The sprites were cropped to their empty margins only, and the two scenes were center-cropped to match the real piece’s shape.</p>
 <h2>Real writing</h2><ul>${wr}</ul><p>Each real passage is an exact excerpt, with only the Gutenberg italic markers removed. Every AI passage was written by AI for this quiz, in the style of its real partner.</p>
 <p><a href="#" id="closeCred">Close credits</a></p>`;
 $('#closeCred').onclick=e=>{e.preventDefault();cred.hidden=true;window.scrollTo(0,0)};
}
$('#creditsLink').onclick=e=>{e.preventDefault();credits();cred.hidden=false;cred.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
home();
})();

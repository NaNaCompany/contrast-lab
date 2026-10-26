import { parseHex, analyze, toHex, verdicts, candidates } from './core.js';
import { locales } from './locales.js';
const $=id=>document.getElementById(id),lang=document.documentElement.lang,t=locales[lang]||locales.ko;
document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=t[el.dataset.t];});document.title=t.title;
$('language').value=lang;$('language').addEventListener('change',e=>{location.href=new URL(e.target.value==='ko'?'./':e.target.value+'/',document.baseURI).href;});
const status=(key,error=false)=>{$('status').textContent=t[key]||t.invalid;$('status').classList.toggle('error',error);};
const cssColor=c=>`rgb(${c.r.toFixed(6)} ${c.g.toFixed(6)} ${c.b.toFixed(6)})`;
let current=null;
function suggestions(){
  $('candidates').replaceChildren();if(!current)return;
  const target=Number($('target').value),list=candidates(current.resolvedFg,current.resolvedBg,target);
  if(!list.length){const p=document.createElement('p');p.className='small';p.textContent=t[current.ratio>=target?'already':'noCandidate'];$('candidates').append(p);return;}
  for(const candidate of list){
    const card=document.createElement('div');card.className='candidate';
    const swatch=document.createElement('div');swatch.className='swatch';swatch.style.backgroundColor=candidate.hex;swatch.setAttribute('aria-hidden','true');
    const text=document.createElement('div');text.className='text';const name=document.createElement('strong');name.textContent=candidate.hex;
    const info=document.createElement('div');info.className='small';info.textContent=t[candidate.direction]+' · '+candidate.ratio.toFixed(2)+':1';text.append(name,info);
    const button=document.createElement('button');button.textContent=t.use;button.setAttribute('aria-label',t.use+' '+candidate.hex);button.addEventListener('click',()=>{$('fg').value=candidate.hex;update();});
    card.append(swatch,text,button);$('candidates').append(card);
  }
}
function update(){
  try {
    current=analyze($('fg').value,$('bg').value,$('canvas').value);
    for(const id of ['fg','bg','canvas']){$(id).removeAttribute('aria-invalid');$(id+'Picker').value=toHex(parseHex($(id).value));}
    $('results').hidden=false;$('ratio').textContent=current.ratio.toFixed(2)+':1';
    const verdict=verdicts(current.ratio);$('verdicts').replaceChildren();
    for(const [key,minimum] of [['aaNormal',4.5],['aaLarge',3],['aaaNormal',7],['aaaLarge',4.5],['nonText',3]]){
      const tr=document.createElement('tr');const label=document.createElement('td');label.textContent=t[key];
      const ratio=document.createElement('td');ratio.textContent=minimum+':1';
      const td=document.createElement('td');const badge=document.createElement('span');badge.className='badge '+(verdict[key]?'pass':'fail');badge.textContent=t[verdict[key]?'pass':'fail'];td.append(badge);tr.append(label,ratio,td);$('verdicts').append(tr);
    }
    $('previewCanvas').style.backgroundColor=toHex(current.canvas);$('preview').style.backgroundColor=toHex(current.background,true);$('preview').style.color=toHex(current.foreground,true);
    $('resolved').textContent=t.resolvedFg+': '+cssColor(current.resolvedFg)+' · '+t.resolvedBg+': '+cssColor(current.resolvedBg);
    $('css').value=`/* WCAG 2.2 contrast: ${current.ratio.toFixed(6)}:1 */\n:root {\n  --foreground: ${toHex(current.foreground,true)};\n  --background: ${toHex(current.background,true)};\n  --canvas: ${toHex(current.canvas)};\n  --composited-foreground: ${cssColor(current.resolvedFg)};\n  --composited-background: ${cssColor(current.resolvedBg)};\n}\n`;
    $('copy').disabled=$('download').disabled=false;suggestions();status('updated');
  }catch(e){current=null;$('results').hidden=true;$('candidates').replaceChildren();$('css').value='';$('copy').disabled=$('download').disabled=true;status(e.message,true);for(const id of ['fg','bg','canvas']){try{parseHex($(id).value,id==='canvas');$(id).removeAttribute('aria-invalid');}catch{$(id).setAttribute('aria-invalid','true');}}}
}
for(const id of ['fg','bg','canvas']){
  $(id).addEventListener('input',update);$(id+'Picker').setAttribute('aria-label',t[id]+' · '+t.picker);
  $(id+'Picker').addEventListener('input',e=>{let alpha='ff';try{alpha=toHex(parseHex($(id).value),true).slice(7);}catch{}$(id).value=e.target.value+(id==='canvas'?'':alpha);update();});
}
$('swap').addEventListener('click',()=>{const fg=$('fg').value;$('fg').value=$('bg').value;$('bg').value=fg;update();});
$('example').addEventListener('click',()=>{$('fg').value='#00000080';$('bg').value='#ffffff80';$('canvas').value='#b8d8ff';update();});
$('target').addEventListener('change',suggestions);
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('css').value);status('copied');}catch{status('copyFail',true);}});
$('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([$(`css`).value],{type:'text/css;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='contrast-palette.css';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('saved');});
update();

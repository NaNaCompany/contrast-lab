export function parseHex(value, opaque=false) {
  const hex=value.trim();
  if(!/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(hex))throw new Error('invalid');
  let h=hex.slice(1);if(h.length<=4)h=[...h].map(c=>c+c).join('');if(h.length===6)h+='ff';
  const rgba=[0,2,4,6].map(i=>parseInt(h.slice(i,i+2),16));
  if(opaque && rgba[3]!==255)throw new Error('opaque');
  return {r:rgba[0],g:rgba[1],b:rgba[2],a:rgba[3]/255};
}
export function over(top,bottom){return {r:top.r*top.a+bottom.r*(1-top.a),g:top.g*top.a+bottom.g*(1-top.a),b:top.b*top.a+bottom.b*(1-top.a),a:1};}
export function luminance(c){const linear=v=>{const s=v/255;return s<=0.04045?s/12.92:((s+0.055)/1.055)**2.4;};return 0.2126*linear(c.r)+0.7152*linear(c.g)+0.0722*linear(c.b);}
export function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
export function toHex(c,alpha=false){const byte=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');return '#'+[c.r,c.g,c.b,...(alpha?[c.a*255]:[])].map(byte).join('');}
export function analyze(fg,bg,canvas){const f=parseHex(fg),b=parseHex(bg),c=parseHex(canvas,true);const resolvedBg=over(b,c),resolvedFg=over(f,resolvedBg);return {foreground:f,background:b,canvas:c,resolvedBg,resolvedFg,ratio:contrast(resolvedFg,resolvedBg)};}
export function verdicts(ratio){return {aaNormal:ratio>=4.5,aaLarge:ratio>=3,aaaNormal:ratio>=7,aaaLarge:ratio>=4.5,nonText:ratio>=3};}
export function candidates(fg,bg,target=4.5){
  if(![3,4.5,7].includes(target))throw new Error('target');
  if(contrast(fg,bg)>=target)return [];
  const result=[];
  for(const endpoint of [0,255]){
    const blend=t=>{const c={r:fg.r+(endpoint-fg.r)*t,g:fg.g+(endpoint-fg.g)*t,b:fg.b+(endpoint-fg.b)*t,a:1};return parseHex(toHex(c));};
    if(contrast(blend(1),bg)<target)continue;
    let lo=0,hi=1;
    for(let n=0;n<30;n++){const mid=(lo+hi)/2;if(contrast(blend(mid),bg)>=target)hi=mid;else lo=mid;}
    const color=blend(hi);const hex=toHex(color);if(!result.some(r=>r.hex===hex))result.push({hex,ratio:contrast(color,bg),direction:endpoint===0?'darker':'lighter'});
  }
  return result;
}

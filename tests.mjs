import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {parseHex,over,luminance,contrast,toHex,analyze,verdicts,candidates} from './dist/core.js';
import {locales} from './dist/locales.js';
let checks=0;const equal=(a,b)=>{assert.deepEqual(a,b);checks++;},near=(a,b,tolerance=1e-10)=>{assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);checks++;};
near(analyze('#000','#fff','#fff').ratio,21);near(analyze('#fff','#fff','#000').ratio,1);
near(luminance(parseHex('#f00')),0.2126);near(luminance(parseHex('#0f0')),0.7152);near(luminance(parseHex('#00f')),0.0722);
near(analyze('#777','#fff','#fff').ratio,4.478089453577214);near(analyze('#767676','#fff','#fff').ratio,4.542224959605253);
near(analyze('#00000080','#fff','#fff').ratio,4.0041069566148515);near(analyze('#000','#ffffff80','#000').ratio,5.317210002277984);
near(luminance({r:10.31475,g:10.31475,b:10.31475}),0.0031308049535603713);
equal(toHex(parseHex('#abcd'),true),'#aabbccdd');equal(toHex(parseHex('#123')),'#112233');
equal(over({r:255,g:0,b:0,a:0.5},{r:0,g:0,b:255,a:1}),{r:127.5,g:0,b:127.5,a:1});
equal(verdicts(4.499999).aaNormal,false);equal(verdicts(4.5).aaNormal,true);equal(verdicts(3).aaLarge,true);equal(verdicts(6.999999).aaaNormal,false);equal(verdicts(7).aaaNormal,true);equal(verdicts(2.999999).nonText,false);
equal(analyze('#0000','#fff','#fff').ratio,1);
for(const bad of ['', '#12','#12345','#gggggg','rgba(0,0,0,.5)','red','123456','#123456789']){assert.throws(()=>parseHex(bad));checks++;}assert.throws(()=>parseHex('#fff8',true));checks++;
for(const target of [3,4.5,7]){const list=candidates(parseHex('#888'),parseHex('#fff'),target);if(target<=3){equal(list.length,0);}else{assert(list.length>0);checks++;for(const c of list){assert(c.ratio>=target);assert(contrast(parseHex(c.hex),parseHex('#fff'))>=target);checks++;}}}
const extremes=candidates(parseHex('#777'),parseHex('#777'),7);equal(extremes.length,0);
for(const [lang,catalog] of Object.entries(locales)){equal(Object.keys(catalog).sort(),Object.keys(locales.ko).sort());assert(Object.values(catalog).every(x=>typeof x==='string'&&x.length));checks++;const path=lang==='ko'?'dist/index.html':`dist/${lang}/index.html`;assert(existsSync(path));checks++;const html=readFileSync(path,'utf8');for(const match of html.matchAll(/data-t="([^"]+)"/g))assert(catalog[match[1]]);assert(html.includes(`lang="${lang}"`));assert(html.includes('noindex,nofollow'));checks++;}
console.log(`PASS ${checks} checks: independent WCAG color fixtures, alpha composition, exact thresholds, opaque suggestions, malformed input, six locale routes/catalogs.`);

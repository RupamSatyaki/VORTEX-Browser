/**
 * color-picker.js — Full-featured Color Picker
 * Features: HEX/RGB/HSL/CMYK/HWB, alpha, palette, harmony, gradient,
 *           history, CSS vars, Tailwind match, color blindness sim,
 *           eyedropper, export, large preview
 */
const ColorPickerTool = {
  id: 'color-picker',
  name: 'Color Picker',
  desc: 'HEX/RGB/HSL/CMYK · Palette · Harmony · Gradient · Tailwind · More',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>`,

  _history: [],
  _alpha: 1,
  _currentHex: '#00c8b4',

  // ── Tailwind palette (subset) ──────────────────────────────────────────────
  _tw: {
    'slate-50':'#f8fafc','slate-100':'#f1f5f9','slate-200':'#e2e8f0','slate-300':'#cbd5e1','slate-400':'#94a3b8','slate-500':'#64748b','slate-600':'#475569','slate-700':'#334155','slate-800':'#1e293b','slate-900':'#0f172a',
    'gray-50':'#f9fafb','gray-100':'#f3f4f6','gray-200':'#e5e7eb','gray-300':'#d1d5db','gray-400':'#9ca3af','gray-500':'#6b7280','gray-600':'#4b5563','gray-700':'#374151','gray-800':'#1f2937','gray-900':'#111827',
    'red-100':'#fee2e2','red-300':'#fca5a5','red-400':'#f87171','red-500':'#ef4444','red-600':'#dc2626','red-700':'#b91c1c','red-900':'#7f1d1d',
    'orange-300':'#fdba74','orange-400':'#fb923c','orange-500':'#f97316','orange-600':'#ea580c',
    'yellow-300':'#fde047','yellow-400':'#facc15','yellow-500':'#eab308','yellow-600':'#ca8a04',
    'green-300':'#86efac','green-400':'#4ade80','green-500':'#22c55e','green-600':'#16a34a','green-700':'#15803d',
    'teal-300':'#5eead4','teal-400':'#2dd4bf','teal-500':'#14b8a6','teal-600':'#0d9488',
    'cyan-300':'#67e8f9','cyan-400':'#22d3ee','cyan-500':'#06b6d4','cyan-600':'#0891b2',
    'blue-300':'#93c5fd','blue-400':'#60a5fa','blue-500':'#3b82f6','blue-600':'#2563eb','blue-700':'#1d4ed8',
    'indigo-400':'#818cf8','indigo-500':'#6366f1','indigo-600':'#4f46e5',
    'violet-400':'#a78bfa','violet-500':'#8b5cf6','violet-600':'#7c3aed',
    'purple-400':'#c084fc','purple-500':'#a855f7','purple-600':'#9333ea',
    'pink-300':'#f9a8d4','pink-400':'#f472b6','pink-500':'#ec4899','pink-600':'#db2777',
    'rose-400':'#fb7185','rose-500':'#f43f5e','rose-600':'#e11d48',
    'white':'#ffffff','black':'#000000',
  },

  render(container) {
    this._history = [];
    this._alpha = 1;
    this._currentHex = '#00c8b4';
    const self = this;

    container.innerHTML = `<div class="cp-wrap">

      <!-- Large preview -->
      <div class="cp-hero" id="cp-hero">
        <div class="cp-hero-hex" id="cp-hero-hex">#00c8b4</div>
        <div class="cp-hero-name" id="cp-hero-name"></div>
      </div>

      <!-- Picker row -->
      <div class="cp-picker-row">
        <input type="color" id="cp-native" value="#00c8b4" class="cp-native-input" title="Click to open color picker"/>
        <div class="cp-fields-grid">
          <div class="cp-field-group"><label>HEX</label><input class="dh-input cp-field" id="cp-hex" type="text" value="#00c8b4" maxlength="7" spellcheck="false"/></div>
          <div class="cp-field-group"><label>R</label><input class="dh-input cp-field cp-num" id="cp-r" type="number" min="0" max="255"/></div>
          <div class="cp-field-group"><label>G</label><input class="dh-input cp-field cp-num" id="cp-g" type="number" min="0" max="255"/></div>
          <div class="cp-field-group"><label>B</label><input class="dh-input cp-field cp-num" id="cp-b" type="number" min="0" max="255"/></div>
          <div class="cp-field-group"><label>H</label><input class="dh-input cp-field cp-num" id="cp-h" type="number" min="0" max="360"/></div>
          <div class="cp-field-group"><label>S%</label><input class="dh-input cp-field cp-num" id="cp-s" type="number" min="0" max="100"/></div>
          <div class="cp-field-group"><label>L%</label><input class="dh-input cp-field cp-num" id="cp-l" type="number" min="0" max="100"/></div>
          <div class="cp-field-group"><label>A</label><input class="dh-input cp-field cp-num" id="cp-a" type="number" min="0" max="100" value="100"/></div>
        </div>
      </div>

      <!-- Alpha slider -->
      <div class="cp-alpha-row">
        <label class="cp-alpha-label">Opacity</label>
        <div class="cp-alpha-track">
          <div class="cp-alpha-checker"></div>
          <div class="cp-alpha-gradient" id="cp-alpha-gradient"></div>
          <input type="range" id="cp-alpha-slider" min="0" max="100" value="100" class="cp-slider"/>
        </div>
        <span class="cp-alpha-val" id="cp-alpha-val">100%</span>
      </div>

      <!-- Tabs -->
      <div class="cp-tabs">
        <button class="cp-tab active" data-tab="contrast">Contrast</button>
        <button class="cp-tab" data-tab="palette">Palette</button>
        <button class="cp-tab" data-tab="harmony">Harmony</button>
        <button class="cp-tab" data-tab="gradient">Gradient</button>
        <button class="cp-tab" data-tab="blindness">Blindness</button>
        <button class="cp-tab" data-tab="css">CSS / TW</button>
      </div>

      <!-- Contrast tab -->
      <div class="cp-tab-content" id="cp-tab-contrast">
        <div class="cp-contrast-row">
          <div class="cp-contrast-box" id="cp-vs-white"><span>Aa</span><span class="cp-cr-badge" id="cp-cw-badge"></span></div>
          <div class="cp-contrast-box" id="cp-vs-black"><span>Aa</span><span class="cp-cr-badge" id="cp-cb-badge"></span></div>
        </div>
        <div class="cp-wcag-row" id="cp-wcag"></div>
      </div>

      <!-- Palette tab -->
      <div class="cp-tab-content" id="cp-tab-palette" style="display:none">
        <div class="cp-palette-label">Shades</div>
        <div class="cp-swatch-row" id="cp-shades"></div>
        <div class="cp-palette-label" style="margin-top:8px">Tints</div>
        <div class="cp-swatch-row" id="cp-tints"></div>
        <div class="cp-palette-label" style="margin-top:8px">Tones</div>
        <div class="cp-swatch-row" id="cp-tones"></div>
      </div>

      <!-- Harmony tab -->
      <div class="cp-tab-content" id="cp-tab-harmony" style="display:none">
        <div id="cp-harmony-grid"></div>
      </div>

      <!-- Gradient tab -->
      <div class="cp-tab-content" id="cp-tab-gradient" style="display:none">
        <div class="cp-grad-controls">
          <div class="cp-field-group"><label>Color B</label><input type="color" id="cp-grad-b" value="#1a6a6a" class="cp-native-input" style="width:36px;height:36px;"/></div>
          <div class="cp-field-group"><label>Angle</label><input class="dh-input cp-field cp-num" id="cp-grad-angle" type="number" min="0" max="360" value="135"/></div>
          <select class="dh-input" id="cp-grad-type" style="font-size:11.5px;padding:5px 8px;">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="conic">Conic</option>
          </select>
        </div>
        <div class="cp-grad-preview" id="cp-grad-preview"></div>
        <div class="cp-grad-code" id="cp-grad-code"></div>
        <button class="dh-btn" id="cp-grad-copy" style="margin-top:6px">Copy CSS</button>
      </div>

      <!-- Color Blindness tab -->
      <div class="cp-tab-content" id="cp-tab-blindness" style="display:none">
        <div class="cp-blind-grid" id="cp-blind-grid"></div>
      </div>

      <!-- CSS / Tailwind tab -->
      <div class="cp-tab-content" id="cp-tab-css" style="display:none">
        <div class="cp-css-out" id="cp-css-out"></div>
        <div class="cp-tw-match" id="cp-tw-match"></div>
        <button class="dh-btn" id="cp-css-copy" style="margin-top:6px">Copy CSS Vars</button>
        <button class="dh-btn" id="cp-export-btn" style="margin-top:6px">Export Palette JSON</button>
      </div>

      <!-- Actions -->
      <div class="cp-actions">
        <button class="dh-btn" id="cp-copy-hex">HEX</button>
        <button class="dh-btn" id="cp-copy-rgb">RGB</button>
        <button class="dh-btn" id="cp-copy-hsl">HSL</button>
        <button class="dh-btn" id="cp-copy-rgba">RGBA</button>
        <button class="dh-btn" id="cp-copy-cmyk">CMYK</button>
        <button class="dh-btn" id="cp-copy-hwb">HWB</button>
        <button class="dh-btn" id="cp-eyedropper" title="Pick color from screen">💉 Pick</button>
        <span class="dh-status" id="cp-status"></span>
      </div>

      <!-- History -->
      <div class="cp-history-wrap" id="cp-history-wrap" style="display:none">
        <div class="cp-palette-label">Recent</div>
        <div class="cp-swatch-row" id="cp-history"></div>
      </div>

    </div>`;

    const $ = id => container.querySelector('#' + id);

    // ── Color math ─────────────────────────────────────────────────────────────
    function hexToRgb(hex) {
      return { r:parseInt(hex.slice(1,3),16), g:parseInt(hex.slice(3,5),16), b:parseInt(hex.slice(5,7),16) };
    }
    function rgbToHex(r,g,b) {
      return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
    }
    function rgbToHsl(r,g,b) {
      r/=255; g/=255; b/=255;
      const max=Math.max(r,g,b), min=Math.min(r,g,b);
      let h,s,l=(max+min)/2;
      if(max===min){h=s=0;}else{
        const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
        switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}
        h/=6;
      }
      return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
    }
    function hslToRgb(h,s,l) {
      s/=100; l/=100;
      const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l);
      const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
      return {r:Math.round(f(0)*255),g:Math.round(f(8)*255),b:Math.round(f(4)*255)};
    }
    function rgbToCmyk(r,g,b) {
      r/=255; g/=255; b/=255;
      const k=1-Math.max(r,g,b);
      if(k===1) return {c:0,m:0,y:0,k:100};
      return {c:Math.round((1-r-k)/(1-k)*100),m:Math.round((1-g-k)/(1-k)*100),y:Math.round((1-b-k)/(1-k)*100),k:Math.round(k*100)};
    }
    function rgbToHwb(r,g,b) {
      const {h} = rgbToHsl(r,g,b);
      const w=Math.round(Math.min(r,g,b)/255*100), bl=Math.round((1-Math.max(r,g,b)/255)*100);
      return {h,w,b:bl};
    }
    function luminance(r,g,b) {
      return [r,g,b].reduce((s,v,i)=>{v/=255;return s+[0.2126,0.7152,0.0722][i]*(v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));},0);
    }
    function contrastRatio(l1,l2) {
      const [a,b]=[Math.max(l1,l2),Math.min(l1,l2)];
      return +((a+0.05)/(b+0.05)).toFixed(2);
    }
    function hslToHex(h,s,l) { const {r,g,b}=hslToRgb(h,s,l); return rgbToHex(r,g,b); }

    // ── Color blindness simulation ─────────────────────────────────────────────
    function simulateBlindness(r,g,b,type) {
      const m = {
        protanopia:   [[0.567,0.433,0],[0.558,0.442,0],[0,0.242,0.758]],
        deuteranopia: [[0.625,0.375,0],[0.7,0.3,0],[0,0.3,0.7]],
        tritanopia:   [[0.95,0.05,0],[0,0.433,0.567],[0,0.475,0.525]],
        achromatopsia:[[0.299,0.587,0.114],[0.299,0.587,0.114],[0.299,0.587,0.114]],
      }[type];
      if(!m) return {r,g,b};
      return {
        r:Math.round(m[0][0]*r+m[0][1]*g+m[0][2]*b),
        g:Math.round(m[1][0]*r+m[1][1]*g+m[1][2]*b),
        b:Math.round(m[2][0]*r+m[2][1]*g+m[2][2]*b),
      };
    }

    // ── Tailwind closest match ─────────────────────────────────────────────────
    function closestTailwind(hex) {
      const {r:tr,g:tg,b:tb} = hexToRgb(hex);
      let best='', bestDist=Infinity;
      Object.entries(self._tw).forEach(([name,h]) => {
        const {r,g,b}=hexToRgb(h);
        const d=(tr-r)**2+(tg-g)**2+(tb-b)**2;
        if(d<bestDist){bestDist=d;best=name;}
      });
      return {name:best,hex:self._tw[best],dist:Math.round(Math.sqrt(bestDist))};
    }

    // ── Status helper ──────────────────────────────────────────────────────────
    function setStatus(msg,ok) {
      const el=$('cp-status'); el.textContent=msg; el.style.color=ok?'#22c55e':'#ef4444';
      setTimeout(()=>{if(el.textContent===msg)el.textContent='';},1500);
    }
    function copied(val) { navigator.clipboard.writeText(val); setStatus('Copied!',true); }

    // ── Swatch helper ──────────────────────────────────────────────────────────
    function makeSwatch(hex, title='') {
      const s=document.createElement('div');
      s.className='cp-swatch-item'; s.style.background=hex; s.title=title||hex;
      s.addEventListener('click',()=>update(hex));
      return s;
    }

    // ── Main update ────────────────────────────────────────────────────────────
    function update(hex, skipHistory=false) {
      if(!/^#[0-9a-f]{6}$/i.test(hex)) return;
      hex = hex.toLowerCase();
      self._currentHex = hex;
      const {r,g,b} = hexToRgb(hex);
      const {h,s,l}  = rgbToHsl(r,g,b);
      const a = self._alpha;

      // Hero
      $('cp-hero').style.background = hex;
      $('cp-hero-hex').textContent = hex.toUpperCase();
      const tw = closestTailwind(hex);
      $('cp-hero-name').textContent = tw.dist < 20 ? tw.name : '';

      // Fields
      $('cp-native').value = hex;
      $('cp-hex').value = hex;
      $('cp-r').value=r; $('cp-g').value=g; $('cp-b').value=b;
      $('cp-h').value=h; $('cp-s').value=s; $('cp-l').value=l;
      $('cp-a').value=Math.round(a*100);

      // Alpha gradient
      $('cp-alpha-gradient').style.background = `linear-gradient(to right, transparent, ${hex})`;

      // Hero text color (auto contrast)
      const lum = luminance(r,g,b);
      $('cp-hero-hex').style.color = lum>0.4?'rgba(0,0,0,0.7)':'rgba(255,255,255,0.9)';
      $('cp-hero-name').style.color = lum>0.4?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)';

      // History
      if(!skipHistory && (self._history.length===0 || self._history[0]!==hex)) {
        self._history.unshift(hex);
        if(self._history.length>12) self._history.pop();
        renderHistory();
      }

      // Active tab refresh
      const activeTab = container.querySelector('.cp-tab.active')?.dataset.tab;
      if(activeTab==='contrast')  renderContrast(r,g,b);
      if(activeTab==='palette')   renderPalette(h,s,l);
      if(activeTab==='harmony')   renderHarmony(h,s,l);
      if(activeTab==='gradient')  renderGradient();
      if(activeTab==='blindness') renderBlindness(r,g,b);
      if(activeTab==='css')       renderCSS(r,g,b,h,s,l);
    }

    // ── Contrast ───────────────────────────────────────────────────────────────
    function renderContrast(r,g,b) {
      const lum=luminance(r,g,b), hex=self._currentHex;
      const cw=contrastRatio(lum,1), cb=contrastRatio(lum,0);
      const vw=$('cp-vs-white'), vb=$('cp-vs-black');
      vw.style.background=hex; vw.style.color='#fff';
      vb.style.background=hex; vb.style.color='#000';
      $('cp-cw-badge').textContent=cw+':1';
      $('cp-cb-badge').textContent=cb+':1';
      $('cp-wcag').innerHTML = [
        ['AA Normal (4.5:1)',  cw>=4.5, cb>=4.5],
        ['AA Large (3:1)',     cw>=3,   cb>=3],
        ['AAA Normal (7:1)',   cw>=7,   cb>=7],
        ['AAA Large (4.5:1)', cw>=4.5, cb>=4.5],
      ].map(([label,w,b])=>`
        <div class="cp-wcag-row-item">
          <span class="cp-wcag-label">${label}</span>
          <span class="cp-wcag-badge ${w?'pass':'fail'}">vs White ${w?'✓':'✗'}</span>
          <span class="cp-wcag-badge ${b?'pass':'fail'}">vs Black ${b?'✓':'✗'}</span>
        </div>`).join('');
    }

    // ── Palette ────────────────────────────────────────────────────────────────
    function renderPalette(h,s,l) {
      const shades=$('cp-shades'), tints=$('cp-tints'), tones=$('cp-tones');
      shades.innerHTML=''; tints.innerHTML=''; tones.innerHTML='';
      // Shades: darken
      [90,75,60,45,30,15,5].forEach(lv => shades.appendChild(makeSwatch(hslToHex(h,s,lv),`L:${lv}%`)));
      // Tints: desaturate toward white
      [95,85,75,65,55,45,35].forEach(lv => tints.appendChild(makeSwatch(hslToHex(h,Math.round(s*0.6),lv),`L:${lv}%`)));
      // Tones: desaturate
      [100,80,60,40,20,10,5].forEach(sv => tones.appendChild(makeSwatch(hslToHex(h,sv,l),`S:${sv}%`)));
    }

    // ── Harmony ────────────────────────────────────────────────────────────────
    function renderHarmony(h,s,l) {
      const grid=$('cp-harmony-grid'); grid.innerHTML='';
      const groups = [
        { label:'Complementary',       colors:[(h+180)%360].map(hv=>hslToHex(hv,s,l)) },
        { label:'Split-Complementary', colors:[(h+150)%360,(h+210)%360].map(hv=>hslToHex(hv,s,l)) },
        { label:'Triadic',             colors:[(h+120)%360,(h+240)%360].map(hv=>hslToHex(hv,s,l)) },
        { label:'Analogous',           colors:[(h+30)%360,(h-30+360)%360].map(hv=>hslToHex(hv,s,l)) },
        { label:'Tetradic',            colors:[(h+90)%360,(h+180)%360,(h+270)%360].map(hv=>hslToHex(hv,s,l)) },
        { label:'Square',              colors:[(h+90)%360,(h+180)%360,(h+270)%360].map(hv=>hslToHex(hv,s,l)) },
      ];
      groups.forEach(({label,colors}) => {
        const row=document.createElement('div'); row.className='cp-harmony-row';
        const lbl=document.createElement('div'); lbl.className='cp-harmony-label'; lbl.textContent=label;
        const swatches=document.createElement('div'); swatches.className='cp-swatch-row';
        swatches.appendChild(makeSwatch(self._currentHex,'Base'));
        colors.forEach(c=>swatches.appendChild(makeSwatch(c)));
        row.appendChild(lbl); row.appendChild(swatches);
        grid.appendChild(row);
      });
    }

    // ── Gradient ───────────────────────────────────────────────────────────────
    function renderGradient() {
      const a=self._currentHex, b=$('cp-grad-b').value;
      const angle=$('cp-grad-angle').value, type=$('cp-grad-type').value;
      let css;
      if(type==='radial') css=`radial-gradient(circle, ${a}, ${b})`;
      else if(type==='conic') css=`conic-gradient(from ${angle}deg, ${a}, ${b}, ${a})`;
      else css=`linear-gradient(${angle}deg, ${a}, ${b})`;
      $('cp-grad-preview').style.background=css;
      $('cp-grad-code').textContent=`background: ${css};`;
    }

    // ── Color Blindness ────────────────────────────────────────────────────────
    function renderBlindness(r,g,b) {
      const grid=$('cp-blind-grid'); grid.innerHTML='';
      [
        {type:'normal',       label:'Normal'},
        {type:'protanopia',   label:'Protanopia\n(red-blind)'},
        {type:'deuteranopia', label:'Deuteranopia\n(green-blind)'},
        {type:'tritanopia',   label:'Tritanopia\n(blue-blind)'},
        {type:'achromatopsia',label:'Achromatopsia\n(no color)'},
      ].forEach(({type,label}) => {
        const sim = type==='normal' ? {r,g,b} : simulateBlindness(r,g,b,type);
        const hex = rgbToHex(sim.r,sim.g,sim.b);
        const div=document.createElement('div'); div.className='cp-blind-item';
        div.innerHTML=`<div class="cp-blind-swatch" style="background:${hex}"></div>
          <div class="cp-blind-label">${label.replace('\n','<br>')}</div>
          <div class="cp-blind-hex">${hex}</div>`;
        div.querySelector('.cp-blind-swatch').addEventListener('click',()=>update(hex));
        grid.appendChild(div);
      });
    }

    // ── CSS / Tailwind ─────────────────────────────────────────────────────────
    function renderCSS(r,g,b,h,s,l) {
      const a=self._alpha, hex=self._currentHex;
      const {c,m,y,k}=rgbToCmyk(r,g,b);
      const {h:hw,w,b:bk}=rgbToHwb(r,g,b);
      const cssVars=`--color: ${hex};\n--color-rgb: ${r}, ${g}, ${b};\n--color-hsl: ${h}, ${s}%, ${l}%;\n--color-rgba: rgba(${r}, ${g}, ${b}, ${a});\n--color-cmyk: cmyk(${c}%, ${m}%, ${y}%, ${k}%);\n--color-hwb: hwb(${hw} ${w}% ${bk}%);`;
      $('cp-css-out').textContent = cssVars;
      const tw=closestTailwind(hex);
      $('cp-tw-match').innerHTML=`<div class="cp-tw-row">
        <div class="cp-tw-swatch" style="background:${tw.hex}"></div>
        <div>
          <div class="cp-tw-name">${tw.name}</div>
          <div class="cp-tw-dist">Δ ${tw.dist} · <code>${tw.hex}</code></div>
        </div>
        <button class="dh-btn cp-tw-copy" data-val="${tw.name}">Copy class</button>
      </div>`;
      container.querySelector('.cp-tw-copy').addEventListener('click',e=>copied(e.target.dataset.val));
    }

    // ── History ────────────────────────────────────────────────────────────────
    function renderHistory() {
      const wrap=$('cp-history-wrap'), row=$('cp-history');
      if(!self._history.length){wrap.style.display='none';return;}
      wrap.style.display='';
      row.innerHTML='';
      self._history.forEach(h=>row.appendChild(makeSwatch(h)));
    }

    // ── Tab switching ──────────────────────────────────────────────────────────
    container.querySelectorAll('.cp-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.cp-tab').forEach(t=>t.classList.remove('active'));
        container.querySelectorAll('.cp-tab-content').forEach(c=>c.style.display='none');
        tab.classList.add('active');
        $('cp-tab-'+tab.dataset.tab).style.display='';
        const {r,g,b}=hexToRgb(self._currentHex);
        const {h,s,l}=rgbToHsl(r,g,b);
        if(tab.dataset.tab==='contrast')  renderContrast(r,g,b);
        if(tab.dataset.tab==='palette')   renderPalette(h,s,l);
        if(tab.dataset.tab==='harmony')   renderHarmony(h,s,l);
        if(tab.dataset.tab==='gradient')  renderGradient();
        if(tab.dataset.tab==='blindness') renderBlindness(r,g,b);
        if(tab.dataset.tab==='css')       renderCSS(r,g,b,h,s,l);
      });
    });

    // ── Events ─────────────────────────────────────────────────────────────────
    $('cp-native').addEventListener('input', e=>update(e.target.value));
    $('cp-hex').addEventListener('change', e=>update(e.target.value));
    ['r','g','b'].forEach(c=>$('cp-'+c).addEventListener('change',()=>{
      update(rgbToHex(+$('cp-r').value,+$('cp-g').value,+$('cp-b').value));
    }));
    ['h','s','l'].forEach(c=>$('cp-'+c).addEventListener('change',()=>{
      const {r,g,b}=hslToRgb(+$('cp-h').value,+$('cp-s').value,+$('cp-l').value);
      update(rgbToHex(r,g,b));
    }));
    $('cp-a').addEventListener('change',()=>{
      self._alpha=Math.max(0,Math.min(100,+$('cp-a').value))/100;
      $('cp-alpha-slider').value=Math.round(self._alpha*100);
      $('cp-alpha-val').textContent=Math.round(self._alpha*100)+'%';
    });
    $('cp-alpha-slider').addEventListener('input',e=>{
      self._alpha=+e.target.value/100;
      $('cp-a').value=e.target.value;
      $('cp-alpha-val').textContent=e.target.value+'%';
    });

    // Gradient controls
    $('cp-grad-b').addEventListener('input',renderGradient);
    $('cp-grad-angle').addEventListener('input',renderGradient);
    $('cp-grad-type').addEventListener('change',renderGradient);
    $('cp-grad-copy').addEventListener('click',()=>copied($('cp-grad-code').textContent.replace('background: ','')));

    // Copy buttons
    $('cp-copy-hex').addEventListener('click',()=>copied(self._currentHex));
    $('cp-copy-rgb').addEventListener('click',()=>{const{r,g,b}=hexToRgb(self._currentHex);copied(`rgb(${r},${g},${b})`);});
    $('cp-copy-hsl').addEventListener('click',()=>{const{r,g,b}=hexToRgb(self._currentHex);const{h,s,l}=rgbToHsl(r,g,b);copied(`hsl(${h},${s}%,${l}%)`);});
    $('cp-copy-rgba').addEventListener('click',()=>{const{r,g,b}=hexToRgb(self._currentHex);copied(`rgba(${r},${g},${b},${self._alpha})`);});
    $('cp-copy-cmyk').addEventListener('click',()=>{const{r,g,b}=hexToRgb(self._currentHex);const{c,m,y,k}=rgbToCmyk(r,g,b);copied(`cmyk(${c}%,${m}%,${y}%,${k}%)`);});
    $('cp-copy-hwb').addEventListener('click',()=>{const{r,g,b}=hexToRgb(self._currentHex);const{h,w,b:bk}=rgbToHwb(r,g,b);copied(`hwb(${h} ${w}% ${bk}%)`);});
    $('cp-css-copy').addEventListener('click',()=>copied($('cp-css-out').textContent));
    $('cp-export-btn').addEventListener('click',()=>{
      const data={current:self._currentHex,history:self._history};
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='palette.json'; a.click();
      setStatus('Exported!',true);
    });

    // Eyedropper
    $('cp-eyedropper').addEventListener('click',async()=>{
      if(!window.EyeDropper){setStatus('Not supported in this context',false);return;}
      try { const r=await new EyeDropper().open(); update(r.sRGBHex); } catch{}
    });

    // Init
    update('#00c8b4', true);
    renderContrast(...Object.values(hexToRgb('#00c8b4')));
  }
};

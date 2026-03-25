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
        <button class="cp-tab active" data-tab="canvas">Canvas</button>
        <button class="cp-tab" data-tab="contrast">Contrast</button>
        <button class="cp-tab" data-tab="palette">Palette</button>
        <button class="cp-tab" data-tab="harmony">Harmony</button>
        <button class="cp-tab" data-tab="gradient">Gradient</button>
        <button class="cp-tab" data-tab="mixer">Mixer</button>
        <button class="cp-tab" data-tab="named">Named</button>
        <button class="cp-tab" data-tab="image">Image</button>
        <button class="cp-tab" data-tab="saved">Saved</button>
        <button class="cp-tab" data-tab="blindness">Blindness</button>
        <button class="cp-tab" data-tab="css">CSS/TW</button>
      </div>

      <!-- Canvas tab -->
      <div class="cp-tab-content" id="cp-tab-canvas">
        <div class="cp-canvas-wrap">
          <canvas id="cp-canvas" width="300" height="160" class="cp-canvas"></canvas>
          <div class="cp-hue-wrap">
            <canvas id="cp-hue-bar" width="300" height="16" class="cp-hue-bar"></canvas>
          </div>
        </div>
      </div>

      <!-- Contrast tab -->
      <div class="cp-tab-content" id="cp-tab-contrast" style="display:none">
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

      <!-- Mixer tab -->
      <div class="cp-tab-content" id="cp-tab-mixer" style="display:none">
        <div class="cp-mixer-row">
          <div class="cp-mixer-col">
            <div class="cp-palette-label">Color A</div>
            <input type="color" id="cp-mix-a" value="#00c8b4" class="cp-native-input" style="width:48px;height:48px;"/>
          </div>
          <div class="cp-mixer-col">
            <div class="cp-palette-label">Color B</div>
            <input type="color" id="cp-mix-b" value="#1a3838" class="cp-native-input" style="width:48px;height:48px;"/>
          </div>
        </div>
        <div class="cp-palette-label" style="margin-top:8px">Ratio (A → B)</div>
        <input type="range" id="cp-mix-ratio" min="0" max="100" value="50" class="cp-mix-slider"/>
        <div class="cp-mix-preview-row" id="cp-mix-preview-row"></div>
        <div class="cp-mix-steps-row" id="cp-mix-steps"></div>
      </div>

      <!-- Named Colors tab -->
      <div class="cp-tab-content" id="cp-tab-named" style="display:none">
        <input class="dh-input" id="cp-named-search" type="text" placeholder="Search CSS named colors…" style="width:100%;margin-bottom:8px;" spellcheck="false"/>
        <div class="cp-named-grid" id="cp-named-grid"></div>
      </div>

      <!-- Image Colors tab -->
      <div class="cp-tab-content" id="cp-tab-image" style="display:none">
        <div class="cp-img-drop" id="cp-img-drop">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2e6060" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <div>Drop image or <label style="color:#00c8b4;cursor:pointer"><input type="file" id="cp-img-file" accept="image/*" style="display:none"/>click to upload</label></div>
        </div>
        <div id="cp-img-result" style="display:none">
          <img id="cp-img-preview" style="max-width:100%;max-height:80px;border-radius:8px;border:1px solid #1e3838;margin-bottom:8px;"/>
          <div class="cp-palette-label">Dominant Colors</div>
          <div class="cp-swatch-row" id="cp-img-colors"></div>
        </div>
      </div>

      <!-- Saved Palettes tab -->
      <div class="cp-tab-content" id="cp-tab-saved" style="display:none">
        <div class="cp-saved-add-row">
          <input class="dh-input" id="cp-saved-name" type="text" placeholder="Palette name…" style="flex:1;" maxlength="30"/>
          <button class="dh-btn primary" id="cp-saved-add">+ Save Current</button>
        </div>
        <div id="cp-saved-list"></div>
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
      if(activeTab==='canvas')    renderCanvas(h,s,l);
      if(activeTab==='contrast')  renderContrast(r,g,b);
      if(activeTab==='palette')   renderPalette(h,s,l);
      if(activeTab==='harmony')   renderHarmony(h,s,l);
      if(activeTab==='gradient')  renderGradient();
      if(activeTab==='mixer')     renderMixer();
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

    // ── Canvas (2D SL picker + Hue bar) ───────────────────────────────────────
    function renderCanvas(h,s,l) {
      const cv=$('cp-canvas'), ctx=cv.getContext('2d');
      const W=cv.width, H=cv.height;
      // SL gradient: white→hue horizontal, white→black vertical
      const gradH=ctx.createLinearGradient(0,0,W,0);
      gradH.addColorStop(0,'#fff');
      gradH.addColorStop(1,`hsl(${h},100%,50%)`);
      ctx.fillStyle=gradH; ctx.fillRect(0,0,W,H);
      const gradV=ctx.createLinearGradient(0,0,0,H);
      gradV.addColorStop(0,'rgba(0,0,0,0)');
      gradV.addColorStop(1,'#000');
      ctx.fillStyle=gradV; ctx.fillRect(0,0,W,H);
      // Draw cursor
      const cx=Math.round(s/100*W), cy=Math.round((1-l/100)*H);
      ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2);
      ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2);
      ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=1; ctx.stroke();

      // Hue bar
      const hcv=$('cp-hue-bar'), hctx=hcv.getContext('2d');
      const hg=hctx.createLinearGradient(0,0,hcv.width,0);
      for(let i=0;i<=360;i+=30) hg.addColorStop(i/360,`hsl(${i},100%,50%)`);
      hctx.fillStyle=hg; hctx.fillRect(0,0,hcv.width,hcv.height);
      // Hue cursor
      const hx=Math.round(h/360*hcv.width);
      hctx.beginPath(); hctx.arc(hx,hcv.height/2,6,0,Math.PI*2);
      hctx.strokeStyle='#fff'; hctx.lineWidth=2; hctx.stroke();
    }

    function _canvasClick(e) {
      const cv=$('cp-canvas'), rect=cv.getBoundingClientRect();
      const x=e.clientX-rect.left, y=e.clientY-rect.top;
      const s=Math.round(Math.max(0,Math.min(1,x/cv.offsetWidth))*100);
      const l=Math.round(Math.max(0,Math.min(1,1-y/cv.offsetHeight))*100);
      const {h}=rgbToHsl(...Object.values(hexToRgb(self._currentHex)));
      const {r,g,b}=hslToRgb(h,s,l);
      update(rgbToHex(r,g,b));
    }
    function _hueClick(e) {
      const hcv=$('cp-hue-bar'), rect=hcv.getBoundingClientRect();
      const x=e.clientX-rect.left;
      const h=Math.round(Math.max(0,Math.min(1,x/hcv.offsetWidth))*360);
      const {r:cr,g:cg,b:cb}=hexToRgb(self._currentHex);
      const {s,l}=rgbToHsl(cr,cg,cb);
      const {r,g,b}=hslToRgb(h,s,l);
      update(rgbToHex(r,g,b));
    }

    // ── Mixer ──────────────────────────────────────────────────────────────────
    function renderMixer() {
      const aHex=$('cp-mix-a').value, bHex=$('cp-mix-b').value;
      const ratio=+$('cp-mix-ratio').value/100;
      const a=hexToRgb(aHex), b=hexToRgb(bHex);
      const mix=(t)=>rgbToHex(
        Math.round(a.r+(b.r-a.r)*t),
        Math.round(a.g+(b.g-a.g)*t),
        Math.round(a.b+(b.b-a.b)*t)
      );
      const mixedHex=mix(ratio);
      const prev=$('cp-mix-preview-row');
      prev.innerHTML=`
        <div class="cp-mix-result" style="background:${mixedHex}" title="${mixedHex}">
          <span style="color:${luminance(...Object.values(hexToRgb(mixedHex)))>0.4?'#000':'#fff'};font-size:11px;font-family:monospace">${mixedHex}</span>
        </div>`;
      prev.querySelector('.cp-mix-result').addEventListener('click',()=>update(mixedHex));
      // 7-step gradient
      const steps=$('cp-mix-steps'); steps.innerHTML='';
      for(let i=0;i<=6;i++) steps.appendChild(makeSwatch(mix(i/6),`${Math.round(i/6*100)}%`));
    }

    // ── Named Colors ───────────────────────────────────────────────────────────
    const CSS_NAMED = {
      aliceblue:'#f0f8ff',antiquewhite:'#faebd7',aqua:'#00ffff',aquamarine:'#7fffd4',azure:'#f0ffff',
      beige:'#f5f5dc',bisque:'#ffe4c4',black:'#000000',blanchedalmond:'#ffebcd',blue:'#0000ff',
      blueviolet:'#8a2be2',brown:'#a52a2a',burlywood:'#deb887',cadetblue:'#5f9ea0',chartreuse:'#7fff00',
      chocolate:'#d2691e',coral:'#ff7f50',cornflowerblue:'#6495ed',cornsilk:'#fff8dc',crimson:'#dc143c',
      cyan:'#00ffff',darkblue:'#00008b',darkcyan:'#008b8b',darkgoldenrod:'#b8860b',darkgray:'#a9a9a9',
      darkgreen:'#006400',darkkhaki:'#bdb76b',darkmagenta:'#8b008b',darkolivegreen:'#556b2f',
      darkorange:'#ff8c00',darkorchid:'#9932cc',darkred:'#8b0000',darksalmon:'#e9967a',
      darkseagreen:'#8fbc8f',darkslateblue:'#483d8b',darkslategray:'#2f4f4f',darkturquoise:'#00ced1',
      darkviolet:'#9400d3',deeppink:'#ff1493',deepskyblue:'#00bfff',dimgray:'#696969',
      dodgerblue:'#1e90ff',firebrick:'#b22222',floralwhite:'#fffaf0',forestgreen:'#228b22',
      fuchsia:'#ff00ff',gainsboro:'#dcdcdc',ghostwhite:'#f8f8ff',gold:'#ffd700',goldenrod:'#daa520',
      gray:'#808080',green:'#008000',greenyellow:'#adff2f',honeydew:'#f0fff0',hotpink:'#ff69b4',
      indianred:'#cd5c5c',indigo:'#4b0082',ivory:'#fffff0',khaki:'#f0e68c',lavender:'#e6e6fa',
      lavenderblush:'#fff0f5',lawngreen:'#7cfc00',lemonchiffon:'#fffacd',lightblue:'#add8e6',
      lightcoral:'#f08080',lightcyan:'#e0ffff',lightgoldenrodyellow:'#fafad2',lightgray:'#d3d3d3',
      lightgreen:'#90ee90',lightpink:'#ffb6c1',lightsalmon:'#ffa07a',lightseagreen:'#20b2aa',
      lightskyblue:'#87cefa',lightslategray:'#778899',lightsteelblue:'#b0c4de',lightyellow:'#ffffe0',
      lime:'#00ff00',limegreen:'#32cd32',linen:'#faf0e6',magenta:'#ff00ff',maroon:'#800000',
      mediumaquamarine:'#66cdaa',mediumblue:'#0000cd',mediumorchid:'#ba55d3',mediumpurple:'#9370db',
      mediumseagreen:'#3cb371',mediumslateblue:'#7b68ee',mediumspringgreen:'#00fa9a',
      mediumturquoise:'#48d1cc',mediumvioletred:'#c71585',midnightblue:'#191970',mintcream:'#f5fffa',
      mistyrose:'#ffe4e1',moccasin:'#ffe4b5',navajowhite:'#ffdead',navy:'#000080',oldlace:'#fdf5e6',
      olive:'#808000',olivedrab:'#6b8e23',orange:'#ffa500',orangered:'#ff4500',orchid:'#da70d6',
      palegoldenrod:'#eee8aa',palegreen:'#98fb98',paleturquoise:'#afeeee',palevioletred:'#db7093',
      papayawhip:'#ffefd5',peachpuff:'#ffdab9',peru:'#cd853f',pink:'#ffc0cb',plum:'#dda0dd',
      powderblue:'#b0e0e6',purple:'#800080',red:'#ff0000',rosybrown:'#bc8f8f',royalblue:'#4169e1',
      saddlebrown:'#8b4513',salmon:'#fa8072',sandybrown:'#f4a460',seagreen:'#2e8b57',seashell:'#fff5ee',
      sienna:'#a0522d',silver:'#c0c0c0',skyblue:'#87ceeb',slateblue:'#6a5acd',slategray:'#708090',
      snow:'#fffafa',springgreen:'#00ff7f',steelblue:'#4682b4',tan:'#d2b48c',teal:'#008080',
      thistle:'#d8bfd8',tomato:'#ff6347',turquoise:'#40e0d0',violet:'#ee82ee',wheat:'#f5deb3',
      white:'#ffffff',whitesmoke:'#f5f5f5',yellow:'#ffff00',yellowgreen:'#9acd32',
    };

    function renderNamed(q) {
      const grid=$('cp-named-grid'); grid.innerHTML='';
      const entries=Object.entries(CSS_NAMED).filter(([n])=>!q||n.includes(q.toLowerCase()));
      entries.forEach(([name,hex])=>{
        const item=document.createElement('div'); item.className='cp-named-item';
        item.title=`${name} · ${hex}`;
        item.innerHTML=`<div class="cp-named-swatch" style="background:${hex}"></div><div class="cp-named-label">${name}</div>`;
        item.addEventListener('click',()=>update(hex));
        grid.appendChild(item);
      });
    }

    // ── Image Color Extraction ─────────────────────────────────────────────────
    function extractColors(img, n=8) {
      const cv=document.createElement('canvas');
      const scale=Math.min(1,80/Math.max(img.width,img.height));
      cv.width=Math.round(img.width*scale); cv.height=Math.round(img.height*scale);
      const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0,cv.width,cv.height);
      const data=ctx.getImageData(0,0,cv.width,cv.height).data;
      // Simple quantize: bucket by 32
      const buckets={};
      for(let i=0;i<data.length;i+=4) {
        if(data[i+3]<128) continue;
        const r=Math.round(data[i]/32)*32, g=Math.round(data[i+1]/32)*32, b=Math.round(data[i+2]/32)*32;
        const k=`${r},${g},${b}`; buckets[k]=(buckets[k]||0)+1;
      }
      return Object.entries(buckets).sort((a,b)=>b[1]-a[1]).slice(0,n)
        .map(([k])=>{ const [r,g,b]=k.split(',').map(Number); return rgbToHex(r,g,b); });
    }

    // ── Saved Palettes ─────────────────────────────────────────────────────────
    function loadSaved() { try { return JSON.parse(localStorage.getItem('vx_cp_palettes')||'[]'); } catch{return[];} }
    function saveSaved(d) { localStorage.setItem('vx_cp_palettes',JSON.stringify(d)); }

    function renderSaved() {
      const list=$('cp-saved-list'); list.innerHTML='';
      const palettes=loadSaved();
      if(!palettes.length){list.innerHTML='<div style="font-size:11px;color:#4a8080;padding:8px 0">No saved palettes yet</div>';return;}
      palettes.forEach((p,idx)=>{
        const row=document.createElement('div'); row.className='cp-saved-row';
        const swatches=p.colors.map(c=>`<div class="cp-swatch-item" style="background:${c};width:22px;height:22px;" title="${c}"></div>`).join('');
        row.innerHTML=`
          <div class="cp-saved-name">${p.name}</div>
          <div class="cp-swatch-row" style="flex:1">${swatches}</div>
          <button class="dh-btn jv-sm-btn cp-saved-del" data-idx="${idx}">✕</button>`;
        row.querySelectorAll('.cp-swatch-item').forEach((s,i)=>{
          s.style.cursor='pointer';
          s.addEventListener('click',()=>update(p.colors[i]));
        });
        row.querySelector('.cp-saved-del').addEventListener('click',e=>{
          const d=loadSaved(); d.splice(+e.target.dataset.idx,1); saveSaved(d); renderSaved();
        });
        list.appendChild(row);
      });
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
        if(tab.dataset.tab==='canvas')    renderCanvas(h,s,l);
        if(tab.dataset.tab==='contrast')  renderContrast(r,g,b);
        if(tab.dataset.tab==='palette')   renderPalette(h,s,l);
        if(tab.dataset.tab==='harmony')   renderHarmony(h,s,l);
        if(tab.dataset.tab==='gradient')  renderGradient();
        if(tab.dataset.tab==='mixer')     renderMixer();
        if(tab.dataset.tab==='named')     renderNamed('');
        if(tab.dataset.tab==='image')     { /* user uploads */ }
        if(tab.dataset.tab==='saved')     renderSaved();
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

    // Canvas events
    let _canvasDragging=false, _hueDragging=false;
    $('cp-canvas').addEventListener('mousedown',e=>{_canvasDragging=true;_canvasClick(e);});
    $('cp-hue-bar').addEventListener('mousedown',e=>{_hueDragging=true;_hueClick(e);});
    document.addEventListener('mousemove',e=>{if(_canvasDragging)_canvasClick(e);if(_hueDragging)_hueClick(e);});
    document.addEventListener('mouseup',()=>{_canvasDragging=false;_hueDragging=false;});

    // Mixer events
    $('cp-mix-a').addEventListener('input',renderMixer);
    $('cp-mix-b').addEventListener('input',renderMixer);
    $('cp-mix-ratio').addEventListener('input',renderMixer);

    // Named search
    $('cp-named-search').addEventListener('input',e=>renderNamed(e.target.value));

    // Image upload
    function handleImgFile(file) {
      if(!file||!file.type.startsWith('image/')) return;
      const reader=new FileReader();
      reader.onload=ev=>{
        const img=new Image();
        img.onload=()=>{
          $('cp-img-preview').src=ev.target.result;
          $('cp-img-result').style.display='';
          $('cp-img-drop').style.display='none';
          const colors=extractColors(img);
          const row=$('cp-img-colors'); row.innerHTML='';
          colors.forEach(c=>row.appendChild(makeSwatch(c)));
        };
        img.src=ev.target.result;
      };
      reader.readAsDataURL(file);
    }
    $('cp-img-file').addEventListener('change',e=>handleImgFile(e.target.files[0]));
    const drop=$('cp-img-drop');
    drop.addEventListener('dragover',e=>{e.preventDefault();drop.style.borderColor='#00c8b4';});
    drop.addEventListener('dragleave',()=>drop.style.borderColor='');
    drop.addEventListener('drop',e=>{e.preventDefault();drop.style.borderColor='';handleImgFile(e.dataTransfer.files[0]);});

    // Saved palettes
    $('cp-saved-add').addEventListener('click',()=>{
      const name=$('cp-saved-name').value.trim()||'Palette '+(loadSaved().length+1);
      const d=loadSaved();
      d.unshift({name, colors:self._history.slice(0,8).length?self._history.slice(0,8):[self._currentHex]});
      saveSaved(d); $('cp-saved-name').value=''; renderSaved(); setStatus('Saved!',true);
    });

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
    // Canvas is default tab — render it
    const {h:ih,s:is,l:il}=rgbToHsl(0,200,180);
    renderCanvas(ih,is,il);
  }
};

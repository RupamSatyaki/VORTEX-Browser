const ColorPickerTool = {
  id: 'color-picker',
  name: 'Color Picker',
  desc: 'HEX ↔ RGB ↔ HSL converter & contrast checker',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>`,

  render(container) {
    container.innerHTML = `
      <div class="dh-tool-wrap">
        <div class="cp-preview-row">
          <div class="cp-swatch" id="cp-swatch"></div>
          <input type="color" id="cp-native" value="#00c8b4" style="width:44px;height:44px;border:none;background:none;cursor:pointer;border-radius:8px;" />
        </div>

        <div class="cp-fields">
          <div class="cp-field-group">
            <label>HEX</label>
            <input class="dh-input" id="cp-hex" type="text" value="#00c8b4" maxlength="7" />
          </div>
          <div class="cp-field-group">
            <label>RGB</label>
            <div style="display:flex;gap:4px;">
              <input class="dh-input cp-rgb" id="cp-r" type="number" min="0" max="255" placeholder="R" />
              <input class="dh-input cp-rgb" id="cp-g" type="number" min="0" max="255" placeholder="G" />
              <input class="dh-input cp-rgb" id="cp-b" type="number" min="0" max="255" placeholder="B" />
            </div>
          </div>
          <div class="cp-field-group">
            <label>HSL</label>
            <div style="display:flex;gap:4px;">
              <input class="dh-input cp-rgb" id="cp-h" type="number" min="0" max="360" placeholder="H" />
              <input class="dh-input cp-rgb" id="cp-s" type="number" min="0" max="100" placeholder="S%" />
              <input class="dh-input cp-rgb" id="cp-l" type="number" min="0" max="100" placeholder="L%" />
            </div>
          </div>
        </div>

        <div class="cp-contrast">
          <div class="cp-contrast-label">Contrast vs White / Black</div>
          <div class="cp-contrast-row">
            <div class="cp-contrast-box" id="cp-vs-white">Aa</div>
            <div class="cp-contrast-box" id="cp-vs-black">Aa</div>
          </div>
          <div class="cp-contrast-ratio" id="cp-ratio"></div>
        </div>

        <div class="dh-tool-actions">
          <button class="dh-btn" id="cp-copy-hex">Copy HEX</button>
          <button class="dh-btn" id="cp-copy-rgb">Copy RGB</button>
          <button class="dh-btn" id="cp-copy-hsl">Copy HSL</button>
          <span class="dh-status" id="cp-status"></span>
        </div>
      </div>`;

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      return {r,g,b};
    }
    function rgbToHex(r,g,b) {
      return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
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
    function luminance(r,g,b) {
      const [rs,gs,bs]=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
      return 0.2126*rs+0.7152*gs+0.0722*bs;
    }
    function contrastRatio(l1,l2) {
      const [a,b]=[Math.max(l1,l2),Math.min(l1,l2)];
      return ((a+0.05)/(b+0.05)).toFixed(2);
    }

    function update(hex) {
      if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
      const {r,g,b} = hexToRgb(hex);
      const {h,s,l} = rgbToHsl(r,g,b);
      container.querySelector('#cp-swatch').style.background = hex;
      container.querySelector('#cp-native').value = hex;
      container.querySelector('#cp-hex').value = hex;
      container.querySelector('#cp-r').value = r;
      container.querySelector('#cp-g').value = g;
      container.querySelector('#cp-b').value = b;
      container.querySelector('#cp-h').value = h;
      container.querySelector('#cp-s').value = s;
      container.querySelector('#cp-l').value = l;

      const lum = luminance(r,g,b);
      const cw = contrastRatio(lum, 1), cb = contrastRatio(lum, 0);
      const vw = container.querySelector('#cp-vs-white');
      const vb = container.querySelector('#cp-vs-black');
      vw.style.background = hex; vw.style.color = '#fff';
      vb.style.background = hex; vb.style.color = '#000';
      container.querySelector('#cp-ratio').textContent =
        `vs White: ${cw}:1 ${cw>=4.5?'✓ AA':'✗'} · vs Black: ${cb}:1 ${cb>=4.5?'✓ AA':'✗'}`;
    }

    update('#00c8b4');

    container.querySelector('#cp-native').addEventListener('input', e => update(e.target.value));
    container.querySelector('#cp-hex').addEventListener('change', e => update(e.target.value));
    ['r','g','b'].forEach(c => {
      container.querySelector(`#cp-${c}`).addEventListener('change', () => {
        const r=+container.querySelector('#cp-r').value, g=+container.querySelector('#cp-g').value, b=+container.querySelector('#cp-b').value;
        update(rgbToHex(r,g,b));
      });
    });
    ['h','s','l'].forEach(c => {
      container.querySelector(`#cp-${c}`).addEventListener('change', () => {
        const h=+container.querySelector('#cp-h').value, s=+container.querySelector('#cp-s').value, l=+container.querySelector('#cp-l').value;
        const {r,g,b} = hslToRgb(h,s,l);
        update(rgbToHex(r,g,b));
      });
    });

    const st = container.querySelector('#cp-status');
    function copied(msg) { st.textContent = msg; st.style.color='#22c55e'; setTimeout(()=>st.textContent='',1500); }
    container.querySelector('#cp-copy-hex').addEventListener('click', () => { navigator.clipboard.writeText(container.querySelector('#cp-hex').value); copied('Copied!'); });
    container.querySelector('#cp-copy-rgb').addEventListener('click', () => { const r=container.querySelector('#cp-r').value,g=container.querySelector('#cp-g').value,b=container.querySelector('#cp-b').value; navigator.clipboard.writeText(`rgb(${r},${g},${b})`); copied('Copied!'); });
    container.querySelector('#cp-copy-hsl').addEventListener('click', () => { const h=container.querySelector('#cp-h').value,s=container.querySelector('#cp-s').value,l=container.querySelector('#cp-l').value; navigator.clipboard.writeText(`hsl(${h},${s}%,${l}%)`); copied('Copied!'); });
  }
};

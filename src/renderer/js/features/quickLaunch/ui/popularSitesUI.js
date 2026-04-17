/**
 * features/quickLaunch/ui/popularSitesUI.js
 * Popular sites data + rendered list HTML.
 */

const QLPopularSitesUI = (() => {

  const SITES = [
    { name:'Instagram',     url:'https://www.instagram.com',           icon:'https://www.instagram.com/favicon.ico',           cat:'social' },
    { name:'Facebook',      url:'https://www.facebook.com',            icon:'https://www.facebook.com/favicon.ico',            cat:'social' },
    { name:'Twitter',       url:'https://www.twitter.com',             icon:'https://www.twitter.com/favicon.ico',             cat:'social' },
    { name:'WhatsApp',      url:'https://web.whatsapp.com',            icon:'https://web.whatsapp.com/favicon.ico',            cat:'social' },
    { name:'LinkedIn',      url:'https://www.linkedin.com',            icon:'https://www.linkedin.com/favicon.ico',            cat:'social' },
    { name:'Reddit',        url:'https://www.reddit.com',              icon:'https://www.reddit.com/favicon.ico',              cat:'social' },
    { name:'Telegram',      url:'https://web.telegram.org',            icon:'https://web.telegram.org/favicon.ico',            cat:'social' },
    { name:'Pinterest',     url:'https://www.pinterest.com',           icon:'https://www.pinterest.com/favicon.ico',           cat:'social' },
    { name:'Google',        url:'https://www.google.com',              icon:'https://www.google.com/favicon.ico',              cat:'search' },
    { name:'Gmail',         url:'https://mail.google.com',             icon:'https://mail.google.com/favicon.ico',             cat:'search' },
    { name:'Drive',         url:'https://drive.google.com',            icon:'https://drive.google.com/favicon.ico',            cat:'search' },
    { name:'Maps',          url:'https://maps.google.com',             icon:'https://maps.google.com/favicon.ico',             cat:'search' },
    { name:'Wikipedia',     url:'https://www.wikipedia.org',           icon:'https://www.wikipedia.org/favicon.ico',           cat:'search' },
    { name:'Translate',     url:'https://translate.google.com',        icon:'https://translate.google.com/favicon.ico',        cat:'search' },
    { name:'YouTube',       url:'https://www.youtube.com',             icon:'https://www.youtube.com/favicon.ico',             cat:'entertainment' },
    { name:'Netflix',       url:'https://www.netflix.com',             icon:'https://www.netflix.com/favicon.ico',             cat:'entertainment' },
    { name:'Spotify',       url:'https://open.spotify.com',            icon:'https://open.spotify.com/favicon.ico',            cat:'entertainment' },
    { name:'Hotstar',       url:'https://www.hotstar.com',             icon:'https://www.hotstar.com/favicon.ico',             cat:'entertainment' },
    { name:'Prime Video',   url:'https://www.primevideo.com',          icon:'https://www.primevideo.com/favicon.ico',          cat:'entertainment' },
    { name:'Amazon',        url:'https://www.amazon.in',               icon:'https://www.amazon.in/favicon.ico',               cat:'shopping' },
    { name:'Flipkart',      url:'https://www.flipkart.com',            icon:'https://www.flipkart.com/favicon.ico',            cat:'shopping' },
    { name:'Meesho',        url:'https://www.meesho.com',              icon:'https://www.meesho.com/favicon.ico',              cat:'shopping' },
    { name:'Myntra',        url:'https://www.myntra.com',              icon:'https://www.myntra.com/favicon.ico',              cat:'shopping' },
    { name:'Snapdeal',      url:'https://www.snapdeal.com',            icon:'https://www.snapdeal.com/favicon.ico',            cat:'shopping' },
    { name:'Nykaa',         url:'https://www.nykaa.com',               icon:'https://www.nykaa.com/favicon.ico',               cat:'shopping' },
    { name:'GitHub',        url:'https://www.github.com',              icon:'https://github.com/favicon.ico',                  cat:'dev' },
    { name:'Stack Overflow',url:'https://stackoverflow.com',           icon:'https://stackoverflow.com/favicon.ico',           cat:'dev' },
    { name:'CodePen',       url:'https://codepen.io',                  icon:'https://codepen.io/favicon.ico',                  cat:'dev' },
    { name:'MDN',           url:'https://developer.mozilla.org',       icon:'https://developer.mozilla.org/favicon.ico',       cat:'dev' },
    { name:'npm',           url:'https://www.npmjs.com',               icon:'https://www.npmjs.com/favicon.ico',               cat:'dev' },
    { name:'Vercel',        url:'https://vercel.com',                  icon:'https://vercel.com/favicon.ico',                  cat:'dev' },
    { name:'Times of India',url:'https://timesofindia.indiatimes.com', icon:'https://timesofindia.indiatimes.com/favicon.ico', cat:'news' },
    { name:'NDTV',          url:'https://www.ndtv.com',                icon:'https://www.ndtv.com/favicon.ico',                cat:'news' },
    { name:'Zerodha',       url:'https://kite.zerodha.com',            icon:'https://kite.zerodha.com/favicon.ico',            cat:'news' },
    { name:'Groww',         url:'https://groww.in',                    icon:'https://groww.in/favicon.ico',                    cat:'news' },
  ];

  const CATEGORIES = [
    { id:'all',           label:'All' },
    { id:'social',        label:'Social' },
    { id:'search',        label:'Productivity' },
    { id:'entertainment', label:'Entertainment' },
    { id:'shopping',      label:'Shopping' },
    { id:'dev',           label:'Dev' },
    { id:'news',          label:'News' },
  ];

  function filter(query, category) {
    const q = (query || '').toLowerCase().trim();
    let list = SITES;
    if (category && category !== 'all') list = list.filter(s => s.cat === category);
    if (q) list = list.filter(s => s.name.toLowerCase().includes(q) || s.url.includes(q));
    return list;
  }

  function buildItem(site, onOpen) {
    const item = document.createElement('div');
    item.className = 'ql-pop-item';
    item.innerHTML = `
      <img src="${site.icon}" width="16" height="16"
        onerror="this.style.display='none'"
        style="border-radius:3px;flex-shrink:0"/>
      <span>${site.name}</span>`;
    item.addEventListener('click', () => onOpen(site.url));
    return item;
  }

  return { SITES, CATEGORIES, filter, buildItem };

})();

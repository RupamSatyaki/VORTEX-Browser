/**
 * errorPages/index.js
 * Main error page handler — intercepts did-fail-load and injects 3D error pages.
 */

const WVErrorPage = (() => {

  // Three.js code — loaded once, reused for all error pages
  let _threeJsCode = null;

  async function _loadThreeJs() {
    if (_threeJsCode) return _threeJsCode;
    try {
      // Load from local file
      const res = await fetch('js/browser/webview/errorPages/lib/three.min.js');
      _threeJsCode = await res.text();
    } catch {
      _threeJsCode = ''; // fallback — no 3D
    }
    return _threeJsCode;
  }

  // Scene scripts map
  const SCENE_SCRIPTS = {
    noInternet:   typeof SceneNoInternet   !== 'undefined' ? SceneNoInternet   : '',
    dnsError:     typeof SceneDnsError     !== 'undefined' ? SceneDnsError     : '',
    sslError:     typeof SceneSslError     !== 'undefined' ? SceneSslError     : '',
    timeout:      typeof SceneTimeout      !== 'undefined' ? SceneTimeout      : '',
    notFound:     typeof SceneNotFound     !== 'undefined' ? SceneNotFound     : '',
    redirectLoop: typeof SceneRedirectLoop !== 'undefined' ? SceneRedirectLoop : '',
  };

  async function show(wv, { errorCode, errorDescription, url }) {
    try {
      const sceneName  = ErrorMap.getScene(errorCode);
      if (!sceneName) return; // ignore (e.g. ERR_ABORTED)

      const message    = ErrorMap.getMessage(sceneName);
      const sceneScript = SCENE_SCRIPTS[sceneName] || SCENE_SCRIPTS.noInternet;
      const threeJs    = await _loadThreeJs();

      const html = ErrorLayout.render({
        scene:       sceneName,
        sceneScript,
        message,
        errorCode,
        url,
        threeJsCode: threeJs,
      });

      // Inject into webview
      WVErrorRenderer.inject(wv, html);

    } catch (err) {
      console.warn('[WVErrorPage] Failed to show error page:', err.message);
    }
  }

  return { show };

})();

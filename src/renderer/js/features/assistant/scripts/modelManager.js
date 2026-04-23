/**
 * features/assistant/scripts/modelManager.js
 * Fetch Ollama models, populate dropdown, save/load default.
 */

const ModelManager = (() => {

  const STORAGE_KEY = 'ast_default_model';
  let _selectEl = null;
  let _dotEl    = null;
  let _models   = [];

  function init(selectEl, dotEl) {
    _selectEl = selectEl;
    _dotEl    = dotEl;
  }

  async function refresh() {
    if (!_selectEl) {
      console.warn('[ModelManager] selectEl not found, retrying...');
      setTimeout(refresh, 500);
      return;
    }
    _setDot('loading');
    _selectEl.innerHTML = '<option value="">Connecting...</option>';
    _selectEl.disabled = true;

    try {
      const online = await OllamaClient.ping();
      if (!online) {
        _setDot('offline');
        _selectEl.innerHTML = '<option value="">Ollama offline — run: ollama serve</option>';
        _selectEl.disabled = true;
        return;
      }

      const models = await OllamaClient.getModels();
      _models = models;
      _setDot('online');
      _selectEl.disabled = false;

      if (_models.length === 0) {
        _selectEl.innerHTML = '<option value="">No models — run: ollama pull llama3</option>';
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      _selectEl.innerHTML = _models.map(m =>
        `<option value="${m.name}" ${m.name === saved ? 'selected' : ''}>${m.name}</option>`
      ).join('');

      if (!saved || !_models.find(m => m.name === saved)) {
        _selectEl.value = _models[0].name;
        _save(_models[0].name);
      }

    } catch (err) {
      console.error('[ModelManager] refresh error:', err);
      _setDot('offline');
      _selectEl.innerHTML = `<option value="">Error: ${err.message}</option>`;
      _selectEl.disabled = true;
    }
  }

  function getSelected() {
    return _selectEl?.value || '';
  }

  function onChange(fn) {
    _selectEl?.addEventListener('change', () => {
      _save(_selectEl.value);
      fn(_selectEl.value);
    });
  }

  function _save(model) {
    try { localStorage.setItem(STORAGE_KEY, model); } catch {}
  }

  function _setDot(state) {
    if (!_dotEl) return;
    _dotEl.className = '';
    _dotEl.classList.add(state);
  }

  return { init, refresh, getSelected, onChange };

})();

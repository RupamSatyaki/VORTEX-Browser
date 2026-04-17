/**
 * features/summarizer/index.js
 * Summarizer module — public API, same interface as old summarizer.js
 *
 * Delegates to:
 *   ui/summarizerUI.js                    — render bullets/loading/error
 *   scripts/providers/extractive.js       — offline word-frequency
 *   scripts/providers/huggingface.js      — free HuggingFace API
 *   scripts/providers/ollama.js           — local Ollama LLM
 *   scripts/providers/openai.js           — OpenAI GPT
 *   scripts/summarizerHandler.js          — summarize flow + button bindings
 */

const Summarizer = (() => {

  let _visible = false;

  // ── Open / Close ──────────────────────────────────────────────────────────
  function open() {
    const drawer = document.getElementById('summarizer-drawer');
    const btn    = document.getElementById('nav-summarize');
    if (!drawer) return;

    if (_visible) { close(); return; }

    _visible = true;
    drawer.classList.add('visible');
    if (btn) btn.classList.add('active');

    // Auto-summarize on open
    SummarizerHandler.summarize();
  }

  function close() {
    const drawer = document.getElementById('summarizer-drawer');
    const btn    = document.getElementById('nav-summarize');
    _visible = false;
    drawer?.classList.remove('visible');
    btn?.classList.remove('active');
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    SummarizerHandler.bindButtons(close);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _visible) close();
    });

    // Re-summarize when active tab changes
    document.addEventListener('vortex:tab-changed', () => {
      if (_visible) {
        document.getElementById('sum-content').innerHTML = '';
        SummarizerHandler.summarize();
      }
    });
  });

  // ── Public API (same as old summarizer.js) ────────────────────────────────
  return { open, close, summarize: () => SummarizerHandler.summarize() };

})();

/**
 * features/summarizer/scripts/providers/ollama.js
 * Ollama local LLM — requires `ollama serve` running on localhost:11434.
 */

const SummarizerOllama = (() => {

  async function summarize(text) {
    const truncated = text.slice(0, 3000);
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:  'llama3',
        prompt: `Summarize the following webpage content in 4-5 clear bullet points:\n\n${truncated}`,
        stream: false,
      }),
    });
    if (!res.ok) throw new Error('Ollama not running. Start with: ollama serve');
    const data = await res.json();
    const resp  = data.response || '';
    const lines = resp.split('\n')
      .map(l => l.replace(/^[-•*\d.]+\s*/, '').trim())
      .filter(l => l.length > 10);
    return lines.slice(0, 6);
  }

  return { summarize };

})();

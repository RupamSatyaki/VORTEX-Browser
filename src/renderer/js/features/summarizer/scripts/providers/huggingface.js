/**
 * features/summarizer/scripts/providers/huggingface.js
 * HuggingFace free inference API — facebook/bart-large-cnn model.
 */

const SummarizerHuggingFace = (() => {

  async function summarize(text, apiKey) {
    const truncated = text.slice(0, 1800);
    const headers   = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;

    const res = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: truncated,
          parameters: { max_length: 180, min_length: 60, do_sample: false },
        }),
      }
    );
    if (!res.ok) throw new Error('HuggingFace API error: ' + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const summary = (data[0]?.summary_text) || '';
    return summary.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) || [summary];
  }

  return { summarize };

})();

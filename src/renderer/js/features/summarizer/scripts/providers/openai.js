/**
 * features/summarizer/scripts/providers/openai.js
 * OpenAI GPT-3.5-turbo summarizer — requires API key.
 */

const SummarizerOpenAI = (() => {

  async function summarize(text, apiKey) {
    if (!apiKey) throw new Error('OpenAI API key required');
    const truncated = text.slice(0, 4000);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Summarize the webpage content in 4-5 concise bullet points.' },
          { role: 'user',   content: truncated },
        ],
        max_tokens: 300,
      }),
    });
    if (!res.ok) throw new Error('OpenAI API error: ' + res.status);
    const data  = await res.json();
    const resp  = data.choices?.[0]?.message?.content || '';
    const lines = resp.split('\n')
      .map(l => l.replace(/^[-•*\d.]+\s*/, '').trim())
      .filter(l => l.length > 10);
    return lines.slice(0, 6);
  }

  return { summarize };

})();

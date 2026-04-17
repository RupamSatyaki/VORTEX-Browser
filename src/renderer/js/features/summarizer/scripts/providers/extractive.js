/**
 * features/summarizer/scripts/providers/extractive.js
 * Extractive summarizer — offline, no API key needed.
 * Uses word frequency scoring to pick top sentences.
 */

const SummarizerExtractive = (() => {

  function summarize(text, maxSentences = 5) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (!sentences.length) return [text.slice(0, 400)];

    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const freq  = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    const scored = sentences.map(s => {
      const sw    = s.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const score = sw.reduce((sum, w) => sum + (freq[w] || 0), 0) / (sw.length || 1);
      return { s: s.trim(), score };
    });

    const top = [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .map(x => x.s);

    return scored.filter(x => top.includes(x.s)).map(x => x.s);
  }

  return { summarize };

})();

// notepad/core/highlight.js - Syntax highlighting rules
var NpHighlight = {

  LANGUAGES: ['plain','javascript','python','html','css','json','sql','markdown','typescript','bash'],

  detect: function(text, filename) {
    if (filename) {
      var ext = filename.split('.').pop().toLowerCase();
      var map = { js:'javascript', ts:'typescript', py:'python', html:'html', htm:'html', css:'css', json:'json', sql:'sql', md:'markdown', sh:'bash', bash:'bash' };
      if (map[ext]) return map[ext];
    }
    if (/^\s*\{/.test(text) && /"\s*:/.test(text)) return 'json';
    if (/<html|<div|<span/i.test(text)) return 'html';
    if (/def |import |print\(|elif /.test(text)) return 'python';
    if (/function |const |let |var |=>/.test(text)) return 'javascript';
    if (/SELECT |FROM |WHERE |INSERT /i.test(text)) return 'sql';
    if (/^#+ |^\*\*|^\- /.test(text)) return 'markdown';
    return 'plain';
  },

  tokenize: function(code, lang) {
    if (lang === 'plain') return this._escHtml(code);
    var rules = this._getRules(lang);
    if (!rules) return this._escHtml(code);
    return this._applyRules(code, rules);
  },

  _escHtml: function(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  _applyRules: function(code, rules) {
    // Split into lines, apply rules per line
    return code.split('\n').map(function(line) {
      var escaped = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      rules.forEach(function(rule) {
        escaped = escaped.replace(rule.re, function(m) {
          return '<span class="np-' + rule.cls + '">' + m + '</span>';
        });
      });
      return escaped;
    }).join('\n');
  },

  _getRules: function(lang) {
    var STRING  = { re: /(&quot;|&#39;)(.*?)\1|`[^`]*`/g, cls: 'string' };
    var COMMENT_LINE = { re: /\/\/.*/g, cls: 'comment' };
    var COMMENT_HASH = { re: /#.*/g, cls: 'comment' };
    var NUMBER  = { re: /\b\d+\.?\d*\b/g, cls: 'number' };

    if (lang === 'javascript' || lang === 'typescript') return [
      { re: /\/\*[\s\S]*?\*\//g, cls: 'comment' },
      COMMENT_LINE,
      STRING,
      NUMBER,
      { re: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|typeof|instanceof|try|catch|finally|throw|switch|case|break|continue|default|null|undefined|true|false|void|delete|in|of)\b/g, cls: 'keyword' },
      { re: /\b([A-Z][a-zA-Z0-9]*)\b/g, cls: 'class' },
      { re: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, cls: 'function' },
    ];
    if (lang === 'python') return [
      { re: /"""[\s\S]*?"""|'''[\s\S]*?'''/g, cls: 'comment' },
      COMMENT_HASH,
      STRING,
      NUMBER,
      { re: /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|pass|break|continue|try|except|finally|raise|with|as|lambda|yield|global|nonlocal|del|assert)\b/g, cls: 'keyword' },
      { re: /\b([A-Z][a-zA-Z0-9]*)\b/g, cls: 'class' },
      { re: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, cls: 'function' },
    ];
    if (lang === 'html') return [
      { re: /&lt;!--[\s\S]*?--&gt;/g, cls: 'comment' },
      { re: /&lt;\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^&]*?)?\/?\s*&gt;/g, cls: 'tag' },
      { re: /\b([a-zA-Z-]+)(?==)/g, cls: 'attr' },
      { re: /=(&quot;[^&]*&quot;|&#39;[^&]*&#39;)/g, cls: 'string' },
    ];
    if (lang === 'css') return [
      { re: /\/\*[\s\S]*?\*\//g, cls: 'comment' },
      { re: /([.#]?[a-zA-Z][a-zA-Z0-9_-]*)\s*\{/g, cls: 'selector' },
      { re: /([a-zA-Z-]+)\s*:/g, cls: 'property' },
      { re: /#[0-9a-fA-F]{3,8}\b/g, cls: 'number' },
      { re: /\b\d+\.?\d*(px|em|rem|%|vh|vw|pt|s|ms)?\b/g, cls: 'number' },
      STRING,
    ];
    if (lang === 'json') return [
      { re: /(&quot;[^&]*&quot;)\s*:/g, cls: 'keyword' },
      { re: /:\s*(&quot;[^&]*&quot;)/g, cls: 'string' },
      NUMBER,
      { re: /\b(true|false|null)\b/g, cls: 'keyword' },
    ];
    if (lang === 'sql') return [
      { re: /--.*$/gm, cls: 'comment' },
      STRING,
      NUMBER,
      { re: /\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MAX|MIN|UNION|ALL|VALUES|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|CONSTRAINT)\b/gi, cls: 'keyword' },
    ];
    if (lang === 'markdown') return [
      { re: /^#{1,6}\s.*/gm, cls: 'keyword' },
      { re: /\*\*[^*]+\*\*/g, cls: 'class' },
      { re: /\*[^*]+\*/g, cls: 'string' },
      { re: /`[^`]+`/g, cls: 'number' },
      { re: /^\s*[-*+]\s/gm, cls: 'function' },
      { re: /\[([^\]]+)\]\([^)]+\)/g, cls: 'attr' },
    ];
    if (lang === 'bash') return [
      COMMENT_HASH,
      STRING,
      { re: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|echo|cd|ls|mkdir|rm|cp|mv|grep|sed|awk|cat|export|source|alias)\b/g, cls: 'keyword' },
      { re: /\$[a-zA-Z_][a-zA-Z0-9_]*/g, cls: 'function' },
    ];
    return null;
  },
};

/**
 * passwords/generator.js
 * Password generator with configurable options
 */

const PasswordGenerator = (() => {

  const CHARS = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  function generate(opts = {}) {
    const {
      length   = 16,
      upper    = true,
      lower    = true,
      numbers  = true,
      symbols  = true,
    } = opts;

    let pool = '';
    const required = [];

    if (upper)   { pool += CHARS.upper;   required.push(CHARS.upper[Math.floor(Math.random() * CHARS.upper.length)]); }
    if (lower)   { pool += CHARS.lower;   required.push(CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)]); }
    if (numbers) { pool += CHARS.numbers; required.push(CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)]); }
    if (symbols) { pool += CHARS.symbols; required.push(CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)]); }

    if (!pool) pool = CHARS.lower + CHARS.numbers;

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let password = Array.from(arr).map(n => pool[n % pool.length]).join('');

    // Inject required chars at random positions
    required.forEach((ch, i) => {
      const pos = i % length;
      password = password.slice(0, pos) + ch + password.slice(pos + 1);
    });

    return password;
  }

  function strength(password) {
    if (!password) return { score: 0, label: 'None', color: '#4a8080' };
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak',   color: '#ef4444', pct: 25 };
    if (score <= 4) return { score, label: 'Fair',   color: '#f59e0b', pct: 50 };
    if (score <= 5) return { score, label: 'Good',   color: '#3b82f6', pct: 75 };
    return              { score, label: 'Strong', color: '#22c55e', pct: 100 };
  }

  return { generate, strength };
})();

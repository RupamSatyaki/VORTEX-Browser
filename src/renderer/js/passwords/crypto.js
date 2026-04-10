/**
 * passwords/crypto.js
 * AES-256-GCM encryption using Web Crypto API (renderer-safe)
 */

const VaultCrypto = (() => {

  // Derive AES key from master password + salt using PBKDF2
  async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Hash master password for storage verification (SHA-256 + salt)
  async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const data = enc.encode(password + salt);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  // Generate random salt
  function generateSalt() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2,'0')).join('');
  }

  // Encrypt plaintext string → base64 string
  async function encrypt(plaintext, password, salt) {
    const key = await deriveKey(password, salt);
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipherBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );
    // Prepend IV to ciphertext
    const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuf), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt base64 string → plaintext string
  async function decrypt(ciphertext, password, salt) {
    const key = await deriveKey(password, salt);
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv         = combined.slice(0, 12);
    const cipherBuf  = combined.slice(12);
    const plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBuf
    );
    return new TextDecoder().decode(plainBuf);
  }

  return { hashPassword, generateSalt, encrypt, decrypt };
})();

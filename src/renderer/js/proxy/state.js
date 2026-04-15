// Shared state — singleton, listeners properly cleaned up on re-mount
const ProxyState = {
  config: null,
  status: {
    enabled: false, type: 'none', connected: false,
    ip: null, originalIp: null, country: '', city: '', org: '',
    latency: null, torBootstrap: 0,
  },
  torRunning: false,
  torBootstrap: 0,
  torMessage: '',

  _listeners: {},

  // Register listener — returns unsubscribe fn
  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
    return () => this.off(event, cb);
  },

  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== cb);
  },

  // Remove ALL listeners for all events (call on panel unmount/remount)
  clearAll() {
    this._listeners = {};
  },

  emit(event, data) {
    (this._listeners[event] || []).forEach(cb => { try { cb(data); } catch(e) { console.warn('[ProxyState]', e); } });
  },

  setStatus(s) {
    // Merge — don't overwrite fields with null/undefined
    Object.keys(s).forEach(k => {
      if (s[k] !== null && s[k] !== undefined) this.status[k] = s[k];
    });
    this.emit('statusChanged', { ...this.status });
  },

  setConfig(c) {
    this.config = c;
    this.emit('configChanged', c);
  },

  setTorBootstrap(pct, msg) {
    this.torBootstrap = pct;
    this.torMessage = msg;
    this.emit('torProgress', { percent: pct, message: msg });
  },

  setTorRunning(v) {
    this.torRunning = v;
    this.emit('torRunningChanged', v);
  },
};

window.ProxyState = ProxyState;

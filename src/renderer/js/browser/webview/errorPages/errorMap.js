/**
 * errorPages/errorMap.js
 * Maps Chromium error codes to scene types and user-friendly messages.
 */

const ErrorMap = {
  scenes: {
    '-2':   'noInternet',
    '-3':   null,            // ERR_ABORTED — ignore (navigation cancelled)
    '-6':   'notFound',      // ERR_FILE_NOT_FOUND
    '-7':   'timeout',       // ERR_TIMED_OUT
    '-10':  'noInternet',    // ERR_ACCESS_DENIED
    '-20':  'noInternet',    // ERR_INTERNET_DISCONNECTED
    '-21':  'noInternet',    // ERR_ADDRESS_INVALID
    '-100': 'noInternet',    // ERR_CONNECTION_CLOSED
    '-101': 'noInternet',    // ERR_CONNECTION_RESET
    '-102': 'noInternet',    // ERR_CONNECTION_REFUSED
    '-103': 'noInternet',    // ERR_CONNECTION_ABORTED
    '-104': 'noInternet',    // ERR_CONNECTION_FAILED
    '-105': 'dnsError',      // ERR_NAME_NOT_RESOLVED
    '-106': 'noInternet',    // ERR_INTERNET_DISCONNECTED
    '-109': 'noInternet',    // ERR_ADDRESS_UNREACHABLE
    '-111': 'noInternet',    // ERR_CONNECTION_REFUSED
    '-118': 'timeout',       // ERR_CONNECTION_TIMED_OUT
    '-137': 'dnsError',      // ERR_NAME_RESOLUTION_FAILED
    '-200': 'sslError',      // ERR_CERT_COMMON_NAME_INVALID
    '-201': 'sslError',      // ERR_CERT_DATE_INVALID
    '-202': 'sslError',      // ERR_CERT_AUTHORITY_INVALID
    '-203': 'sslError',      // ERR_CERT_CONTAINS_ERRORS
    '-204': 'sslError',      // ERR_CERT_NO_REVOCATION_MECHANISM
    '-207': 'sslError',      // ERR_CERT_INVALID
    '-310': 'redirectLoop',  // ERR_TOO_MANY_REDIRECTS
    '-324': 'noInternet',    // ERR_EMPTY_RESPONSE
    '-501': 'notFound',      // ERR_INSECURE_RESPONSE
  },

  messages: {
    noInternet: {
      title:    'No Internet Connection',
      subtitle: "Can't reach this page",
      tips: [
        'Check your WiFi or Ethernet connection',
        'Try disabling VPN or Proxy',
        'Restart your router',
        'Check if other sites work',
      ],
      color: '#00c8b4',
      // wifi-off icon
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00c8b4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    },
    dnsError: {
      title:    'Domain Not Found',
      subtitle: "DNS address could not be resolved",
      tips: [
        'Check if the URL is spelled correctly',
        'The domain may not exist',
        'Try flushing DNS: ipconfig /flushdns',
        'Try a different DNS server (8.8.8.8)',
      ],
      color: '#a78bfa',
      // search / help-circle icon
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="11"/><line x1="11" y1="14" x2="11.01" y2="14"/></svg>`,
    },
    sslError: {
      title:    'Connection Not Secure',
      subtitle: "SSL certificate error",
      tips: [
        'The site\'s security certificate is invalid',
        'Your system clock may be incorrect',
        'The site may be using an expired certificate',
      ],
      color: '#ef4444',
      // unlock / broken lock icon
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    },
    timeout: {
      title:    'Connection Timed Out',
      subtitle: "The server took too long to respond",
      tips: [
        'The server may be overloaded',
        'Check your internet connection speed',
        'Try again in a few moments',
        'The site may be temporarily down',
      ],
      color: '#f59e0b',
      // clock icon
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    },
    redirectLoop: {
      title:    'Too Many Redirects',
      subtitle: "This page has a redirect loop",
      tips: [
        'Clear cookies for this site',
        'The site has a configuration error',
        'Try opening in incognito mode',
      ],
      color: '#eab308',
      // repeat / loop icon
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
    },
    notFound: {
      title:    'Page Not Found',
      subtitle: "The requested page doesn't exist",
      tips: [
        'Check if the URL is correct',
        'The page may have been moved or deleted',
        'Try searching for the content',
      ],
      color: '#6366f1',
      // file-x icon
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
    },
  },

  getScene(errorCode) {
    return this.scenes[String(errorCode)] || 'noInternet';
  },

  getMessage(scene) {
    return this.messages[scene] || this.messages.noInternet;
  },
};

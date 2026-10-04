// Safeguard for browser environments where window.fetch is a getter without a setter
if (typeof window !== 'undefined') {
  try {
    const origFetch = window.fetch ? window.fetch.bind(window) : undefined;
    let _fetch = origFetch;
    const desc = {
      get() { return _fetch; },
      set(val: any) { _fetch = val; },
      configurable: true,
      enumerable: true
    };
    try { Object.defineProperty(window, 'fetch', desc); } catch (_) {}
    if (typeof Window !== 'undefined' && Window.prototype) {
      try { Object.defineProperty(Window.prototype, 'fetch', desc); } catch (_) {}
    }
  } catch (_) {}
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);


(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import React from './_virtual/index.js';
import { c as clientExports } from './_virtual/client.js';
import { App } from './App.js';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}
const root = clientExports.createRoot(container);
root.render(React.createElement(React.StrictMode, null,
    React.createElement(App, null)));
//# sourceMappingURL=renderer.js.map

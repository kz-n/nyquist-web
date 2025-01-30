
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import React from './_virtual/index.js';
import { AudioPlayer } from './components/AudioPlayer.js';

function App() {
    return (React.createElement("div", null,
        React.createElement(AudioPlayer, null),
        React.createElement("h1", null, "Hello from React + Electron!")));
}

export { App };
//# sourceMappingURL=App.js.map

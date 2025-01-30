
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import React, { r as reactExports } from '../_virtual/index.js';
import { MusicList } from './MusicList.js';

function AudioPlayer() {
    const [music, setMusic] = reactExports.useState('');
    return React.createElement("div", null,
        React.createElement("audio", { src: music, controls: true }),
        React.createElement(MusicList, { music: setMusic }));
}

export { AudioPlayer };
//# sourceMappingURL=AudioPlayer.js.map

import React, { useState } from 'react';
import { MusicList } from './MusicList';
export function AudioPlayer() {
    const [music, setMusic] = useState('');
    return React.createElement("div", null,
        React.createElement("audio", { src: music, controls: true }),
        React.createElement(MusicList, { music: setMusic }));
}
//# sourceMappingURL=AudioPlayer.js.map
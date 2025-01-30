
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import React, { r as reactExports } from '../_virtual/index.js';

function MusicList({ music }) {
    const [result, setResult] = reactExports.useState([]);
    reactExports.useEffect(() => {
        window.api.getMusic("asd")
            .then((response) => {
            console.log('Response:', response);
            setResult(response);
        })
            .catch((error) => {
            console.error('Error:', error);
        });
    }, []);
    return (React.createElement("div", null,
        React.createElement("ul", null, result.map((item, index) => (React.createElement("li", { key: index },
            React.createElement("button", { onClick: () => music(item) }, item)))))));
}

export { MusicList };
//# sourceMappingURL=MusicList.js.map

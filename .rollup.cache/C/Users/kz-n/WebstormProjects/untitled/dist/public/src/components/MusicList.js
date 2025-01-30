import React, { useEffect, useState } from "react";
export function MusicList({ music }) {
    const [result, setResult] = useState([]);
    useEffect(() => {
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
//# sourceMappingURL=MusicList.js.map
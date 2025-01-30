import React, { useEffect, useState, Dispatch, SetStateAction } from "react";

interface MusicListProps {
    music: Dispatch<SetStateAction<string>>;
}

export function MusicList({ music }: MusicListProps) {
    const [result, setResult] = useState<string[]>([]);

    useEffect(() => {
        window.api.getMusic("asd")
            .then((response: string[]) => {
                console.log('Response:', response);
                setResult(response);
            })
            .catch((error: Error) => {
                console.error('Error:', error);
            });
    }, []);
    
    return (
        <div>
            <ul>
                {result.map((item, index) => (
                    <li key={index}>
                        <button onClick={() => music(item)}>{item}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
} 
import {Jukebox} from "../object/Jukebox";
import {createEffect, createSignal, For} from "solid-js";
import {Track} from "../object/Track";

type PlaylistProps = {
    jukebox: Jukebox
}

export const QueueComponent = (props: PlaylistProps) => {
    const [queue, setQueue] = createSignal<Track[]>([]);
    const [albumArtUUID, setAlbumArtUUID] = createSignal<string>("");

    // Set up the initial queue and subscribe to changes
    createEffect(() => {
        setQueue([...props.jukebox.playlist.queue]);
        props.jukebox.playlist.onModified = () => {
            setQueue([...props.jukebox.playlist.queue]);
        };
    });

    const handleClick = async (item: Track) => {
        const metadata = await window.api.getMusicMetadata(item.path);
        console.log(item.path)
        console.log('Metadata:', metadata);
        
        if (metadata?.common?.picture?.[0]) {
            const imageData = metadata.common.picture[0];
            const uuid = await window.api.depotAdd({
                data: Array.from(imageData.data),
                format: imageData.format
            }, 'blob');
            setAlbumArtUUID(uuid);
        }
        await props.jukebox.play(item);
    };

    return (
        <div>
            <h1>Queue</h1>
            <img 
                id="album-art" 
                alt="Album cover" 
                src={albumArtUUID() ? `nyquist://depot/${albumArtUUID()}` : ''} 
            />
            <For each={queue()}>
                {(item: Track) => (
                    <button
                        onClick={() => handleClick(item)}
                        class="music-list__button"
                    >
                        {item.path.split('\\').pop()}
                    </button>
                )}
            </For>
        </div>
    );
};

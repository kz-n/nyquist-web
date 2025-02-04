import {Jukebox} from "../object/Jukebox";
import {createEffect, createSignal, For} from "solid-js";
import {Track} from "../object/Track";
import {IAudioMetadata} from "music-metadata";

type PlaylistProps = {
    jukebox: Jukebox
}

export const QueueComponent = (props: PlaylistProps) => {
    const [queue, setQueue] = createSignal<Track[]>([]);
    const [picture, setPicture] = createSignal<Blob>(new Blob());
    // Set up the initial queue and subscribe to changes
    createEffect(() => {
        setQueue([...props.jukebox.playlist.queue]);
        props.jukebox.playlist.onModified = () => {
            setQueue([...props.jukebox.playlist.queue]);
        };
    });
    createEffect(() => {
        document.getElementById("album-art")?.setAttribute("src", URL.createObjectURL(picture()));
    })
    const handleClick = async (item: Track) => {
        const metadata: IAudioMetadata = await window.api.getMusicMetadata(item.path);
        console.log(item.path)
        console.log('Metadata:', metadata);
        // check if null
        if (metadata.common.picture && metadata.common.picture[0]) {
            setPicture(new Blob([metadata.common.picture[0].data], {type: metadata.common.picture[0].format}));
        }
        // You can do something with the metadata here
        //props.jukebox.play(item);
    };

    return (
        <div>
            <h1>Queue</h1>
            <img id={"album-art"} alt="Album cover" />
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

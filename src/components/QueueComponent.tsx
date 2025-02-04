import {Jukebox} from "../object/Jukebox";
import {createEffect, createSignal, For} from "solid-js";
import {Track} from "../object/Track";

type PlaylistProps = {
    jukebox: Jukebox
}

export const QueueComponent = (props: PlaylistProps) => {
    const [queue, setQueue] = createSignal<Array<any>>([]);
    
    // Set up the initial queue and subscribe to changes
    createEffect(() => {
        setQueue([...props.jukebox.playlist.queue]);
        props.jukebox.playlist.onModified = () => {
            setQueue([...props.jukebox.playlist.queue]);
        };
    });

    return (
        <div class="playlist">
            <h1>Queue</h1>
            <For each={queue()}>
                {(item: Track) => (
                    <button
                        onClick={() => console.log(window.api.getMusicMetadata(item.path)) //props.jukebox.play(item)
                    }
                        class="music-list__button"
                    >
                        {item.path.split('\\').pop()}
                    </button>
                )}
            </For>
        </div>
    );
};

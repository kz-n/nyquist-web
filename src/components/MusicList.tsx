import {For} from "solid-js";
import {Jukebox} from "../object/Jukebox";

type MusicListProps = {
    jukebox: Jukebox;
}

export const MusicList = (props: MusicListProps) => {
    return (
        <div class="music-list">
            <h1>Music List</h1>
            <For each={props.jukebox.playlist.tracks}>
                {(item) => (
                    <button
                        onClick={() => props.jukebox.playlist.addToQueue(item)}
                        class="music-list__button"
                    >
                        {item.path.split('\\').pop()}
                    </button>
                )}
            </For>
        </div>
    );
};
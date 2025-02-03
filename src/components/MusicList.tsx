import {For} from "solid-js";
import {Jukebox} from "../object/Jukebox";

type MusicListProps = {
    jukebox: Jukebox;
}

export const MusicList = (props: MusicListProps) => {
    return (
        <div class="music-list">
            <For each={props.jukebox.playlist.tracks}>
                {(item) => (
                    <button
                        onClick={() => props.jukebox.play(item)}
                        class="music-list__button"
                    >
                        {item.path.split('\\').pop()}
                    </button>
                )}
            </For>
        </div>
    );
};
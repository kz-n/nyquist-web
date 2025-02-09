import {For} from "solid-js";
import {Jukebox} from "../object/Jukebox";
import "../styles/main.scss"
import {MusicCard} from "./MusicCard";
type MusicListProps = {
    jukebox: Jukebox;
}

export const MusicList = (props: MusicListProps) => {
    return (
        <div class="music-list">
            <h1 class="nyq-logo"><i>Nyquist</i></h1>
            <div class="music-list__card-container">
                <For each={props.jukebox.playlist.tracks}>
                    {(item) => (
                        <MusicCard artist={item.path} title={item.path.split('\\').pop()} picture={item.path} />
                    )}
                </For>
            </div>
        </div>
    );
};
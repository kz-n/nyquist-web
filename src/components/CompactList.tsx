import { Component, For } from 'solid-js';
import { Jukebox } from '../object/Jukebox';
import { MusicCompactCard } from './MusicCompactCard';
import '../styles/components/_compact-list.scss';

type CompactListProps = {
    jukebox: Jukebox;
    onPlay: () => void;
}

export const CompactList: Component<CompactListProps> = (props) => {
    return (
        <div class="compact-list">
            <For each={props.jukebox.playlist.tracks}>
                {(track, index) => (
                    <div class="compact-list__item">
                        <MusicCompactCard
                            track={track}
                            jukebox={props.jukebox}
                            onPlay={props.onPlay}
                        />
                    </div>
                )}
            </For>
        </div>
    );
}; 
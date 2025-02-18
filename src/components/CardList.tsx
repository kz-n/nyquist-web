import {For, createSignal, Show} from "solid-js";
import {Jukebox} from "../object/Jukebox";
import "../styles/main.scss"
import {MusicCard} from "./MusicCard";
import { MetadataLoader } from "../object/MetadataLoader";
import { createEffect } from "solid-js";
import { CompactList } from "./CompactList";

type ViewMode = 'Cards' | 'Compact';

type CardListProps = {
    jukebox: Jukebox;
}

export const CardList = (props: CardListProps) => {
    const [viewMode, setViewMode] = createSignal<ViewMode>('Cards');
    const metadataLoader = MetadataLoader.getInstance();

    // Add all tracks to the metadata loading queue
    createEffect(() => {
        if (props.jukebox.playlist.tracks.length > 0) {
            metadataLoader.addToQueue(props.jukebox.playlist.tracks);
        }
    });

    // Set up intersection observer for visible cards
    let containerRef: HTMLDivElement | undefined;
    const observer = new IntersectionObserver(
        (entries) => {
            const visibleTracks = entries
                .filter(entry => entry.isIntersecting)
                .map(entry => props.jukebox.playlist.tracks[parseInt(entry.target.getAttribute('data-index') || '0')]);
            
            if (visibleTracks.length > 0) {
                metadataLoader.prioritize(visibleTracks);
            }
        },
        { rootMargin: '100px' }
    );

    // Store the original onPlay callback
    const originalOnPlay = props.jukebox.onPlay;

    // Set up combined onPlay callback
    props.jukebox.onPlay = (track) => {
        // Call the original callback first
        originalOnPlay(track);
        
        // Then handle metadata loading
        setTimeout(() => {
            const time = new Date().toLocaleTimeString();
            console.log(`[${time}] CardList: Resuming metadata loading after playback started`);
            metadataLoader.resume();
        }, 1000);
    };

    const handlePause = () => {
        metadataLoader.pause();
    };

    return (
        <div class="card-list">
            <div class="card-list__header">
                <select 
                    class="card-list__view-selector"
                    value={viewMode()}
                    onChange={(e) => setViewMode(e.currentTarget.value as ViewMode)}
                >
                    <option value="Cards">Cards</option>
                    <option value="Compact">Compact</option>
                </select>
            </div>
            <Show when={viewMode() === 'Cards'}>
                <div class="card-list__card-container" ref={containerRef}>
                    <For each={props.jukebox.playlist.tracks}>
                        {(item, index) => (
                            <div data-index={index()}>
                                <MusicCard 
                                    track={item}
                                    jukebox={props.jukebox}
                                    onPlay={handlePause}
                                />
                            </div>
                        )}
                    </For>
                </div>
            </Show>
            <Show when={viewMode() === 'Compact'}>
                <CompactList 
                    jukebox={props.jukebox}
                    onPlay={handlePause}
                />
            </Show>
        </div>
    );
}; 
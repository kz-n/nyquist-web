import { Component, For, createEffect, createSignal } from 'solid-js';
import { BaseDock } from './BaseDock';
import { QueueCompactCard } from './QueueCompactCard';
import { Track } from '../object/Track';
import { Jukebox } from '../object/Jukebox';
import '../styles/components/_queue-dock.scss';

type QueueDockProps = {
    jukebox: Jukebox;
}

export const QueueDock: Component<QueueDockProps> = (props) => {
    const [queue, setQueue] = createSignal<Track[]>([]);
    const [nowPlaying, setNowPlaying] = createSignal<Track | null>(null);

    // Update queue when it changes
    createEffect(() => {
        // Filter out the currently playing track from the queue display
        const currentQueue = props.jukebox.playlist.queue;
        const currentTrack = props.jukebox.playlist.nowPlaying;
        const filteredQueue = currentQueue.filter(track => track !== currentTrack);
        
        setQueue(filteredQueue);
        setNowPlaying(currentTrack);

        // Subscribe to queue changes
        props.jukebox.playlist.onModified = () => {
            const updatedQueue = props.jukebox.playlist.queue.filter(
                track => track !== props.jukebox.playlist.nowPlaying
            );
            setQueue(updatedQueue);
            setNowPlaying(props.jukebox.playlist.nowPlaying);
        };
    });

    const handleTrackClick = (track: Track) => {
        props.jukebox.play(track);
    };

    return (
        <BaseDock 
            name="Queue" 
            showName={true} 
            class="queue-dock"
        >
            <div class="queue-dock__content">
                {/* Now Playing Section */}
                <div class="queue-dock__now-playing">
                    {nowPlaying() && (
                        <QueueCompactCard 
                            track={nowPlaying()!}
                            isNowPlaying={true}
                            onClick={() => handleTrackClick(nowPlaying()!)}
                        />
                    )}
                </div>

                {/* Queue Section */}
                {queue().length > 0 && (
                    <>
                        <div class="queue-dock__queue-title">Next Up</div>
                        <div class="queue-dock__queue">
                            <For each={queue()}>
                                {(track) => (
                                    <QueueCompactCard 
                                        track={track}
                                        onClick={() => handleTrackClick(track)}
                                    />
                                )}
                            </For>
                        </div>
                    </>
                )}
            </div>
        </BaseDock>
    );
}; 
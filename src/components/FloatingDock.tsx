import { Track, TrackMetadata } from "../object/Track";
import { Jukebox } from "../object/Jukebox";
import { createSignal, onCleanup, onMount, createEffect } from "solid-js";
import "../styles/components/_floating-dock.scss";

type FloatingDockProps = {
    currentTrack: Track | null;
    isPlaying: boolean;
    isPaused: boolean;
    jukebox: Jukebox;
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const FloatingDock = (props: FloatingDockProps) => {
    const [currentTime, setCurrentTime] = createSignal(0);
    const [duration, setDuration] = createSignal(0);
    const [isDragging, setIsDragging] = createSignal(false);
    const [metadata, setMetadata] = createSignal<TrackMetadata>({
        title: props.currentTrack?.fileName || 'No track playing',
        artist: 'Unknown Artist',
        album: 'Unknown Album'
    });

    // Watch for track changes
    createEffect(async () => {
        if (props.currentTrack) {
            const trackMetadata = await props.currentTrack.getMetadata();
            setMetadata(trackMetadata);
        } else {
            setMetadata({
                title: 'No track playing',
                artist: 'Unknown Artist',
                album: 'Unknown Album'
            });
        }
    });

    props.jukebox.onTimeUpdate = (time: number, total: number) => {
        if (!isDragging()) {
            setCurrentTime(time);
        }
        setDuration(total);
    };

    onCleanup(() => {
        props.jukebox.onTimeUpdate = () => {};
    });

    const handleSeek = (e: InputEvent) => {
        const input = e.target as HTMLInputElement;
        const time = parseFloat(input.value);
        setCurrentTime(time);
        if (!isDragging()) {
            props.jukebox.seek(time);
        }
    };

    return (
        <div class="floating-dock">
            <div class="floating-dock__content">
                <div class="floating-dock__main">
                    {props.currentTrack && (
                        <div class="floating-dock__album-art" 
                            style={{
                                "background-image": metadata().albumArtUUID ? `url(nyquist://depot/${metadata().albumArtUUID})` : 'none'
                            }}
                        />
                    )}
                    <div class="floating-dock__track-info">
                        {props.currentTrack && (
                            <>
                                <div class="floating-dock__title">
                                    {metadata().title}
                                </div>
                                <div class="floating-dock__time">
                                    {props.currentTrack && (
                                        <input
                                            type="range"
                                            class="floating-dock__seek"
                                            min="0"
                                            max={duration()}
                                            value={currentTime()}
                                            step="0.1"
                                            onInput={handleSeek}
                                            onMouseDown={() => setIsDragging(true)}
                                            onMouseUp={() => {
                                                setIsDragging(false);
                                                props.jukebox.seek(currentTime());
                                            }}
                                        />
                                    )}
                                    {formatTime(currentTime())} / {formatTime(duration())}
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div class="floating-dock__controls">
                        {props.isPlaying ? (
                            <>
                                {props.isPaused ? (
                                    <button
                                        onClick={() => props.jukebox.resume()}
                                        class="floating-dock__button"
                                    >
                                        ▶
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => props.jukebox.pause()}
                                        class="floating-dock__button"
                                    >
                                        ⏸
                                    </button>
                                )}
                                <button
                                    onClick={() => props.jukebox.stop()}
                                    class="floating-dock__button"
                                >
                                    ⏹
                                </button>
                            </>
                        ) : (
                            <div class="floating-dock__placeholder">
                                No track playing
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 
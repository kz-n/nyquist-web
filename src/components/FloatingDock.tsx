import { Track } from "../object/Track";
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
    const [albumArtUUID, setAlbumArtUUID] = createSignal<string>("");

    const loadAlbumArt = async (track: Track) => {
        try {
            setAlbumArtUUID(""); // Clear current art first
            const metadata = await window.api.getMusicMetadata(track.path);
            if (metadata?.common?.picture?.[0]) {
                const imageData = metadata.common.picture[0];
                const uuid = await window.api.depotAdd({
                    data: Array.from(imageData.data),
                    format: imageData.format
                }, 'blob');
                setAlbumArtUUID(uuid);
            }
        } catch (error) {
            console.error('Failed to load album art:', error);
        }
    };

    // Watch for track changes
    createEffect(() => {
        if (props.currentTrack) {
            loadAlbumArt(props.currentTrack);
        } else {
            setAlbumArtUUID("");
        }
    });

    onMount(() => {
        if (props.currentTrack) {
            loadAlbumArt(props.currentTrack);
        }
    });

    props.jukebox.onTimeUpdate = (time: number, total: number) => {
        if (!isDragging()) {
            setCurrentTime(time);
        }
        setDuration(total);
    };

    // Remove onPlay handler since we're using createEffect
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
                                "background-image": albumArtUUID() ? `url(nyquist://depot/${albumArtUUID()})` : 'none'
                            }}
                        />
                    )}
                    <div class="floating-dock__track-info">
                        {props.currentTrack && (
                            <>
                                <div class="floating-dock__title">
                                    {props.currentTrack.path.split('\\').pop()}
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
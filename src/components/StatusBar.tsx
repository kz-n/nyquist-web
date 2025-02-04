import { Track } from "../object/Track";
import { Jukebox } from "../object/Jukebox";
import { createSignal } from "solid-js";
import AudioMotionAnalyzer from "audiomotion-analyzer";

type StatusBarProps = {
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

export const StatusBar = (props: StatusBarProps) => {
    const [currentTime, setCurrentTime] = createSignal(0);
    const [duration, setDuration] = createSignal(0);
    const [isDragging, setIsDragging] = createSignal(false);

    // Set up time update handler
    props.jukebox.onTimeUpdate = (time: number, total: number) => {
        if (!isDragging()) {
            setCurrentTime(time);
            setDuration(total);
        }
    };

    const handleSeek = (e: InputEvent) => {
        const input = e.target as HTMLInputElement;
        const time = parseFloat(input.value);
        setCurrentTime(time);
        if (!isDragging()) {
            props.jukebox.seek(time);
        }
    };
    return (
        <div class="status-bar">
            <div class="status-bar__now-playing">
                Now Playing: {props.currentTrack ? props.currentTrack.path.split('\\').pop() : 'Nothing playing'}
            </div>
            <div class="status-bar__time-control">
                <span>{formatTime(currentTime())}</span>
                <input
                    type="range"
                    min="0"
                    max={duration()}
                    value={currentTime()}
                    step="0.1"
                    class="status-bar__time-control-slider"
                    onInput={handleSeek}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => {
                        setIsDragging(false);
                        props.jukebox.seek(currentTime());
                    }}
                />
                <span>{formatTime(duration())}</span>
            </div>
            <div class="status-bar__controls">
                {props.isPlaying && (
                    <>
                        {props.isPaused ? (
                            <button
                                onClick={() => props.jukebox.resume()}
                                class="status-bar__button status-bar__button--resume"
                            >
                                Resume
                            </button>
                        ) : (
                            <button
                                onClick={() => props.jukebox.pause()}
                                class="status-bar__button status-bar__button--pause"
                            >
                                Pause
                            </button>
                        )}
                        <button
                            onClick={() => props.jukebox.stop()}
                            class="status-bar__button status-bar__button--stop"
                        >
                            Stop
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
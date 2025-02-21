import { createSignal, createEffect, onCleanup } from "solid-js";
import { Track } from "../object/Track";
import { BaseDock } from "./BaseDock";
import "../styles/components/_debug-dock.scss";

type DebugDockProps = {
    tracks: Track[];
}

export const DebugDock = (props: DebugDockProps) => {
    const [loadedCount, setLoadedCount] = createSignal(0);
    const [startTime] = createSignal(new Date());
    const [elapsedTime, setElapsedTime] = createSignal(0);
    const [loadingTimes, setLoadingTimes] = createSignal<{time: number, count: number}[]>([]);
    const [isComplete, setIsComplete] = createSignal(false);
    const [finalTime, setFinalTime] = createSignal(0);

    // Update loaded count and track loading times
    createEffect(() => {
        const interval = setInterval(() => {
            const currentCount = props.tracks.filter(track => track.isMetadataLoaded).length;
            setLoadedCount(currentCount);
            
            if (!isComplete()) {
                const now = new Date();
                const elapsed = (now.getTime() - startTime().getTime()) / 1000;
                setElapsedTime(elapsed);

                // Add new data point to loading times
                setLoadingTimes(prev => [...prev, { time: elapsed, count: currentCount }]);

                // Check if loading is complete
                if (currentCount === props.tracks.length) {
                    setIsComplete(true);
                    setFinalTime(elapsed);
                    console.log(`[${now.toLocaleTimeString()}] DebugDock: All metadata loaded in ${elapsed.toFixed(2)} seconds`);
                    clearInterval(interval);
                }
            }
        }, 1000);

        onCleanup(() => clearInterval(interval));
    });

    const renderGraph = () => {
        const times = loadingTimes();
        if (times.length === 0) return null;

        const maxCount = props.tracks.length;
        const width = 200;
        const height = 100;
        const points = times.map((point, i) => {
            const x = (point.time / Math.max(isComplete() ? finalTime() : elapsedTime(), 1)) * width;
            const y = height - (point.count / maxCount) * height;
            return `${x},${y}`;
        });

        return (
            <svg width={width} height={height} class="debug-dock__graph">
                <polyline
                    points={points.join(' ')}
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                />
            </svg>
        );
    };

    return (
        <BaseDock 
            name="Debug Information" 
            showName={true} 
            class="debug-dock"
        >
            <div class="debug-dock__stat">
                Metadata Loading: {loadedCount()}/{props.tracks.length}
            </div>
            <div class="debug-dock__stat">
                Time Elapsed: {isComplete() ? finalTime().toFixed(1) : elapsedTime().toFixed(1)}s
            </div>
            {isComplete() && (
                <div class="debug-dock__stat debug-dock__stat--complete">
                    Complete! Total time: {finalTime().toFixed(2)}s
                </div>
            )}
            <div class="debug-dock__graph-container">
                {renderGraph()}
            </div>
        </BaseDock>
    );
}; 
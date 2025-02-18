import { Track } from "./Track";

export class MetadataLoader {
    private static instance: MetadataLoader;
    private queue: Track[] = [];
    private isLoading = false;
    private isPaused = false;
    private currentLoadingPromise: Promise<void> | null = null;

    private constructor() {}

    static getInstance(): MetadataLoader {
        if (!MetadataLoader.instance) {
            MetadataLoader.instance = new MetadataLoader();
        }
        return MetadataLoader.instance;
    }

    prioritize(tracks: Track[]) {
        // Remove these tracks from their current position if they exist
        this.queue = this.queue.filter(t => !tracks.includes(t));
        // Add them to the front of the queue
        this.queue.unshift(...tracks);
        
        // Start loading if not already loading
        this.loadNext();
    }

    addToQueue(tracks: Track[]) {
        // Only add tracks that aren't already in the queue
        const newTracks = tracks.filter(t => !this.queue.includes(t));
        this.queue.push(...newTracks);
        this.loadNext();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.loadNext();
    }

    private async loadNext() {
        if (this.isLoading || this.isPaused || this.queue.length === 0) return;

        this.isLoading = true;
        const track = this.queue.shift()!;

        try {
            this.currentLoadingPromise = track.loadMetadata();
            await this.currentLoadingPromise;
        } catch (error) {
            console.error('Failed to load metadata:', error);
        }

        this.isLoading = false;
        this.currentLoadingPromise = null;
        
        // Continue with next track if not paused
        if (!this.isPaused) {
            this.loadNext();
        }
    }
} 
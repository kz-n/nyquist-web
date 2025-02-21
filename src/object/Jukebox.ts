import {Playlist} from "./Playlist";
import {WebAudioAPI} from "./WebAudioAPI";
import {Track} from "./Track";

export class Jukebox {
    onPlay: (track: Track) => void = () => {};
    onStop: () => void = () => {};
    onPause: () => void = () => {};
    onResume: () => void = () => {};
    onTimeUpdate: (currentTime: number, duration: number) => void = () => {};
    private isPaused: boolean = false;

    constructor(
        public playlist: Playlist,
        private webAudioAPI: WebAudioAPI
    ) {
        this.webAudioAPI.onTimeUpdate = (currentTime, duration) => {
            this.onTimeUpdate(currentTime, duration);
        };

        // Handle track ended with additional checks
        this.webAudioAPI.onEnded = () => {
            const time = new Date().toLocaleTimeString();
            if (this.playlist.nowPlaying) {
                console.log(`[${time}] Queue state - Now playing: ${this.playlist.nowPlaying.fileName}`);
                console.log(`[${time}] Queue state - Queue length: ${this.playlist.queue.length}`);
                console.log(`[${time}] Queue state - Queue tracks: ${this.playlist.queue.map(t => t.fileName).join(', ')}`);
                this.playNext();
            }
        };
    }

    async play(track: Track) {
        const time = new Date().toLocaleTimeString();
        
        // Initialize queue if empty and track isn't in queue
        if (!this.playlist.queue.includes(track)) {
            const currentIndex = this.playlist.tracks.indexOf(track);
            if (currentIndex >= 0) {
                // Add the next 5 tracks (excluding the current track) to the queue
                const nextTracks = this.playlist.tracks
                    .slice(currentIndex + 1, currentIndex + 6)
                    .filter(t => t !== track);
                this.playlist.queue = [track, ...nextTracks];
                this.playlist.onModified();
            }
        }

        console.log(`[${time}] Queue state before play:`);
        console.log(`[${time}] - Now playing: ${this.playlist.nowPlaying?.fileName || 'none'}`);
        console.log(`[${time}] - Queue length: ${this.playlist.queue.length}`);
        console.log(`[${time}] - Queue tracks: ${this.playlist.queue.map(t => t.fileName).join(', ')}`);
        
        // Stop any currently playing track first
        if (this.playlist.nowPlaying && this.playlist.nowPlaying !== track) {
            this.stop();
        }

        // Update playlist state before starting playback
        this.playlist.nowPlaying = track;
        
        try {
            await this.webAudioAPI.play(track.path);
            this.isPaused = false;
            this.onPlay(track);
        } catch (error) {
            console.error(`[${time}] Error playing track:`, error);
            this.stop();
        }
    }

    playNext() {
        const time = new Date().toLocaleTimeString();
        const currentTrack = this.playlist.nowPlaying;
        if (!currentTrack) return;

        // Find the next track in the queue (excluding the current track)
        const nextTrack = this.playlist.queue.find(t => t !== currentTrack);
        
        if (nextTrack) {
            console.log(`[${time}] Playing next track: ${nextTrack.fileName}`);
            
            // Update queue to remove the current track and add a new track at the end if available
            const currentIndex = this.playlist.tracks.indexOf(currentTrack);
            const lastQueueTrack = this.playlist.queue[this.playlist.queue.length - 1];
            const lastQueueIndex = this.playlist.tracks.indexOf(lastQueueTrack);
            
            if (lastQueueIndex < this.playlist.tracks.length - 1) {
                const newTrack = this.playlist.tracks[lastQueueIndex + 1];
                this.playlist.queue = [...this.playlist.queue.filter(t => t !== currentTrack), newTrack];
            } else {
                this.playlist.queue = this.playlist.queue.filter(t => t !== currentTrack);
            }
            
            this.playlist.onModified();
            this.play(nextTrack);
        } else {
            console.log(`[${time}] No more tracks in queue, stopping`);
            this.stop();
        }
    }

    setVolume(volume: number) {
        this.webAudioAPI.setVolume(volume);
    }

    getVolume(): number {
        return this.webAudioAPI.getVolume();
    }

    pause() {
        const time = new Date().toLocaleTimeString();
        if (!this.isPaused) {
            console.log(`[${time}] Jukebox: Pausing playback`);
            this.webAudioAPI.pause();
            this.isPaused = true;
            this.onPause();
        }
    }

    resume() {
        const time = new Date().toLocaleTimeString();
        if (this.isPaused) {
            console.log(`[${time}] Jukebox: Resuming playback`);
            this.webAudioAPI.resume();
            this.isPaused = false;
            this.onResume();
        }
    }

    seek(time: number) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Jukebox: Seeking to ${time} seconds`);
        this.webAudioAPI.seek(time);
    }

    stop() {
        const time = new Date().toLocaleTimeString();
        console.log(`[${time}] Jukebox: Stopping playback`);
        this.webAudioAPI.stop();
        this.isPaused = false;
        this.playlist.nowPlaying = null;  // Clear the currently playing track
        this.onStop();
    }

    getIsPaused(): boolean {
        return this.isPaused;
    }
}
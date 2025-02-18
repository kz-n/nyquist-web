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
    }

    async play(track: Track) {
        const startTime = new Date().toLocaleTimeString();
        console.log(`[${startTime}] Jukebox: Starting playback for track: ${track.fileName}`);
        
        this.playlist.nowPlaying = track;
        const playStartTime = new Date().toLocaleTimeString();
        console.log(`[${playStartTime}] Jukebox: Initiating WebAudioAPI playback`);
        
        await this.webAudioAPI.play(track.path);
        const endTime = new Date().toLocaleTimeString();
        console.log(`[${endTime}] Jukebox: Playback started, calling onPlay callback`);
        
        this.isPaused = false;
        this.onPlay(track);
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
        this.onStop();
    }

    getIsPaused(): boolean {
        return this.isPaused;
    }
}
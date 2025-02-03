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
        this.playlist.nowPlaying = track;
        await this.webAudioAPI.play(track.path);
        this.isPaused = false;
        this.onPlay(track);
    }

    pause() {
        if (!this.isPaused) {
            this.webAudioAPI.pause();
            this.isPaused = true;
            this.onPause();
        }
    }

    resume() {
        if (this.isPaused) {
            this.webAudioAPI.resume();
            this.isPaused = false;
            this.onResume();
        }
    }

    seek(time: number) {
        this.webAudioAPI.seek(time);
    }

    stop() {
        this.webAudioAPI.stop();
        this.isPaused = false;
        this.onStop();
    }

    getIsPaused(): boolean {
        return this.isPaused;
    }
}
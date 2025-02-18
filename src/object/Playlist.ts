import {Track} from "./Track";

export class Playlist {
    onModified: () => void = () => {};

    constructor(
        public tracks: Track[] = [],
        public queue: Track[] = [],
        public nowPlaying: Track | null = null
    ) {}

    addToQueue(track: Track) {
        this.queue.push(track);
        this.onModified();
    }
}
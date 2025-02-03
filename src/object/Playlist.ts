import {Track} from "./Track";

export class Playlist {
    constructor(public tracks: Track[], public nowPlaying: Track) {
    }
}
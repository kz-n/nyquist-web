import { Track } from "./Track";

export class Playlist {
    constructor(public queue: Track[], public playing: Track | null,
         public paused: boolean, public currentDuration: number, 
         public currentTime: number) {
    }
}
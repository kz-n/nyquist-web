export class WebAudioAPI {
    private audioContext: AudioContext;
    private currentSource: AudioBufferSourceNode | null = null;
    private startTime: number = 0;
    private pauseTime: number = 0;
    private currentBuffer: AudioBuffer | null = null;
    private isPaused: boolean = false;
    onTimeUpdate: (currentTime: number, duration: number) => void = () => {};

    constructor() {
        this.audioContext = new AudioContext();
        this.startTimeUpdateInterval();
    }

    private startTimeUpdateInterval() {
        setInterval(() => {
            if (this.currentSource && !this.isPaused) {
                const currentTime = this.getCurrentTime();
                const duration = this.getDuration();
                this.onTimeUpdate(currentTime, duration);
            }
        }, 100); // Update every 100ms
    }

    getCurrentTime(): number {
        if (!this.currentSource || !this.currentBuffer) return 0;
        if (this.isPaused) return this.pauseTime;
        return (this.audioContext.currentTime - this.startTime) % this.currentBuffer.duration;
    }

    getDuration(): number {
        return this.currentBuffer?.duration || 0;
    }

    async createAudioBuffer(this: any, filePath: string) {
        const arrayBuffer = await window.api.getAudioStream(filePath);
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }

    async play(filePath: string) {
        try {
            if (this.currentSource) {
                this.stop();
            }

            const arrayBuffer = await window.api.getAudioStream(filePath);
            this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.startPlayback(0);
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    private startPlayback(offset: number = 0) {
        if (!this.currentBuffer) return;

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.currentBuffer;
        this.currentSource.connect(this.audioContext.destination);
        this.startTime = this.audioContext.currentTime - offset;
        this.currentSource.start(0, offset);
        this.isPaused = false;
    }

    pause() {
        if (this.currentSource && !this.isPaused) {
            this.pauseTime = this.getCurrentTime();
            this.currentSource.stop();
            this.currentSource = null;
            this.isPaused = true;
        }
    }

    resume() {
        if (this.isPaused && this.currentBuffer) {
            this.startPlayback(this.pauseTime);
        }
    }

    seek(time: number) {
        if (!this.currentBuffer) return;
        
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }

        this.startPlayback(time);
    }

    stop() {
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }
        this.currentBuffer = null;
        this.isPaused = false;
        this.pauseTime = 0;
    }

    cleanup() {
        this.stop();
        if (this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}

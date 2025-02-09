export class WebAudioAPI {
    private audioContext: AudioContext;
    private currentSource: AudioBufferSourceNode | null = null;
    private currentBuffer: AudioBuffer | null = null;
    private startTime: number = 0;
    private offset: number = 0;
    private isPaused: boolean = false;
    private analyzerNodes: AnalyserNode[] = [];
    onTimeUpdate: (currentTime: number, duration: number) => void = () => {};
    private timeUpdateInterval: number | null = null;

    constructor() {
        this.audioContext = new AudioContext();
        this.startTimeUpdates();
    }

    private startTimeUpdates() {
        this.timeUpdateInterval = window.setInterval(() => {
            const currentTime = this.getCurrentTime();
            const duration = this.getDuration();
            this.onTimeUpdate(currentTime, duration);
        }, 50);
    }

    public getAudioContext(): AudioContext {
        return this.audioContext;
    }

    getCurrentTime(): number {
        if (!this.currentBuffer) return 0;
        if (this.isPaused) return this.offset;
        if (!this.currentSource) return this.offset;
        
        const elapsed = this.audioContext.currentTime - this.startTime;
        return Math.min(this.offset + elapsed, this.currentBuffer.duration);
    }

    getDuration(): number {
        return this.currentBuffer?.duration || 0;
    }

    async play(filePath: string) {
        try {
            if (this.currentSource) {
                this.stop();
            }

            const uuid = await window.api.depotAdd(filePath, 'path');
            const response = await fetch(`nyquist://depot/${uuid}`);
            const arrayBuffer = await response.arrayBuffer();
            this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.offset = 0;
            this.startPlayback(0);
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    private startPlayback(startOffset: number = 0) {
        if (!this.currentBuffer) return;

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.currentBuffer;

        // Connect to analyzers
        this.analyzerNodes.forEach(analyzer => {
            this.currentSource?.connect(analyzer);
        });

        // Connect to destination
        this.currentSource.connect(this.audioContext.destination);

        this.startTime = this.audioContext.currentTime;
        this.offset = startOffset;
        this.currentSource.start(0, startOffset);
        this.isPaused = false;
    }

    pause() {
        if (this.currentSource && !this.isPaused) {
            this.offset = this.getCurrentTime();
            this.currentSource.stop();
            this.currentSource = null;
            this.isPaused = true;
        }
    }

    resume() {
        if (this.isPaused && this.currentBuffer) {
            this.startPlayback(this.offset);
        }
    }

    seek(time: number) {
        if (!this.currentBuffer) return;
        
        const wasPlaying = !this.isPaused;
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }

        if (wasPlaying) {
            this.startPlayback(time);
        } else {
            this.offset = time;
        }
    }

    stop() {
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }
        this.currentBuffer = null;
        this.isPaused = false;
        this.offset = 0;
    }

    cleanup() {
        if (this.timeUpdateInterval) {
            window.clearInterval(this.timeUpdateInterval);
        }
        this.stop();
        if (this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }

    public connectAnalyzer(analyzer: AnalyserNode) {
        this.analyzerNodes.push(analyzer);
        if (this.currentSource) {
            this.currentSource.connect(analyzer);
        }
    }
}

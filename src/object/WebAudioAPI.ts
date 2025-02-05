export class WebAudioAPI {
    private audioContext: AudioContext;
    private currentSource: AudioBufferSourceNode | null = null;
    private startTime: number = 0;
    private pauseTime: number = 0;
    private currentBuffer: AudioBuffer | null = null;
    private isPaused: boolean = false;
    private analyzerNodes: AnalyserNode[] = [];
    private audioChunks: Uint8Array[] = [];
    private isStreaming: boolean = false;
    onTimeUpdate: (currentTime: number, duration: number) => void = () => {};

    constructor() {
        this.audioContext = new AudioContext();
        this.startTimeUpdateInterval();
    }
    public getAudioContext(): AudioContext {
        return this.audioContext;
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

    private async processAudioChunks() {
        const concatenated = new Uint8Array(this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of this.audioChunks) {
            concatenated.set(chunk, offset);
            offset += chunk.length;
        }
        
        try {
            this.currentBuffer = await this.audioContext.decodeAudioData(concatenated.buffer);
            if (this.isStreaming) {
                this.startPlayback(0);
            }
        } catch (error) {
            console.error('Error decoding audio data:', error);
        }
    }

    async play(filePath: string) {
        try {
            if (this.currentSource) {
                this.stop();
            }

            this.audioChunks = [];
            this.isStreaming = true;

            // Set up chunk listener
            window.api.onAudioChunk(({ chunk, isLastChunk }) => {
                this.audioChunks.push(new Uint8Array(chunk));
                if (isLastChunk) {
                    this.processAudioChunks();
                }
            });

            // Start the stream
            await window.api.getAudioStream(filePath);

        } catch (error) {
            console.error('Error playing audio:', error);
            this.isStreaming = false;
            window.api.removeAudioChunkListener();
        }
    }

    private startPlayback(offset: number = 0) {
        if (!this.currentBuffer) return;

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.currentBuffer;
        
        // Connect to all analyzer nodes first
        this.analyzerNodes.forEach(analyzer => {
            this.currentSource?.connect(analyzer);
        });

        // Then connect to the destination
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
        window.api.removeAudioChunkListener();
        this.isStreaming = false;
        this.audioChunks = [];
        
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

    public connectAnalyzer(analyzer: AnalyserNode) {
        this.analyzerNodes.push(analyzer);
        if (this.currentSource) {
            this.currentSource.connect(analyzer);
        }
    }
}

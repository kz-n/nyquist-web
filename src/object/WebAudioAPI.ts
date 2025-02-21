export class WebAudioAPI {
    private audioContext: AudioContext;
    private currentSource: AudioBufferSourceNode | null = null;
    private currentBuffer: AudioBuffer | null = null;
    private startTime: number = 0;
    private offset: number = 0;
    private isPaused: boolean = false;
    private analyzerNodes: AnalyserNode[] = [];
    private gainNode: GainNode;
    onTimeUpdate: (currentTime: number, duration: number) => void = () => {};
    onEnded: () => void = () => {};
    private timeUpdateInterval: number | null = null;

    constructor() {
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 1.0;  // Default volume
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

    setVolume(volume: number) {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    getVolume(): number {
        return this.gainNode?.gain.value || 1.0;
    }

    async play(filePath: string) {
        try {
            // const startTime = new Date().toLocaleTimeString();
            // console.log(`[${startTime}] WebAudioAPI: Starting audio load for: ${filePath}`);

            // Ensure any existing playback is fully stopped
            this.stop();
            
            // Reset state
            this.currentSource = null;
            this.currentBuffer = null;
            this.offset = 0;
            this.isPaused = false;

            // const depotStartTime = new Date().toLocaleTimeString();
            // console.log(`[${depotStartTime}] WebAudioAPI: Adding file to depot`);
            const uuid = await window.api.depotAdd(filePath, 'path');
            
            // const fetchStartTime = new Date().toLocaleTimeString();
            // console.log(`[${fetchStartTime}] WebAudioAPI: Fetching audio data`);
            const response = await fetch(`nyquist://depot/${uuid}`);
            
            // const decodeStartTime = new Date().toLocaleTimeString();
            // console.log(`[${decodeStartTime}] WebAudioAPI: Decoding audio data`);
            const arrayBuffer = await response.arrayBuffer();
            this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // const playStartTime = new Date().toLocaleTimeString();
            // console.log(`[${playStartTime}] WebAudioAPI: Starting playback`);
            this.startPlayback(0);

            // const endTime = new Date().toLocaleTimeString();
            // console.log(`[${endTime}] WebAudioAPI: Playback successfully started`);
        } catch (error) {
            const errorTime = new Date().toLocaleTimeString();
            console.error(`[${errorTime}] WebAudioAPI: Error playing audio:`, error);
            this.stop();
            throw error;
        }
    }

    private startPlayback(startOffset: number = 0) {
        if (!this.currentBuffer) return;

        // Clean up any existing source
        if (this.currentSource) {
            try {
                this.currentSource.stop();
                this.currentSource.disconnect();
            } catch (error) {
                console.error('Error cleaning up existing source:', error);
            }
        }

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.currentBuffer;

        // Connect to analyzers
        this.analyzerNodes.forEach(analyzer => {
            this.currentSource?.connect(analyzer);
        });

        // Connect to gain node
        this.currentSource.connect(this.gainNode);

        // Set up ended callback with additional checks
        this.currentSource.onended = () => {
            const currentTime = this.getCurrentTime();
            const duration = this.getDuration();
            
            // Only consider it a natural end if we have a valid duration
            if (duration <= 0) {
                console.log(`[${new Date().toLocaleTimeString()}] Invalid duration: ${duration}, ignoring end event`);
                return;
            }

            const isNearEnd = Math.abs(currentTime - duration) < 0.5; // Within 0.5 seconds of the end
            const hasValidTime = currentTime > 0.5; // At least half a second has played

            console.log(`[${new Date().toLocaleTimeString()}] Track end check - Time: ${currentTime.toFixed(2)}/${duration.toFixed(2)}`);
            console.log(`[${new Date().toLocaleTimeString()}] State - Paused: ${this.isPaused}, NearEnd: ${isNearEnd}, ValidTime: ${hasValidTime}`);

            if (!this.isPaused && isNearEnd && hasValidTime) {
                console.log(`[${new Date().toLocaleTimeString()}] ✓ Natural track end`);
                this.onEnded();
            }
        };

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
            try {
                this.currentSource.stop();
                this.currentSource.disconnect();
            } catch (error) {
                console.error('Error stopping current source:', error);
            }
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
        
        // Clean up analyzer nodes
        this.analyzerNodes.forEach(analyzer => {
            try {
                analyzer.disconnect();
            } catch (error) {
                console.error('Error disconnecting analyzer:', error);
            }
        });
        this.analyzerNodes = [];

        // Clean up gain node
        try {
            this.gainNode.disconnect();
        } catch (error) {
            console.error('Error disconnecting gain node:', error);
        }

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

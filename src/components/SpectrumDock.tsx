import { WebAudioAPI } from "../object/WebAudioAPI";
import { createEffect, onCleanup, onMount } from "solid-js";
import "../styles/components/_spectrum-dock.scss";

type SpectrumDockProps = {
    webAudioAPI: WebAudioAPI;
}

export const SpectrumDock = (props: SpectrumDockProps) => {
    let canvasRef: HTMLCanvasElement | undefined;
    const audioContext = props.webAudioAPI.getAudioContext();
    const analyserNode = audioContext.createAnalyser();
    
    // Configure analyzer with higher FFT size for better resolution
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.1;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Connect analyzer to the audio context
    props.webAudioAPI.connectAnalyzer(analyserNode);

    let animationFrameId: number;

    const draw = () => {
        if (!canvasRef) return;

        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match its display size
        canvasRef.width = canvasRef.offsetWidth;
        canvasRef.height = canvasRef.offsetHeight;

        analyserNode.getByteFrequencyData(dataArray);

        // Clear the canvas with semi-transparent black
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

        // Number of bars we want to display
        const numBars = 256;
        const barWidth = canvasRef.width / numBars;

        // Calculate frequencies for logarithmic scale
        const minFreq = 20;  // Hz
        const maxFreq = audioContext.sampleRate / 2;
        const minLog = Math.log10(minFreq);
        const maxLog = Math.log10(maxFreq);

        // Volume scaling factor (lower = more headroom)
        const volumeScale = 2;

        for (let i = 0; i < numBars; i++) {
            // Calculate frequency for this bar using logarithmic scale
            const freq = Math.pow(10, minLog + (i / numBars) * (maxLog - minLog));
            
            // Convert frequency to FFT bin index
            const binIndex = Math.round((freq / maxFreq) * bufferLength);
            
            // Calculate how many bins to average for this frequency range
            const nextFreq = Math.pow(10, minLog + ((i + 1) / numBars) * (maxLog - minLog));
            const nextBinIndex = Math.round((nextFreq / maxFreq) * bufferLength);
            
            // Average the bins
            let sum = 0;
            let count = 0;
            for (let j = binIndex; j < nextBinIndex && j < bufferLength; j++) {
                sum += dataArray[j];
                count++;
            }
            
            let amplitude = count > 0 ? sum / count : 0;
            
            // Apply some frequency-dependent scaling
            const frequencyScaling = Math.pow(i / numBars, 0.3); // Adjust bass response
            amplitude *= (1 + frequencyScaling);

            // Calculate bar height with volume scaling and additional headroom
            const barHeight = Math.min(
                canvasRef.height,
                (amplitude / (255 * volumeScale)) * canvasRef.height
            );

            // Draw bar in white with slight transparency
            ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
            
            // Draw bar with small gap between bars
            const x = i * barWidth;
            ctx.fillRect(x, canvasRef.height - barHeight, barWidth * 0.8, barHeight);
        }

        animationFrameId = requestAnimationFrame(draw);
    };

    onMount(() => {
        if (canvasRef) {
            draw();
        }
    });

    onCleanup(() => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });

    return (
        <div class="spectrum-dock">
            <div class="spectrum-dock__content">
                <canvas 
                    ref={canvasRef} 
                    class="spectrum-dock__canvas"
                />
            </div>
        </div>
    );
}; 
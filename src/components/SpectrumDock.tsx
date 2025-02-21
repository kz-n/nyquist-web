import { WebAudioAPI } from "../object/WebAudioAPI";
import { createEffect, onCleanup, onMount } from "solid-js";
import { BaseDock } from "./BaseDock";
import "../styles/components/_spectrum-dock.scss";

type SpectrumDockProps = {
    webAudioAPI: WebAudioAPI;
}

// Helper function to smooth values
const smoothValues = (values: number[], windowSize: number): number[] => {
    const result = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - windowSize); j <= Math.min(values.length - 1, i + windowSize); j++) {
            sum += values[j];
            count++;
        }
        result[i] = sum / count;
    }
    return result;
};

export const SpectrumDock = (props: SpectrumDockProps) => {
    let canvasRef: HTMLCanvasElement | undefined;
    const audioContext = props.webAudioAPI.getAudioContext();
    const analyserNode = audioContext.createAnalyser();
    
    // Configure analyzer
    analyserNode.fftSize = 8192;  // Increased from 2048 for higher frequency resolution
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

        canvasRef.width = canvasRef.offsetWidth;
        canvasRef.height = canvasRef.offsetHeight;

        analyserNode.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

        // Number of points to plot
        const numPoints = 512;  // Increased from 256 for higher visual resolution
        const pointWidth = canvasRef.width / (numPoints - 1);

        // Frequency range configuration
        const minFreq = 20;  // Hz
        const maxFreq = audioContext.sampleRate / 2;
        const minLog = Math.log10(minFreq);
        const maxLog = Math.log10(maxFreq);

        // Collect amplitude data for each point
        const amplitudes = new Array(numPoints + 4);  // Add extra points for smooth ends
        
        // Add two zero points at the start
        amplitudes[0] = 0;
        amplitudes[1] = 0;
        
        // Fill the main frequency data
        for (let i = 0; i < numPoints; i++) {
            // Use a modified logarithmic scale that gives more weight to lower frequencies
            const t = i / numPoints;
            const exp = minLog + (Math.pow(t, 0.8) * (maxLog - minLog));  // Adjusted power for better low-end distribution
            const freq = Math.pow(10, exp);
            const binIndex = Math.round((freq / maxFreq) * bufferLength);
            
            // Get the amplitude for this frequency
            amplitudes[i + 2] = binIndex < bufferLength ? dataArray[binIndex] : 0;
        }
        
        // Add two zero points at the end
        amplitudes[numPoints + 2] = 0;
        amplitudes[numPoints + 3] = 0;

        // Apply smoothing with larger window for lower frequencies
        const smoothedAmplitudes = smoothValues(amplitudes, 2);  // Reduced smoothing window to preserve detail

        // Create path for the line
        ctx.beginPath();
        ctx.moveTo(0, canvasRef.height);

        // Calculate the width for each point including the extra points
        const totalPoints = numPoints + 4;
        const adjustedPointWidth = canvasRef.width / (numPoints + 1);  // +1 to account for proper spacing

        // Draw the spectrum using quadratic curves for smoother appearance
        for (let i = 0; i < totalPoints; i++) {
            const amplitude = smoothedAmplitudes[i];
            // Scale down the amplitude to prevent clipping (using 0.7 instead of 1.0)
            const pointHeight = Math.min(
                canvasRef.height,
                (amplitude / 255) * canvasRef.height * 0.7
            );

            // Adjust x position to account for extra points
            const x = Math.max(0, Math.min(canvasRef.width, (i - 1) * adjustedPointWidth));
            const y = canvasRef.height - pointHeight;

            if (i === 0) {
                ctx.moveTo(x, canvasRef.height);
            } else {
                // Use quadratic curves for smoother lines
                const prevX = Math.max(0, Math.min(canvasRef.width, (i - 2) * adjustedPointWidth));
                const prevY = canvasRef.height - Math.min(
                    canvasRef.height,
                    (smoothedAmplitudes[i - 1] / 255) * canvasRef.height * 0.7
                );
                const cpX = (prevX + x) / 2;
                ctx.quadraticCurveTo(cpX, prevY, x, y);
            }
        }

        // Complete the path to create a filled shape
        ctx.lineTo(canvasRef.width, canvasRef.height);

        // Create gradient for fill
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        // Fill the area under the line
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw the line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

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
        <BaseDock 
            name="Spectrum Analyzer" 
            showName={false} 
            class="spectrum-dock"
        >
            <canvas 
                ref={canvasRef} 
                class="spectrum-dock__canvas"
            />
        </BaseDock>
    );
}; 
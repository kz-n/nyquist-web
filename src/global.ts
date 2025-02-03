// global.d.ts
export {};

declare global {
    interface Window {
        api: {
            getMusic: (param: string) => Promise<string[]>;
            getAudioStream(param: string): Promise<ReadableStream>;
        };
    }
}
import { createSignal, Accessor, Setter } from "solid-js";

interface MusicMetadata {
    common?: {
        title?: string;
        artist?: string;
        album?: string;
        picture?: Array<{
            data: Uint8Array;
            format: string;
        }>;
    };
}

export interface TrackMetadata {
    title?: string;
    artist?: string;
    album?: string;
    albumArtUUID?: string;
}

export class Track {
    private fullMetadataPromise: Promise<MusicMetadata | null> | null = null;
    private _fileName: string;
    private _defaultMetadata: TrackMetadata;
    private _cachedBasicMetadata: TrackMetadata | null = null;
    private _cachedAlbumArtUUID: string | undefined;
    private _metadataLoaded: Accessor<boolean>;
    private _setMetadataLoaded: Setter<boolean>;

    constructor(public path: string) {
        if (!path || path.trim() === '') {
            throw new Error('Track path cannot be empty');
        }
        this._fileName = path.split('\\').pop() || path;
        this._defaultMetadata = {
            title: this._fileName,
            artist: 'Unknown Artist',
            album: 'Unknown Album'
        };
        [this._metadataLoaded, this._setMetadataLoaded] = createSignal(false);
    }

    async loadMetadata(): Promise<void> {
        if (this.fullMetadataPromise) return;

        const startTime = new Date().toLocaleTimeString();
        console.log(`[${startTime}] Track: Loading full metadata for: ${this.path}`);
        
        this.fullMetadataPromise = (async () => {
            try {
                const metadata = await window.api.getMusicMetadata(this.path) as MusicMetadata;
                const endTime = new Date().toLocaleTimeString();
                console.log(`[${endTime}] Track: Loaded full metadata for: ${this.path}`);
                this._setMetadataLoaded(true);
                return metadata;
            } catch (error) {
                console.error(`[${new Date().toLocaleTimeString()}] Track: Failed to load metadata:`, error);
                return null;
            }
        })();

        await this.fullMetadataPromise;
    }

    get fileName(): string {
        return this._fileName;
    }

    get isMetadataLoaded(): boolean {
        return this._metadataLoaded();
    }

    async getBasicMetadata(): Promise<TrackMetadata> {
        // Return cached basic metadata if available
        if (this._cachedBasicMetadata) {
            return this._cachedBasicMetadata;
        }

        // Return default metadata if metadata hasn't been loaded yet
        if (!this.fullMetadataPromise) {
            return this._defaultMetadata;
        }

        const metadata = await this.fullMetadataPromise;
        this._cachedBasicMetadata = {
            title: metadata?.common?.title || this._fileName,
            artist: metadata?.common?.artist || 'Unknown Artist',
            album: metadata?.common?.album || 'Unknown Album'
        };

        return this._cachedBasicMetadata;
    }

    async getMetadata(): Promise<TrackMetadata> {
        // Get basic metadata
        const basicMetadata = await this.getBasicMetadata();

        // If we already have the album art UUID cached, return the complete metadata
        if (this._cachedAlbumArtUUID !== undefined) {
            return {
                ...basicMetadata,
                albumArtUUID: this._cachedAlbumArtUUID
            };
        }

        // Return basic metadata without album art if metadata hasn't been loaded yet
        if (!this.fullMetadataPromise) {
            return basicMetadata;
        }

        // Load album art if needed
        const metadata = await this.fullMetadataPromise;
        if (metadata?.common?.picture?.[0]) {
            try {
                const imageData = metadata.common.picture[0];
                this._cachedAlbumArtUUID = await window.api.depotAdd({
                    data: Array.from(imageData.data),
                    format: imageData.format
                }, 'blob');
            } catch (error) {
                console.error(`[${new Date().toLocaleTimeString()}] Track: Failed to load album art:`, error);
                this._cachedAlbumArtUUID = undefined;
            }
        } else {
            this._cachedAlbumArtUUID = undefined;
        }

        return {
            ...basicMetadata,
            albumArtUUID: this._cachedAlbumArtUUID
        };
    }
}
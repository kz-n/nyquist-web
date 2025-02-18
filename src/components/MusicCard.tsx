import {createSignal, createEffect} from "solid-js";
import { Jukebox } from "../object/Jukebox";
import { Track, TrackMetadata } from "../object/Track";

type MusicCardProps = {
    track: Track;
    jukebox: Jukebox;
    onPlay?: () => void;
}

export const MusicCard = (props: MusicCardProps) => {
    const [metadata, setMetadata] = createSignal<TrackMetadata>({
        title: props.track.fileName,
        artist: 'Loading...',
        album: 'Loading...'
    });

    // Create an effect that updates metadata when it's loaded
    createEffect(async () => {
        const time = new Date().toLocaleTimeString();
        
        // Check if metadata is loaded
        if (props.track.isMetadataLoaded) {
            console.log(`[${time}] MusicCard: Metadata loaded for track: ${props.track.fileName}, updating display`);
            const currentMetadata = await props.track.getMetadata();
            setMetadata(currentMetadata);
        } else {
            console.log(`[${time}] MusicCard: Waiting for metadata to load for track: ${props.track.fileName}`);
        }
    });

    const handleClick = () => {
        const time = new Date().toLocaleTimeString();
        console.log(`[${time}] MusicCard: Click detected, initiating playback for track: ${props.track.fileName}`);
        props.onPlay?.();
        props.jukebox.play(props.track);
    };

    return <div class="music-card" onClick={handleClick}>
        <div 
            class="music-card__background"
            style={{
                "background-image": metadata().albumArtUUID ? `url(nyquist://depot/${metadata().albumArtUUID})` : 'none',
                "background-size": "cover",
                "background-position": "center"
            }}
        >
            <div class="music-card__info">
                <div class="music-card__title">
                    {metadata().title}
                </div>
                <div class="music-card__artist">
                    {metadata().artist}
                </div>
            </div>
        </div>
    </div>
}
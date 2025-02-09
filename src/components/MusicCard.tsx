import {createSignal, onMount, onCleanup} from "solid-js";
import { Jukebox } from "../object/Jukebox";

type MusicCardProps = {
    artist: string;
    title: string;
    picture: string;
    jukebox: Jukebox;
}

export const MusicCard = (props: MusicCardProps) => {
    const [albumArtUUID, setAlbumArtUUID] = createSignal<string>("");
    let cardRef: HTMLDivElement | undefined;

    const loadAlbumArt = async () => {
        try {
            const metadata = await window.api.getMusicMetadata(props.picture);
            if (metadata?.common?.picture?.[0]) {
                const imageData = metadata.common.picture[0];
                const uuid = await window.api.depotAdd({
                    data: Array.from(imageData.data),
                    format: imageData.format
                }, 'blob');
                setAlbumArtUUID(uuid);
            }
        } catch (error) {
            console.error('Failed to load album art:', error);
        }
    };

    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !albumArtUUID()) {
                        loadAlbumArt();
                    }
                });
            },
            { rootMargin: '50px' }
        );

        if (cardRef) {
            observer.observe(cardRef);
        }

        onCleanup(() => {
            if (cardRef) {
                observer.unobserve(cardRef);
            }
            observer.disconnect();
        });
    });

    const handleClick = () => {
        props.jukebox.play({ path: props.picture });
    };

    return <div class="music-card" ref={cardRef} onClick={handleClick}>
        <div 
            class="music-card__background"
            style={{
                "background-image": albumArtUUID() ? `url(nyquist://depot/${albumArtUUID()})` : 'none',
                "background-size": "cover",
                "background-position": "center"
            }}
        >
            <div class="music-card__title">
                {props.title}
            </div>
        </div>
    </div>
}
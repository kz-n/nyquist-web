import { Component, createEffect, createSignal } from 'solid-js';
import { Track } from '../object/Track';
import '../styles/components/_queue-compact-card.scss';

type QueueCompactCardProps = {
    track: Track;
    isNowPlaying?: boolean;
    onClick?: () => void;
}

export const QueueCompactCard: Component<QueueCompactCardProps> = (props) => {
    const [metadata, setMetadata] = createSignal<any>(null);
    const [albumArtUrl, setAlbumArtUrl] = createSignal<string>('');

    createEffect(async () => {
        try {
            const meta = await window.api.getMusicMetadata(props.track.path);
            setMetadata(meta);

            if (meta?.common?.picture?.[0]) {
                const imageData = meta.common.picture[0];
                const uuid = await window.api.depotAdd({
                    data: Array.from(imageData.data),
                    format: imageData.format
                }, 'blob');
                setAlbumArtUrl(`nyquist://depot/${uuid}`);
            }
        } catch (error) {
            console.error('Failed to load metadata:', error);
        }
    });

    return (
        <div 
            class={`queue-compact-card ${props.isNowPlaying ? 'queue-compact-card--now-playing' : ''}`}
            onClick={props.onClick}
        >
            <div class={`queue-compact-card__art ${props.isNowPlaying ? 'queue-compact-card__art--now-playing' : ''}`}>
                {albumArtUrl() ? (
                    <img src={albumArtUrl()} alt="Album art" />
                ) : (
                    <div class="queue-compact-card__art-placeholder">
                        🎵
                    </div>
                )}
            </div>
            <div class="queue-compact-card__info">
                <span class="queue-compact-card__title">
                    {metadata()?.common?.title || props.track.path.split('\\').pop()}
                </span>
                <span class="queue-compact-card__artist">
                    {metadata()?.common?.artist || 'Unknown Artist'}
                </span>
            </div>
        </div>
    );
}; 
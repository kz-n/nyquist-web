import { Component, createEffect, createSignal } from 'solid-js';
import { Track } from '../object/Track';
import { Jukebox } from '../object/Jukebox';
import '../styles/components/_music-compact-card.scss';

type MusicCompactCardProps = {
    track: Track;
    jukebox: Jukebox;
    onPlay: () => void;
}

export const MusicCompactCard: Component<MusicCompactCardProps> = (props) => {
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

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleClick = async () => {
        props.onPlay();
        await props.jukebox.play(props.track);
    };

    return (
        <div class="music-compact-card" onClick={handleClick}>
            <div class="music-compact-card__art">
                {albumArtUrl() ? (
                    <img src={albumArtUrl()} alt="Album art" />
                ) : (
                    <div class="music-compact-card__art-placeholder">
                        🎵
                    </div>
                )}
            </div>
            <div class="music-compact-card__info">
                <span class="music-compact-card__title">
                    {metadata()?.common?.title || props.track.path.split('\\').pop()}
                </span>
                <div class="music-compact-card__details">
                    <span class="music-compact-card__artist">
                        {metadata()?.common?.artist || 'Unknown Artist'}
                    </span>
                    {/*<span class="music-compact-card__album">*/}
                    {/*    {metadata()?.common?.album || 'Unknown Album'}*/}
                    {/*</span>*/}
                    {/*<div class="music-compact-card__secondary">*/}
                    {/*    <span class="music-compact-card__genre">*/}
                    {/*        {metadata()?.common?.genre?.[0] || ''}*/}
                    {/*    </span>*/}
                    {/*    <span class="music-compact-card__year">*/}
                    {/*        {metadata()?.common?.year || ''}*/}
                    {/*    </span>*/}
                    {/*    <span class="music-compact-card__duration">*/}
                    {/*        {metadata()?.format?.duration ? formatDuration(metadata().format.duration) : ''}*/}
                    {/*    </span>*/}
                    {/*</div>*/}
                </div>
            </div>
            <button class="music-compact-card__play-button">
                ▶
            </button>
        </div>
    );
}; 
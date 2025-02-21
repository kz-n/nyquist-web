import {createResource, createSignal, onCleanup, Show, createEffect} from 'solid-js';
import {Playlist} from "../object/Playlist";
import {WebAudioAPI} from "../object/WebAudioAPI";
import {Track} from "../object/Track";
import {Jukebox} from "../object/Jukebox";
import {StatusBar} from "./StatusBar";
import {QueueComponent} from "./QueueComponent";
import {SpectrumAnalyzer} from "./SpectrumAnalyzer";
import "../styles/main.scss";
import {FloatingDock} from "./FloatingDock";
import {SpectrumDock} from "./SpectrumDock";
import {DebugDock} from "./DebugDock";
import {AppLayout} from "./AppLayout";
import { QueueDock } from "./QueueDock";

export const AudioRoot = () => {
    const [playlist] = createSignal(new Playlist([], [], null));
    const [webAudioAPI] = createSignal(new WebAudioAPI());
    const [jukeboxState, setJukeboxState] = createSignal({
        jukebox: new Jukebox(playlist(), webAudioAPI()),
        currentTrack: null as Track | null,
        isPlaying: false,
        isPaused: false
    });

    const fetchMusic = async () => {
        try {
            const response = await window.api.getMusic("asd");
            console.log('Fetched music files:', response);
            
            // Clear existing tracks
            playlist().tracks = [];
            
            // Add tracks to library but not to queue
            response.forEach((path: string) => {
                if (path && path.trim() !== '') {
                    try {
                        const track = new Track(path);
                        playlist().tracks.push(track);
                    } catch (error) {
                        console.error('Failed to create track for path:', path, error);
                    }
                }
            });

            const jukebox = jukeboxState().jukebox;
            
            jukebox.onPlay = (track: Track) => {
                // When a track starts playing, add the next few tracks to the queue
                const currentIndex = playlist().tracks.indexOf(track);
                if (currentIndex >= 0) {
                    // Add the next 5 tracks (or remaining tracks if less) to the queue
                    const nextTracks = playlist().tracks.slice(currentIndex + 1, currentIndex + 6);
                    playlist().queue = [track, ...nextTracks];
                    playlist().onModified();
                }

                setJukeboxState(prev => ({
                    ...prev,
                    currentTrack: track,
                    isPlaying: true,
                    isPaused: false
                }));
            };

            jukebox.onPause = () => {
                setJukeboxState(prev => ({
                    ...prev,
                    isPaused: true
                }));
            };

            jukebox.onResume = () => {
                setJukeboxState(prev => ({
                    ...prev,
                    isPaused: false
                }));
            };

            jukebox.onStop = () => {
                setJukeboxState(prev => ({
                    ...prev,
                    isPlaying: false,
                    isPaused: false
                }));
            };

            return response;
        } catch (error) {
            console.error('Failed to fetch music:', error);
            return [];
        }
    };

    const [musicData] = createResource(fetchMusic);

    onCleanup(() => {
        webAudioAPI().cleanup();
    });
    const [depot] = createResource(() => window.api.getDepot());
    const [depotUUID, setDepotUUID] = createSignal<string>("");
    
    createEffect(() => {
        if (!depot.loading && depot()) {
            window.api.depotAdd("D:\\nicotine\\downloads\\01 - 4Me.flac")
                .then((uuid) => setDepotUUID(uuid));
        }
    });

    return (
        <Show when={!musicData.loading} fallback={<div>Loading...</div>}>
            <div class={"master-container"}>
                <FloatingDock
                    currentTrack={jukeboxState().currentTrack}
                    isPlaying={jukeboxState().isPlaying}
                    isPaused={jukeboxState().isPaused}
                    jukebox={jukeboxState().jukebox}
                />
                <SpectrumDock webAudioAPI={webAudioAPI()} />
                <QueueDock jukebox={jukeboxState().jukebox} />
                <DebugDock tracks={playlist().tracks} />
                <AppLayout jukebox={jukeboxState().jukebox} />
            </div>

            {/*<audio */}
            {/*    style={{ display: "block", width: "300px" }}*/}
            {/*    controls*/}
            {/*    src={depotUUID() ? "nyquist://depot/" + depotUUID() : ""}*/}
            {/*/>*/}
            {/*<div>*/}
            {/*    <StatusBar */}
            {/*        currentTrack={jukeboxState().currentTrack} */}
            {/*        isPlaying={jukeboxState().isPlaying}*/}
            {/*        isPaused={jukeboxState().isPaused}*/}
            {/*        jukebox={jukeboxState().jukebox}*/}
            {/*    />*/}
            {/*    <SpectrumAnalyzer webAudioAPI={webAudioAPI()}></SpectrumAnalyzer>*/}
            {/*    <QueueComponent jukebox={jukeboxState().jukebox}></QueueComponent>*/}

            {/*    <MusicList jukebox={jukeboxState().jukebox} />*/}
            {/*</div>*/}
        </Show>
    );
};

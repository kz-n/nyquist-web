import {createResource, createSignal, onCleanup, Show} from 'solid-js';
import {Playlist} from "../object/Playlist";
import {MusicList} from "./MusicList";
import {WebAudioAPI} from "../object/WebAudioAPI";
import {Track} from "../object/Track";
import {Jukebox} from "../object/Jukebox";
import {StatusBar} from "./StatusBar";
import {QueueComponent} from "./QueueComponent";
import {SpectrumAnalyzer} from "./SpectrumAnalyzer";

export const AudioRoot = () => {
    const [playlist] = createSignal(new Playlist([], [], new Track("")));
    const [webAudioAPI] = createSignal(new WebAudioAPI());
    const [jukeboxState, setJukeboxState] = createSignal({
        jukebox: new Jukebox(playlist(), webAudioAPI()),
        currentTrack: null as Track | null,
        isPlaying: false,
        isPaused: false
    });

    const fetchMusic = async () => {
        const response = await window.api.getMusic("asd");
        response.forEach((item: string) => playlist().tracks.push(new Track(item)));
        const jukebox = jukeboxState().jukebox;
        
        jukebox.onPlay = (track: Track) => {
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
    };

    const [musicData] = createResource(fetchMusic);

    onCleanup(() => {
        webAudioAPI().cleanup();
    });

    return (
        <Show when={!musicData.loading} fallback={<div>Loading...</div>}>
            <div>
                <StatusBar 
                    currentTrack={jukeboxState().currentTrack} 
                    isPlaying={jukeboxState().isPlaying}
                    isPaused={jukeboxState().isPaused}
                    jukebox={jukeboxState().jukebox}
                />
                <SpectrumAnalyzer webAudioAPI={webAudioAPI()}></SpectrumAnalyzer>
                <QueueComponent jukebox={jukeboxState().jukebox}></QueueComponent>

                <MusicList jukebox={jukeboxState().jukebox} />
            </div>
        </Show>
    );
};

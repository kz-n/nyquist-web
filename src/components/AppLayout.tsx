import { Component, createSignal, Show } from 'solid-js';
import { MenuBar } from './MenuBar';
import { CardList } from './CardList';
import { Jukebox } from '../object/Jukebox';

type AppLayoutProps = {
    jukebox: Jukebox;
}

export const AppLayout: Component<AppLayoutProps> = (props) => {
    const [activeSection, setActiveSection] = createSignal('library');

    return (
        <div class="app-layout">
            <MenuBar 
                activeSection={activeSection()} 
                onSectionChange={setActiveSection} 
            />
            <div class="content-area">
                <Show when={activeSection() === 'library'}>
                    <CardList jukebox={props.jukebox} />
                </Show>
                <Show when={activeSection() === 'playlists'}>
                    <div class="placeholder">Playlists section coming soon</div>
                </Show>
                <Show when={activeSection() === 'settings'}>
                    <div class="placeholder">Settings section coming soon</div>
                </Show>
            </div>
        </div>
    );
}; 
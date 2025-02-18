import { Component } from 'solid-js';
import '../styles/components/_menu-bar.scss';

export type MenuSection = {
    id: string;
    label: string;
    icon: string;
}

type MenuBarProps = {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export const MenuBar: Component<MenuBarProps> = (props) => {
    const sections: MenuSection[] = [
        { id: 'library', label: 'Library', icon: '📚' },
        { id: 'playlists', label: 'Playlists', icon: '🎵' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    return (
        <div class="menu-bar">
            <nav class="menu-bar__nav">
                {sections.map(section => (
                    <button
                        class={`menu-bar__item ${section.id === props.activeSection ? 'menu-bar__item--active' : ''}`}
                        onClick={() => props.onSectionChange(section.id)}
                    >
                        <span class="menu-bar__icon">{section.icon}</span>
                        <span class="menu-bar__label">{section.label}</span>
                    </button>
                ))}
            </nav>
            <div class="menu-bar__logo">
                <h1 class="nyq-logo"><i>Nyquist</i></h1>
            </div>
        </div>
    );
}; 
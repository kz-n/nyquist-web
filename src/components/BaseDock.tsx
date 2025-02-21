import { ParentComponent, createSignal, Show } from 'solid-js';
import '../styles/components/_base-dock.scss';

export type BaseDockProps = {
    name: string;
    showName?: boolean;
    defaultVisible?: boolean;
    class?: string;
};

export const BaseDock: ParentComponent<BaseDockProps> = (props) => {
    const [isExpanded, setIsExpanded] = createSignal(props.defaultVisible ?? true);
    const [isHovered, setIsHovered] = createSignal(false);

    return (
        <div 
            class={`base-dock ${props.class || ''} ${isExpanded() ? 'base-dock--expanded' : 'base-dock--collapsed'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Show when={isExpanded()}>
                <div class="base-dock__content">
                    <Show when={props.showName || isHovered()}>
                        <div class="base-dock__header">
                            <div class="base-dock__title">{props.name}</div>
                            <button 
                                class="base-dock__toggle"
                                onClick={() => setIsExpanded(false)}
                                title="Collapse"
                            >
                                −
                            </button>
                        </div>
                    </Show>
                    {props.children}
                </div>
            </Show>
            <Show when={!isExpanded()}>
                <button 
                    class="base-dock__expand-button"
                    onClick={() => setIsExpanded(true)}
                    title={props.name}
                >
                    <span class="base-dock__expand-icon">+</span>
                </button>
            </Show>
        </div>
    );
}; 
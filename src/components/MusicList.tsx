import {For} from "solid-js";
import {Jukebox} from "../object/Jukebox";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./shad/Card";

type MusicListProps = {
    jukebox: Jukebox;
}

export const MusicList = (props: MusicListProps) => {
    return (
        <div class="music-list">
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card>
            <For each={props.jukebox.playlist.tracks}>
                {(item) => (
                    <button
                        onClick={() => props.jukebox.play(item)}
                        class="music-list__button"
                    >
                        {item.path.split('\\').pop()}
                    </button>
                )}
            </For>
        </div>
    );
};
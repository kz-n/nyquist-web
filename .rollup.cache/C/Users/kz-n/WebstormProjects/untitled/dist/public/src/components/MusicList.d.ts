import React, { Dispatch, SetStateAction } from "react";
interface MusicListProps {
    music: Dispatch<SetStateAction<string>>;
}
export declare function MusicList({ music }: MusicListProps): React.JSX.Element;
export {};

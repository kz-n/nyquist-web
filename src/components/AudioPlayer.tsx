import React, { useState } from 'react';
import { MusicList } from './MusicList';
import { Track } from '../object/Track';

export function AudioPlayer() {

    const [music, setMusic] = useState<string>('');
    return <div>
        <audio src={music} controls />
        <MusicList music={setMusic} />
    </div>;
} 
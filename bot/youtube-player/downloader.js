import path from 'path';
import url from 'url';

import youtubedl from 'youtube-dl-exec';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadAudio = async (url) => {  
    const dl = await youtubedl(url, {
        extractAudio: true, 
        audioFormat: 'mp3',
        audioQuality: 0,
        output: __dirname + '/files/%(id)s.%(ext)s',
        ffmpegLocation: 'C:/ffmpeg/bin',
        preferFfmpeg: true,
        printJson: true        
    });
    return { 
        url: dl.original_url,
        id: dl.display_id,
        title: dl.fulltitle,
        duration: dl.duration_string,
        path: path.resolve(__dirname, `./files/${dl.display_id}.mp3`).replace(/\\/g, '\\\\'),
        thumbnail: dl.thumbnail
    };
};

export { 
    downloadAudio
}
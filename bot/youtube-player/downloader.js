import path from 'path';
import url from 'url';

import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath('C:/ffmpeg/bin/ffmpeg.exe')

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeAudio = async (input, output) => {
    console.log('normalize', input, output);
    return new Promise( (resolve, reject) => { 
        ffmpeg(input)
            .audioFilters('loudnorm=I=-16:LRA=11:TP=-1.5')
            .output(output)
            .on('end', () => resolve(output))
            .on('error', err => reject(err))
            .run();
    });
};

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

    const filePath = path.resolve(__dirname, `./files/${dl.display_id}.mp3`).replace(/\\/g, '\\\\');
    const outputPath = path.resolve(__dirname, `./files/${dl.display_id}_norm.mp3`).replace(/\\/g, '\\\\');
    await normalizeAudio(filePath, outputPath);

    return { 
        url: dl.original_url,
        id: dl.display_id,
        title: dl.fulltitle,
        duration: dl.duration_string,
        path: outputPath,
        thumbnail: dl.thumbnail
    };
};

export { 
    downloadAudio
}
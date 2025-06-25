import path from 'path';
import url from 'url';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath('C:/ffmpeg/bin/ffmpeg.exe')


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSoundOpts = (name) => {
    const folderPath = path.resolve(__dirname, name).replace(/\\/g, '\\\\');
    return fs.readdirSync(folderPath)
};

export const getSoundPath = (name, sound) => { 
    const soundPath = path.resolve(__dirname, name, sound).replace(/\\/g, '\\\\');
    return soundPath;
};

const normalizeAudio = async (input, output) => {
    return new Promise( (resolve, reject) => { 
        ffmpeg(input)
            .audioFilters('loudnorm=I=-10:LRA=11:TP=-1.5')
            .output(output)
            .on('end', () => resolve(output))
            .on('error', err => reject(err))
            .run();
    });
};

export const normalizeSounds = async () => {
     
    const folders = ['Brand', 'Jar', 'Jesh', 'John', 'Lee', 'Tim', 'Ty'];
    for (const folder of folders) { 
        const folderPath = path.resolve(__dirname, '../', 'soundboard - Copy', folder);
        const files = fs.readdirSync(folderPath);
        for (const file of files) { 
            const input = path.resolve(folderPath, file);
            const output = path.resolve(__dirname, folder, file);
            console.log(input, output);
            await normalizeAudio(input, output);
        }
    }

};
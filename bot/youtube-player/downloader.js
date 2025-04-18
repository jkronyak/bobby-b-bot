import fs from 'fs'
import path from 'path';
import url from 'url';

import ytdl from '@distube/ytdl-core';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadAudio = async (url) => {
    const isValid = ytdl.validateURL(url);
    if (!isValid) {
        throw new Error('Invalid URL');
    }
    const dl = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' });
    const details = (await ytdl.getInfo(url)).videoDetails;
    const filePath = path.resolve(__dirname, `./files/${details.videoId}.mp3`).replace(/\\/g, '\\\\');;
    const writeStream = fs.createWriteStream(filePath);
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            resolve({
                path: filePath,
                details: details
            });
        });
        writeStream.on('error', (err) => {
            reject(err);
        });
        dl.pipe(writeStream);
    });

}

export { 
    downloadAudio
};
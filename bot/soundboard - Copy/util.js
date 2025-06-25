import path from 'path';
import url from 'url';
import fs from 'fs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSoundOpts = (name) => {
    const folderPath = path.resolve(__dirname, name).replace(/\\/g, '\\\\');
    return fs.readdirSync(folderPath)
};

export const getSoundPath = (name, sound) => { 
    const soundPath = path.resolve(__dirname, name, sound).replace(/\\/g, '\\\\');
    return soundPath;
}
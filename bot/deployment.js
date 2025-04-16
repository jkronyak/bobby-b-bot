import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

import dotenv from 'dotenv';
dotenv.config();

const token = process.env.BOT_TOKEN;
const clientId = process.env.BOT_APP_ID;
const acePlaceGuildId = process.env.BOT_AP_GUILD_ID;
const futureWorldLeadersGuildId = process.env.BOT_FWL_GUILD_ID;

const rest = new REST().setToken(token);

const commands = [];

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandFolderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFolderPath);
for (const folder of commandFolders) {
    const folderPath = path.join(commandFolderPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) { 
        const filePath = path.join(folderPath, file);
        const { default: cmd } = await import(`file://${path.resolve(filePath)}`);
        commands.push(cmd.data.toJSON());
    }
}

await rest.put(
    Routes.applicationCommands(clientId, futureWorldLeadersGuildId),
    { body: commands }
);

await rest.put(
    Routes.applicationCommands(clientId, acePlaceGuildId),
    { body: commands }
);

import { Client, Collection, GatewayIntentBits }  from 'discord.js';
import fs from 'fs';
import url from 'url';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.BOT_TOKEN;
const args = process.argv.slice(2);

const client = new Client({intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    ...(args.includes('--invisible') ? { presence: { status: 'invisible' } } : {})
});

client.commands = new Collection();

const commandFolderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFolderPath);
for (const folder of commandFolders) {
    const folderPath = path.join(commandFolderPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) { 
        const filePath = path.join(folderPath, file);
        const { default: cmd } = await import(`file://${path.resolve(filePath)}`);
        client.commands.set(cmd.data.name, cmd);
    }
}

const eventFolderPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventFolderPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) { 
    const filePath = path.join(eventFolderPath, file);
    const { default: event } = await import(`file://${path.resolve(filePath)}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));
}

await client.login(token);
console.log('Successfully logged in.');
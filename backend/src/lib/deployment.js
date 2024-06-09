import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import help from './commands/util/help.js';
import join from './commands/join/join.js';
import leave from './commands/leave/leave.js';
import play from './commands/play/play.js';
import sound from './commands/sound/sound.js';

const token = process.env.BOT_TOKEN;
const clientId = process.env.BOT_APP_ID;
const acePlaceGuildId = process.env.BOT_AP_GUILD_ID;
const futureWorldLeadersGuildId = process.env.BOT_FWL_GUILD_ID;

const rest = new REST().setToken(token);

const commands = [
    help.data.toJSON(), 
    join.data.toJSON(),
    leave.data.toJSON(),
    play.data.toJSON(),
    sound.data.toJSON(),
];

// const resp = await rest.put(
//     Routes.applicationCommands(clientId, acePlaceGuildId),
//     { body: commands }
// );

await rest.put(
    Routes.applicationCommands(clientId, futureWorldLeadersGuildId),
    { body: commands }
);

// await rest.put(
//     Routes.applicationCommands(clientId),
//     { body: commands }
// );
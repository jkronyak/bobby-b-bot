import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import help from './commands/util/help.js';
import join from './commands/join/join.js';
import leave from './commands/leave/leave.js';
import play from './commands/play/play.js';
import sound from './commands/sound/sound.js';
import pause from './commands/pause/pause.js';
import unpause from './commands/unpause/unpause.js';
import stop from './commands/stop/stop.js';
import queue from './commands/queue/queue.js';


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
    pause.data.toJSON(),
    unpause.data.toJSON(),
    stop.data.toJSON(),
    queue.data.toJSON()

];

await rest.put(
    Routes.applicationCommands(clientId, futureWorldLeadersGuildId),
    { body: commands }
);

await rest.put(
    Routes.applicationCommands(clientId, acePlaceGuildId),
    { body: commands }
);

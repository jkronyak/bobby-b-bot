import { Client, Collection, Events, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder }  from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import help from './commands/util/help.js';
import join from './commands/join/join.js';
import leave from './commands/leave/leave.js';
import play from './commands/play/play.js';
import pause from './commands/pause/pause.js';
import unpause from './commands/unpause/unpause.js';
import sound from './commands/sound/sound.js';
import stop from './commands/stop/stop.js';
import queue from './commands/queue/queue.js';

import { getRandomQuote } from '../util/util.js';

const token = process.env.BOT_TOKEN;

const client = new Client({intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]});

client.commands = new Collection();

client.commands.set(help.data.name, help);
client.commands.set(join.data.name, join);
client.commands.set(leave.data.name, leave);
client.commands.set(play.data.name, play);
client.commands.set(sound.data.name, sound);
client.commands.set(pause.data.name, pause);
client.commands.set(unpause.data.name, unpause);
client.commands.set(stop.data.name, stop);
client.commands.set(queue.data.name, queue);

client.on(Events.MessageCreate, async interaction => { 
    if(interaction.author.bot) return;

    const content = interaction.content.toLowerCase().trim();
    if(content.includes('booby b') || content.includes('boobyb')) { 
        interaction.channel.send('THANK THE GODS FOR BESSIE AND HER TITS!');
    }
    if(content.includes('bobby b')
     || content.includes('bobbyb')
     || interaction.mentions.users.some(user => user.id === client.user.id)
    ) { 
        interaction.channel.send(getRandomQuote());
    }

});

client.on(Events.InteractionCreate, async interaction => {

	if(interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
    
        if(!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch(error) {
            console.error(error);
            if(interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    } else if(interaction.isStringSelectMenu()) { 
        if(interaction.customId === 'name-select') {

            const nameSelect = interaction.message.components[0].components[0];
            nameSelect.options.forEach(opt => {
                opt.default = opt.value === interaction.values[0];
            })
            console.log(nameSelect);

            const soundSelect = new StringSelectMenuBuilder()
                .setCustomId('sound-select')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setLabel('s1')
                    .setDescription('s1')
                    .setValue('s1')
                )
        
            const row = new ActionRowBuilder()
                .addComponents(soundSelect)
            await interaction.update({
                content: interaction.values[0],
                components: [
                    ...interaction.message.components, row
                ]
            })
        } else if(interaction.customId === "sound-select") {
            const nameSelect = interaction.message.components[0].components[0];
            nameSelect.options.forEach(opt => {
                opt.default = opt.value === interaction.values[0];
            })
            await interaction.reply("lol");
        }
    }

});


client.login(token);
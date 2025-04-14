import { Client, Collection, Events, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder }  from 'discord.js';
import fs from 'fs';
import url from 'url';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { getRandomQuote } from './util/util.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.BOT_TOKEN;

const client = new Client({intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]});

client.commands = new Collection();

const folderPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(folderPath);
for (const file of commandFiles) {
    const curPath = path.join(folderPath, file);
    const { default: cmd } = await import(`file://${path.resolve(curPath)}`);
    client.commands.set(cmd.data.name, cmd);
}

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

await client.login(token);
console.log('Successfully logged in.');
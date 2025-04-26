import { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import audioQueue from '../lib/AudioQueue.js';
import { getVoiceConnection } from '@discordjs/voice';

export default {
    name: Events.InteractionCreate, 
    async execute(interaction) { 
        if (interaction.isChatInputCommand()) { 
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) { 
                return console.log(`No command matching found: ${interaction.commandName}`);
            }

            try { 
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error while executing this command: ${error}`)
                if (interaction.replied || interaction.deferred) { 
                    await interaction.followUp({ content: 'Error while executing this command!', emphemeral: true });
                } else { 
                    await interaction.reply({ content: 'Error while executing this command!', emphemeral: true });
                }
            }
        } else if (interaction.isStringSelectMenu()) { 
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
        } else if (interaction.isButton()) { 
            if (interaction.customId === 'pause-btn') {
                const { guildId } = interaction.member.voice.channel;
                const connection = getVoiceConnection(guildId);
                if(!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
                }

                audioQueue.pause(guildId);
                const { message } = interaction;
                const newBtn = new ButtonBuilder()
                    .setCustomId('unpause-btn')
                    .setLabel('Resume')
                    .setStyle(ButtonStyle.Primary);

                const updatedComps = message.components.map(row => {
                    const newRow = new ActionRowBuilder();
                    const newRowComps = row.components.map(comp => comp.customId === 'pause-btn' ? newBtn : ButtonBuilder.from(comp));
                    return newRow.addComponents(newRowComps);
                });

                await interaction.update({ embeds: [...message.embeds], components: updatedComps});
            } else if (interaction.customId === 'unpause-btn') { 
                const { guildId } = interaction.member.voice.channel;
                const connection = getVoiceConnection(guildId);
                if(!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
                }

                audioQueue.unpause(guildId);
                const { message } = interaction;
                const newBtn = new ButtonBuilder()
                    .setCustomId('pause-btn')
                    .setLabel('Pause')
                    .setStyle(ButtonStyle.Primary);
                    const updatedComps = message.components.map(row => {
                        const newRow = new ActionRowBuilder();
                        const newRowComps = row.components.map(comp => comp.customId === 'unpause-btn' ? newBtn : ButtonBuilder.from(comp));
                        return newRow.addComponents(newRowComps);
                    });
                await interaction.update({ embeds: [...message.embeds], components: updatedComps});
            } else if (interaction.customId === 'skip-btn') { 
                const { guildId } = interaction.member.voice.channel;
                const connection = getVoiceConnection(guildId);
                if(!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
                }
                audioQueue.skip(guildId);
                return await interaction.reply('Skipping...');

            } else if (interaction.customId === 'stop-btn') {
                const { guildId } = interaction.member.voice.channel;
                const connection = getVoiceConnection(guildId);
                if(!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
                }
                audioQueue.stop(guildId);
                return await interaction.reply('Stopping...');

            } else if (interaction.customId === 'repeat-btn') { 
                const { guildId } = interaction.member.voice.channel;
                const connection = getVoiceConnection(guildId);
                if(!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
                }
                return await interaction.reply('Not implemented yet...');
            }
        }
    }
}
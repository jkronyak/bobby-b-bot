import { 
    Events, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    EmbedBuilder
} from 'discord.js';
import audioQueue from '../lib/AudioQueue.js';
import { createAudioPlayer, createAudioResource, getVoiceConnection } from '@discordjs/voice';
import { getSoundOpts, getSoundPath } from '../soundboard/util.js';

const numPerPage = 25;

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
                let selectedName = interaction.values[0];
                let selectedSound = null;
                
                interaction.message.components.forEach(row => {
                    row.components.filter(comp => comp.customId === 'sound-select').forEach(comp => selectedSound = comp.placeholder);
                });
                const soundOpts = getSoundOpts(selectedName);
                const numPages = Math.ceil(soundOpts.length / numPerPage);

                const soundSelect = new StringSelectMenuBuilder()
                    .setCustomId('sound-select')
                    .addOptions(soundOpts.slice(0, Math.min(soundOpts.length, numPerPage)).map((o) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(o)
                            .setValue(o)
                    ));

                const { message } = interaction;
                const updatedComps = [];
                message.components.forEach(row => { 
                    const newRow = new ActionRowBuilder();
                    const newRowComps = row.components.filter(comp => comp.customId !== 'sb-play-btn').map(comp => {
                        if (comp.customId === 'sound-select') return soundSelect;
                        else if (comp.customId === 'name-select') return StringSelectMenuBuilder.from(comp).setPlaceholder(selectedName || '');
                        else return StringSelectMenuBuilder.from(comp);
                    });
                    if (newRowComps.length > 0) updatedComps.push(newRow.addComponents(newRowComps));
                });
                if (updatedComps.length === 1) {
                    const soundRow = new ActionRowBuilder();
                    soundRow.addComponents(soundSelect);
                    updatedComps.push(soundRow);
                }
                if (numPages > 1) {
                    const pageRow = new ActionRowBuilder();
                    const nextBtn = new ButtonBuilder()
                        .setCustomId('sb-next:1')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary);
                    pageRow.addComponents(nextBtn);
                    updatedComps.push(pageRow);
                }
                await interaction.update({ embeds: [...message.embeds], components: updatedComps});
            } else if(interaction.customId === "sound-select") {
                let selectedName = null;
                let selectedSound = interaction.values[0];
                
                interaction.message.components.forEach(row => {
                    row.components.filter(comp => comp.customId === 'name-select').forEach(comp => selectedName = comp.placeholder);
                });
                const { message } = interaction;
                const updatedComps = [];
                message.components.forEach(row => {
                    const newRow = new ActionRowBuilder();
                    const newRowComps = row.components.filter(comp => comp.customId !== 'sb-play-btn').map(comp => {
                        if (comp.customId === 'sound-select') return StringSelectMenuBuilder.from(comp).setPlaceholder(selectedSound || '');
                        else if (comp.customId === 'name-select') return StringSelectMenuBuilder.from(comp).setPlaceholder(selectedName || '');
                        else if (comp.customId.startsWith('sb-next') || comp.customId.startsWith('sb-prev')) return ButtonBuilder.from(comp);
                        else return StringSelectMenuBuilder.from(comp);
                    });
                    if (newRowComps.length > 0) updatedComps.push(newRow.addComponents(newRowComps));
                });
                const playBtn = new ButtonBuilder()
                    .setCustomId('sb-play-btn')
                    .setLabel('Play')
                    .setStyle(ButtonStyle.Primary);
                updatedComps.push(new ActionRowBuilder().addComponents(playBtn));
                await interaction.update({ embeds: [...message.embeds], components: updatedComps});
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
                if (!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
                } 
                const session = audioQueue.getSession(guildId);
                audioQueue.repeat(guildId);
                const { message } = interaction;
                const newBtn = new ButtonBuilder()
                    .setCustomId('repeat-btn')
                    .setLabel(session.repeatFlag ? 'Repeat Off' : 'Repeat On')
                    .setStyle(ButtonStyle.Primary);

                const updatedComps = message.components.map(row => {
                    const newRow = new ActionRowBuilder();
                    const newRowComps = row.components.map(comp => comp.customId === 'repeat-btn' ? newBtn : ButtonBuilder.from(comp));
                    return newRow.addComponents(newRowComps);
                });
                await interaction.update({ embeds: [...message.embeds], components: updatedComps});
            } else if (interaction.customId === 'queue-btn') { 
                const { guildId } = interaction.member.voice.channel;
                const connection = getVoiceConnection(guildId);
                if (!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
                }
                    const embeds = audioQueue.getQueue(interaction.guild.id).map((item, idx) => 
                    new EmbedBuilder()
                        .setTitle(`[${idx}]`)
                        .setDescription(`[${item.title}](${item.url})\n(${item.duration})`)
                        .setThumbnail(item.thumbnail)
                );

                const reply = embeds.length > 0 ? { embeds } : "NOTHING YOU FUCKING IDIOT";
                await interaction.reply(reply);
            } else if (interaction.customId === 'sb-play-btn') {
                const { guildId } = interaction.member.voice.channel;
                const connection = getVoiceConnection(guildId);
                if(!connection) { 
                    return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true });
                }
                let selectedName = null;
                let selectedSound = null;
                
                interaction.message.components.forEach(row => {
                    row.components.forEach(comp => {
                        if (comp.customId === 'name-select') {
                            selectedName = comp.placeholder;
                        } else if (comp.customId === 'sound-select') {
                            selectedSound = comp.placeholder;
                        }
                    });
                });
                if (!selectedName || !selectedSound) return await interaction.reply({ content: `Error playing sound: '${selectedName}' - '${selectedSound}'`, ephemeral: true});

                const soundPath = getSoundPath(selectedName, selectedSound);
                const player = createAudioPlayer();
                const resource = createAudioResource(soundPath);
                player.play(resource);
                connection.subscribe(player);
                await interaction.update({ content: '' });
            } else if (interaction.customId.startsWith('sb-next') || interaction.customId.startsWith('sb-prev')) {
                const [action, pageStr] = interaction.customId.split(':');
                const targetPage = parseInt(pageStr);

                let selectedName = null;
                interaction.message.components.forEach(row => { 
                    row.components.forEach(comp => {
                        if (comp.customId === 'name-select') selectedName = comp.placeholder;
                    })
                });
                const soundOpts = getSoundOpts(selectedName);
                const numPages = Math.ceil(soundOpts.length / numPerPage);
                const start = numPerPage * targetPage;
                const end = Math.min(start + numPerPage, soundOpts.length);
                const paginatedOpts = soundOpts.slice(start, end);
                const soundSelect = new StringSelectMenuBuilder()
                    .setCustomId('sound-select')
                    .addOptions(paginatedOpts.map((o) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(o)
                            .setValue(o)
                    ));
                const { message } = interaction;
                const updatedComps = [];
                message.components.forEach(row => {
                    const newRow = new ActionRowBuilder();
                    const newRowComps = row.components
                        .filter(comp => comp.customId === 'name-select')
                        .map(comp => {
                            if (comp.customId === 'name-select') return StringSelectMenuBuilder.from(comp).setPlaceholder(selectedName || '');
                            return StringSelectMenuBuilder.from(comp);
                        });
                    if (newRowComps.length > 0) updatedComps.push(newRow.addComponents(newRowComps));
                });
                updatedComps.push(new ActionRowBuilder().addComponents(soundSelect));

                const pageRow = new ActionRowBuilder();
                if (targetPage > 0) pageRow.addComponents(new ButtonBuilder().setCustomId(`sb-prev:${targetPage-1}`).setLabel('Prev').setStyle(ButtonStyle.Primary));
                if (numPages - 1 > targetPage) pageRow.addComponents(new ButtonBuilder().setCustomId(`sb-next:${targetPage+1}`).setLabel('Next').setStyle(ButtonStyle.Primary));
                if (pageRow.components.length > 0) updatedComps.push(pageRow);

                await interaction.update({ embeds: [...message.embeds], components: updatedComps});
            } else { 
                console.log('Not found: ', interaction.customId);
            }
        }
    }
}
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';

import audioQueue from '../../lib/AudioQueue.js';
import { downloadAudio } from '../../youtube-player/downloader.js';
import { secondsToTime } from '../../util/util.js';

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays audio from a Youtube video!')
    .addStringOption( option => 
        option.setName('url')
            .setDescription('The Youtube URL to play')
            .setRequired(true)
    );

const execute = async (interaction) => {

    await interaction.deferReply();

    const { channel } = interaction.member.voice;
    if (!channel) { 
        return await interaction.followUp('You need to be in a voice channel to use this command!');
    }

    const guildId = interaction.guildId;
    let connection = getVoiceConnection(guildId);
    
    if (!connection) { 
        joinVoiceChannel({ 
            channelId: channel.id, 
            guildId: channel.guild.id, 
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        connection = getVoiceConnection(guildId);
    }

    const inputUrl = interaction.options.getString('url').trim();
    let songData;
    try { 
        songData = await downloadAudio(inputUrl);
    } catch (error) { 
        console.log(error);
        return await interaction.followUp({ content: `Error downloading audio. ${JSON.stringify(e)}`, ephemeral: true });
    }

    audioQueue.initGuildSession(guildId, connection);
    audioQueue.initPlayer(guildId, interaction.channel);
    const author = { displayName: interaction.member.displayName, photo: interaction.user.displayAvatarURL() };
    const pos = audioQueue.enqueue(guildId, songData, author);
    if(pos === 0) {
        const { repeatFlag } = audioQueue.getSession(guildId);
        const embed = new EmbedBuilder()
            .setTitle('Now playing...')
            .setDescription(`[${songData.title}](${songData.url})\n(${songData.duration})`)
            .setThumbnail(songData.thumbnail)
            .setAuthor({ name: author.displayName, iconURL: author.photo });
        
        const pauseBtn = new ButtonBuilder()
            .setCustomId('pause-btn')
            .setLabel('Pause')
            .setStyle(ButtonStyle.Primary);
        
        const skipBtn = new ButtonBuilder()
            .setCustomId('skip-btn')
            .setLabel('Skip')
            .setStyle(ButtonStyle.Secondary);
        
        const stopBtn = new ButtonBuilder()
            .setCustomId('stop-btn')
            .setLabel('Stop')
            .setStyle(ButtonStyle.Danger);

        const repeatBtn = new ButtonBuilder()
            .setCustomId('repeat-btn')
            .setLabel(repeatFlag ? 'Repeat Off' : 'Repeat On')
            .setStyle(ButtonStyle.Primary);

        const queueBtn = new ButtonBuilder()
            .setCustomId('queue-btn')
            .setLabel('View Queue')
            .setStyle(ButtonStyle.Primary);
        
        const row = new ActionRowBuilder().addComponents(pauseBtn, skipBtn, stopBtn, repeatBtn, queueBtn);
        const sentMessage = await interaction.channel.send({embeds: [embed], components: [row]});
        audioQueue.play(guildId, sentMessage);
    } 
    const queueEmbed = new EmbedBuilder()
        .setDescription(`Added to queue position [${pos}]: [${songData.title}](${songData.url})`)
    await interaction.followUp({embeds: [queueEmbed]});
}

export default {
    data, 
    execute
};
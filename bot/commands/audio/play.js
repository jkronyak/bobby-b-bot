import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';

import audioQueue from '../../lib/AudioQueue.js';
import { downloadAudio } from '../../youtube-player/downloader.js';
import { secondsToTime } from '../../util/util.js';

export const songQueue = [];

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays audio from a Youtube video!')
    .addStringOption( option => 
        option.setName('url')
            .setDescription('The Youtube URL to play')
            .setRequired(true)
    );

const execute = async (interaction) => {

    await interaction.deferReply({ ephemeral: true });

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
    let audioData;
    try { 
        audioData = await downloadAudio(inputUrl);
    } catch (error) { 
        console.log(error);
        return await interaction.followUp({ content: `Error downloading audio. ${JSON.stringify(e)}`, ephemeral: true });
    }

    // const resource = createAudioResource(audioData.path);
    const path = audioData.path;
    audioQueue.initGuildSession(guildId, connection);
    audioQueue.initPlayer(guildId, interaction.channel);

    const pos = audioQueue.enqueue(guildId, path, audioData.details, interaction.member.displayName);
    if(pos === 0) {
        audioQueue.play(guildId);
        const embed = new EmbedBuilder()
            .setTitle('Now playing...')
            .setDescription(`[${audioData.details.title}](${audioData.details.video_url})\n(${secondsToTime(audioData.details.lengthSeconds)})`)
            .setThumbnail(audioData.details.thumbnails[audioData.details.thumbnails.length-1].url);
        await interaction.channel.send({embeds: [embed]});
    }
    await interaction.followUp({
        content: `Added to queue.\n[${audioData.details.title}](<${audioData.details.video_url}>)`, 
        ephemeral: true 
    });
}

export default {
    data, 
    execute
};
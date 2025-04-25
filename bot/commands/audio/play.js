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
    let songData;
    try { 
        songData = await downloadAudio(inputUrl);
    } catch (error) { 
        console.log(error);
        return await interaction.followUp({ content: `Error downloading audio. ${JSON.stringify(e)}`, ephemeral: true });
    }

    // const resource = createAudioResource(audioData.path);
    audioQueue.initGuildSession(guildId, connection);
    audioQueue.initPlayer(guildId, interaction.channel);

    const pos = audioQueue.enqueue(guildId, songData, interaction.member.displayName);
    if(pos === 0) {
        audioQueue.play(guildId);
        const embed = new EmbedBuilder()
            .setTitle('Now playing...')
            .setDescription(`[${songData.title}](${songData.url})\n(${songData.duration})`)
            .setThumbnail(songData.thumbnail);
        await interaction.channel.send({embeds: [embed]});
    }
    await interaction.followUp({
        content: `Added to queue.\n[${songData.title}](<${songData.url}>)`, 
        ephemeral: true 
    });
}

export default {
    data, 
    execute
};
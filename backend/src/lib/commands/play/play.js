import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createAudioPlayer, createAudioResource, getVoiceConnection } from '@discordjs/voice';

import { downloadAudio } from '../../youtube-player/downloader.js';

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays audio from a Youtube video!')
    .addStringOption( option => 
        option.setName('url')
            .setDescription('The Youtube URL to play')
    );

const execute = async (interaction) => {

    await interaction.deferReply();
    const inputUrl = interaction.options.getString('url');
    const { path: filePath, details: videoDetails } = await downloadAudio(inputUrl);
    console.log(filePath, videoDetails)
    const connection = getVoiceConnection(interaction.member.voice.channel.guildId);
    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);
    player.play(resource);
    connection.subscribe(player);

    player.on('stateChange', (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
     });

    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        player.play(getNextResource());
    });
    const embed = new EmbedBuilder()
        .setTitle('Now playing...')
        .setDescription(`[${videoDetails.title}](${videoDetails.video_url})`)
        .setThumbnail(videoDetails.thumbnails[videoDetails.thumbnails.length-1].url);
    await interaction.followUp({embeds: [embed]});
}

export default {
    data, 
    execute
};
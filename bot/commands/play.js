import fs from 'fs';
import url from 'url';
import path from 'path';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createAudioPlayer, createAudioResource, getVoiceConnection } from '@discordjs/voice';

import { downloadAudio } from '../youtube-player/downloader.js';

import { secondsToTime } from '../util/util.js';

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
    console.log("songQueue", songQueue);

    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const connection = getVoiceConnection(guildId);
    if(!connection) { 
        return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
    }
    const inputUrl = interaction.options.getString('url').trim();
    let filePath;
    let videoDetails;
    try {
        const audio = await downloadAudio(inputUrl);
        filePath = audio.path;
        videoDetails = audio.details;
    } catch (e) { 
        console.log(e);
        return await interaction.followUp({ content: `Error downloading audio. ${JSON.stringify(e)}`, ephemeral: true });
    }
    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);

    songQueue.push({
        resource: resource, 
        videoDetails: videoDetails,
        user: interaction.member.displayName
    });

    if(songQueue.length === 1) { 
        player.play(resource);
        connection.subscribe(player);
        const embed = new EmbedBuilder()
            .setTitle('Now playing...')
            .setDescription(`[${videoDetails.title}](${videoDetails.video_url})\n(${secondsToTime(videoDetails.lengthSeconds)})`)
            .setThumbnail(videoDetails.thumbnails[videoDetails.thumbnails.length-1].url);
        await interaction.channel.send({embeds: [embed]})
    }

    // player.play(resource);

    player.on('stateChange', async (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        if(newState.status === 'idle') {
            const prev = songQueue.shift();
            const filePath = path.resolve(__dirname, `../youtube-player/files/${prev.videoDetails.videoId}.mp3`).replace(/\\/g, '\\\\');;
            if(songQueue.length > 0) { 
                const cur = songQueue[0];
                player.play(cur.resource);
                connection.subscribe(player);
                const embed = new EmbedBuilder()
                    .setTitle('Now playing...')
                    .setDescription(`[${cur.videoDetails.title}](${cur.videoDetails.video_url})\n(${secondsToTime(cur.videoDetails.lengthSeconds)})`)
                    .setThumbnail(cur.videoDetails.thumbnails[cur.videoDetails.thumbnails.length-1].url);
                await interaction.channel.send({embeds: [embed]})
            }
            try {
                fs.unlinkSync(filePath);
            } catch (e) { 
                console.log(e);
            }
        }
     });

    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
    });

    await interaction.followUp({ content: `Added to queue.\n[${videoDetails.title}](<${videoDetails.video_url}>)`, ephemeral: true });
}

export default {
    data, 
    execute
};
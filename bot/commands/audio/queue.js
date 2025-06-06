import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import audioQueue from '../../lib/AudioQueue.js';
import { secondsToTime } from '../../util/util.js';

const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the queue!');

const execute = async (interaction) => {
    // Create an array of embeds
    const embeds = audioQueue.getQueue(interaction.guild.id).map((item, idx) => 
        new EmbedBuilder()
            .setTitle(`[${idx+1}]`)
            .setDescription(`**[${item.videoDetails.title}](${item.videoDetails.video_url})**\n(${secondsToTime(item.videoDetails.lengthSeconds)})`)
            .setThumbnail(item.videoDetails.thumbnails[item.videoDetails.thumbnails.length - 1].url)
    );

    const reply = embeds.length > 0 ? { embeds } : "NOTHING YOU FUCKING IDIOT";
    await interaction.reply(reply);
};

export default {
    data,
    execute,
};

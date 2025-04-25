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
            .setTitle(`[${idx}]`)
            .setDescription(`[${item.title}](${item.url})\n(${item.duration})`)
            .setThumbnail(item.thumbnail)
    );

    const reply = embeds.length > 0 ? { embeds } : "NOTHING YOU FUCKING IDIOT";
    await interaction.reply(reply);
};

export default {
    data,
    execute,
};

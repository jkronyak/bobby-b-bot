import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import audioQueue from '../../lib/AudioQueue.js';
import { secondsToTime } from '../../util/util.js';

const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current song!');

const execute = async (interaction) => {
    const queue = audioQueue.getQueue(interaction.guild.id);
    if (queue.length > 0) { 
        audioQueue.skip(interaction.guild.id);
        return await interaction.reply('Skipping...');
    }
    return await interaction.reply('Nothing is in the queue to skip!');
};

export default {
    data,
    execute,
};

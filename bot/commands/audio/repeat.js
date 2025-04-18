import { SlashCommandBuilder } from '@discordjs/builders';
import audioQueue from '../../lib/AudioQueue.js';

const data = new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Repeats the current song!');

const execute = async (interaction) => {
    const { queue, repeatFlag } = audioQueue.getSession(interaction.guild.id);
    if (queue.length > 0) { 
        audioQueue.repeat(interaction.guild.id);
        return await interaction.reply(repeatFlag ? 'Repeat disabled...' : 'Repeat enabled...');
    }
    return await interaction.reply('Nothing is in the queue to repeat!');
};

export default {
    data,
    execute,
};

import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import audioQueue from '../../lib/AudioQueue.js';

const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses audio from a Youtube video!');

const execute = async (interaction) => { 

    const { guildId } = interaction.member.voice.channel;
    const connection = getVoiceConnection(guildId);
    if(!connection) { 
        return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
    }

    audioQueue.pause(guildId);
    await interaction.reply('Paused...');
};

export default { 
    data,
    execute
}
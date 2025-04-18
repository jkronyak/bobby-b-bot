import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import audioQueue from '../../lib/AudioQueue.js';

const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the audio player!');

const execute = async (interaction) => { 
    
    const { guildId } = interaction.member.voice.channel;
    const connection = getVoiceConnection(guildId);
    if(!connection) { 
        return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
    }
    
    audioQueue.stop(guildId);
    await interaction.reply('Stopping...');
};

export default { 
    data,
    execute
}
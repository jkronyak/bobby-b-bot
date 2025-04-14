import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';


const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the audio player!');

const execute = async (interaction) => { 
    
    const connection = getVoiceConnection(interaction.member.voice.channel.guildId);
    if(!connection) { 
        return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
    }

    connection.state.subscription.player.stop();
    await interaction.reply('Stopping...');
};

export default { 
    data,
    execute
}
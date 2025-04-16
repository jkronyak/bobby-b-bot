import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';


const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses audio from a Youtube video!');

const execute = async (interaction) => { 
    
    const connection = getVoiceConnection(interaction.member.voice.channel.guildId);
    if(!connection) { 
        return await interaction.reply({ content: 'Not in a voice channel!', ephemeral: true })
    }

    connection.state.subscription.player.pause();
    await interaction.reply('Paused...');
};

export default { 
    data,
    execute
}
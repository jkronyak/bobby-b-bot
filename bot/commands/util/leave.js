import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';

import { getRandomQuote } from '../../util/util.js';


const data = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Bobby B leaves the voice channel.');

const execute = async (interaction) => {
    const channel = interaction.member.voice.channel;
    if(!channel) { 
        return await interaction.reply('You need to be in a voice channel to use this command!');
    }
    const connection = getVoiceConnection(channel.guild.id);
    connection.destroy();
    await interaction.reply({content: getRandomQuote(), ephemeral: true});
}

export default {
    data, 
    execute
};
import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';

import { getRandomQuote } from '../util/util.js';


const data = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Bobby B joins the voice channel.');

const execute = async (interaction) => {
    const channel = interaction.member.voice.channel;
    if(!channel) { 
        return await interaction.reply('You need to be in a voice channel to use this command!');
    }
    joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    await interaction.reply({content: getRandomQuote(), ephemeral: true});
}

export default {
    data, 
    execute
};
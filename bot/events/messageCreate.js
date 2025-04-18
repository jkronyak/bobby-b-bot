import { Events } from 'discord.js';
import { getRandomQuote } from '../util/util.js';

export default {
    name: Events.MessageCreate, 
    async execute(interaction) { 
        if (interaction.author.bot) return;
        const content = interaction.content.toLowerCase().trim();
        if (content.includes('booby b') || content.includes('boobyb')) {
            return interaction.channel.send('THANK THE GODS FOR BESSIE AND HER TITS!');
        }

        const hasKeyword = interaction.mentions.users
            .some(u => u.id === interaction.client.user.id) || 
            content.includes('bobby b') ||
            content.includes('bobbyb');

        if (hasKeyword) { 
            return interaction.channel.send(getRandomQuote());
        }
    }
}
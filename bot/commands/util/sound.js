import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

const opts = ['Brand', 'Jar', 'Jesh', 'John', 'Lee', 'Tim', 'Ty'];
const formattedOpts = opts.map((o) => { 
    return { 
        name: o, value: o
    }
})

const data = new SlashCommandBuilder()
    .setName('sound')
    .setDescription('Plays some audio!');

const execute  = async (interaction) => {
    const nameSelect = new StringSelectMenuBuilder()
        .setCustomId('name-select')
        .addOptions(opts.map((o) => 
            new StringSelectMenuOptionBuilder()
                .setLabel(o)
                .setValue(o)
        ));

    const row = new ActionRowBuilder().addComponents(nameSelect);

    await interaction.reply({
        content: "ree",
        components: [row]
    });
}

export default {
    data, 
    execute
};
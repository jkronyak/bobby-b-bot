import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

const opts = ['Brand', 'Jar', 'Jesh', 'John', 'Lee', 'Tim', 'Ty'];
const formattedOpts = opts.map((o) => { 
    return { 
        name: o, value: o
    }
})

const data = new SlashCommandBuilder()
    .setName('sound')
    .setDescription('Plays some audio!')
    .addStringOption( option =>  
        option.setName('group')
            .setDescription('The soundboard group')
            .setRequired(true)
            .addChoices(...formattedOpts)
    );

const execute  = async (interaction) => {
    // const strChoice = interaction.options.getString("group");
    // console.log(strChoice);
    const nameSelect = new StringSelectMenuBuilder()
        .setCustomId('name-select')
        .addOptions(opts.map((o) => 
            new StringSelectMenuOptionBuilder()
                .setLabel(o)
                .setDescription(o)
                .setValue(o)
        ))

    const row = new ActionRowBuilder()
        .addComponents(nameSelect)

    await interaction.reply({
        content: "ree",
        components: [row]
    });
}

export default {
    data, 
    execute
};
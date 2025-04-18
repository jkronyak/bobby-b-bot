import { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';

export default {
    name: Events.InteractionCreate, 
    async execute(interaction) { 
        if (interaction.isChatInputCommand()) { 
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) { 
                return console.log(`No command matching found: ${interaction.commandName}`);
            }

            try { 
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error while executing this command: ${error}`)
                if (interaction.replied || interaction.deferred) { 
                    await interaction.followUp({ content: 'Error while executing this command!', emphemeral: true });
                } else { 
                    await interaction.reply({ content: 'Error while executing this command!', emphemeral: true });
                }
            }
        } else if(interaction.isStringSelectMenu()) { 
            if(interaction.customId === 'name-select') {
    
                const nameSelect = interaction.message.components[0].components[0];
                nameSelect.options.forEach(opt => {
                    opt.default = opt.value === interaction.values[0];
                })
                console.log(nameSelect);
    
                const soundSelect = new StringSelectMenuBuilder()
                    .setCustomId('sound-select')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                        .setLabel('s1')
                        .setDescription('s1')
                        .setValue('s1')
                    )
            
                const row = new ActionRowBuilder()
                    .addComponents(soundSelect)
                await interaction.update({
                    content: interaction.values[0],
                    components: [
                        ...interaction.message.components, row
                    ]
                })
            } else if(interaction.customId === "sound-select") {
                const nameSelect = interaction.message.components[0].components[0];
                nameSelect.options.forEach(opt => {
                    opt.default = opt.value === interaction.values[0];
                })
                await interaction.reply("lol");
            }
        }
    }
}
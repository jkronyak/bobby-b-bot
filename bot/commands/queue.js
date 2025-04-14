// import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
// import { songQueue } from '../play/play.js';

// import { secondsToTime } from '../../../util/util.js';


// const data = new SlashCommandBuilder()
//     .setName('queue')
//     .setDescription('Displays the queue!');

// const execute = async (interaction) => {

//     const embed = new EmbedBuilder().setTitle("Song queue");
    
//     songQueue.forEach((item, idx) => {
//         embed.addFields([
//             {
//                 name: `[${idx+1}] ${idx === 0 ? "Now playing" : ""}`,
//                 value: `**[${item.videoDetails.title}](${item.videoDetails.video_url})**
//                 (${secondsToTime(item.videoDetails.lengthSeconds)})
//                 [Thumbnail](${item.videoDetails.thumbnails[item.videoDetails.thumbnails.length-1].url})`,
//             }
//         ])
//     })

//     await interaction.reply({ embeds: [embed] })
// }

// export default {
//     data, 
//     execute
// };

import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { songQueue } from './play.js';
import { secondsToTime } from '../util/util.js';

const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the queue!');

const execute = async (interaction) => {
    // Create an array of embeds
    const embeds = songQueue.map((item, idx) => 
        new EmbedBuilder()
            .setTitle(`[${idx+1}]`)
            .setDescription(`**[${item.videoDetails.title}](${item.videoDetails.video_url})**\n(${secondsToTime(item.videoDetails.lengthSeconds)})`)
            .setThumbnail(item.videoDetails.thumbnails[item.videoDetails.thumbnails.length - 1].url)
    );

    const reply = embeds.length > 0 ? { embeds } : "NOTHING YOU FUCKING IDIOT";
    await interaction.reply(reply);
};

export default {
    data,
    execute,
};

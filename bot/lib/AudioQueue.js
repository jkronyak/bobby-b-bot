import { EmbedBuilder } from "@discordjs/builders";
import { createAudioPlayer } from "@discordjs/voice";

import { secondsToTime } from "../util/util.js";

class AudioQueue { 
     
    constructor() { 
        this.sessions = new Map();
    }

    initPlayer(guildId, channel) {
        const { queue, connection, player } = this.sessions.get(guildId);
        if (!player) { 
            const newPlayer = createAudioPlayer();
            this.sessions.set(guildId, { 
                queue,
                connection, 
                player: newPlayer
            });
            connection.subscribe(newPlayer);

            newPlayer.on('stateChange', async (oldState, newState) => { 
                console.log(`Player in guild ${guildId} transitioned from ${oldState.status} to ${newState.status}`);
                if (newState.status === 'idle') { 
                    const prev = queue.shift();
                    if (queue.length > 0) { 
                        const cur = queue[0];
                        newPlayer.play(cur.resource);
                        const embed = new EmbedBuilder()
                            .setTitle('Now playing...')
                            .setDescription(`[${cur.videoDetails.title}](${cur.videoDetails.video_url})\n(${secondsToTime(cur.videoDetails.lengthSeconds)})`)
                            .setThumbnail(cur.videoDetails.thumbnails[cur.videoDetails.thumbnails.length-1].url);
                        await channel.send({embeds: [embed]});
                    }
                }
            });

            newPlayer.on('error', error => { 
                console.error(`Player in guild ${guildId} failed: ${error}`);
            });
        }
    }

    initGuildSession(guildId, connection) {
        if (!this.sessions.has(guildId)) { 
            this.sessions.set(guildId, {
                queue: [],
                connection: connection,
                player: null,
            });
        }
        return this.sessions.get(guildId);
    }

    getSession(guildId) {
        return this.sessions.get(guildId) || null;
    }

    clearQueue(guildId) { 
        const session = this.sessions.get(guildId);
        this.sessions.set(guildId, { 
            ...session,
            queue: []
        });
    }

    getQueue(guildId) { 
        const { queue } = this.sessions.get(guildId);
        return queue;
    }

    play(guildId) {
        const { queue, connection, player } = this.sessions.get(guildId);
        if (queue.length > 0) { 
            const cur = queue[0];
            connection.subscribe(player);
            player.play(cur.resource);
            return cur;
        }
        return null;
    }

    enqueue(guildId, resource, videoDetails, user) {
        const { queue } = this.sessions.get(guildId);
        const song = { resource, videoDetails, user };
        queue.push(song);
        return queue.length - 1;
    }

    pause(guildId) { 
        const { player } = this.sessions.get(guildId);
        player.pause();
    }

    unpause(guildId) { 
        const { player } = this.sessions.get(guildId);
        player.unpause();
    }

    stop(guildId) { 
        const { player } = this.sessions.get(guildId);
        player.stop();
        this.clearQueue();
    }

}
const audioQueue = new AudioQueue();
export default audioQueue;
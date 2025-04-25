import { EmbedBuilder } from "@discordjs/builders";
import { createAudioPlayer, createAudioResource } from "@discordjs/voice";

import { secondsToTime } from "../util/util.js";

class AudioQueue { 
     
    constructor() { 
        this.sessions = new Map();
    }

    initPlayer(guildId, channel) {
        const { queue, connection, player, repeatFlag } = this.sessions.get(guildId);
        if (!player) { 
            const newPlayer = createAudioPlayer();
            this.sessions.set(guildId, { 
                queue,
                connection, 
                player: newPlayer,
                repeatFlag
            });
            connection.subscribe(newPlayer);

            newPlayer.on('stateChange', async (oldState, newState) => { 
                console.log(`Player in guild ${guildId} transitioned from ${oldState.status} to ${newState.status}`);
                if (newState.status === 'idle') {
                    const curSession = this.sessions.get(guildId);
                    if(!curSession.repeatFlag) { 
                        curSession.queue.shift();
                    }
                    if (curSession.queue.length > 0) { 
                        const cur = curSession.queue[0];
                        newPlayer.play(createAudioResource(cur.path));
                        const embed = new EmbedBuilder()
                            .setTitle('Now playing...')
                            .setDescription(`[${cur.title}](${cur.url})\n(${cur.duration})`)
                            .setThumbnail(cur.thumbnail);
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
                repeatFlag: false
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
            player.play(createAudioResource(cur.path));
            return cur;
        }
        return null;
    }

    enqueue(guildId, songData, user) {
        const { queue } = this.sessions.get(guildId);
        const song = { ...songData, user };
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
        this.clearQueue(guildId);
        player.stop();
    }

    skip(guildId) { 
        const { player } = this.sessions.get(guildId);
        player.stop();
    }

    repeat(guildId) { 
        const session = this.sessions.get(guildId);
        session.repeatFlag = !session.repeatFlag;
    }

}
const audioQueue = new AudioQueue();
export default audioQueue;
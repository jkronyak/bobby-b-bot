import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { createAudioPlayer, createAudioResource } from "@discordjs/voice";

import { secondsToTime } from "../util/util.js";

class AudioQueue { 
     
    constructor() { 
        this.sessions = new Map();
    }

    initPlayer(guildId, channel) {
        const { queue, connection, player, repeatFlag, nowPlayingMessage } = this.sessions.get(guildId);
        if (!player) { 
            const newPlayer = createAudioPlayer();
            this.sessions.set(guildId, { 
                queue,
                connection, 
                player: newPlayer,
                repeatFlag, 
                nowPlayingMessage
            });
            connection.subscribe(newPlayer);

            newPlayer.on('stateChange', async (oldState, newState) => { 
                console.log(`Player in guild ${guildId} transitioned from ${oldState.status} to ${newState.status}`);
                const curSession = this.sessions.get(guildId);
                if (newState.status === 'idle') {
                    if (curSession.nowPlayingMessage) {
                        await curSession.nowPlayingMessage.delete();
                        curSession.nowPlayingMessage = null;
                    }

                    if(!curSession.repeatFlag) { 
                        curSession.queue.shift();
                    }
                    let sentMessage = null;
                    if (curSession.queue.length > 0) { 
                        const cur = curSession.queue[0];
                        newPlayer.play(createAudioResource(cur.path));
                        const embed = new EmbedBuilder()
                            .setTitle('Now playing...')
                            .setDescription(`[${cur.title}](${cur.url})\n(${cur.duration})`)
                            .setThumbnail(cur.thumbnail);
                        const pauseBtn = new ButtonBuilder()
                            .setCustomId('pause-btn')
                            .setLabel('Pause')
                            .setStyle(ButtonStyle.Primary);
                
                        const skipBtn = new ButtonBuilder()
                            .setCustomId('skip-btn')
                            .setLabel('Skip')
                            .setStyle(ButtonStyle.Secondary);

                        const stopBtn = new ButtonBuilder()
                            .setCustomId('stop-btn')
                            .setLabel('Stop')
                            .setStyle(ButtonStyle.Danger);

                        const repeatBtn = new ButtonBuilder()
                            .setCustomId('repeat-btn')
                            .setLabel(curSession.repeatFlag ? 'Repeat Off' : 'Repeat On')
                            .setStyle(ButtonStyle.Primary);

                        const queueBtn = new ButtonBuilder()
                            .setCustomId('queue-btn')
                            .setLabel('View Queue')
                            .setStyle(ButtonStyle.Primary);
                        
                        const row = new ActionRowBuilder().addComponents(pauseBtn, skipBtn, stopBtn, repeatBtn, queueBtn);
                        sentMessage = await channel.send({embeds: [embed], components: [row]});
                    } else { 
                        sentMessage = await channel.send({ content: 'There are no more songs in the queue!' });
                    }
                    this.sessions.set(guildId, { ...curSession, nowPlayingMessage: sentMessage });
                
                // If we are playing the first song in the queue, and there is a previous nowPlaying message (no songs in queue), delete it.
                } else if (newState.status === 'playing' && curSession.queue.length === 0) {
                    if (curSession.nowPlayingMessage) { 
                        await curSession.nowPlayingMessage.delete();
                        curSession.nowPlayingMessage = null;
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
                repeatFlag: false,
                nowPlayingMessage: null
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

    play(guildId, sentMessage) {
        // const { queue, connection, player } = this.sessions.get(guildId);
        const session = this.sessions.get(guildId);
        if (session.queue.length > 0) {
            const cur = session.queue[0];
            session.connection.subscribe(session.player);
            session.player.play(createAudioResource(cur.path));
            this.sessions.set(guildId, { ...session, nowPlayingMessage: sentMessage});
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
        const session = this.sessions.get(guildId);
        this.clearQueue(guildId);
        session.player.stop();
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
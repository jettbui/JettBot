const ytdl = require("ytdl-core");

module.exports = {
    name: "play",
    description: "Plays music",
    category: "music",
    aliases: [],
    args: true,
    usage: "<link>",
    cooldown: 5,
    guildOnly: true,
    disabled: true,
    async execute(message, args, serverQueue) {

        const url = args[0];
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(ytdl(args[0]), { volume: 0.3 });

        dispatcher.on("start", () => {
            console.log("PLAYING");
        });

        dispatcher.on("finish", () => {
            console.log("DONE");
        });

        dispatcher.on("error", console.error);
        if (!(args[1] === "dontstop")) return;

        try {
            const queue = message.client.queue;

            // validity checks
            const voiceChannel = message.member.voice.channel;
            const botPermissions = voiceChannel.permissionsFor(message.client.user);

            if (!voiceChannel) {
                return message.channel.send("You must be in a voice channel for me to join!");
            }
            if (!botPermissions.has("CONNECT") || !botPermissions.has("SPEAK")) {
                return message.channel.send("I do not have permissions to play music.");
            }

            // get song information from youtube link
            const link = args[0];
            const songInfo = await ytdl.getInfo(link);
            const song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url };

            // handle queue
            if (!serverQueue) {
                // create contract
                const queueContract = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true
                };
                queue.set(message.guild.id, queueContract);
                queueContract.songs.push(song);

                try {
                    const connection = await voiceChannel.join();
                    queueContract.connection = connection;
                    this.play(message, queueContract.songs[0]);
                } catch (error) {
                    console.error(error);
                    queue.delete(message.build.id);
                    return message.channel.send("An error has occurred. Check logs for details.")
                }

            } else {
                serverQueue.songs.push(song);
                console.log(`Song Queue: ${serverQueue.songs}`);
                return message.channel.send(`'${song.title}' added to the queue.`);
            }

        } catch (error) {
            console.error(error);
            return message.channel.send("An error has occurred. Check log for details.");
        }


    },
    play(message, song) {
        const queue = message.client.queue;
        const guild = message.guild;
        const serverQueue = queue.get(message.guild.id);

        // handle no song
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                this.play(guild, serverQueue.songs[0]);
            })
            .on("error", (error) => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Now playing: **${song.title}**`);
    },
};
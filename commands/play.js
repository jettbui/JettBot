const ytdl = require("ytdl-core");

module.exports = {
	name: "play",
    description: "Plays music",
    category: "fun",
    aliases: [],
    args: false,
    usage: "<link>",
    cooldown: 5,
    guildOnly: true,
	async execute(message, args) {
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(ytdl("https://www.youtube.com/watch?v=2H5rusicEnc"), { volume: 0.3 });

            dispatcher.on("start", () => {
                console.log("PLAYING");
            });

            dispatcher.on("finish", () => {
                console.log("DONE");
            });

            dispatcher.on("error", console.error);


        }
	},
};
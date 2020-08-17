const Discord = require("discord.js");
const emotes = require("../json/emotes.json");

module.exports = {
	name: "emote",
    description: "Display a Twitch, BTTV, or FFZ emote and an optional message",
    category: "fun",
    aliases: ["e"],
    args: true,
    usage: "<emote> [msg]",
    guildOnly: false,
	execute(message, args) {
        const emote = emotes[args[0].toLowerCase()];
        const msg = (args[1]) ? args.splice(1).join(" ") : null;

        if (emote) {
            let emoteUrl;
            switch (emote.type) {
                case "ttv":
                    emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/3.0`; break;
                case "bttv":
                    emoteUrl = `https://cdn.betterttv.net/emote/${emote.id}/2x`; break;
                case "ffz":
                    emoteUrl = `https://cdn.frankerfacez.com/emoticon/${emote.id}/2`; break;
            }

            const user = message.author;
            const member = message.guild.member(user);

            const emoteEmbed = new Discord.MessageEmbed()
                .setColor((member.displayHexColor != "#000000") ? member.displayHexColor : "#969c9f")
                .setAuthor((msg) ? `${member.displayName} says: ${msg}`: `${member.displayName} says`, user.displayAvatarURL())
                .setThumbnail(emoteUrl)
                .setTimestamp();

            message.channel.send(emoteEmbed);
            message.delete();
        } else {
            message.channel.send("No emote found.");
        }
        // https://static-cdn.jtvnw.net/emoticons/v1/{self.emote_id}/3.0 ttv
        // https://cdn.betterttv.net/emote/{self.emote_id}/3x bttv
        // https://cdn.frankerfacez.com/emoticon/{self.emote_id}/4 ffz
	},
};
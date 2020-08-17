const Discord = require("discord.js"),
    emotes = require("../../json/emotes.json"),
    { emoteResponses } = require("../../json/responses.json");

module.exports = {
    name: "emote",
    description: "Display a TTV/BTTV/FFZ emote",
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
                    emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/3.0`;
                    break;
                case "bttv":
                    emoteUrl = `https://cdn.betterttv.net/emote/${emote.id}/2x`;
                    break;
                case "ffz":
                    emoteUrl = `https://cdn.frankerfacez.com/emoticon/${emote.id}/2`;
                    break;
            }

            const user = message.author;
            const member = message.guild.member(user);

            const emoteEmbed = new Discord.MessageEmbed()
                .setColor((member.displayHexColor != "#000000") ? member.displayHexColor : "#969c9f")
                .setAuthor((msg) ? `${member.displayName} says: ${msg}` : `${member.displayName} says`, user.displayAvatarURL())
                .setThumbnail(emoteUrl)
                .setTimestamp();

            message.channel.send(emoteEmbed);
            message.delete();
        } else {
            message.channel.send(emoteResponses.noEmote);
        }
    },
};
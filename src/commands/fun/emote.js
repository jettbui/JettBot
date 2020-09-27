const { MessageEmbed } = require("discord.js"),
    emotes = require("../../json/emotes.json"),
    { emoteResponses } = require("../../json/responses.json");

module.exports = {
    name: "emote",
    description: "Display a TTV/BTTV/FFZ emote",
    category: "fun",
    aliases: ["e"],
    args: true,
    usage: "<emote> [msg]",
    exampleUsage: "emote pepeJAM Dun dun dun dun dun dun",
    guildOnly: true,
    execute(message, args) {
        const user = message.author;
        const member = message.member;
        const emote = emotes[args[0].toLowerCase()];
        const msgArr = [];

        for (let i = 1; i < args.length; i++) { // parse message (including mentions)
            const userMention = args[i].match(/^<@!?(\d+)>$/);
            const roleMention = args[i].match(/^<@&?(\d+)>$/);
            const channelMention = args[i].match(/^<#?(\d+)>$/);
            if (userMention) {
                const member = message.guild.members.cache.get(userMention[1]);
                msgArr[i - 1] = `@${member.displayName}`;
            } else if (roleMention) {
                const role = message.guild.roles.cache.get(roleMention[1]);
                msgArr[i - 1] = `@${role.name}`;
            } else if (channelMention) {
                const channel = message.guild.channels.cache.get(channelMention[1]);
                msgArr[i - 1] = `#${channel.name}`;
            } else {
                msgArr[i - 1] = args[i];
            }
        }

        const msg = (msgArr.length) ? msgArr.join(" ") : null;

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

            const embed = new MessageEmbed()
                .setColor((member.displayHexColor != "#000000") ? member.displayHexColor : "#969c9f")
                .setAuthor((msg) ? `${member.displayName} says: ${msg}` : `${member.displayName} says`, user.displayAvatarURL())
                .setThumbnail((emote.animated) ? `${emoteUrl}.gif` : emoteUrl)
                .setTimestamp();
            
            message.delete();
            return message.channel.send(embed);
        }

        return message.channel.send(emoteResponses.noEmote);
    },
};
module.exports = {
    name: "servers",
    description: "List servers (developer only)",
    aliases: [],
    args: false,
    guildOnly: false,
    devOnly: true,
    execute(message) {
        let output = "Online on the following servers:\n";
        message.client.guilds.cache.forEach(guild => { output = output + `- ${guild.name} (${guild.id})\n`; });
        return message.channel.send(output);
    },
};
module.exports = {
    name: "echo",
    description: "Echo a message",
    category: "utility",
    aliases: [],
    args: true,
    usage: "<message>",
    exampleUsage: "echo Hello world!",
    execute(message, args) {
        return message.channel.send(args.join(" "));
    },
};
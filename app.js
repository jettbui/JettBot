const { Structures, Collection, PartialTextBasedChannel } = require("discord.js"),
    Client = require("./client/Client"),
    fs = require("fs"),
    { exit } = require("process"),
    { prefix, token, defaultCooldown, defaultActivity, ownerId, logMessages } = require("./config.json"),
    { globalResponses } = require("./json/responses.json");


// extend guild structure
Structures.extend("Guild", (Guild) => {
    class ExtendedGuild extends Guild {
        constructor(client, data) {
            super(client, data);
            this.isPollRunning = false;
            this.musicData = { // music data
                queue: [],
                isPlaying: false,
                skipVoteRunning: false,
                skipCollector: null,
                nowPlaying: null,
                songDispatcher: null,
                volume: 0.3
            };
            this.triviaData = { // music trivia data
                isTriviaRunning: false,
                wasTriviaEndCalled: false,
                triviaQueue: [],
                triviaScore: new Map()
            };
        }
    }
    return ExtendedGuild;
});

// instantiate client
console.log("Starting JettBot...\n");
const client = new Client();

// import commands
console.log("Loading the following commands:");

const commandFiles = fs.readdirSync("./commands", { withFileTypes: true });

for (const file of commandFiles) {
    if (file.name.endsWith(".js")) {
        const command = require(`./commands/${file.name}`);
        client.commands.set(command.name, command);
    } else if (file.isDirectory()) {
        const subfolder = fs.readdirSync(`./commands/${file.name}`);
        if (!subfolder.length) continue;
        for (const subfile of subfolder) {
            if (subfile.endsWith(".js")) {
                const command_2 = require(`./commands/${file.name}/${subfile}`);
                client.commands.set(command_2.name, command_2);
            }
        }
        console.log(`${subfolder.map(s => `${file.name}/${s}`).join("\n")}`);
    }
}

console.log(`${commandFiles.map(f => f.name).filter(f => f.endsWith(".js")).join("\n")}\n`);

// client events
client.on("ready", () => {
    console.log("Online on the following servers:")
    client.guilds.cache.forEach((server) => { console.log(`- ${server.name}`) });
    console.log(`Logged in as ${client.user.tag}.\n`);
    client.user.setActivity(defaultActivity, { type: "PLAYING" });
    console.log(`Activity set to '${defaultActivity}'`);
});

client.on("message", (message) => {

    if (logMessages) {
        console.log(`${message.author.username} (${message.guild}): ${message.content}`);
    }

    // command handler
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command)
        return message.channel.send(globalResponses.noCommand);

    // check context
    if (command.disabled && message.author.id !== ownerId)
        return message.channel.send(globalResponses.commandDisabled);
    if (command.guildOnly && message.channel.type !== "text")
        return message.channel.send(globalResponses.serverOnly);
    if (command.devOnly && message.author.id != ownerId)
        return message.channel.send(globalResponses.notAuthorized);

    // check permissions
    if (command.permissions !== undefined && command.permissions.length) {
        let validPerms = false;
        command.permissions.forEach((permission) => {
            if (!message.member.hasPermission(permission)) validPerms = true;
        });
        if (validPerms) return message.channel.send(globalResponses.noPermission);
    }

    // check args
    if (command.args && !args.length) {
        let response = globalResponses.invalidArgs;

        if (command.usage)
            response += `\nUsage: ${prefix}${command.name} ${command.usage}`;

        return message.channel.send(response);
    }

    // check cooldown
    if (!client.cooldowns.has(command.name))
        client.cooldowns.set(command.name, new Collection());

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime)
            return message.channel.send(globalResponses.cooldown);
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // execute command
    try {
        command.execute(message, args);
    } catch (error) {
        console.error("An error occurred executing a command:\n", error);
        message.channel.send(globalResponses.error);
    }
});

client.on('voiceStateUpdate', async (___, newState) => {
    if (
        newState.member.user.bot &&
        !newState.channelID &&
        newState.guild.musicData.songDispatcher &&
        newState.member.user.id == client.user.id
    ) {
        newState.guild.musicData.queue.length = 0;
        newState.guild.musicData.songDispatcher.end();
        return;
    }
    if (
        newState.member.user.bot &&
        newState.channelID &&
        newState.member.user.id == client.user.id &&
        !newState.selfDeaf
    ) {
        newState.setSelfDeaf(true);
    }
});

client.on("invalidated", () => {
    console.log("The bot is now invalidated. The process will now exit.");
    exit();
});

client.login(token);

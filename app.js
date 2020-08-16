const Discord = require("discord.js"),
      { prefix, token, defaultCooldown, ownerId } = require("./config.json"),
      fs = require("fs");

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// import commands
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log("Loaded " + file);
}

// music data
const queue = new Map();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}.`);
    client.user.setActivity("Use !help for commands", { type: "PLAYING" });
});

client.on("message", (message) => {

    // command handler
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
                    || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    
    // check context
    if (command.guildOnly && message.channel.type !== "text")
        return message.channel.send("You may only use this command in a server.");

    if (command.devOnly && message.author.id != ownerId)
        return message.channel.send("Only authorized users may use this command.");

    // check args
    if (command.args && !args.length) {
        let response = "Invalid arguments provided.";

        if (command.usage) {
            response += `\nUsage: ${prefix}${command.name} ${command.usage}`
        }

        return message.channel.send(response);
    }

    // check cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime)
            return message.channel.send("The command is currently on cooldown.");
    }

    if (message.author.id != ownerId) {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
    
    // execute command
    try {
        
        // handle music commands
        if (["play", "skip", "stop"].includes(commandName)) {
            const serverQueue = queue.get(message.guild.id);
            command.execute(message, args, serverQueue);
        } else {
            command.execute(message, args);
        }
    } catch (error) {
        console.error("An error occurred executing a command:", error);
        message.channel.send("That command does not exist.");
    }
});

client.login(token);
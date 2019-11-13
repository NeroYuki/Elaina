var Discord = require("discord.js");
var config = require("../config.json");
var cd = new Set();

module.exports.run = async (client, message, args) => {
    let user = message.author.id;
    if (!(message.channel instanceof Discord.DMChannel) && !cd.has(user)) {
        if (message.member.roles.find("name", "Helper") || message.member.roles.find("name", "Moderator")) cd.delete(user);
        let toreport = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if (!toreport) return;
        let reason = args.slice(1).join(" ");
        if (!reason) {message.author.lastMessage.delete();
            message.reply("please add a reason.");
            return;
        }
        let channel = message.guild.channels.find(c => c.name === config.report_channel);
        if (!channel) {
            message.reply("please create a report log channel first!");
            return;
        }

        message.author.lastMessage.delete();

        let reportembed = new Discord.RichEmbed()
            .setAuthor(message.member.user.tag, message.author.avatarURL)
            .setDescription(`Report by ${message.author}`)
            .setColor("#527ea3")
            .setTimestamp(new Date())
            .setFooter("React to this message upon completing report based on decision given")
            .addField("Reported user: " + toreport.user.username, "Reported in: " + message.channel)
            .addField("Reason: ", reason);

        channel.send(reportembed);

        let replyembed = new Discord.RichEmbed()
            .setTitle("Report statistics")
            .setColor("#527ea3")
            .setTimestamp(new Date())
            .setFooter("Elaina owo")
            .addField("Reported user: " + toreport.user.username, "Reported in: " + message.channel)
            .addField("Reason: " + reason, "Make sure you have evidence ready!\nAbuse of this command will result in a mute.");

        try {
            await message.author.send(replyembed);
        } catch (e) {}

        let cooldown = config.member_cooldown;
        if (!message.member.roles.find("name", "Helper") && !message.member.roles.find("name", "Moderator")) {
            cd.add(user);
            setTimeout(() => {
                cd.delete(user)
            }, cooldown * 1000)
        }
    } else {
        if (cd.has(message.author.id)) {
            message.author.lastMessage.delete();
            message.reply("you are still on cooldown!").then (message => {
                message.delete(5000)
            });
            return;
        }
        message.channel.send("This command is not allowed in DMs")
    }
};

module.exports.help = {
    name: "report"
};

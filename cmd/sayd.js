module.exports.run = (client, message, args) => {
	if (message.member.roles.find("name", "Owner")) {
		let sayMessage = args.join(" ");
		message.author.lastMessage.delete();
		message.channel.send(sayMessage);
	}
	else message.channel.send("You don't have enough permission to use this :3");
}

module.exports.help = {
	name: "sayd"
}

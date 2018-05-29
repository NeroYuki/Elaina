module.exports.run = (client, message, args) => {
	let sayMessage = args.join(" ");
	message.author.lastMessage.delete();
	message.channel.send(sayMessage);
}

module.exports.help = {
	name: "sayd"
}

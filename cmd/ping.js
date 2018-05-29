module.exports.run = (client, message, args) => {
	message.channel.send(`Pong! took me ${-(Date.now() - message.createdTimestamp)/10} ms for that you know`);
}

module.exports.help = {
	name: "ping"
}

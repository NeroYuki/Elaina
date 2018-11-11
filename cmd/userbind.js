const mongodb = require('mongodb');

module.exports.run = (client, message, args, maindb) => {
	let uid = args[0];
	if (isNaN(parseInt(uid))) {message.channel.send("Your uid please!")}
	else {
		let binddb = maindb.collection("userbind");
		let query = { discordid: message.author.id };
		var bind = {
			discordid: message.author.id,
			uid: uid
		};
		var updatebind = {
			$set: {
				discordid: message.author.id,
				uid: uid
			}
		}
		binddb.find(query).toArray(function(err, res) {
			if (err) throw err;
			if (!res[0]) {
				binddb.insertOne(bind, function(err, res) {
					if (err) throw err;
					console.log("bind added");
					message.channel.send("Haii <3, binded <@"+message.author.id+"> to uid "+uid);
				});
			}
			else {
				binddb.updateOne(query, updatebind, function(err, res) {
					if (err) throw err;
					console.log("bind updated");
					message.channel.send("Haii <3, binded <@"+message.author.id+"> to uid "+uid);
				});
			}
		});
	}
}

module.exports.help = {
	name: "userbind"
}

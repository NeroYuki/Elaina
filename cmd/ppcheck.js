var Discord = require('discord.js');
require('http');
require('mongodb');

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	let page = 1;
	if (args[0]) {
		if (isNaN(args[0]) || parseInt(args[0]) > 15) ufind = args[0];
		else if (parseInt(args[0]) <= 0) page = 1;
		else page = parseInt(args[0]);
		ufind = ufind.replace('<@!', '');
		ufind = ufind.replace('<@', '');
		ufind = ufind.replace('>', '');
	}
	if (args[1]) {
		if (isNaN(args[1]) || parseInt(args[1]) > 15 || parseInt(args[1]) <= 0) page = 1;
		else page = parseInt(args[1]);
	}
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) throw err;
		if (res[0]) {
			var uid = res[0].uid;
			var username = res[0].username;
			var discordid = res[0].discordid;
			var pp = 0;
			var ppentry = [];
			if (res[0].pptotal) pp = res[0].pptotal.toFixed(2);
			if (res[0].pp) ppentry = res[0].pp;

			let site = "[PP Profile](https://ppboard.herokuapp.com/profile?uid=" + uid + ")";
			let mirror = "[Mirror](https://droidppboard.herokuapp.com/profile?uid=" + uid + ")";

			const embed = new Discord.RichEmbed()
				.setDescription('**PP Profile for <@' + discordid + '> (' + username + ') [Page ' + page + ']**\nTotal PP: **' + pp + " pp**\n" + site + " - " + mirror)
				.setColor(message.member.highestRole.hexColor)
				.setFooter("Elaina owo", "https://image.frl/p/yaa1nf94dho5f962.jpg");
			
			for (var x = 5 * (page - 1); x < 5 + 5 * (page - 1); x++) {
				if (ppentry[x]) {
					let combo = ppentry[x][3].toString();
					if (combo.indexOf("x") == -1) combo = combo + "x";
					else if (combo.indexOf(" ") != -1) combo = combo.trimRight();

					let acc = ppentry[x][4].toString();
					if (acc.indexOf('\r') != -1) acc = acc.replace(" ", "").replace("\r", "");
					else if (acc.indexOf("%") != -1) acc = parseFloat(acc.trimRight()).toFixed(2) + "%";
					else acc = acc + "%";

					let miss = ppentry[x][5].toString() + " ❌";
					embed.addField((x+1) + '. ' + ppentry[x][1], combo + ' | ' + acc + " | " + miss + " | __" + ppentry[x][2] + ' pp__ (Net pp: ' + (ppentry[x][2] * Math.pow(0.95, x)).toFixed(2) + ' pp)')
				}
				else embed.addField((x+1) + '. -', '-')
			}

			message.channel.send(embed);
		}
		else message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")
	});
};

module.exports.help = {
	name: "ppcheck"
};

var Discord = require('discord.js');
var http = require('http');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;
var cd = new Set();

function modread(input) {
	var res = '';
	if (input.includes('n')) res += 'NF';
	if (input.includes('h')) res += 'HD';
	if (input.includes('r')) res += 'HR';
	if (input.includes('e')) res += 'EZ';
	if (input.includes('t')) res += 'HT';
	if (input.includes('c')) res += 'NC';
	if (input.includes('d')) res += 'DT';
	if (res) res = '+' + res;
	return res;
}

function rankEmote(input) {
	if (!input) return;
	switch (input) {
		case 'A': return '611559473236148265';
		case 'B': return '611559473169039413';
		case 'C': return '611559473328422942';
		case 'D': return '611559473122639884';
		case 'S': return '611559473294606336';
		case 'X': return '611559473492000769';
		case 'SH': return '611559473361846274';
		case 'XH': return '611559473479155713';
		default : return;
	}
}

function editpp(client, message, rplay, name, page) {
	let embed = new Discord.RichEmbed()
		.setDescription("Recent play for **" + name + " (Page " + page + "/10)**")
		.setColor(message.member.highestRole.hexColor)
		.setFooter("Elaina owo", "https://images-ext-2.discordapp.net/external/d0iu_mPMvyoLQWnBSEnW4RL0-07KYm7zG9mjWdfWl7M/https/image.frl/p/yaa1nf94dho5f962.jpg");

	for (var i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
		if (!rplay[i]) break;
		var date = new Date(rplay[i].date*1000);
		date.setUTCHours(date.getUTCHours() + 8);
		var play = client.emojis.get(rankEmote(rplay[i].mark)).toString() + " | " + rplay[i].filename + " " + modread(rplay[i].mode);
		var score = rplay[i].score.toLocaleString() + ' / ' + rplay[i].combo + 'x / ' + parseFloat(rplay[i].accuracy)/1000 + '% / ' + rplay[i].miss + ' miss(es) \n `' + date.toUTCString() + '`';
		embed.addField(play, score)
	}
	return embed
}

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (cd.has(ufind)) return message.channel.send("Please wait for a bit before using this command again!");
	let page = 1;
	if (args[0]) {
		if (isNaN(args[0]) || parseInt(args[0]) > 10) ufind = args[0];
		else if (parseInt(args[0]) <= 0) page = 1;
		else page = parseInt(args[0]);
		ufind = ufind.replace('<@!', '');
		ufind = ufind.replace('<@', '');
		ufind = ufind.replace('>', '');
	}
	if (args[1]) {
		if (isNaN(args[1]) || parseInt(args[1]) > 10 || parseInt(args[1]) <= 0) page = 1;
		else page = parseInt(args[1]);
	}

	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = {discordid: ufind};
	binddb.find(query).toArray(function (err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (res[0]) {
			let uid = res[0].uid;
			var options = new URL("http://ops.dgsrz.com/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid);
			var content = "";

			var req = http.get(options, function (res) {
				res.setEncoding("utf8");
				res.on("data", function (chunk) {
					content += chunk;
				});

				res.on("end", function () {
					if (!content) return message.channel.send("Error: Empty API response. Please try again!");
					var resarr = content.split('<br>');
					var headerres = resarr[0].split(' ');
					if (headerres[0] == 'FAILED') return message.channel.send("User not exist");
					resarr.shift();
					content = resarr.join("");
					var obj = JSON.parse(content);
					var name = headerres[2];
					var rplay = obj.recent;;
					let embed = editpp(client, message, rplay, name, page);
					if (!rplay[0]) {message.channel.send("This player haven't submitted any play"); return;}

					message.channel.send({embed}).then (msg => {
						msg.react("⏮️").then(() => {
							msg.react("⬅️").then(() => {
								msg.react("➡️").then(() => {
									msg.react("⏭️").catch(e => console.log(e))
								})
							})
						});

						let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 60000});
						let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
						let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});
						let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 60000});

						backward.on('collect', () => {
							page = 1;
							embed = editpp(client, message, rplay, name, page);
							msg.edit(embed).catch(e => console.log(e));
							msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
						});

						back.on('collect', () => {
							if (page === 1) page = 10;
							else page--;
							embed = editpp(client, message, rplay, name, page);
							msg.edit(embed).catch(e => console.log(e));
							msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
						});

						next.on('collect', () => {
							if (page === 10) page = 1;
							else page++;
							embed = editpp(client, message, rplay, name, page);
							msg.edit(embed).catch(e => console.log(e));
							msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
						});

						forward.on('collect', () => {
							page = 10;
							embed = editpp(client, message, rplay, name, page);
							msg.edit(embed).catch(e => console.log(e));
							msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
						})
					});
				})
			});
			req.end();
			cd.add(message.author.id);
			setTimeout(() => {
				cd.delete(message.author.id)
			}, 10000)
		} else message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")
	})
};

module.exports.help = {
	name: "recent5me"
};

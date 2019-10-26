var http = require('http');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;
const recent = new Set();

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

module.exports.run = (client, message, args) => {
	if (message.channel.name != "bot-ground") {message.channel.send("The command is only allowed in <#325827427446161413>").then (message => {
		message.delete(5000)});
		return;
	}
	let uid = parseInt(args[0]);
	if (isNaN(uid)) {
		message.channel.send("Invalid uid");
		return;
	}
	if (recent.has(message.author.id)) {
		if (message.member.roles.find("name", "Moderator")) {
			recent.delete(message.author.id)
		} else {
			message.channel.send("You are still on cooldown! Please wait").then (message => {
				message.delete(5000)});
				return;
		}
	}
	var options = new URL("http://ops.dgsrz.com/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid);
	var content = "";

	var req = http.get(options, function (res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			var resarr = content.split('<br>');
			var headerres = resarr[0].split(' ');
			if (headerres[0] == 'FAILED') {
				message.channel.send("User not exist");
				return;
			}
			resarr.shift();
			content = resarr.join("");
			var obj = JSON.parse(content);
			var name = headerres[2];
			var entries = [];
			var rplay = obj.recent;
			for (var i = 0; i < 10; i++) {
				if (!rplay[i]) break;
				var date = new Date(rplay[i].date * 1000);
				date.setUTCHours(date.getUTCHours() + 8);
				var entry = {
					"name": client.emojis.get(rankEmote(rplay[i].mark)).toString() + " | " + rplay[i].filename + " " + modread(rplay[i].mode),
					"value": rplay[i].score.toLocaleString() + ' / ' + rplay[i].combo + 'x / ' + parseFloat(rplay[i].accuracy) / 1000 + '% / ' + rplay[i].miss + ' miss(es) \n `' + date.toUTCString() + '`'
				}
				entries.push(entry);
			}
			date.setUTCHours(date.getUTCHours() + 8)
			if (!rplay[0]) {
				message.channel.send("This player haven't submitted any play");
				return;
			}
			const embed = {
				"description": "Recent play for **" + name + "**",
				"color": 8102199,
				"footer": {
					"icon_url": "https://image.frl/p/yaa1nf94dho5f962.jpg",
					"text": "Elaina by -Nero Yuki-"
				},
				"fields": entries
			};

			message.channel.send({embed});
		})
	})
	req.end();

	recent.add(message.author.id);
	if (message.member.roles.find("name", "Moderator")) {
		recent.delete(message.author.id)
	} else {
		setTimeout(() => {
			recent.delete(message.author.id)
		}, 600000)
	}
}

module.exports.help = {
	name: "recent10"
}

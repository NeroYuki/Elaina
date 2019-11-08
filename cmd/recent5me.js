var http = require('http');
var mongodb = require('mongodb');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;

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
		case 'A': return '555772511628034061';
		case 'B': return '555772511753601037';
		case 'C': return '555772511577702460';
		case 'D': return '555772512026361862';
		case 'S': return '555772511812321320';
		case 'X': return '555772513460944931';
		case 'SH': return '555772511741018142';
		case 'XH': return '555772511997132830';
		default : return;
	}
}

module.exports.run = (client, message, args, maindb) => {
	let page = 1;
	if (args[0]) page = parseInt(args[0]); //First argument will be page
	if (isNaN(args[0]) || page <= 0 || page > 10) page = 1; //Detect out-of-range page input
	let ufind = message.author.id;
	
	/*Allows dynamic command format
	If first argument is an integer with a value more than 10, it
	treats the argument as user ID. Similarly, if it's a mention,
	it will be treated as user ID as well.*/
	if (args[0]) {
		if (isNaN(args[0]) || parseInt(args[0]) > 10) ufind = args[0];
		if (args[1]) ufind = args[1];
		ufind = ufind.replace('<@!', '');
		ufind = ufind.replace('<@', '');
		ufind = ufind.replace('>', '');
	}

	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = {discordid: ufind};
	binddb.find(query).toArray(function (err, res) {
		if (err) throw err;
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
					for (var i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
						if (!rplay[i]) break;
						var date = new Date(rplay[i].date * 1000);
						date.setUTCHours(date.getUTCHours() + 8);
						var entry = {
							"name": client.emojis.get(rankEmote(rplay[i].mark)).toString() + " | " + rplay[i].filename + " " + modread(rplay[i].mode),
							"value": rplay[i].score.toLocaleString() + ' / ' + rplay[i].combo + 'x / ' + parseFloat(rplay[i].accuracy) / 1000 + '% / ' + rplay[i].miss + ' miss(es) \n `' + date.toUTCString() + '`'
						};
						entries.push(entry);
					}
					if (!rplay[0]) {
						message.channel.send("This player haven't submitted any play");
						return;
					}
					const embed = {
						"description": "Recent play for **" + name + " (Page " + page + ")**",
						"color": 8102199,
						"footer": {
							"icon_url": "https://image.frl/p/yaa1nf94dho5f962.jpg",
							"text": "Elaina owo"
						},
						"fields": entries
					};

					message.channel.send({embed});
				})
			})
			req.end();
		} else {
			message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")
		};
	});
}

module.exports.help = {
	name: "recent5me"
}

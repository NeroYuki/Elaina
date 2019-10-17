var http = require('http');
var mongodb = require('mongodb');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;

function modread(input) {
	var res = '';
	if (input.includes('n')) res += 'NF'
	if (input.includes('h')) res += 'HD'
	if (input.includes('r')) res += 'HR'
	if (input.includes('e')) res += 'EZ'
	if (input.includes('t')) res += 'HT'
	if (input.includes('c')) res += 'NC'
	if (input.includes('d')) res += 'DT'
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
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) throw err;
		if (res[0]) {
			let uid = res[0].uid;
			var options = {
				host: "ops.dgsrz.com",
				port: 80,
				path: "/profile.php?uid="+uid+".html"
			};

			var content = "";   

			var req = http.request(options, function(res) {
			res.setEncoding("utf8");
			res.on("data", function (chunk) {
				content += chunk;
			});

			res.on("end", function () {
				const a = content;
				let b = a.split('\n');
				let avalink=""; let location="";
				for (x = 0; x < b.length; x++) {
					if (b[x].includes('h3 m-t-xs m-b-xs')) {
						b[x-3]=b[x-3].replace('<img src="',"");
						b[x-3]=b[x-3].replace('" class="img-circle">',"");
						b[x-3]=b[x-3].trim();
						avalink = b[x-3];
						b[x+1]=b[x+1].replace('<small class="text-muted"><i class="fa fa-map-marker"><\/i>',"");
						b[x+1]=b[x+1].replace("<\/small>","");
						b[x+1]=b[x+1].trim()
						location=b[x+1]
					}
				}
				apiFetch(uid, avalink, location, message, client)
				});
			});
			req.end();
		}
		else { message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`") };
	});
}

function apiFetch(uid, avalink, location, message, client) {
	var options = new URL("http://ops.dgsrz.com/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid);
	var content = "";   

	var req = http.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			var resarr = content.split('<br>');
			var headerres = resarr[0].split(' ');
			if (headerres[0] == 'FAILED') {message.channel.send("User not exist"); return;}
			resarr.shift();
			content = resarr.join("")
			var obj = JSON.parse(content);
			var name = headerres[2];
			var tscore = headerres[3];
			var pcount = headerres[4];
			var oacc = parseFloat(headerres[5])*100;
			var rank = obj.rank;
			var rplay = obj.recent[0];
			var date = new Date(rplay.date*1000)
			date.setUTCHours(date.getUTCHours() + 8)
			if (!rplay) {message.channel.send("This player haven't submitted any play"); return;}
			const embed = {
				"description": "**Username: **"+name+"\n**Rank**: "+rank,
				"color": 8102199,
				"footer": {
					"icon_url": "https://image.frl/p/yaa1nf94dho5f962.jpg",
					"text": "Elaina owo"
				},
					"thumbnail": {
						"url": avalink
				},
				"author": {
					"name": "osu!droid profile (click here to view profile)",
					"url": "http://ops.dgsrz.com/profile.php?uid="+uid,
						"icon_url": "https://image.frl/p/beyefgeq5m7tobjg.jpg"
				},
				"fields": [
					{
						"name": "Total Score: " + parseInt(tscore).toLocaleString(),
						"value": "Overall Accuracy: " + oacc.toFixed(2) +"%"
					},
					{
						"name": "Play Count: " + pcount,
						"value": "Location: " + location
					},
					{
						"name": "Most Recent Play",
						"value": client.emojis.get(rankEmote(rplay.mark)).toString() + " | " + rplay.filename + " " + modread(rplay.mode) + '\n' + rplay.score.toLocaleString() + ' / ' + rplay.combo + 'x / ' + parseFloat(rplay.accuracy)/1000 + '% / ' + rplay.miss + 'm \n ' + date.toUTCString() 
					}
				]
			};
			
			message.channel.send({ embed });
		})
	})
}

module.exports.help = {
	name: "profileme"
}

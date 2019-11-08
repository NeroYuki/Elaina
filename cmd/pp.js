var http = require('http');
var droid = require("./ojsamadroid");
var https = require("https");
var request = require("request");
require("dotenv").config();
var apikey = process.env.OSU_API_KEY;
var droidapikey = process.env.DROID_API_KEY;

function modenum(mod) {
	var res = 4;
	if (mod.includes("r")) res += 16;
	if (mod.includes("h")) res += 8;
	if (mod.includes("d")) res += 64;
	if (mod.includes("c")) res += 576;
	if (mod.includes("n")) res += 1;
	if (mod.includes("e")) res += 2;
	if (mod.includes("t")) res += 256;
	return res;
}

function getMapPP(input, pcombo, pacc, pmissc, pmod = "", message, objcount, whitelist, cb) {

	var isWhitelist = false;

	var whitelistQuery = {hashid: input};

	whitelist.findOne(whitelistQuery, (err, wlres) => {
		if (err) throw err;
		if (wlres) isWhitelist = true; 
		console.log(input);

		if (isWhitelist) var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + wlres.mapid); 
		else var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + input);

		var content = "";   

		var req = https.get(options, function(res) {
			res.setEncoding("utf8");
			res.on("data", function (chunk) {
				content += chunk;
			});

			res.on("end", function () {
				var obj = JSON.parse(content);
				if (!obj[0]) {
					console.log("Map not found"); 
					message.channel.send("Error: The map you've played can't be found on osu! beatmap listing, please make sure the map is submitted, and up-to-date");
					objcount.x++;
					return;
				}
				var mapinfo = obj[0];
				var mapid = mapinfo.beatmap_id;
				if (mapinfo.mode !=0) return;
				if ((mapinfo.approved == 3 || mapinfo.approved <= 0) && !isWhitelist) {
					message.channel.send('Error: PP system only accept ranked, approved, whitelisted or loved mapset right now');
					objcount.x++;
					return;
				}
				//console.log(obj.beatmaps[0])
				if (pmod) var mods = modenum(pmod);
				else var mods = 4;
				if (pacc) var acc_percent = parseFloat(pacc);
				else var acc_percent = 100;
				if (pcombo) var combo = parseInt(pcombo);
				else var combo;
				if (pmissc) var nmiss = parseInt(pmissc);
				else var nmiss = 0;
				var parser = new droid.parser();
				console.log(acc_percent);
				//var url = "https://osu.ppy.sh/osu/1031991";
				var url = 'https://osu.ppy.sh/osu/' + mapid;
				request(url, function (err, response, data) {
					parser.feed(data);
					var nmap = parser.map;
					var cur_od = nmap.od - 5;
					var cur_ar = nmap.ar;
					var cur_cs = nmap.cs - 4;
					// if (mods) {
					// 	console.log("+" + osu.modbits.string(mods));
					// }
					if (pmod.includes("r")) {
						mods -= 16; 
						cur_ar = Math.min(cur_ar*1.4, 10);
						cur_od = Math.min(cur_od*1.4, 5);
						cur_cs += 1;
					}

					if (pmod.includes("PR")) { cur_od += 4; }

					nmap.od = cur_od; nmap.ar = cur_ar; nmap.cs = cur_cs;
					
					if (nmap.ncircles == 0 && nmap.nsliders == 0) {
						console.log('Error: no object found'); 
						objcount.x++;
						return;
					}
					
					var nstars = new droid.diff().calc({map: nmap, mods: mods});
					//console.log(stars.toString());

					
					var npp = droid.ppv2({
						stars: nstars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});
					
					parser.reset();

					if (pmod.includes("r")) { mods += 16; }
					
					console.log(nstars.toString());
					console.log(npp.toString());
					var ppline = npp.toString().split("(");
					var playinfo = mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + ((mods == 4 && (!pmod.includes("PR")))? " " : "+ ") + droid.modbits.string(mods - 4) + ((pmod.includes("PR")? "PR": ""))
					objcount.x++;
					cb(ppline[0], playinfo, input, pcombo, pacc, pmissc);
				})
			})
		})
	})
}

module.exports.run = (client, message, args, maindb) => {
	let channel = message.guild.channels.find("name", "bot-ground");
	let channel2 = message.guild.channels.find("name", "elaina-pp-project");
	if (!channel && !channel2) {message.author.lastMessage.delete();
		message.channel.send(`${message.author}, ask server manager to create #elaina-pp-project or #bot-ground channel first!`).then (message => {message.delete(5000)});
		return;
	}
	if (message.channel.name == 'bot-ground' || message.channel.name == 'elaina-pp-project') {
		let objcount = {x: 0};
		var offset = 1;
		var start = 1;
		if (args[0]) offset = parseInt(args[0]);
		if (args[1]) start = parseInt(args[1]);
		if (isNaN(offset)) offset = 1;
		if (isNaN(start)) start = 1;
		let ufind = message.author.id;
		if (offset > 5 || offset < 1) offset = 1;
		if (start + offset - 1 > 50) {
			console.log('Out of limit');
			return;
		}
		// if (args[0]) {
		// ufind = args[0];
		// ufind = ufind.replace('<@!','');
		// ufind = ufind.replace('<@','');
		// ufind = ufind.replace('>','');
		// }
		console.log(ufind);
		let binddb = maindb.collection("userbind");
		let whitelist = maindb.collection("mapwhitelist");
		let query = {discordid: ufind};
		binddb.find(query).toArray(function (err, userres) {
			if (err) throw err;
			if (userres[0]) {
				console.log(offset);
				console.log(userres[0]);
				let uid = userres[0].uid;
				let discordid = userres[0].discordid;
				if (userres[0].pp) var pplist = userres[0].pp;
				else var pplist = [];
				if (userres[0].pptotal) var pre_pptotal = userres[0].pptotal;
				else var pre_pptotal = 0;
				if (userres[0].playc) var playc = userres[0].playc;
				else var playc = 0;
				var pptotal = 0;
				var submitted = 0;
				var options = {
					host: "ops.dgsrz.com",
					port: 80,
					path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
				};

				var content = "";

				var req = http.request(options, function (res) {
					res.setEncoding("utf8");
					res.on("data", function (chunk) {
						content += chunk;
					});

					res.on("end", function () {
						curpos = 0;
						var playentry = [];
						var resarr = content.split('<br>');
						var obj = JSON.parse(resarr[1]);
						var rplay = obj.recent;
						for (var i = start - 1; i < start + offset - 1; i++) {
							if (!rplay[i]) break;
							var play = {
								title: "", acc: "", miss: "", combo: "", mod: "", hash: ""
							};
							play.title = rplay[i].filename;
							play.acc = rplay[i].accuracy.toPrecision(4) / 1000;
							play.miss = rplay[i].miss;
							play.combo = rplay[i].combo;
							play.mod = rplay[i].mode;
							play.hash = rplay[i].hash;
							playentry[curpos] = play;
							curpos++;
						}

						console.log(playentry);
						playentry.forEach(function (x) {
							if (x.title) getMapPP(x.hash, x.combo, x.acc, x.miss, x.mod, message, objcount, whitelist, (pp, playinfo, hash, acc, combo, miss) => {
								console.log(objcount);
								var ppentry = [hash, playinfo, parseFloat(pp), acc, combo, miss];
								var dup = false;
								//pplist.push(ppentry)
								for (i in pplist) {
									if (ppentry[0] == pplist[i][0]) {
										pplist[i] = ppentry;
										dup = true;
										playc++;
										break;
									}
								}
								if (!dup) {
									pplist.push(ppentry);
									playc++;
								}
								pplist.sort(function (a, b) {
									return b[2] - a[2]
								});
								while (pplist.length > 75) pplist.pop();
								submitted++;
								if (objcount.x == playentry.length) {
									var weight = 1;
									for (i in pplist) {
										pptotal += weight * pplist[i][2];
										weight *= 0.95;
									}
									var diff = pptotal - pre_pptotal;
									message.channel.send('<@' + discordid + '> Submitted ' + submitted + ' plays: + ' + diff.toFixed(2) + ' pp');
									var updateVal = {
										$set: {
											pptotal: pptotal,
											pp: pplist,
											playc: playc
										}
									};
									binddb.updateOne(query, updateVal, function (err, res) {
										if (err) throw err;
										console.log('pp updated');
										addcount = 0;
									})
								}
							})
						})
					});
				});
				req.end();
			} else {
				message.channel.send("The account is not binded, you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")
			};
		});
	} else {message.author.lastMessage.delete();
		if (channel && channel2) {
			message.channel.send(`${message.author}, that command is only allowed in ${channel} and ${channel2}!`).then(message => {
				message.delete(5000)
			});
		}
		if (channel) {
			message.channel.send(`${message.author}, that command is only allowed in ${channel}!`).then(message => {
				message.delete(5000)
			});
		}
		if (channel2) {
			message.channel.send(`${message.author}, that command is only allowed in ${channel2}!`).then(message => {
				message.delete(5000)
			});
		}
	}
};

module.exports.help = {
	name: "pp"
};

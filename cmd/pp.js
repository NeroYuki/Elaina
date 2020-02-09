var http = require('http');
var mongodb = require('mongodb');
var droid = require("./ojsamadroid");
var https = require("https");
var request = require("request")
require("dotenv").config();
var apikey = process.env.OSU_API_KEY;

function rankread(imgsrc) {
	let rank="";
	switch(imgsrc) {
		case '<img src="assets/images/ranking-S-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-S-small.png";break;
		case '<img src="assets/images/ranking-A-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-A-small.png";break;
		case '<img src="assets/images/ranking-B-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-B-small.png";break;
		case '<img src="assets/images/ranking-C-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-C-small.png";break;
		case '<img src="assets/images/ranking-D-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-D-small.png";break;
		case '<img src="assets/images/ranking-SH-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-SH-small.png";break;
		case '<img src="assets/images/ranking-X-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-X-small.png";break;
		case '<img src="assets/images/ranking-XH-small.png"/>':rank="http://ops.dgsrz.com/assets/images/ranking-XH-small.png";break;
		default: rank="unknown";
	}
	return rank;
}


function modenum(mod) {
	var res = 4;
	if (mod.includes("HardRock")) res += 16;
	if (mod.includes("Hidden")) res += 8;
	if (mod.includes("DoubleTime")) res += 64;
	if (mod.includes("NightCore")) res += 576;
	if (mod.includes("NoFail")) res += 1;
	if (mod.includes("Easy")) res += 2;
	if (mod.includes("HalfTime")) res += 256;
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
					message.channel.send("Error: The map you've played can't be found on osu! beatmap listing, please make sure the map is submitted, and up-to-date")
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
				if (pmod) var mods = modenum(pmod)
				else var mods = 4;
				if (pacc) var acc_percent = parseFloat(pacc)
				else var acc_percent = 100;
				if (pcombo) var combo = parseInt(pcombo)
				else var combo;
				if (pmissc) var nmiss = parseInt(pmissc)
				else var nmiss = 0;
				var parser = new droid.parser();
				console.log(acc_percent);
				//var url = "https://osu.ppy.sh/osu/1031991";
				var url = 'https://osu.ppy.sh/osu/' + mapid;
				request(url, function (err, response, data) {
					parser.feed(data);
					var nmap = parser.map;
					var cur_od = nmap.od;
					var cur_ar = nmap.ar;
					var cur_cs = nmap.cs;
					// if (mods) {
					// 	console.log("+" + osu.modbits.string(mods));
					// }
					//HR work slightly different in droid
					if (pmod.includes("HardRock")) {
						mods -= 16; 
						cur_ar = Math.min(cur_ar*1.4, 10);
						cur_od = Math.min(cur_od*1.4, 10);
						cur_cs += 1;
					}
					if (pmod.includes("Easy")) {
						mods -= 2;
						cur_ar = cur_ar / 2;
						cur_od = cur_od / 2;
						cur_cs -= 1
					}
					var droidODtoMS = 100
					if (pmod.includes("Precise")) { 
						droidODtoMS = 55 + 6 * (5 - cur_od)
					}
					else {
						droidODtoMS = 75 + 5 * (5 - cur_od)
					}
					cur_od = 5 - (droidODtoMS - 50) / 6
					cur_cs -= 4
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
					
					parser.reset()

					if (pmod.includes("HardRock")) { mods += 16; }
					
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
	let objcount = {x: 0}
	var offset = 1;
	var start = 1;
	if (args[0]) offset = parseInt(args[0]);
	if (args[1]) start = parseInt(args[1]);
	if (isNaN(offset)) offset = 1;
	if (isNaN(start)) start = 1;
	let ufind = message.author.id;
	if (offset > 5 || offset < 1) offset = 1;
	if (start + offset - 1 > 50) {console.log('out of limit'); return;}
	// if (args[0]) {
		// ufind = args[0];
		// ufind = ufind.replace('<@!','');
		// ufind = ufind.replace('<@','');
		// ufind = ufind.replace('>','');
	// }
	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let whitelist = maindb.collection("mapwhitelist");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, userres) {
		if (err) throw err;
		if (userres[0]) {
			console.log(offset);
			let uid = userres[0].uid;
			let discordid = userres[0].discordid;
			if (userres[0].pp) var pplist = userres[0].pp;
			else var pplist = [];
			if (userres[0].pptotal) var pre_pptotal = userres[0].pptotal;
			else var pre_pptotal = 0
			if (userres[0].playc) var playc = userres[0].playc;
			else var playc = 0;
			var pptotal = 0;
			var submitted = 0;
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
					let b = a.split('\n'), d = []; 
					curpos = 0;
					curentry = 0;
					var playentry = [];
					for (x = 0; x < b.length; x++) {
						if (b[x].includes('<small>') && b[x - 1].includes('class="block"')) {
							var play = {
								title: "", acc: "", miss: "", combo: "", mod: "", hash:""
							}
							b[x-1]=b[x-1].replace("<strong class=\"block\">","");
							b[x-1]=b[x-1].replace("<\/strong>","");
							b[x]=b[x].replace("<\/small>","");
							b[x]=b[x].replace("<small>","");
							b[x+1]=b[x+1].replace('<span id="statics" class="hidden">{"miss":','');
							b[x+1]=b[x+1].replace('}</span>','')
							play.title=b[x-1].trim();
							var mshs = b[x+1].trim().split(',');
							play.miss = mshs[0];
							play.hash = mshs[1].split(':')[1];
							//console.log(play.hash)
							d = b[x].split("/"); ptime = d[0]; play.mod = d[2]; play.combo = d[3]; play.acc = d[4];
							b[x-5]=b[x-5].trim();
							curpos++;
							if (curpos >= start) {playentry[curentry] = play; curentry++;}
							if (curentry >= offset) break;
						}
						if (b[x].includes('h3 m-t-xs m-b-xs')) {
							b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
							b[x]=b[x].replace('<\/div>',"");
							b[x]=b[x].trim();
							name = b[x]
						}
					}
					
					console.log(playentry);
					playentry.forEach(function (x) {		
						if (x.title) getMapPP (x.hash, x.combo, x.acc, x.miss, x.mod, message, objcount, whitelist, (pp, playinfo, hash, acc, combo, miss) => {
							console.log(objcount);
							var ppentry = [hash, playinfo, parseFloat(pp), acc, combo, miss]
							var dup = false
							//pplist.push(ppentry)
							for (i in pplist) {
								if (ppentry[0] == pplist[i][0]) {pplist[i] = ppentry; dup = true; playc++; break;} 
							}
							if (!dup) {pplist.push(ppentry); playc++;}
							pplist.sort(function(a, b) {return b[2] - a[2]})
							while (pplist.length > 75) pplist.pop();
							submitted++;
							if (objcount.x == playentry.length) {
								var weight = 1;
								for (i in pplist) {
									pptotal += weight*pplist[i][2];
									weight *= 0.95;
								}
								var diff = pptotal - pre_pptotal;
								message.channel.send('<@' + discordid + '> Submitted ' + submitted + ' plays: + ' + diff.toFixed(2) + ' pp');
								var updateVal = { $set: {
										pptotal: pptotal,
										pp: pplist,
										playc: playc
									}
								}
								binddb.updateOne(query, updateVal, function(err, res) {
									if (err) throw err;
									console.log('pp updated')
									addcount = 0;
								})
							}
						})
					})
				});
			});
			req.end();
		}
		else { message.channel.send("The account is not binded, you need to use `&userbind <uid>` first") };
	});
}

module.exports.help = {
	name: "pp"
}
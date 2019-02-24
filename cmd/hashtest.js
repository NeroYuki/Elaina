var cmd = require("node-cmd");
var osu = require("ojsama");
var https = require("https");
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
	if (mod.includes("HR")) res += 16;
	if (mod.includes("HD")) res += 8;
	if (mod.includes("DT")) res += 64;
	if (mod.includes("NC")) res += 576;
	if (mod.includes("NF")) res += 1;
	if (mod.includes("EZ")) res += 2;
	if (mod.includes("HT")) res += 256;
	return res;
}

function mapstatusread(status) {
	switch (status) {
		case -2: return 16711711;
		case -1: return 9442302;
		case 0: return 16312092;
		case 1: return 2483712;
		case 2: return 16741376;
		case 3: return 5301186;
		case 4: return 16711796;
		default: return 0;
	}
}

function getMapPP(input, pcombo, pacc, pmissc, pmod = "", message) {

	var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + input);

	var content = "";   

	var req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			var obj = JSON.parse(content);
			if (!obj[0]) {console.log("Map not found"); return;}
			var mapinfo = obj[0];
			var mapid = mapinfo.beatmap_id;
			if (mapinfo.mode !=0) return;
			//console.log(obj.beatmaps[0])
			if (pmod) var mods = modenum(pmod)
			else var mods = 4;
			if (pacc) var acc_percent = parseFloat(pacc)
			else var acc_percent = 100;
			if (pcombo) var combo = parseInt(pcombo)
			else var combo;
			if (pmissc) var nmiss = parseInt(pmissc)
			else var nmiss = 0;
			var parser = new osu.parser();
			var pcparser = new osu.parser();
			console.log(acc_percent);
			//var url = "https://osu.ppy.sh/osu/1031991";
			var url = 'https://osu.ppy.sh/osu/' + mapid;
			cmd.get('curl ' + url ,
				function(err, data, stderr){
					//console.log(mods);
					pcparser.feed(data);
					var pcmap = pcparser.map;
					if (mods) {
						console.log("+" + osu.modbits.string(mods - 4));
					}
					var pcstars = new osu.diff().calc({map: pcmap, mods: mods - 4});
					//console.log(pcstars.toString());

					var pcpp = osu.ppv2({
						stars: pcstars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});

					var max_combo = pcmap.max_combo();
					combo = combo || max_combo;

					// console.log(pcpp.computed_accuracy.toString());
					// console.log(combo + "/" + max_combo + "x");

					//console.log(pcpp.toString());
					var line = data.split("\n");
					for (var x = 0; x < line.length; x++) {
						if (line[x].includes("CircleSize:")) {
							var csline = line[x].split(":");
							var cs = parseFloat(csline[1]);
							if (osu.modbits.string(mods).includes("HR")) var csedit = (cs*1.3-4)/1.3; 
							else var csedit = cs - 4;
							line[x] = csline[0] + ":" + csedit;
							//console.log(line[x]);
						}
						if (line[x].includes("OverallDifficulty:")) {
							var odline = line[x].split(":");
							var od = parseFloat(odline[1])
							if (osu.modbits.string(mods).includes("HR") && pmod.includes("PR")) var odedit = (od*1.4>10)? 9/1.4 : ((od*1.4-1)/1.4);
							else if (osu.modbits.string(mods).includes("HR") && !pmod.includes("PR")) var odedit = (od*1.4>10)? 5/1.4 : ((od*1.4-5)/1.4);
							else if (!osu.modbits.string(mods).includes("HR") && pmod.includes("PR")) var odedit = od - 1;
							else var odedit = od - 5;
							line[x] = odline[0] + ":" + odedit;
							console.log(line[x]);
						}
					}
					var data2 = "";
					for (var x = 0; x < line.length; x++) data2 += line[x] + "\n";
					var map = parser.map;
					if (map.ncircles == 0 && map.nsliders == 0) {console.log('Error: no object found'); return;}
					if (mods) {
						console.log("+" + osu.modbits.string(mods));
					}
					var stars = new osu.diff().calc({map: map, mods: mods});
					//console.log(stars.toString());

					var pp = osu.ppv2({
						stars: stars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});

					//console.log(pp.toString());
					var ppline = pp.toString().split("(");
					var starsline = stars.toString().split("(");
					var pcppline = pcpp.toString().split("(");
					var pcstarsline = pcstars.toString().split("(");
					const embed = {
						"title": mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + ((mods == 4 && (!pmod.includes("PR")))? " " : "+ ") + osu.modbits.string(mods - 4) + ((pmod.includes("PR")? "PR": "")),
						"description": "Download: [osu!](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download) ([no video](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download?noVideo=1)) - [Bloodcat]()",
						"url": "https://osu.ppy.sh/b/" + mapinfo.beatmap_id ,
						"color": mapstatusread(parseInt(mapinfo.approved)),
						"footer": {
							"icon_url": "https://images-ext-2.discordapp.net/external/d0iu_mPMvyoLQWnBSEnW4RL0-07KYm7zG9mjWdfWl7M/https/image.frl/p/yaa1nf94dho5f962.jpg",
							"text": "Elaina owo"
						},
						"author": {
							"name": "Map Found",
							"icon_url": "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg"
						},
						"thumbnail": {
							"url": "https://b.ppy.sh/thumb/" + mapinfo.beatmapset_id + ".jpg"
						},
						"fields": [
							{
								"name": "CS: " + mapinfo.diff_size + " - AR: " + mapinfo.diff_approach + " - OD: " + mapinfo.diff_overall + " - HP: " + mapinfo.diff_drain ,
								"value": "BPM: " + mapinfo.bpm + " - Length: " + mapinfo.hit_length + "/" + mapinfo.total_length + " s"
							},
							{
								"name": "Last Update: " + mapinfo.last_update,
								"value": "Result: " + combo + "x / " + acc_percent + "% / " + nmiss + " miss(es)"  
							},
							{
								"name": "Droid pp (Experimental): __" + ppline[0] + "__ - " + starsline[0] ,
								"value": "PC pp: " + pcppline[0] + " - " + pcstarsline[0]
							}
						]
					};
					message.channel.send({embed})
				}
			)
		});
	});
}

module.exports.run = (client, message, args) => {
	var beatmapid;
	var combo;
	var acc;
	var missc;
	var mod;
	if (!args[0]) message.channel.send("Hey at least give me the map :/");
	var hash = args[0]
	for (var i = 1; i < args.length; i++) {
		if (args[i].endsWith("%")) acc = args[i];
		if (args[i].endsWith("m")) missc = args[i];
		if (args[i].endsWith("x")) combo = args[i];
		if (args[i].startsWith("+")) mod = args[i];
	}
	console.log(acc);
	getMapPP(hash, combo, acc, missc, mod, message);
}

module.exports.help = {
	name: "hashtest"
}
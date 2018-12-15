var http = require('http');
var cmd = require("node-cmd");
var osu = require("ojsama");
var https = require("https");

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

function getMapPP(input, pcombo, pacc, pmissc, pmod, message, fallback) {
	var mapper = "";
	var diff = "";
	var artist = "";
	var title = "";

	var a = input.split(' - '); artist = a[0]; for (var i = 2; i <a.length; i++) a[1] += " - " + a[i]; 
	var b = a[1].split(' ('); title = b[0]; if (b.length>2) title += " (" + b[1];
	var c = b[b.length-1].split(' ['); mapper = c[0]; mapper = mapper.replace(/\)/g,"");
	for (var i = 1; i < c.length; i++) diff += c[i]; diff = diff.replace(/\]/g,"");
	
	var fmapper = mapper.split(" ")[0];
	var ftitle = title.split(" ")[0];
	var fartist = artist.split(" ")[0];
	var fdiff = diff.split(" ")[0];

	//small sure-fire patch
	if (title.includes("   ")) title = "";
	if (artist.includes("CV")) artist = artist.split("CV")[0]
	title = title.replace(/ s /g, "'s ");
	diff = diff.replace(/ s /g, "'s ");
	
	// console.log(artist);
	// console.log(title);
	// console.log(mapper);
	// console.log(diff);

	if (!fallback) var options = new URL("https://osusearch.com/query/?title=" + title + "&artist=" + artist + "&mapper=" + mapper + "&diff_name=" + diff + "&query_order=favorites")
	else var options = new URL("https://osusearch.com/query/?title=" + ftitle + "&artist=" + fartist + "&mapper=" + fmapper + "&diff_name=" + fdiff + "&query_order=favorites");

	var content = "";   

	var req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			var obj = JSON.parse(content);
			if (!obj.beatmaps[0]) {
				console.log("Map not found");
				if (!fallback) {
					getMapPP(input, pcombo, pacc, pmissc, pmod, message, true);
					return;
				}
				else return;
			}
			var mapinfo = obj.beatmaps[0];
			if (mapinfo.gamemode !=0) {console.log("invalid gamemod"); return;}
			//console.log(obj.beatmaps[0])
			var mods = modenum(pmod);
			var acc_percent = parseFloat(pacc);
			var combo = parseInt(pcombo);
			var nmiss = parseInt(pmissc);
			var parser = new osu.parser();
			var pcparser = new osu.parser();
			//var url = "https://osu.ppy.sh/osu/1031991";
			var url = 'https://osu.ppy.sh/osu/' + obj.beatmaps[0].beatmap_id
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

					//console.log(pcpp.computed_accuracy.toString());
					//console.log(combo + "/" + max_combo + "x");

					//console.log(pcpp.toString());
					var line = data.split("\n");
					data = "";
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
							if (osu.modbits.string(mods).includes("HR")) var odedit = (od*1.4>10)? 5/1.4 : ((od*1.4-5)/1.4);
							else var odedit = od - 5;
							line[x] = odline[0] + ":" + odedit;
							//console.log(line[x]);
						}
					}
					for (var x = 0; x < line.length; x++) data += line[x] + "\n";
					parser.feed(data);
					var map = parser.map;
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
						"title": mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.mapper + ") [" + mapinfo.difficulty_name + "] " + ((mods == 4)? " " : "+ ") + osu.modbits.string(mods - 4),
						"description": "Download: [osu!](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download) ([no video](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download?noVideo=1)) - [Bloodcat]()",
						"url": "https://osu.ppy.sh/b/" + mapinfo.beatmap_id ,
						"color": mapstatusread(mapinfo.beatmap_status),
						"footer": {
							"icon_url": "https://images-ext-2.discordapp.net/external/d0iu_mPMvyoLQWnBSEnW4RL0-07KYm7zG9mjWdfWl7M/https/image.frl/p/yaa1nf94dho5f962.jpg",
							"text": "Elaina owo" + (fallback)? "[fallback search]" : ""
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
								"name": "CS: " + mapinfo.difficulty_cs + " - AR: " + mapinfo.difficulty_ar + " - OD: " + mapinfo.difficulty_od + " - HP: " + mapinfo.difficulty_hp ,
								"value": "BPM: " + mapinfo.bpm + " - Length: " + mapinfo.play_length + "/" + mapinfo.total_length + " s"
							},
							{
								"name": "Last Update: " + mapinfo.date,
								"value": "❤️ " + mapinfo.favorites + " - ▶️ " + mapinfo.play_count
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
	let uid = args[0];
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
		let name=""; let title =""; let score=""; let ptime =""; let acc=""; let miss=""; let rank ="";let combo=""; let mod="";
		for (x = 0; x < b.length; x++) {
    	if (b[x].includes('<small>') && b[x - 1].includes('class="block"')) {
			b[x-1]=b[x-1].replace("<strong class=\"block\">","");
			b[x-1]=b[x-1].replace("<\/strong>","");
			b[x]=b[x].replace("<\/small>","");
			b[x]=b[x].replace("<small>","");
			b[x+1]=b[x+1].replace('<span id="statics" class="hidden">{"miss":','');
			b[x+1]=b[x+1].replace('}</span>','')
			title=b[x-1].trim();
			b[x]=b[x].trim();
			miss=b[x+1].trim();
			d = b[x].split("/"); ptime = d[0]; score = d[1]; mod = d[2]; combo = d[3]; acc = d[4];
			b[x-5]=b[x-5].trim();
			rank=rankread(b[x-5]);
			break;
    		}
		if (b[x].includes('h3 m-t-xs m-b-xs')) {
			b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
			b[x]=b[x].replace('<\/div>',"");
			b[x]=b[x].trim();
			name = b[x]
			}
		}
		
		if (title) {getMapPP(title, combo, acc, miss, mod, message, false);}
		
		const embed = {
			  "title": title,
			  "description": "**Score**: `" + score + "` - Combo: `" + combo + "` - Accuracy: `" + acc + "` (`" + miss + "` x )\nMod: `" + mod + "` Time: `" + ptime + "`",
			  "color": 8311585,
			  "author": {
					"name": "Recent Play for "+ name,
					"icon_url": rank
			}
		};
		message.channel.send({ embed });
    	});
	});
	req.end();
}

module.exports.help = {
	name: "recent"
}

var http = require('http');
var cmd = require("node-cmd");
var droid = require("./ojsamadroid");
var osu = require("ojsama")
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
			var nparser = new droid.parser();
			var pcparser = new osu.parser();
			console.log(acc_percent);
			//var url = "https://osu.ppy.sh/osu/1031991";
			var url = 'https://osu.ppy.sh/osu/' + mapid;
			cmd.get('curl ' + url ,
				function(err, data, stderr){
					nparser.feed(data);
					pcparser.feed(data);
					var pcmods = mods - 4;
					var nmap = nparser.map;
					var pcmap = pcparser.map
					var cur_od = nmap.od - 5;
					var cur_ar = nmap.ar;
					var cur_cs = nmap.cs - 4;
					// if (mods) {
					// 	console.log("+" + osu.modbits.string(mods));
					// }
					if (pmod.includes("HR")) {
						mods -= 16; 
						cur_ar = Math.min(cur_ar*1.4, 10);
						cur_od = Math.min(cur_od*1.4, 5);
						cur_cs += 1;
					}

					if (pmod.includes("PR")) { cur_od += 4; }

					nmap.od = cur_od; nmap.ar = cur_ar; nmap.cs = cur_cs;
                    
                    if (nmap.ncircles == 0 && nmap.nsliders == 0) {
						console.log(target[0] + ' - Error: no object found'); 
						return;
                    }
                    
					var nstars = new droid.diff().calc({map: nmap, mods: mods});
					var pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});
					//console.log(stars.toString());

                    
                    var npp = droid.ppv2({
						stars: nstars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});

					var pcpp = osu.ppv2({
						stars: pcstars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});
					
					nparser.reset()
                    
					console.log(nstars.toString());
                    console.log(npp.toString());
					var starsline = nstars.toString().split("(");
					var ppline = npp.toString().split("(");
					var pcstarsline = pcstars.toString().split("(");
					var pcppline = pcpp.toString().split("(");
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
								"value": "❤️ " + mapinfo.favourite_count + " - ▶️ " + mapinfo.playcount
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
		let name=""; let title =""; let score=""; let ptime =""; let acc=""; let miss=""; let rank ="";let combo=""; let mod=""; let hash = "";
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
			var mshs = b[x+1].trim().split(',');
			miss = mshs[0];
			hash = mshs[1].split(':')[1];
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
		
		if (title) {getMapPP(hash, combo, acc, miss, mod, message);}
		
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

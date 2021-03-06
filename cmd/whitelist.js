var https = require("https");
var mongodb = require("mongodb");
var apikey = process.env.OSU_API_KEY;

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

module.exports.run = (client, message, args, maindb) => {
    var whitelist = maindb.collection("mapwhitelist");
    if (message.member.roles.find("name", "pp-project Map Validator")) {
        var link_in = args[0];
        var hash_in = args[1]
        whitelistInfo(link_in, hash_in, message, (res, mapid = "", hashid = "", mapstring = "") => {
            if (res > 0) {
                var dupQuery = {mapid: parseInt(mapid)}
                whitelist.findOne(dupQuery, (err, wlres) => {
                    if (err) throw err;
                    if (!wlres) {
                        var insertData = {
                            mapid: parseInt(mapid),
                            hashid: hashid,
                            mapname: mapstring
                        }
                        whitelist.insertOne(insertData, () => {
                            console.log("Whitelist entry added")
                            message.channel.send("Whitelist entry added | `" + mapstring + "`")
                        })
                    }
                    else {
                        var updateData = { $set: {
                            mapid: parseInt(mapid),
                            hashid: hashid,
                            mapname: mapstring
                        }}
                        whitelist.updateOne(dupQuery, updateData, () => {
                            console.log("Whitelist entry update")
                            message.channel.send("Whitelist entry updated | `" + mapstring + "`")
                        })
                    }
                })
            }
            else message.channel.send("Beatmap white-listing failed")
        })
    }
    else message.channel.send("You don't have enough permission for this")
}

function whitelistInfo(link_in, hash_in, message, callback) {
    var wlmode = 0;
    var beatmapid = "";
    var hashid = "";

    if(link_in) {
        wlmode = 1;                     //Normal mode
        var line_sep = link_in.split('/');
        beatmapid = line_sep[line_sep.length-1]
    }
    if(hash_in) {wlmode = 2; hashid = hash_in;}             //Override mode (use for fixed map)
    if (wlmode > 0) var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + beatmapid);
    else return

	var content = "";   

	var req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
        });
        res.on("end", function () {
			var obj = JSON.parse(content);
            if (!obj[0]) {console.log("Map not found"); callback(0);}
            var mapinfo = obj[0];
            if (mapinfo.mode !=0) callback(0);

            if (wlmode == 1) hashid = mapinfo.file_md5;

            var mapstring = mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] ";

            const embed = {
                "title": mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] ",
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
                        "value": "Star Rating: " + parseFloat(mapinfo.difficultyrating).toFixed(2)
                    }
                ]
            };
            message.channel.send({embed})
            callback(1, beatmapid, hashid, mapstring);
        });
    })
}


module.exports.help = {
	name: "whitelist"
}

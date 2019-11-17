var https = require("https");
var mongodb = require("mongodb");
require("dotenv").config();
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
        whitelistInfo(link_in, message, (res, mapid, hashid, mapstring, diffstring) => {
            if (res > 0) {
                var i = 0;
                var entryarr = []
                for (i in mapid) {
                    var finalstring = mapstring + " [" + diffstring[i] + "]";
                    entryarr.push([mapid[i], hashid[i], finalstring]);
                }
                entryarr.forEach((entry) => {
                    var dupQuery = {mapid: parseInt(entry[0])}
                    whitelist.findOne(dupQuery, (err, wlres) => {
                        if (err) throw err;
                        if (!wlres) {
                            var insertData = {
                                mapid: parseInt(entry[0]),
                                hashid: entry[1],
                                mapname: entry[2]
                            }
                            console.log("Whitelist entry added")
                            whitelist.insertOne(insertData, () => {
                                message.channel.send("Whitelist entry added | `" + entry[2] + "`")
                            })
                        }
                        else {
                            var updateData = { $set: {
                                mapid: parseInt(entry[0]),
                                hashid: entry[1],
                                mapname: entry[2]
                            }}
                            console.log("Whitelist entry update")
                            whitelist.updateOne(dupQuery, updateData, () => {
                                message.channel.send("Whitelist entry updated | `" + entry[2] + "`")
                            })
                        }
                    })
                })
            }
            else message.channel.send("Beatmap white-listing failed")
        })
    }
    else message.channel.send("You don't have enough permission for this")
}

function whitelistInfo(link_in, message, callback) {
    var setid = "";
    var mapid = [];
    var hashid = [];
    var diffstring = [];

    if(link_in) {                 //Normal mode
        var line_sep = link_in.split('/');
        setid = line_sep[line_sep.length-1]
    }
    var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&s=" + setid);

	var content = "";   

	var req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
        });
        res.on("end", function () {
			var obj = JSON.parse(content);
            if (!obj[0]) {console.log("Set not found"); callback(0);}
            var mapinfo = obj;
            var firstmapinfo = mapinfo[0];
            if (firstmapinfo.mode !=0) callback(0);

            for (i in mapinfo) {
                if (mapinfo[i].mode == 0) {
                    mapid.push(mapinfo[i].beatmap_id);
                    hashid.push(mapinfo[i].file_md5);
                    diffstring.push(mapinfo[i].version);
                }
            }
            
            var listoutput = ""

            for (i in diffstring) {
                listoutput += "- " + diffstring[i] + " - **" + parseFloat(mapinfo[i].difficultyrating).toFixed(2) + "**\n" ;
            }

            var mapstring = firstmapinfo.artist + " - " + firstmapinfo.title + " (" + firstmapinfo.creator + ")";

            const embed = {
                "title": mapstring,
                "description": "Download: [osu!](https://osu.ppy.sh/beatmapsets/" + firstmapinfo.beatmapset_id + "/download) ([no video](https://osu.ppy.sh/beatmapsets/" + firstmapinfo.beatmapset_id + "/download?noVideo=1)) - [Bloodcat]()",
                "url": "https://osu.ppy.sh/b/" + firstmapinfo.beatmap_id ,
                "color": mapstatusread(parseInt(firstmapinfo.approved)),
                "footer": {
                    "icon_url": "https://images-ext-2.discordapp.net/external/d0iu_mPMvyoLQWnBSEnW4RL0-07KYm7zG9mjWdfWl7M/https/image.frl/p/yaa1nf94dho5f962.jpg",
                    "text": "Elaina owo"
                },
                "author": {
                    "name": "Set Found",
                    "icon_url": "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg"
                },
                "thumbnail": {
                    "url": "https://b.ppy.sh/thumb/" + firstmapinfo.beatmapset_id + ".jpg"
                },
                "fields": [
                    {
                        "name": "Last Update: " + firstmapinfo.last_update,
                        "value": "Star Rating: \n" + listoutput 
                    }
                ]
            };
            message.channel.send({embed})
            console.log(mapid)
            console.log(hashid)
            console.log(mapstring)
            console.log(diffstring)
            callback(1, mapid, hashid, mapstring, diffstring);
        });
    })
}


module.exports.help = {
	name: "whitelistset"
}

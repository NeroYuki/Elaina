var http = require('http');
var mongodb = require('mongodb');

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

function convertTimeDiff(playTime) {
	year = parseInt(playTime.split(" ")[0].split("-")[0]);
	month = parseInt(playTime.split(" ")[0].split("-")[1])-1;
	day = parseInt(playTime.split(" ")[0].split("-")[2]);
	hour = parseInt(playTime.split(" ")[1].split(":")[0]);
	minute = parseInt(playTime.split(" ")[1].split(":")[1]);
	second = parseInt(playTime.split(" ")[1].split(":")[2]);
	var convertedTime = new Date(year, month, day, hour, minute, second);
	var timeDiff = Date.now()-convertedTime;
	return timeDiff;
}

module.exports.run = (client, message = "", args = {}, maindb) => {
	let trackdb = maindb.collection("tracking");
	trackdb.find({}).toArray(function(err, res) {
		if (err) throw err;
		//console.log(res);
		res.forEach(function(player) {
			var options = {
				host: "ops.dgsrz.com",
				port: 80,
				path: "/profile.php?uid=" + player.uid + ".html"
			};

			var content = "";   

			var req = http.request(options, function(res) {
				res.setEncoding("utf8");
				res.on("data", function (chunk) {
					content += chunk;
				});

				res.on("end", function () {
					const a = content;
					let b = a.split('\n'); let name=""; let newplay = true; let playIndex=0; let title =""; let score=""; let ptime =""; let acc=""; let miss=""; let rank ="";let combo=""; let mod="";
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
							miss=b[x+1].trim().split(',')[0];
							var d = b[x].split("/"); ptime = d[0]; score = d[1]; mod = d[2]; combo = d[3]; acc = d[4];
							ptime=ptime.trim();
							b[x-5]=b[x-5].trim();
							rank=rankread(b[x-5]);
							let timeDiff = convertTimeDiff(ptime);
							if (newplay) {
								if (timeDiff>600000) newplay = false;
								else {
									//console.log(timeDiff)
									const embed = {
										"title": title,
										"description": "**Score**: `" + score + "` - Combo: `" + combo + "` - Accuracy: `" + acc + "` (`" + miss + "` x )\nMod: `" + mod + "` Time: `" + ptime + "`",
										"color": 8311585,
										"author": {
											"name": "Recent Play for "+ name,
											"icon_url": rank
										}
									};
								client.channels.get("464102207113920524").send({ embed }); //original
								//client.channels.get("461446313956081695").send({ embed });
								}
							}
							playIndex++;
						}
						if (b[x].includes('h3 m-t-xs m-b-xs')) {
							b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
							b[x]=b[x].replace('<\/div>',"");
							b[x]=b[x].trim();
							name = b[x]
						}
					}
				});
			});
			req.end();
		});
	});
}

module.exports.help = {
	name: "trackfunc"
}

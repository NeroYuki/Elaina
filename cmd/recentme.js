var http = require('http');
var fs = require('fs');

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

module.exports.run = (client, message, args) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	console.log(ufind);
	fs.readFile("userbind.txt", 'utf8', function(err, data) {
        if (err) throw err;
		var u = data
		var found=false;
		let x = u.split('\n');
		for (i = 0; i < x.length; i++) {
			if (x[i].includes(ufind)) {
				let e = x[i].split(' ');
				uid = e[1];
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
					found=true;
				}
			}
		if (!found) {message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first")};
	});
}

module.exports.help = {
	name: "recentme"
}

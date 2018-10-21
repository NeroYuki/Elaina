var http = require('http');
var fs = require('fs');

module.exports.run = (client, message, args) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	console.log(ufind);
	fs.readFile("userbind.txt", 'utf8', function(err, data) {
        if (err) throw err;
		var u = data;
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
					let b = a.split('\n'), c = []; 
					let name=""; let rank=""; let tscore =""; let pcount=""; let avalink=""; let location="";
					for (x = 0; x < b.length; x++) {
					if (b[x].includes('h3 m-t-xs m-b-xs')) {
						b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
						b[x]=b[x].replace('<\/div>',"");
						b[x]=b[x].trim();
						name = b[x];
						b[x-3]=b[x-3].replace('<img src="',"");
						b[x-3]=b[x-3].replace('" class="img-circle">',"");
						b[x-3]=b[x-3].trim();
						avalink = b[x-3];
						b[x+8]=b[x+8].replace('<span class="m-b-xs h4 block">',"");
						b[x+8]=b[x+8].replace('<\/span>',"");
						b[x+8]=b[x+8].trim();
						rank = (parseInt(b[x+8])-1).toString();
						b[x+1]=b[x+1].replace('<small class="text-muted"><i class="fa fa-map-marker"><\/i>',"");
						b[x+1]=b[x+1].replace("<\/small>","");
						b[x+1]=b[x+1].trim()
						location=b[x+1]
						}
					if (b[x].includes('Technical Analysis')) {
						b[x+3]=b[x+3].replace('<span class="pull-right">',"");
						b[x+3]=b[x+3].replace('<\/span>',"");
						b[x+3]=b[x+3].trim()
						tscore=b[x+3]
						b[x+13]=b[x+13].replace('<span class="pull-right">',"");
						b[x+13]=b[x+13].replace('<\/span>',"");
						b[x+13]=b[x+13].trim()
						pcount=b[x+13]
						}
					}
					const embed = {
  						"description": "**Username: **"+name+"  /  **Rank**: "+rank + "\n" + location,
 		 				"color": 8102199,
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
      							"name": "Total Score: " + tscore,
      							"value": "Play Count: " + pcount
    						}
  						]
						};
					message.channel.send({ embed });
    				});
				});
				req.end();
				found=true;
			}
		}
		if(!found){message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first")};
	});
}

module.exports.help = {
	name: "pfme"
}

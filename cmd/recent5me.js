var http = require('http');
var fs = require('fs');

function rankread(imgsrc) {
	let rank="";
	switch(imgsrc) {
		case '<img src="assets/images/ranking-S-small.png"/>':rank="S Rank";break;
		case '<img src="assets/images/ranking-A-small.png"/>':rank="A Rank";break;
		case '<img src="assets/images/ranking-B-small.png"/>':rank="B Rank";break;
		case '<img src="assets/images/ranking-C-small.png"/>':rank="C Rank";break;
		case '<img src="assets/images/ranking-D-small.png"/>':rank="D Rank";break;
		case '<img src="assets/images/ranking-SH-small.png"/>':rank="SH Rank";break;
		case '<img src="assets/images/ranking-X-small.png"/>':rank="SS Rank";break;
		case '<img src="assets/images/ranking-XH-small.png"/>':rank="SSH Rank";break;
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
					let b = a.split('\n'), c = []; let name="";
					for (x = 0; x < b.length; x++) {
    				if (b[x].includes('<small>') && b[x - 1].includes('class="block"')) {
						b[x-1]=b[x-1].replace("<strong class=\"block\">","");
						b[x-1]=b[x-1].replace("<\/strong>","");
						b[x]=b[x].replace("<\/small>","");
						b[x-1]=b[x-1].trim();
						b[x]=b[x].trim();
						b[x-5]=b[x-5].trim();
						b[x-5]=rankread(b[x-5]);
						b[x]=b[x].replace("<small>","\n");
        				c.push(b[x-5]+" - "+b[x-1]+b[x]);
    					}
					if (b[x].includes('h3 m-t-xs m-b-xs')) {
						b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
						b[x]=b[x].replace('<\/div>',"");
						b[x]=b[x].trim();
						name = b[x]
						}
					}
					console.log(c[0]);
					message.channel.send("```5 Recent plays for "+name+"\n\n1. "+c[0]+"\n\n2. "+c[1]+"\n\n3. "+c[2]+"\n\n4. "+c[3]+"\n\n5. "+c[4]+"```");
    				});
				});
				req.end();
				found=true;
				}
			}
		if (!found) {message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first")}
	});
}

module.exports.help = {
	name: "recent5me"
}

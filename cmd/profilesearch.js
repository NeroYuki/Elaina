var fs = require('fs');

module.exports.run = (client, message, args) => {
    let username = args[0];
	var notFound=0;
    fs.readFile("profileDataDump(2417-30000).txt", 'utf8', function(err, data) {
        if (err) throw err;
		var u = data;
        let b = u.split('\n'); c=[];
		for (x = 0; x < b.length; x++) {
    	if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
			b[x-1]="\n"+b[x-1];
			c.push([b[x],b[x-1]]);
			}
		}
		if (c.length!=0) {message.channel.send("```"+c[0]+"```")}
		else {
			notFound++;
			if (notFound==4) {
				message.channel.send("User not found, please input correct name (include upper and lower case)");
				notFound=0;
			}
		}
		});
        fs.readFile("profileDataDump(30000-100000).txt", 'utf8', function(err, data) {
        if (err) throw err;
		var u = data;
        let b = u.split('\n'); d=[];
		for (x = 0; x < b.length; x++) {
    	if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
			b[x-1]="\n"+b[x-1];
			d.push([b[x],b[x-1]]);
			}
		}
		if (d.length!=0) {message.channel.send("```"+d[0]+"```")}
		else {
			notFound++;
			if (notFound==4) {
				message.channel.send("User not found, please input correct name (include upper and lower case)");
				notFound=0;
			}
		}
		});
        fs.readFile("profileDataDump(100000-150000).txt", 'utf8', function(err, data) {
        if (err) throw err;
		var u = data;
        let b = u.split('\n');e=[];
		for (x = 0; x < b.length; x++) {
    	if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
			b[x-1]="\n"+b[x-1];
			e.push([b[x],b[x-1]]);
			}
		}
		if (e.length!=0) {message.channel.send("```"+e[0]+"```")}
		else {
			notFound++;
			if (notFound==4) {
				message.channel.send("User not found, please input correct name (include upper and lower case)");
				notFound=0;
			}
		}
	});
	fs.readFile("profileDataDump(150000-200000).txt", 'utf8', function(err, data) {
        if (err) throw err;
		var u = data;
        let b = u.split('\n');e=[];
		for (x = 0; x < b.length; x++) {
    	if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
			b[x-1]="\n"+b[x-1];
			e.push([b[x],b[x-1]]);
			}
		}
		if (e.length!=0) {message.channel.send("```"+e[0]+"```")}
		else {
			notFound++;
			if (notFound==4) {
				message.channel.send("User not found, please input correct name (include upper and lower case)");
				notFound=0;
			}
		}
	});
}
}

module.exports.help = {
	name: "profilesearch"
}

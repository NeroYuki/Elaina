var fs = require("fs");

module.exports.run = (client, message, args) => {
		let uid = args[0];
		if (isNaN(parseInt(uid))) {message.channel.send("Your uid please!")}
		else {
		fs.readFile("userbind.txt", 'utf8', function(err, data) {
			if (err) throw err;
			var dup=false;
			var updatedata="";
			let b = data.split('\n');
			for (i=0;i<b.length;i++) {
				if (b[i].includes(message.author.id)) {
					b[i]=b[i].replace(b[i],message.author.id+" "+uid);
					dup=true;
				}
			}
			if (!dup) {
				b.push(message.author.id+" "+uid);
			}
			for (i=0;i<b.length;i++) {
				updatedata = updatedata + b[i];
				if (i!=b.length-1) {updatedata=updatedata+"\n"}
			}
			fs.writeFile("userbind.txt", updatedata, function(err) {
				if (err) throw err;
				message.channel.send("Haii <3, binded <@"+message.author.id+"> to uid "+uid);
				});
			});
		}
}

module.exports.help = {
	name: "userbind"
}

var fs = require("fs");

module.exports.run = (client, message, args) => {
	if (message.member.roles.find("name", "Owner")) {
		let uid = args[0];
		if (isNaN(parseInt(uid))) {message.channel.send("Your uid please!")}
		else {
		fs.readFile("tracking.txt", 'utf8', function(err, data) {
			if (err) throw err;
			var dup=false;
			var updatedata="";
			let b = data.split('\n');
			for (i=0;i<b.length;i++) {
				if (b[i] == uid) {
                    dup=true;
                   	message.channel.send("this uid has been already added");
                }
			}
			if (!dup) {
				b.push(uid);
			}
			for (i=0;i<b.length;i++) {
				updatedata = updatedata + b[i];
				if (i!=b.length-1) {updatedata=updatedata+"\n"}
			}
			fs.writeFile("tracking.txt", updatedata, function(err) {
				if (err) throw err;
				message.channel.send("Now tracking uid "+uid);
				});
			});
		}
	}
	else message.channel.send("You don't have enough permission to use this :3");
}

module.exports.help = {
	name: "addtrack"
}

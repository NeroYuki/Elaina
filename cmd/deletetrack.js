var fs = require("fs");

module.exports.run = (client, message, args) => {
		let uid = args[0];
		if (isNaN(parseInt(uid))) {message.channel.send("uid please!")}
		else {
		fs.readFile("tracking.txt", 'utf8', function(err, data) {
			if (err) throw err;
			var found=false;
			var updatedata="";
			let b = data.split('\n');
			for (i=0;i<b.length;i++) {
				if (b[i] == uid) {
          found=true;
          b.splice(i,1);
          message.channel.send("uid "+uid+" is now deleted from tracking list");          
        }
			}
			if (!found) {
        message.channel.send("this uid has not been tracked");
			}
			for (i=0;i<b.length;i++) {
				updatedata = updatedata + b[i];
				if (i!=b.length-1) {updatedata=updatedata+"\n"}
			}
			fs.writeFile("tracking.txt", updatedata, function(err) {
				if (err) throw err;
				});
			});
		}
}

module.exports.help = {
	name: "deletetrack"
}
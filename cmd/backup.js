var fs = require("fs");
var s3fs = require('s3fs');
s3fskey = process.env.AWS_KEY
var s3Impl = new s3fs('elaina.neroyuki', {
	region: 'us-east-2',
	accessKeyId: 'AKIAJQOLLTS3ZN6GH7OA',
	secretAccessKey: s3fskey
});

module.exports.run = (client, message, args) => {
	if (message.member.roles.find("name", "Owner")) {
		var updatedata = ''
		fs.readFile("userbind.txt", 'utf8', function(err, data) {
			if (err) throw err;
			updatedata = data;
			console.log('userbind loaded, uploading to cloud...');
			s3Impl.writeFile("userbind.txt", updatedata, function(err) {
				if (err) throw err;
				message.channel.send('```Userbind Backup successful!```')
			});
		});
		fs.readFile("tracking.txt", 'utf8', function(err, data) {
		  if (err) throw err;
		  updatedata = data;
		  console.log('tracking loaded, uploading to cloud...');
		  s3Impl.writeFile("tracking.txt", updatedata, function(err) {
			  if (err) throw err;
			  message.channel.send('```Tracking Backup successful!```')
		  });
		});
	}
	else message.channel.send("You don't have enough permission to use this :3");
}

module.exports.help = {
	name: "backup"
}

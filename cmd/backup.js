var fs = require("fs");
var s3fs = require('s3fs');
s3fskey = process.env.AWS_KEY || 'X6b6M2QtVQMOJwO5l9QCpmlQ9OALv9Ei+Ma+Z7LW' 
var s3Impl = new s3fs('elaina.neroyuki', {
	region: 'us-east-2',
	accessKeyId: 'AKIAISUFXAETCXNWV4NA',
	secretAccessKey: s3fskey
});

module.exports.run = (client, message, args) => {
    var updatedata = ''
    fs.readFile("userbind.txt", 'utf8', function(err, data) {
        if (err) throw err;
        updatedata = data;
        console.log('Loaded, uploading to cloud...');
        s3Impl.writeFile("userbind.txt", updatedata, function(err) {
            if (err) throw err;
            message.channel.send('```Backup successful!```')
        });
    });
}

module.exports.help = {
	name: "backup"
}
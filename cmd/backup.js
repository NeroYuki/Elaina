var fs = require("fs");
var s3fs = require('s3fs');
s3fskey = process.env.AWS_KEY
var s3Impl = new s3fs('elaina.neroyuki', {
	region: 'us-east-2',
	accessKeyId: 'AKIAJQOLLTS3ZN6GH7OA',
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
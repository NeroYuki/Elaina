
var http = require('http');
var mongodb = require('mongodb');

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) throw err;
		if (res[0]) {
			var username = res[0].username;
			var discordid = res[0].discordid;
			var pp = 0;
			var ppentry = [];
			if (res[0].pptotal) pp = res[0].pptotal.toFixed(2);
			if (res[0].pp) ppentry = res[0].pp;
			
			var output = '<@' + discordid + '> PP Profile for ' + username + '\n';
			var codeoutput = 'Total PP: ' + pp + '\n'; 
			for (var x = 0; x < 5; x++) {
				if (ppentry[x]) codeoutput += (x+1) + '. ' + ppentry[x][1] + ' - ' + ppentry[x][2] + ' pp\n';
				else codeoutput += '-\n';
			}
			message.channel.send(output + '```' + codeoutput + '```');
		}
	});
}


module.exports.help = {
	name: "ppcheck"
}

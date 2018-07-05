const Discord = require ("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var http = require("http");
var util = require("util");
var s3fs = require("s3fs");
s3fskey = process.env.AWS_KEY 
var s3Impl = new s3fs('elaina.neroyuki', {
	region: 'us-east-2',
	accessKeyId: 'AKIAJQOLLTS3ZN6GH7OA',
	secretAccessKey: s3fskey
});

client.commands = new Discord.Collection();
fs.readdir("./cmd/" , (err, files) => {
	if (err) throw err;
	let cmdfile = files.filter (f => f.split(".").pop() === "js");
	if (cmdfile.length <= 0) {
		console.log("No command found uwu");
		return;
	}
	
	console.log(`Loading ${cmdfile.length} command(s), please wait...`);
	cmdfile.forEach((f, i) => {
		let props = require(`./cmd/${f}`);
		console.log(`${i+1} : ${f} loaded`);
		client.commands.set(props.help.name, props);
	});
});


client.on("ready", () => {
    console.log("Elaina is up and running");
	var updatedata = '';
    	s3Impl.readFile("userbind.txt", 'utf8', function(err, data) {
        if (err) throw err;
        updatedata = data;
        console.log('userbind downloaded, making change to file system...');
        fs.writeFile("userbind.txt", updatedata, function(err) {
            if (err) throw err;
            console.log('userbind restored')
        });
    });
	s3Impl.readFile("tracking.txt", 'utf8', function(err, data) {
      if (err) throw err;
      updatedata = data;
      console.log('tracking downloaded, making change to file system...');
      fs.writeFile("tracking.txt", updatedata, function(err) {
          if (err) throw err;
          console.log('tracking restored')
      });
  });
  	setInterval(trackfunc,600000);

  	function trackfunc () {
    		let cmd = client.commands.get("trackfunc");
		cmd.run(client);
  	}
});

client.on("message", (message) => {
    let msgArray = message.content.split(/\s+/g);
	let command = msgArray[0];
	let args = msgArray.slice(1);
	
	if (message.content.includes("m.mugzone.net/chart/")) {
		let cmd = client.commands.get("malodychart")
		cmd.run(client, message, args);
	}
	
	if (!message.content.startsWith(config.prefix)|| message.author.bot) return;
	let cmd = client.commands.get(command.slice(config.prefix.length));
	if (cmd) {
		cmd.run(client, message, args);
	}
});

client.login(process.env.BOT_TOKEN);

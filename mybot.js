const Discord = require ("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var http = require("http");
var util = require("util");
var mongodb = require('mongodb');
require("dotenv").config();


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

let uri = 'mongodb+srv://NeroYuki:ngocdang241@elainadb-r6qx3.mongodb.net/test?retryWrites=true';
let maindb = '';
	
mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, function(err, db) {
	if (err) throw err;
	maindb = db.db('ElainaDB');
	console.log("db connection established");
})

client.on("ready", () => {
    console.log("Elaina is up and running");
	
  	setInterval(trackfunc, 600000);

  	function trackfunc () {
    	let cmd = client.commands.get("trackfunc");
		cmd.run(client, message = "", args = {}, maindb);
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
		cmd.run(client, message, args, maindb);
	}
});

client.login(process.env.BOT_TOKEN);



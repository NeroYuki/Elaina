const Discord = require ("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var http = require("http");
var util = require("util");
var wajs = require('wajs');
var waAppId = process.env.WA_APP_ID || "WA_APPID HERE"
var waClient = new wajs(waAppId);

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

client.login(config.token);

client.on("ready", () => {
    console.log("Elaina is up and running");
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

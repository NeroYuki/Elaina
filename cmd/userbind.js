const Discord = require('discord.js');
const http = require('http');
const droidapikey = process.env.DROID_API_KEY;

/**
 * Checks if a specific uid has played verification map.
 *
 * @param {number|string} uid The uid of the account
 * @returns {Promise<boolean>}
 */
function checkPlay(uid) {
    return new Promise(resolve => {
        let options = {
            host: "ops.dgsrz.com",
            port: 80,
            path: `/api/scoresearchv2.php?apiKey=${droidapikey}&uid=${uid}&hash=0eb866a0f36ce88b21c5a3d4c3d76ab0`
        };
        let content = '';

        let req = http.request(options, res => {
            res.setEncoding('utf8');
            res.on('data', chunk => {
                content += chunk
            });
            res.on('end', () => {
                let entry = content.split("<br>");
                entry.shift();
                resolve(entry.length !== 0)
            })
        });
        req.end()
    })
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.guild.id != "325667948905758730" && !message.member.roles.find(r => r.name === "Member")) return message.channel.send("You must be verified before binding your account!");
    let uid = args[0];
    if (!uid) return message.channel.send("Your uid please!");
    if (isNaN(uid)) return message.channel.send("Invalid uid");
    let binddb = maindb.collection("userbind");
    let options = {
        host: "ops.dgsrz.com",
        port: 80,
        path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
    };

    let content = "";

    let req = http.request(options, function (res) {
        res.setEncoding("utf8");
        res.on("data", function (chunk) {
            content += chunk;
        });
        res.on("error", err => {
            console.log(err);
            return message.channel.send("Error: Unable to retrieve user data. Please try again!")
        });
        res.on("end", function () {
            if (content.includes("<html>")) return message.channel.send("Invalid uid");
            let headerres = content.split('<br>')[0].split(" ");
            if (headerres[0] == 'FAILED') return message.channel.send("User doesn't exist");
            let name = headerres[2];
            let uid = headerres[1];

            binddb.findOne({previous_bind: {$all: [uid]}}, async function (err, res) {
                if (err) throw err;

                if (!res) {
                    const hasPlayed = await checkPlay(uid);
                    if (!hasPlayed) return message.channel.send("The account hasn't played verification map yet! Please play this map before binding the account:\nhttps://drive.google.com/open?id=11lboYlvCv8rHfYOI3YvJEQXDUrzQirdr\n\nThis is a one-time verification and you will not be asked again in the future.");
                    binddb.findOne({discordid: message.author.id}, (err, bindres) => {
                        if (err) throw err;
                        if (bindres) {
                            let previous_bind = bindres.previous_bind;
                            if (previous_bind.length >= 2) return message.channel.send("You have reached the limit of 2 binded accounts");
                            previous_bind.push(uid);
                            let updateVal = {
                                $set: {
                                    username: name,
                                    uid: uid,
                                    previous_bind: previous_bind
                                }
                            };
                            binddb.updateOne({discordid: message.author.id}, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send(`Haii <3, binded ${message.author} to uid ${uid}`);
                            })
                        } else {
                            let insertVal = {
                                discordid: message.author.id,
                                uid: uid,
                                username: name,
                                pptotal: 0,
                                playc: 0,
                                pp: [],
                                previous_bind: [uid],
                                clan: ""
                            };
                            binddb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send(`Haii <3, binded ${message.author} to uid ${uid}`);
                            })
                        }
                    });
                    return
                }

                if (res.discordid !== message.author.id) return message.channel.send("That uid has been previously binded by someone else");
                let updateVal = {
                    $set: {
                        username: name,
                        uid: uid
                    }
                };

                binddb.updateOne({discordid: message.author.id}, updateVal, err => {
                    if (err) throw err;
                    message.channel.send(`Haii <3, binded ${message.author} to uid ${uid}`);
                })
            })
        })
    });
    req.end()
};

module.exports.help = {
    name: "userbind"
};

var cd = new Set();

var request = require('request')

function spaceFill (s, l) {
    var a = s.length;
    for (var i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

async function lbcall(hash, page) {
    var droidapikey = process.env.DROID_API_KEY
    var url = 'http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=' + droidapikey + '&hash=' + hash + '&order=score&page=' + page 
    var entries = [];
    //console.log("calling")
    return new Promise((resolve, reject) => {
        request(url, function (err, response, data) {
            if (err) reject(error);
            var line = data.split('<br>')
            for (i in line) {
                entries.push(line[i].split(' '));
            }
            entries.shift();
            //console.log("called")
            resolve(entries);
        })
    })
}

function modstring(mod) {
    var res = " +";
    if (mod.includes("e")) res += "EZ";
    if (mod.includes("h")) res += "HD";
	if (mod.includes("r")) res += "HR";
	if (mod.includes("d")) res += "DT";
	if (mod.includes("c")) res += "NC";
	if (mod.includes("n")) res += "NF";
	if (mod.includes("t")) res += "HT";
	return res;
}

async function editlb(hash, cache, page) {
    return new Promise(async (resolve, reject) => {
        var output = ""
        req_page = Math.floor(parseInt(page) / 10)
        //console.log(page + "-" + req_page)
        //if no longer in page range, load new req_page
        if (req_page != cache.req_page) {
            cache.content = await lbcall(hash, req_page)
            cache.req_page = req_page
        }
        //process the cache
        //console.log(cache.content)
        var lower_bound = page * 10 - ((req_page) * 100)
        var upper_bound = page * 10 + 10 - ((req_page) * 100)
        for (var i = lower_bound ; i < upper_bound ; i++) {
            if (cache.content[i]) {
                var modstringres = modstring(cache.content[i][6])
                if (modstringres == " +") modstringres = ""
                output += spaceFill((req_page * 100 + i + 1).toString(), 3) + " - " + spaceFill(cache.content[i][2], 15) + " - " + spaceFill(cache.content[i][5], 2) + " - " + spaceFill(cache.content[i][3], 10) + "(" + cache.content[i][4] +"x "+ (parseInt(cache.content[i][7])/1000).toFixed(3) +"% "+ cache.content[i][8] +"m" + modstringres + ")\n" 
                output += (new Date(parseInt(cache.content[i][9]) * 1000)).toUTCString() + "\n"
            }
            else break;
        }
        output += "Current page: " + (page + 1);
        resolve(output)
    })
}

function mapcall(bid, cb) {
    var apikey = process.env.OSU_API_KEY;
    var url = "https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + bid
    request(url, (err, response, data) => {
        if (err) throw err
        var obj = JSON.parse(data);
        if (!obj[0]) {console.log("Map not found"); cb(1)}
        else {cb(obj[0].file_md5)}
    })
}

module.exports.run = async (client, message, args) => {
    if (!args[0]) {message.channel.send("Hey at least give me the map :/"); return;}
	var a = args[0].split("/");
    beatmapid = a[a.length-1]
    mapcall(beatmapid, async (hash) => {
        console.log(hash)
        var page = 0;
        var cache = {
            req_page: -1,
            content: []
        }
        let output = await editlb(hash, cache, page);
        message.channel.send('```' + output + '```').then (msg => {
            msg.react("⏮️").then(() => {
                msg.react("⬅️").then(() => {
                    msg.react("➡️").then(() => {
                        msg.react("⏭️").catch(e => console.log(e))
                    })
                })
            });

            let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
            let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
            let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
            let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

            backward.on('collect', async () => {
                page = Math.max(1, page - 10);
                output = await editlb(hash, cache, page);
                msg.edit('```' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
            });

            back.on('collect', async () => {
                page--;
                output = await editlb(hash, cache, page);
                msg.edit('```' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
            });

            next.on('collect', async () => {
                page++;
                output = await editlb(hash, cache, page);
                msg.edit('```' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
            });

            forward.on('collect', async () => {
                page += 10;
                output = await editlb(hash, cache, page);
                msg.edit('```' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
            })
        });
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 15000)
    })
}

module.exports.help = {
	name: "maplb"
}

var request = require("request");

function spaceFill (s, l) {
    var a = s.length;
    for (var i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

function editmsg(cache, page) {
    var res = "```"
    res += spaceFill("No.", 4) + " | " + spaceFill("Country", 20) + " | " + spaceFill("C", 7) + " | " + spaceFill("D", 7) + " | " + spaceFill("R", 7) + "\n"
    for (var i = page * 10; i < page * 10 + 10; i++) {
        if (i >= cache.length) break;
        res += spaceFill((i+1).toString(), 4) + " | " + spaceFill(cache[i][0], 20) + " | " + spaceFill(cache[i][1][0].toString(), 7) + " | " + spaceFill(cache[i][1][1].toString(), 7) + " | " + spaceFill(cache[i][1][2].toString(), 7) + "\n"
    }
    res += "```\nRemember to stay safe, wear mask if possible, wash your hand regularly, and don't touch your nose"
    return res;
}

module.exports.run = (client, message, args) => {
    var options = {
        method: 'GET',
        url: 'https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats',
        headers: {
            'x-rapidapi-host': 'covid-19-coronavirus-statistics.p.rapidapi.com',
            'x-rapidapi-key': 'd70541ca34msh7338204e1c5778ap1b6f1ejsnea702980eb23'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        //console.log(body);
        let obj = JSON.parse(body)
        if (obj.statusCode != 200) {
            message.channel.send("Error fetching data")
            return
        }
        let stat = obj.data.covid19Stats
        let table = new Map();
        for (var i in stat) {
            if (table.get(stat[i].country) === undefined) table.set(stat[i].country,[stat[i].confirmed, stat[i].deaths, stat[i].recovered])
            else {
                var confirmed = table.get(stat[i].country)[0] + stat[i].confirmed
                var deaths = table.get(stat[i].country)[1] + stat[i].deaths
                var recovered = table.get(stat[i].country)[2] + stat[i].recovered
                table.set(stat[i].country,[confirmed, deaths, recovered])
            }
        } 
        table[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => b[1][0] - a[1][0]);
        }
        //console.table(table)
        let page = 0;
        let cache = [];
        const iterator1 = table[Symbol.iterator]();

        for (let item of iterator1) {
            cache.push(item)
        }
        //console.log(cache)
        let sendmsg = editmsg(cache, page)
        message.channel.send(sendmsg).then(msg => {
			msg.react("⏮️").then(() => {
				msg.react("⬅️").then(() => {
					msg.react("➡️").then(() => {
						msg.react("⏭️").catch(console.error)
					})
				})
			});

			let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
			let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
			let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
			let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

			backward.on('collect', () => {
				page = 0;
				sendmsg = editmsg(cache, page)
                msg.edit(sendmsg).catch(console.error)
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
			});

			back.on('collect', () => {
                if (page > 0) page--;
				sendmsg = editmsg(cache, page)
                msg.edit(sendmsg).catch(console.error)
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
			});

			next.on('collect', () => {
				if (page < Math.floor(cache.length / 10)) page++;
				sendmsg = editmsg(cache, page)
                msg.edit(sendmsg).catch(console.error)
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
			});

			forward.on('collect', () => {
				page = Math.floor(cache.length / 10)
				sendmsg = editmsg(cache, page)
                msg.edit(sendmsg).catch(console.error)
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
			});
		});
    });
}

module.exports.help = {
	name: "corona"
}

var mongodb = require('mongodb');

function spaceFill (s, l) {
    var a = s.length;
    for (var i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

module.exports.run = (client, message, args, maindb) => {
    var output = '#  | Username          | UID    | Play | PP \n'
    var binddb = maindb.collection('userbind')
    var ppsort = { pptotal: -1 };
    binddb.find({}, { projection: { _id: 0, discordid: 1, uid: 1, pptotal: 1 , playc: 1, username: 1}}).sort(ppsort).toArray(function(err, res) {
        if (err) throw err;
        for (var i = 0; i < 20; i++) {
            if (res[i].pptotal && res[i].playc) {output += spaceFill((parseInt(i)+1).toString(),3) + ' | ' + spaceFill(res[i].username, 18) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].playc.toString(), 5) + ' | ' + res[i].pptotal.toFixed(2) + '\n';}
        }
        message.channel.send('```' + output + '```')
    });
}

module.exports.help = {
	name: "lb"
}
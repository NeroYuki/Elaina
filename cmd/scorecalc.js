var fs = require('fs');

module.exports.run = (client, message, args) => {
  if (args.length<5) message.channel.send("not enough data")
  else {
    let nowplaying = args[0];
    let score1 = args[1];
    let score2 = args[3];
    let acc1 = args[2];
    let acc2 = args[4];
    let calcscore1 = 0;
    let calcscore2 = 0;
    let maxscore = 0;
    fs.readFile("mappool.txt", 'utf8', function(err, data) {
      if (err) throw err;
      let x = data.split('\n');
      for (i=0;i<x.length;i++) {
        if (x[i].includes(nowplaying+"|")) {
          let y = x[i].split('|');
          maxscore = parseInt(y[2]);
          calcscore1 = (parseInt(score1)/maxscore)*600000+Math.pow(parseFloat(acc1),4)*400000;
          calcscore2 = (parseInt(score2)/maxscore)*600000+Math.pow(parseFloat(acc2),4)*400000;
          calcscore1 = Math.round(calcscore1);
          calcscore2 = Math.round(calcscore2);
          if (calcscore1>calcscore2) message.channel.send("Map Played: "+y[1]+"\n**"+calcscore1+"** - "+calcscore2)
          else if (calcscore1<calcscore2) message.channel.send("Map Played: "+y[1]+"\n"+calcscore1+" - **"+calcscore2+"**")
          else message.channel.send("Map Played: "+y[1]+"\n\n"+calcscore1+" - "+calcscore2);
          break;
        }
      };
    });
  }
}

module.exports.help = {
	name: "scorecalc"
}
var http = require('http');
var fs = require('fs');

function rankread(imgsrc) {
	let rank="";
	switch(imgsrc) {
		case '<img src="assets/images/ranking-S-small.png"/>':rank="S Rank";break;
		case '<img src="assets/images/ranking-A-small.png"/>':rank="A Rank";break;
		case '<img src="assets/images/ranking-B-small.png"/>':rank="B Rank";break;
		case '<img src="assets/images/ranking-C-small.png"/>':rank="C Rank";break;
		case '<img src="assets/images/ranking-D-small.png"/>':rank="D Rank";break;
		case '<img src="assets/images/ranking-SH-small.png"/>':rank="SH Rank";break;
		case '<img src="assets/images/ranking-X-small.png"/>':rank="SS Rank";break;
		case '<img src="assets/images/ranking-XH-small.png"/>':rank="SSH Rank";break;
		default: rank="unknown";
	}
	return rank;
}

function convertTimeDiff(playTime) {
  year = parseInt(playTime.split(" ")[0].split("-")[0]);
  month = parseInt(playTime.split(" ")[0].split("-")[1])-1;
  day = parseInt(playTime.split(" ")[0].split("-")[2]);
  hour = parseInt(playTime.split(" ")[1].split(":")[0])+7;
  minute = parseInt(playTime.split(" ")[1].split(":")[1]);
  second = parseInt(playTime.split(" ")[1].split(":")[2]);
  var convertedTime = new Date(year, month, day, hour, minute, second);
  var currentTime = new Date();
  var timeDiff = currentTime.getTime()-convertedTime;
  return timeDiff;
}

module.exports.run = (client, message, args) => {
	fs.readFile("tracking.txt", 'utf8', function(err, data) {
    if (err) throw err;
    var playerlist = data.split('\n');
    console.log(playerlist);
    playerlist.forEach(function(uid) {
      var options = {
        host: "ops.dgsrz.com",
        port: 80,
        path: "/profile.php?uid="+uid+".html"
    };

    var content = "";   

    var req = http.request(options, function(res) {
      res.setEncoding("utf8");
      res.on("data", function (chunk) {
        content += chunk;
      });

      res.on("end", function () {
      const a = content;
      let b = a.split('\n'), c = []; let name=""; let time=""; let newplay = true; let playIndex=0;
      for (x = 0; x < b.length; x++) {
        if (b[x].includes('<small>') && b[x - 1].includes('class="block"')) {
        b[x-1]=b[x-1].replace("<strong class=\"block\">","");
        b[x-1]=b[x-1].replace("<\/strong>","");
        b[x]=b[x].replace("<\/small>","");
        b[x-1]=b[x-1].trim();
        b[x]=b[x].trim();
        b[x-5]=b[x-5].trim();
        b[x-5]=rankread(b[x-5]);
        b[x]=b[x].replace("<small>","\n");
        playTime = b[x].split("/")[0].replace("\n","");
        let timeDiff = convertTimeDiff(playTime);
        console.log(timeDiff);
        c.push(b[x-5]+" - "+b[x-1]+b[x]);
        if (newplay) {
          if (timeDiff>600000) newplay=false
          else {
            console.log(c[playIndex]);
            client.channels.get("461446313956081695").send("```Recent play for "+name+"\n\n"+c[x]+"```");
          }
          playIndex++;
        }
      }
      if (b[x].includes('h3 m-t-xs m-b-xs')) {
        b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
        b[x]=b[x].replace('<\/div>',"");
        b[x]=b[x].trim();
        name = b[x]
        }
      }
          });
      });
      req.end();
    });
  });
}

module.exports.help = {
	name: "trackfunc"
}

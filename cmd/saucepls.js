var saucekey = process.env.SAUCENAO_KEY
var request = require('request')

function saucenaoprocess(data, message) {
    var obj = JSON.parse(data)
    var status = obj.header.status
    if (status != 0) {
        message.channel.send("Failed to ask SauceNao :(")
        return;
    }
    var res = obj.results
    if (res.length == 0) {
        message.channel.send("Sorry i can't find anything like that :(")
        return;
    }
    var result = obj.results
    if (obj.results == 0) {
        message.channel.send("Can't find the sauce")
        return
    }

    var pixiv_info; var pixivFlag = false;
    var danbooru_info; var danbooruFlag = false;
    var thumbnail
    var title
    var artist
    var pixivLink
    var danbooruLink
    var material
    var characters

    for (var i in result) {
        if (pixivFlag && danbooruFlag) break;
        thumbnail = result[i].header.thumbnail
        if (result[i].header.index_id == 5) { pixiv_info = result[i].data; pixivFlag = true; }
        else if (result[i].header.index_id == 9) { danbooru_info = result[i].data; danbooruFlag = true; }
    }
    // console.log(thumbnail)
    // console.log(pixiv_info)
    // console.log(danbooru_info)

    if (pixivFlag) {
        title = pixiv_info.title
        artist = pixiv_info.member_name
        pixivLink = pixiv_info.ext_urls[0]
    }

    if (danbooruFlag) {
        material = danbooru_info.material
        characters = danbooru_info.characters
        danbooruLink = danbooru_info.ext_urls[0]
    }

    if (!thumbnail) {
        message.channel.send("Can't find the sauce")
        return
    }

    const embed = {
        "title": (title)? title : "Unknown" ,
        "description": (danbooruLink)? "Mirror: [danbooru](" + danbooruLink + ")" : "No Mirror",
        "url": (pixivLink)? pixivLink : "",
        "color": 3270124,
        "thumbnail": {
            "url": thumbnail
        },
        "author": {
            "name": (artist)? "Artist: " + artist : "Artist: Unknown"
        },
        "fields": [
            {
                "name": (material)? "From: " + material : "From: Unknown",
                "value": (characters)? characters : "Unknown" 
            }
        ]
    };

    message.channel.send({embed: embed})
}

module.exports.run = (client, message, args) => {
    message.channel.fetchMessages({ limit: 50 })
    .then(messages => {
        var foundFlag = false;
        if (messages.size == 0) return;
        messages.forEach((x) => {
            if (foundFlag) return;
            if (x.attachments.length == 0) return;
            x.attachments.forEach((ax) => {
                if (ax.url.endsWith(".jpg") || ax.url.endsWith(".png")) {
                    //console.log("Found image attachment")
                    var url = "https://saucenao.com/search.php?db=999&output_type=2&dbmask=544&testmode=1&api_key=" + saucekey + "&url=" + ax.url
                    request(url, function (err, response, data) {
                        if (err) throw err;
                        //console.log(response)
                        saucenaoprocess(data, message)
                    })
                    foundFlag = true;
                }
            })
        })
        if (!foundFlag) {
            message.channel.send("Can't find any image in the last 50 messages")
        }
    })

    // var url = "https://saucenao.com/search.php?db=999&output_type=2&dbmask=32&api_key=" + saucekey + "&url=https://cdn.discordapp.com/attachments/686948895212961807/688965533667950652/Kafuu.Chino.600.2081153.jpg"
    // request(url, function (err, response, data) {
    //     if (err) throw err;
    //     console.log(data)
    // })
}

module.exports.help = {
	name: "saucepls"
}

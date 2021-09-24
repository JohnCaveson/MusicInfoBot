var Discord = require("discord.io");
var logger = require("winston");
var auth = require("../auth.json");
var http = require("http");
var https = require("https");
var spotifyAccessToken = {};

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true,
});
logger.level = "debug";
// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true,
});

bot.on("ready", async function (evt) {
  let buff = Buffer.from(`${auth.spotifyClientId}:${auth.spotifyClientSecret}`);
  let base64 = buff.toString("base64");
  const url =
    "http://localhost:3000/getToken?" +
    new URLSearchParams({ base64Encoded: base64 });
  await http.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.log(
        "🚀 ~ file: bot.js ~ line 28 ~ awaithttp.get ~ res.statusCode",
        res.statusCode
      );
      console.error(`Did not get an OK from the server.`);
      res.resume();
      return;
    }

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("close", () => {
      console.log("Retrieved all data");
      var parsedData = JSON.parse(data);
      spotifyAccessToken = { ...parsedData };
      console.log(
        "🚀 ~ file: bot.js ~ line 44 ~ res.on ~ spotifyAccessToken",
        spotifyAccessToken
      );
    });
  });
});

bot.on("message", async function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) == "!") {
    var args = [];
    args.push(message.substring(1, message.indexOf(" ")));
    args.push(message.substring(message.indexOf(" ") + 1));
    var cmd = args[0];
    var songId = "";
    var songName = args[1];
    var artist = "";
    args = args.splice(1);
    switch (cmd) {
      // !si
      case "si":
        let type = "track";
        let subject = songName;
        const options = {
          hostname: "api.spotify.com",
          path: "/v1/search?" + new URLSearchParams({ q: subject, type: type }),
          headers: {
            Authorization: `Bearer ${spotifyAccessToken.access_token}`,
          },
        };
        await https.get(options, (res) => {
          if (res.statusCode !== 200) {
            console.log(
              "🚀 ~ file: bot.js ~ line 78 ~ awaithttps.get ~ res.statusCode ",
              res.statusCode
            );
            console.error(`Did not get an OK from the server.`);
            res.resume();
            return;
          }

          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("close", async () => {
            console.log("Retrieved all data");
            var parsedData = JSON.parse(data);
            var information = [];
            Object.entries(parsedData).forEach((classification) => {
              let [key, value] = classification;
              if (value.items !== []) {
                value.items.forEach((i) => {
                  information.push({ ...i });
                });
              }
            });
            console.log("🚀 ~ file: bot.js ~ line 102 ~ value.items.forEach ~ information", information[0])
            songId = information[0].id;
            songName = information[0].name;
            artist = information[0].artists[0].name;
            const options2 = {
              hostname: "api.spotify.com",
              path: "/v1/audio-features/" + songId,
              headers: {
                Authorization: `Bearer ${spotifyAccessToken.access_token}`,
              },
            };
            await https.get(options2, (res) => {
              if (res.statusCode !== 200) {
                console.log(
                  "🚀 ~ file: bot.js ~ line 116 ~ awaithttp.get ~ res.statusCode",
                  res.statusCode
                );
                console.error(`Did not get an OK from the server.`);
                res.resume();
                return;
              }

              let data = "";
              res.on("data", (chunk) => {
                data += chunk;
              });

              res.on("close", () => {
                console.log("Retrieved all data");
                var parsedData = JSON.parse(data);
                let songKey = keys[parsedData.key];
                let songMode = mode[parsedData.mode];
                let songBpm = Math.ceil(parsedData.tempo);
                bot.sendMessage({
                  to: channelID,
                  message: `
\`🎵 ${songName} by ${artist}🎵
Key: ${songKey} ${songMode} 🎼
BPM: ${songBpm}\`
                  `,
                });
              });
            });
          });
        });
        break;
      // Just add any case commands if you want to..
    }
  }
});



const keys = {
  0: "C",
  1: "C#/D♭",
  2: "D",
  3: "D#/E♭",
  4: "E",
  5: "F",
  6: "F#/G♭",
  7: "G",
  8: "G#/A♭",
  9: "A",
  10:"A#/B♭",
  11:"B"
}

const mode = {
  0: "Major",
  1: "Minor"
}
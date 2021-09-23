var Discord = require("discord.io");
var logger = require("winston");
var auth = require("../auth.json");
var axios = require("axios");
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
  const url = "http://localhost:3000/getToken";
  // Authorization
  axios
    .get(url, {
      params: {
        base64Encoded: base64,
      },
    })
    .then((res) => {
      spotifyAccessToken = { ...res.data };
    })
    .catch((err) => {
      logger.error(err);
    });
});

bot.on("message", function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) == "!") {
    var args = message.substring(1).split(" ");
    var cmd = args[0];

    args = args.splice(1);
    switch (cmd) {
      // !ping
      case "ping":
        const url = "https://api.spotify.com/v1/search";
        axios
          .get(url, {
            header: {
              Authorization: 'Bearer ' + spotifyAccessToken.access_token,
            },
            params: {
              q: "The Curse of Curves",
              type: "artist,album,track",
            },
          })
          .then((res) => {
            logger.info(res);
          })
          .catch((err) => {
            logger.error(err);
          });

        bot.sendMessage({
          to: channelID,
          message: "Pong!",
        });
        break;
      // Just add any case commands if you want to..
    }
  }
});

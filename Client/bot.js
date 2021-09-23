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
options = {};
bot.on("ready", async function (evt) {
  await makeRequest(http.get, options).then((res) => {
    spotifyAccessToken = { ...res };
    console.log(spotifyAccessToken);
  });
});

bot.on("message", async function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) == "!") {
    var args = message.substring(1).split(" ");
    var cmd = args[0];

    args = args.splice(1);
    switch (cmd) {
      // !ping
      case "ping":
        let type = "artist,album,track";
        let subject = "The Curse of Curves";
        const options = {
          hostname: "api.spotify.com",
          path: "/v1/search?" + new URLSearchParams({ q: subject, type: type }),
          headers: {
            Authorization: `Bearer ${spotifyAccessToken.access_token}`,
          },
        };

        await makeRequest(https.get, options).then(console.log);

        bot.sendMessage({
          to: channelID,
          message: "Pong!",
        });
        break;
      // Just add any case commands if you want to..
    }
  }
});

async function makeRequest(httpOrHttpsAndMethod, options) {
  let buff = Buffer.from(`${auth.spotifyClientId}:${auth.spotifyClientSecret}`);
  let base64 = buff.toString("base64");
  await httpOrHttpsAndMethod(
    options === {}
      ? "http://localhost:3000/getToken?" +
          new URLSearchParams({ base64Encoded: base64 })
      : options,
    (res) => {
      var parsedData = "";
      if (res.statusCode !== 200) {
        console.error(
          `Did not get an OK from the server. Code: ${res.statusCode}`
        );
        res.resume();
        return;
      }

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("close", () => {
        parsedData = JSON.parse(data);
        return parsedData;
      });
    }
  );
}

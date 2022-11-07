var Discord = require("discord.io");
const fs = require("node:fs");
const path = require("node:path");
var { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
var logger = require("winston");
var auth = require("../auth.json");
var http = require("http");
const { options } = require("request");
var spotifyAccessToken = {};

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true,
});
logger.level = "debug";

var client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "../commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.once(Events.ClientReady, () => {
  let buff = Buffer.from(`${auth.spotifyClientId}:${auth.spotifyClientSecret}`);
  let base64 = buff.toString("base64");
  const url =
    "http://localhost:3000/getToken?" +
    new URLSearchParams({ base64Encoded: base64 });
  http.get(url, (res) => {
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

client.login(auth.token);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    // interaction.options = [{ ...options, spotifyAccessToken: spotifyAccessToken }];
    interaction.spotifyAccessToken = spotifyAccessToken
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});
// Initialize Discord Bot
// var bot = new Discord.Client({
//   token: auth.token,
//   autorun: true,
// });

// bot.on("ready", async function (evt) {
//   let buff = Buffer.from(`${auth.spotifyClientId}:${auth.spotifyClientSecret}`);
//   let base64 = buff.toString("base64");
//   const url =
//     "http://localhost:3000/getToken?" +
//     new URLSearchParams({ base64Encoded: base64 });
//   await http.get(url, (res) => {
//     if (res.statusCode !== 200) {
//       console.log(
//         "🚀 ~ file: bot.js ~ line 28 ~ awaithttp.get ~ res.statusCode",
//         res.statusCode
//       );
//       console.error(`Did not get an OK from the server.`);
//       res.resume();
//       return;
//     }

//     let data = "";
//     res.on("data", (chunk) => {
//       data += chunk;
//     });

//     res.on("close", () => {
//       console.log("Retrieved all data");
//       var parsedData = JSON.parse(data);
//       spotifyAccessToken = { ...parsedData };
//       console.log(
//         "🚀 ~ file: bot.js ~ line 44 ~ res.on ~ spotifyAccessToken",
//         spotifyAccessToken
//       );
//     });
//   });
// });

// bot.on("messageCreate", async function (user, userID, channelID, message) {
//   console.log(message)
//   // Our bot needs to know if it will execute a command
//   // It will listen for messages that will start with `!`
//   if (message.substring(0, 1) == "!") {
//     var args = [];
//     var artist = "";
//     var album = "";
//     var releaseDate = "";
//     var songUrl = "";
//     var songId = "";

//     if (message.includes("help")) {
//       args.push(message.substring(1));
//     } else {
//       args.push(message.substring(1, message.indexOf(" ")));
//       args.push(message.substring(message.indexOf(" ") + 1));
//       var songName = args[1];
//     }
//     var cmd = args[0];
//     args = args.splice(1);
//     switch (cmd) {
//       //help
//       case "help":
//         bot.sendMessage({
//           to: channelID,
//           message: `
// Here is some of the stuff I can do:
// \`\`\`!si songName [artist album]:
//     This will return information about the song such as
//     release date, album, tempo and key of a song as well
//     as a link for others to listen to it.\`\`\`
// More is being worked on! if you find any issues or have an
// enhancement request please go to https://github.com/JohnCaveson/MusicInfoBot/issues
// and submit an issue with the appropriate \`Label\``,
//         });
//         break;
//       // !si
//       case "si":
//         let type = "track";
//         let subject = songName;
//         const options = {
//           hostname: "api.spotify.com",
//           path: "/v1/search?" + new URLSearchParams({ q: subject, type: type }),
//           headers: {
//             Authorization: `Bearer ${spotifyAccessToken.access_token}`,
//           },
//         };
//         await https.get(options, (res) => {
//           if (res.statusCode !== 200) {
//             console.log(
//               "🚀 ~ file: bot.js ~ line 78 ~ awaithttps.get ~ res.statusCode ",
//               res.statusCode
//             );
//             console.error(`Did not get an OK from the server.`);
//             res.resume();
//             return;
//           }

//           let data = "";
//           res.on("data", (chunk) => {
//             data += chunk;
//           });

//           res.on("close", async () => {
//             var parsedData = JSON.parse(data);
//             var information = [];
//             Object.entries(parsedData).forEach((classification) => {
//               let [key, value] = classification;
//               if (value.items !== []) {
//                 value.items.forEach((i) => {
//                   information.push({ ...i });
//                 });
//               }
//             });
//             console.log(
//               "🚀 ~ file: bot.js ~ line 102 ~ value.items.forEach ~ information",
//               information[0]
//             );

//             songId = information[0].id;
//             songName = information[0].name;
//             artist = information[0].artists[0].name;
//             album = information[0].album.name;
//             releaseDate = information[0].album.release_date;
//             songUrl = information[0].external_urls.spotify;

//             console.log(
//               "🚀 ~ file: bot.js ~ line 110 ~ res.on ~ information[0]",
//               information[0]
//             );
//             const options2 = {
//               hostname: "api.spotify.com",
//               path: "/v1/audio-features/" + songId,
//               headers: {
//                 Authorization: `Bearer ${spotifyAccessToken.access_token}`,
//               },
//             };
//             await https.get(options2, (res) => {
//               if (res.statusCode !== 200) {
//                 console.log(
//                   "🚀 ~ file: bot.js ~ line 116 ~ awaithttp.get ~ res.statusCode",
//                   res.statusCode
//                 );
//                 console.error(`Did not get an OK from the server.`);
//                 res.resume();
//                 return;
//               }

//               let data = "";
//               res.on("data", (chunk) => {
//                 data += chunk;
//               });

//               res.on("close", () => {
//                 console.log("Retrieved all data");
//                 var parsedData = JSON.parse(data);
//                 let songKey = keys[parsedData.key];
//                 let songMode = mode[parsedData.mode];
//                 let songBpm = Math.ceil(parsedData.tempo);
//                 console.log("🚀 ~ file: bot.js ~ line 173 ~ res.on ~ parsedData", parsedData)
//                 bot.sendMessage({
//                   to: channelID,
//                   message: `
// ${user} here is the song you wanted information for! If there is anything else I can do, let me know!\`\`\`
// Song Name: ${songName}
// Artist: ${artist}
// Album: ${album}
// Release Date: ${releaseDate}
// Key: ${songKey} ${songMode}
// BPM: ${songBpm}\`\`\`
// Here's the song if anyone else wants to listen to it: ${songUrl}
//                   `,
//                 });
//               });
//             });
//           });
//         });
//         break;
//       // Just add any case commands if you want to..
//     }
//   }
// });

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
  10: "A#/B♭",
  11: "B",
};

const mode = {
  0: "Minor",
  1: "Major",
};

const { SlashCommandBuilder } = require("discord.js");
var https = require("https");

var artist = "";
var album = "";
var releaseDate = "";
var songUrl = "";
var songId = "";
var songKey = "";
var songMode = "";
var songBpm = "";


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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("song_info")
    .setDescription("Returns details about the provided song!")
    .addStringOption((option) =>
      option.setName("song_name").setDescription("Song name you want information for").setRequired(true)
    ),
  async execute(interaction) {
    console.log(interaction);
    songName = interaction.options.getString("song_name");
    let type = "track";
    let subject = songName;
    const options = {
      hostname: "api.spotify.com",
      path: "/v1/search?" + new URLSearchParams({ q: subject, type: type }),
      headers: {
        Authorization: `Bearer ${interaction.spotifyAccessToken.access_token}`,
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
        console.log(
          "🚀 ~ file: bot.js ~ line 102 ~ value.items.forEach ~ information",
          information[0]
        );

        songId = information[0].id;
        songName = information[0].name;
        artist = information[0].artists[0].name;
        album = information[0].album.name;
        releaseDate = information[0].album.release_date;
        songUrl = information[0].external_urls.spotify;

        console.log(
          "🚀 ~ file: bot.js ~ line 110 ~ res.on ~ information[0]",
          information[0]
        );
        const options2 = {
          hostname: "api.spotify.com",
          path: "/v1/audio-features/" + songId,
          headers: {
            Authorization: `Bearer ${interaction.spotifyAccessToken.access_token}`,
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
            songKey = keys[parsedData.key];
            songMode = mode[parsedData.mode];
            songBpm = Math.ceil(parsedData.tempo);
            console.log(
              "🚀 ~ file: bot.js ~ line 173 ~ res.on ~ parsedData",
              parsedData
            );
          });
        });
        await interaction.reply(`
    ${interaction.user.username} here is the song you wanted information for! If there is anything else I can do, let me know!\`\`\`
    Song Name: ${songName}
    Artist: ${artist}
    Album: ${album}
    Release Date: ${releaseDate}
    Key: ${songKey} ${songMode}
    BPM: ${songBpm}\`\`\`
    Here's the song if anyone else wants to listen to it: ${songUrl}
                      `);
      });
    });
  },
};


// // Our bot needs to know if it will execute a command
// // It will listen for messages that will start with `!`
// if (message.substring(0, 1) == "!") {
//   if (message.includes("help")) {
//     args.push(message.substring(1));
//   } else {
//     args.push(message.substring(1, message.indexOf(" ")));
//     args.push(message.substring(message.indexOf(" ") + 1));
//     var songName = args[1];
//   }
//   var cmd = args[0];
//   args = args.splice(1);
//   switch (cmd) {
//     //help
//     case "help":
//       bot.sendMessage({
//         to: channelID,
//         message: `
// Here is some of the stuff I can do:
// \`\`\`!si songName [artist album]:
//     This will return information about the song such as
//     release date, album, tempo and key of a song as well
//     as a link for others to listen to it.\`\`\`
// More is being worked on! if you find any issues or have an
// enhancement request please go to https://github.com/JohnCaveson/MusicInfoBot/issues
// and submit an issue with the appropriate \`Label\``,
//       });
//       break;
//     // !si
//     case "si":
//       let type = "track";
//       let subject = songName;
//       const options = {
//         hostname: "api.spotify.com",
//         path: "/v1/search?" + new URLSearchParams({ q: subject, type: type }),
//         headers: {
//           Authorization: `Bearer ${spotifyAccessToken.access_token}`,
//         },
//       };
//       await https.get(options, (res) => {
//         if (res.statusCode !== 200) {
//           console.log(
//             "🚀 ~ file: bot.js ~ line 78 ~ awaithttps.get ~ res.statusCode ",
//             res.statusCode
//           );
//           console.error(`Did not get an OK from the server.`);
//           res.resume();
//           return;
//         }

//         let data = "";
//         res.on("data", (chunk) => {
//           data += chunk;
//         });

//         res.on("close", async () => {
//           var parsedData = JSON.parse(data);
//           var information = [];
//           Object.entries(parsedData).forEach((classification) => {
//             let [key, value] = classification;
//             if (value.items !== []) {
//               value.items.forEach((i) => {
//                 information.push({ ...i });
//               });
//             }
//           });
//           console.log(
//             "🚀 ~ file: bot.js ~ line 102 ~ value.items.forEach ~ information",
//             information[0]
//           );

//           songId = information[0].id;
//           songName = information[0].name;
//           artist = information[0].artists[0].name;
//           album = information[0].album.name;
//           releaseDate = information[0].album.release_date;
//           songUrl = information[0].external_urls.spotify;

//           console.log(
//             "🚀 ~ file: bot.js ~ line 110 ~ res.on ~ information[0]",
//             information[0]
//           );
//           const options2 = {
//             hostname: "api.spotify.com",
//             path: "/v1/audio-features/" + songId,
//             headers: {
//               Authorization: `Bearer ${spotifyAccessToken.access_token}`,
//             },
//           };
//           await https.get(options2, (res) => {
//             if (res.statusCode !== 200) {
//               console.log(
//                 "🚀 ~ file: bot.js ~ line 116 ~ awaithttp.get ~ res.statusCode",
//                 res.statusCode
//               );
//               console.error(`Did not get an OK from the server.`);
//               res.resume();
//               return;
//             }

//             let data = "";
//             res.on("data", (chunk) => {
//               data += chunk;
//             });

//             res.on("close", () => {
//               console.log("Retrieved all data");
//               var parsedData = JSON.parse(data);
//               let songKey = keys[parsedData.key];
//               let songMode = mode[parsedData.mode];
//               let songBpm = Math.ceil(parsedData.tempo);
//               console.log(
//                 "🚀 ~ file: bot.js ~ line 173 ~ res.on ~ parsedData",
//                 parsedData
//               );
//               bot.sendMessage({
//                 to: channelID,
//                 message: `
// ${user} here is the song you wanted information for! If there is anything else I can do, let me know!\`\`\`
// Song Name: ${songName}
// Artist: ${artist}
// Album: ${album}
// Release Date: ${releaseDate}
// Key: ${songKey} ${songMode}
// BPM: ${songBpm}\`\`\`
// Here's the song if anyone else wants to listen to it: ${songUrl}
//                   `,
//               });
//             });
//           });
//         });
//       });
//       break;
//     // Just add any case commands if you want to..
//   }
// }

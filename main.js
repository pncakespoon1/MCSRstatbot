const { Client, GatewayIntentBits } = require('discord.js')
const reader = require("g-sheets-api");
const fetch = require("node-fetch");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})


const prefix = "$";
const website_link = "https://reset-analytics-dev.vercel.app";
const readerOptions1 = {
  apiKey: process.env.SHEETS_API_KEY,
  sheetId: process.env.NAME_KEY_SHEET,
  returnAllResults: false,
  sheetName: 'Data'
};

const fetcher = url => fetch(url).then((res) => {
console.log(res.ok);
return res.json()
});

async function nameToID(str) {
  const name = str.toLowerCase()
  const readerOptions = {
    apiKey: process.env.SHEETS_API_KEY,
    sheetId: process.env.NAME_KEY_SHEET,
    returnAllResults: false,
    sheetName: 'Data'
  };
  return new Promise(resolve => {
    reader(readerOptions, data => {
      const userRow = data.filter(row => row["Username"] === name || (row["Aliases"] || "").split(",").includes(name))
      if (userRow.length != 1) {
        return resolve()
      } else {
        return resolve(userRow[0]["SheetId"])
      }
    })
  })
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return
  const args = msg.content.slice(1).split(" ");
  if (args.length === 0) return
  if (args[0] !== "stats") return
  nameToID(args[1])
  .then((sheetID) => {
    return fetcher(`${website_link}/api/sheet/${sheetID}`);
  })
  .then((data) => {
    console.log("Fetched Data:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
});



client.login(process.env.TOKEN);
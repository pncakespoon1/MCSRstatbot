const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const reader = require("g-sheets-api");
const fetch = require("node-fetch");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

const colourList = ["#0088FE", "#00C49F", "#973e95", "#FF8042", "#FFC0CB", "#FFD700"]

const timelines = ["Iron", "Wood", "Iron Pickaxe", "Nether", "Bastion", "Fortress", "Nether Exit", "Stronghold", "End"]

const msToStr = (ms, dp = true) => {
  let deciseconds = Math.floor((ms % 1000) / 100),
    seconds = Math.floor((ms / 1000) % 60),
    minutes = Math.floor((ms / (1000 * 60)) % 60),
    hours = Math.floor((ms / (1000 * 60 * 60)));


  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10 && hours !== "00") ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  if (hours === "00") {
    return minutes + ":" + seconds + (dp ? "." + deciseconds : "")
  } else {
    return hours + ":" + minutes + ":" + seconds + (dp ? "." + deciseconds : "")
  }
}

const roundToPerc = (fullNum, digits = 2) => Math.round(fullNum * (10 ** digits)) / (10 ** digits)


const maxChar = 20
const prefix = "$";
const website_link = "https://reset-analytics-dev.vercel.app";
const readerOptions = {
  apiKey: process.env.SHEETS_API_KEY,
  sheetId: process.env.NAME_KEY_SHEET,
  returnAllResults: false,
  sheetName: 'Data'
};

const fetcher = url => fetch(url).then((res) => {
  console.log(res.ok);
  return res.json()
});

const data_to_msg = (data, func, args, runner_id) => {
  let sess_data
  if (args.hasOwnProperty("session")) {
    if (["all", "overall", "career", "lifetime"].includes(args["session"].toLowerCase())) {
      sess_data = data["overall"]
    } else if (["latest", "current", "last"].includes(args["session"].toLowerCase())) {
      sess_data = data["session"][0]["ops"]
    } else if (data["session"].length > parseInt(args["session"]) >= 0) {
      sess_data = data["session"][parseInt(args["session"])]["ops"]
    } else {
      sess_data = data["overall"]
    }
  } else {
    sess_data = data["overall"]
  }

  const embed = new EmbedBuilder()
    .setTitle(`Stats for ${runner_id[1]}`)
    .setURL(`${website_link}/sheet/${runner_id[0]}`)

  if (func.toLowerCase() === "overview") {
    embed.setDescription("basic overview stats")
    const fields = [
      { name: "rnph", value: String(roundToPerc(sess_data["rnph"])) },
      { name: "fnph", value: String(roundToPerc(sess_data["fnph"])) },
      { name: "enter avg", value: msToStr(sess_data["tl"][3]["time"]) },
      { name: "playtime", value: msToStr(sess_data["tp"]) },
      { name: "seeds played %", value: `${roundToPerc(roundToPerc(sess_data["pc"]/sess_data["rc"], 4) * 100)}%` },
      { name: "reset count", value: String(sess_data["rc"]) }
    ]
    embed.addFields(...fields)
  } else if (func.toLowerCase() === "split") {
    embed.setDescription(`split info for ${args["split"]}`)
    const split_data = sess_data["tl"][timelines.indexOf(args["split"])]
    const fields = [
      { name: "Count", value: String(split_data["total"]), inline: true },
      { name: "Count per hour", value: `${roundToPerc(split_data["xph"])}`, inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: "C avg", value: msToStr(split_data["time"]), inline: true },
      { name: "R avg", value: msToStr(split_data["tsp"]), inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: "C conversion", value: `${roundToPerc(roundToPerc(split_data["cConv"], 4) * 100)}%`, inline: true },
      { name: "R conversion", value: `${roundToPerc(roundToPerc(split_data["rConv"], 4) * 100)}%`, inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: "C stdev", value: msToStr(split_data["cStdev"]), inline: true },
      { name: "R stdev", value: msToStr(split_data["rStdev"]), inline: true }
    ]
    embed.addFields(...fields)

  } else if (func.toLowerCase() === "basic") {

  } else if (func.toLowerCase() === "basic") {

  } else if (func.toLowerCase() === "basic") {

  }
  return embed
}

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
      if (name.length > maxChar) {
        return resolve([name, "runner"])
      }
      const userRow = data.filter(row => row["Username"] === name || (row["Aliases"] || "").split(",").includes(name))
      if (userRow.length != 1) {
        return resolve()
      } else {
        return resolve([userRow[0]["SheetId"], name])
      }
    })
  })
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return
  let [func1, id, ...args1] = msg.content.slice(prefix.length).split(" ");
  args1 = Object.fromEntries(args1.map(arg => arg.split('=')));
  if (args1.length < 2) return
  let runner_id = []
  nameToID(id)
    .then((sheetID1) => {
      runner_id = sheetID1
      return `${website_link}/api/sheet/${sheetID1[0]}`;
    })
    .then((url) =>
      fetch(url)
    )
    .then((res) => {
      console.log(res.ok);
      return res.json()
    })
    .then((data1) => {
      msg.channel.send({ embeds: [data_to_msg(data1, func1, args1, runner_id)] })
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});



client.login(process.env.TOKEN);
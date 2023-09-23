require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const fetch = require("node-fetch");

//creating the client object
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

// timelines array will be moved to commands/split.js upon its creation
const timelines = ["Iron", "Wood", "Iron Pickaxe", "Nether", "Bastion", "Fortress", "Nether Exit", "Stronghold", "End"] 

// i will probably move variables like this one to a central json file
const website_link = "https://reset-analytics-dev.vercel.app";

// this method isn't referenced, it's just holding some code that is yet to be moved
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

client.cooldowns = new Collection();

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// bot gets booted up
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.TOKEN);
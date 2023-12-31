const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { msToStr, roundToPerc } = require('../../helpers/formatting');
const fetch = require("node-fetch");
const { website_link } = require("../../helpers/data")

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('overview')
		.setDescription('Shows basic info from a runner\'s stats.')
		.addStringOption(option =>
			option.setName('runner')
				.setDescription('A spreadsheet id or the name of a runner')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('session')
				.setDescription('Choose the session (currently just latest or all)')
				.setRequired(true)
				.addChoices(
					{ name: "latest", value: "latest" },
					{ name: "all", value: "all" }
				)),
	async execute(interaction) {
		const session = interaction.options.getString('session');
		const id = interaction.options.getString('runner');
		const isID = (id.length > 20)
		const link = (isID ? `${website_link}/api/sheet/${id}` : `${website_link}/api/user/${id}`)

		fetch(link)
			.then((res) => {
				console.log(res.ok);
				return res.json()
			})
			.then((data) => {
				if (isID) {
					return data
				}
				return fetch(`${website_link}/api/sheet/${data["sheetId"]}`)
			})
			.then((res) => {
				if (isID) {
					return res
				}
				console.log(res.ok);
				return res.json()
			})
			.then((data) => {
				const sess_data = (session === "latest" ? data["session"][0]["ops"] : data["overall"])
				const fields = [
					{ name: "Session", value: session },
					{ name: "RNPH", value: String(roundToPerc(sess_data["rnph"])) },
					{ name: "LNPH", value: String(roundToPerc(sess_data["fnph"])) },
					{ name: "Enter avg", value: msToStr(sess_data["tl"][3]["time"]) },
					{ name: "Playtime", value: msToStr(sess_data["tp"]) },
					{ name: "Seeds played %", value: `${roundToPerc(roundToPerc(sess_data["pc"] / sess_data["rc"], 4) * 100)}%` },
					{ name: "Reset count", value: String(sess_data["rc"]) }
				]
				const embed = new EmbedBuilder()
					.setTitle(`Stats for ${(isID ? "runner" : id)}`)
					.setURL((isID ? `${website_link}/sheet/${id}` : `${website_link}/${id}`))
					.setDescription("basic overview stats")
					.addFields(...fields)
				return interaction.reply({ embeds: [embed] })

			})
			.catch((error) => {
                interaction.reply("An error occured")
            })
     
	}
}
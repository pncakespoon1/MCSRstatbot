const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { msToStr, roundToPerc } = require('../../helpers/formatting');
const fetch = require("node-fetch");

module.exports = {
	cooldown: 10,
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
				.setRequired(false)
				.addChoices(
					{ name: "latest", value: "latest" },
					{ name: "all", value: "all" }
				)),
	async execute(interaction) {
		const session = interaction.options.getString('session');
		const id = interaction.options.getString('runner');
		const website_link = "https://reset-analytics-dev.vercel.app"
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
					{ name: "rnph", value: String(roundToPerc(sess_data["rnph"])) },
					{ name: "fnph", value: String(roundToPerc(sess_data["fnph"])) },
					{ name: "enter avg", value: msToStr(sess_data["tl"][3]["time"]) },
					{ name: "playtime", value: msToStr(sess_data["tp"]) },
					{ name: "seeds played %", value: `${roundToPerc(roundToPerc(sess_data["pc"] / sess_data["rc"], 4) * 100)}%` },
					{ name: "reset count", value: String(sess_data["rc"]) }
				]
				const embed = new EmbedBuilder()
					.setTitle(`Stats for ${(isID ? "runner" : id)}`)
					.setURL((isID ? `${website_link}/sheet/${id}` : `${website_link}/${id}`))
					.setDescription("basic overview stats")
					.addFields(...fields)
				return interaction.reply({ embeds: [embed] })

			})
	}
}
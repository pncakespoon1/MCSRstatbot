const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
			.setRequired(false)),
			.addChoices(
			{ name: "latest", value: "latest"},
			{ name: "all", value: "all"}
			)),
	async execute(interaction) {
		const session = interaction.options.getString('session');
		const runner = interaction.options.getRunner('session');
		const id = (runner.length > 20 ? runner : nameToID(runner))
		const website_link = "https://reset-analytics-dev.vercel.app"
		const link = `${website_link}/api/sheet/${id}`

		fetch(link)
		.then((data) => {
		    const sess_data = (session === "latest" ? data["session"][0]["ops"] : data["overall"])

        const embed = new EmbedBuilder()
        .setTitle(`Stats for ${runner.length > 20 ? "runner" ? runner}`)
        .setURL(`${website_link}/sheet/${link}`)
  }
		})
	},
};

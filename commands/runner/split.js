const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { msToStr, roundToPerc } = require('../../helpers/formatting');
const fetch = require("node-fetch");

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('split')
        .setDescription('Shows detailed info for a specific split')
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
                ))
        .addStringOption(option =>
            option.setName('split')
                .setDescription('Choose the split')
                .setRequired(true)
                .addChoices(
                    { name: "Iron", value: "Iron" },
                    { name: "Wood", value: "Wood" },
                    { name: "Iron Pickaxe", value: "Iron Pickaxe" },
                    { name: "Nether", value: "Nether" },
                    { name: "Fortress", value: "Bastion" },
                    { name: "latest", value: "Fortress" },
                    { name: "Nether Exit", value: "Nether Exit" },
                    { name: "Stronghold", value: "Stronghold" },
                    { name: "End", value: "End" }
                )),
    async execute(interaction) {
        const timelines = ["Iron", "Wood", "Iron Pickaxe", "Nether", "Bastion", "Fortress", "Nether Exit", "Stronghold", "End"] 
        const session = interaction.options.getString('session');
        const id = interaction.options.getString('runner');
        const split = interaction.options.getString('split')
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
                const split_data = sess_data["tl"][timelines.indexOf(split)]
                const fields = [
                    { name: "session", value: session },
                    { name: "split", value: split },
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
                const embed = new EmbedBuilder()
                    .setTitle(`Stats for ${(isID ? "runner" : id)}`)
                    .setURL((isID ? `${website_link}/sheet/${id}` : `${website_link}/${id}`))
                    .setDescription("detailed split stats")
                    .addFields(...fields)
                return interaction.reply({ embeds: [embed] })

            })
    }
}
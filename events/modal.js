const { Events, Client, } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId === 'email') {
			// doing stuff
			await interaction.reply('it is working.')
		}


	},
};
const { SlashCommandBuilder,
		ModalBuilder,
		TextInputBuilder,
		TextInputStyle,
		ActionRowBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('registration')
		.setDescription('Starts the registration process. You can provide a Team-ID to join an existing Team.'),
	async execute(interaction) {

		// Create the modal
		const modal = new ModalBuilder()
			.setCustomId('email')
			.setTitle('Registration for the Challenge #2');

		// Add components to the modal

		//Create Textinput components
		const email = new TextInputBuilder()
			.setCustomId('E-Mail Adress')
			// The label is displayed above the text input field
			.setLabel('E-Mail adress:')
			// single line of text
			.setStyle(TextInputStyle.Short)
			// this is a placeholder in the text input field
			.setPlaceholder('example@example.com');

		const verificationCode = new TextInputBuilder()
			.setCustomId('Verification Code')
			.setLabel('join existing Team with Team-ID (optional)')
			.setStyle(TextInputStyle.Short)
			.setRequired(false)
			.setPlaceholder('Only needed if joining existing team')

		const teamName = new TextInputBuilder()
			.setCustomId('teamName')
			.setLabel('Choose a teamname (optional)')
			.setStyle(TextInputStyle.Short)
			.setRequired(false)
			.setPlaceholder('Choose a teamname')

		// for every textinput (max. 5) you need a Actionrow
		const actionRowEmail = new ActionRowBuilder().addComponents(email);
		const actionRowVerificationCode = new ActionRowBuilder().addComponents(verificationCode);
		const actionRowTeamName = new ActionRowBuilder().addComponents(teamName);

		// Add inputs to modal
		modal.addComponents(actionRowEmail, actionRowVerificationCode, actionRowTeamName)

		// Show modal to user
		await interaction.showModal(modal)
	},
};
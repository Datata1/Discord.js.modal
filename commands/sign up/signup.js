const { SlashCommandBuilder,
		ModalBuilder,
		TextInputBuilder,
		TextInputStyle,
		ActionRowBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('registration')
		.setDescription('This command starts the registration process. You can provide a Team-Code to join an existing Team.'),
	async execute(interaction) {

		// Create the modal
		const modal = new ModalBuilder()
			.setCustomId('email')
			.setTitle('Emails of the participants are required');

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
			.setLabel('(optinal) join Team with verification Code:')
			.setStyle(TextInputStyle.Short)
			.setRequired(false)

		const teamName = new TextInputBuilder()
			.setCustomId('teamName')
			.setLabel('(optional) Choose a teamname')
			.setStyle(TextInputStyle.Short)
			.setRequired(false)

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
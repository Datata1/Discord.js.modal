const { Events, Client, } = require('discord.js');
const sqlite3 = require('sqlite3').verbose()

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId === 'email') {
			// doing stuff

			let db = new sqlite3.Database('./SQLlite/meineDatenbank.db')

			const team = interaction.fields.getTextInputValue('teamName')
			const verificationCode = interaction.fields.getTextInputValue('Verification Code')

			const userid = interaction.user.id
			const username = interaction.user.username
			const email = interaction.fields.getTextInputValue('E-Mail Adress')

			const sql_team = 'INSERT INTO team (teamname, verificationcode) VALUES (?, ?);'
			const sql_participant = 'INSERT INTO participant (userid, username, email, teamid) VALUES (?, ?, ?, ?);'

			db.run(sql_team, [team, verificationCode], function(err) {
				if (err) {
				  return console.log(err.message);
				}
				// get the last insert id
				console.log(`A row has been inserted with rowid ${this.lastID}`);
			  });

			db.run(sql_participant, [userid, username, email], function(err) {
				if (err) {
				  return console.log(err.message);
				}
				// get the last insert id
				console.log(`A row has been inserted with rowid ${this.lastID}`);
			  });
			await interaction.reply('it is working.')

			db.close();
		}


	},
};
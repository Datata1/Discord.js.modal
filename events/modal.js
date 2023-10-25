const { Events, Client, ChannelType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Function to add a role to a user


async function checkMemberCount(teamId, db) {
  const sqlCountMembers = 'SELECT COUNT(*) AS memberCount FROM participant WHERE teamid = ?';

  return new Promise((resolve, reject) => {
    db.get(sqlCountMembers, [teamId], async (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }


      if (row) {
        const memberCount = row.memberCount;

        if (memberCount > 3) {
          // Team hat das Limit erreicht
          console.log('Team hat das Limit erreicht', memberCount);
          resolve(true);
        } else {
          // Team hat weniger als 3 Mitglieder
          console.log('Team hat das Limit nicht erreicht', memberCount);
          resolve(false);
        }
      } else {
        // Kein Team gefunden
        console.log('Team existiert nicht.');
        resolve(false);
      }
    })

  });
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId === 'email') {

			// provide the path to the sqlite database
			let db = new sqlite3.Database('./SQLlite/meineDatenbank.db')

			// these are the textinputs and interaction user related data
			const userid = interaction.user.id
			const username = interaction.user.username
			const email = interaction.fields.getTextInputValue('E-Mail Adress')
			const verificationCodeInput = interaction.fields.getTextInputValue('Verification Code')
			console.log(verificationCodeInput)

			// The insert satement to insert data in a table correctly
			// note: teamid is autoincrement, so we dont need to specify it
			const sql_team = 'INSERT INTO team (teamname, verificationcode) VALUES (?, ?);'
			const sql_participant = 'INSERT INTO participant (userid, username, email, teamid) VALUES (?, ?, ?, ?);'

			// query to find out if validationcode is valid
			const validationCheck = `SELECT teamid FROM team WHERE verificationcode = ?`;

			// if no verification code provided do this
			if (verificationCodeInput === '') {

				// -> if no verification code, create a new verificatiopn code
				const verificationCode = uuidv4();
				console.log(verificationCode)

					// if no teamname was provided then use the interaction.user.name as teamname
					if (interaction.fields.getTextInputValue('teamName') === '') {
						const teamNameLikeUserName = interaction.user.username
						console.log(teamNameLikeUserName)
						// insert the data under the condition that no verificationcode and teamname was provided

						// insert data in table team (:= create a new team)
						db.run(sql_team, [teamNameLikeUserName, verificationCode], function(err) {
							if (err) {
								return console.log(err.message);
							}
							// get the last insert id
							console.log(`A row has been inserted with rowid ${this.lastID}`);

							// get team id from insertion before
							db.run(validationCheck, [verificationCode], function(err, row) {
								if (err) {
									return console.log(err.message)
								}

								if (row){
								const teamId = row.teamid

									// insert participant
									db.run(sql_participant, [userid, username, email, teamId], function(err) {
									if (err) {
									  return console.log(err.message);
									}
									// get the last insert id
									console.log(`A row has been inserted with rowid ${this.lastID}`);
							  })
								}

							})
						});

						// after registration add new role to user
							const role = interaction.guild.roles.cache.get('1164153289684819978');
							await interaction.member.roles.add(role);

						// create private thread and add interaction user + send message with all information
						const channel = interaction.channel
						const thread = await channel.threads.create({
							name: `Team: ${username}`,
							autoArchiveDuration: 60,
							type: ChannelType.PrivateThread,
							reason: 'This is the private Thread for the Team',
						});
						await thread.members.add(userid); // check if an initial message is send

						// 2. send dm to interaction user with onboarding information
							interaction.user.send(`here you can insert a messageThis is your Verification Code: ${verificationCode}`) // code here the message

						// interaction reply
						await interaction.reply(`The registration was successful!` )

					} else {
						// a teamname was provided, we are going to use it now
						const newTeamName = interaction.fields.getTextInputValue('teamName')

						// insert the data under the condition that no verificationcode but a teamname was provided
						// insert data in table team (:= create a new team)
						db.run(sql_team, [newTeamName, verificationCode], function(err) {
							if (err) {
							  return console.log(err.message);
							}
							// get the last insert id
							console.log(`A row has been inserted with rowid ${this.lastID}`);
						  });

						// insert data in participant table
						db.run(sql_participant, [userid, username, email], function(err) {
							if (err) {
							  return console.log(err.message);
							}
							// get the last insert id
							console.log(`A row has been inserted with rowid ${this.lastID}`);
						  })


						// after registration add new role to user
							const role = interaction.guild.roles.cache.get('1164153289684819978');
							await interaction.member.roles.add(role);

						// create private thread and add interaction user + send message with all information
						const channel = interaction.channel
						const thread = await channel.threads.create({
							name: `Team: ${newTeamName}`,
							autoArchiveDuration: 60,
							type: ChannelType.PrivateThread,
							reason: 'This is the private Thread for the Team',
						});
						await thread.members.add(userid); // check if an initial message is send

						// dm to user
						await interaction.user.send('hi') // prepare message to user

						// interaction reply
						await interaction.reply('The registration was successful!')

					}
			}
			// to do:
			// verificationcode was provided and we save it in a variable
			if (verificationCodeInput) {
				  db.get(validationCheck, [verificationCodeInput], async (err, row) => {
					if (err) {
					  console.error(err.message);
					  return;
					}

					if (row) {
					  const teamId = row.teamid;
					  console.log(teamId)

					  // Now, correctly await the checkMemberCount function
					  const isBelowMemberLimit = await checkMemberCount(teamId, db);
					  console.log(isBelowMemberLimit)

					  if (isBelowMemberLimit) {
						// If the team is below the member limit, you can add the participant
						db.run(sql_participant, [userid, username, email, teamId], function(err) {
						  if (err) {
							return console.log(err.message);
						  }
						  console.log(`A row has been inserted with rowid ${this.lastID}`);
						});
					  } else {
						console.log('Team hat das Limit erreicht');
					  }
					} else {
					  console.log('Verifikationscode ungültig');
					}
				  });


							// code here: participant was added to the team


							// after registration add new role to user
							const role = interaction.guild.roles.cache.get('1164153289684819978');
							await interaction.member.roles.add(role);;

							// 2. send dm to interaction user with onboarding information
							interaction.user.send('here you can insert a message') // code here the message

							// 3. add participant to thread + send message in private thread that user joined
							const channel = interaction.channel

							// we need to fetch the team name
							const sqlQuery = 'SELECT teamname FROM team WHERE verificationcode = ?';

							db.get(sqlQuery, [verificationCodeInput], (err, row) => {
							  if (err) {
								console.error(err.message);
								return;
							  }

							  if (row) {
								console.log(`Teamname for validation code ${verificationCodeInput}: ${row.teamname}`);
								const teamnames = row.teamname
								  // fetch thread
								  const thread =  channel.threads.cache.find(x => x.name === `Team: ${teamnames}`);
								// add user
								 thread.members.add(userid)
							  } else {
								console.log(`No team found for validation code ${verificationCodeInput}`);
							  }
							});
							// Don't forget to close the database connection when you're done


							// 	4. dm to user: onboarding mail + verificationcode for other teammeber
							// interaction.user.send('hi') // prepare message to user
						} else {

					  console.log('Verifikationscode ungültig');
					  // interaction.reply "Team has reached member limit. Try it again"
							await interaction.reply('Verification code is not valid! try it again!!')
					}

					// Hier kannst du weitere Aktionen ausführen, z.B. den Benutzer einem Team zuordnen
				  } else {
					// the verificationcode was not found
					console.log('Verifikationscode ungültig');
					await interaction.reply('Verification code is not valid!')
					// code here: "verificationcode doesnt exists"
				  }


			}};

			// 5. send message in hackathon welcome Channel: 'interaction.user.name joined the Hackathon! (some emoji)' (if time is left, we can add a array of possible welcome messages and a random message will be send on sign up)



			// code here: interaction.reply 'registration was successful' in ephemeral



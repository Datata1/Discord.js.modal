const { Events, Client, ChannelType, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');


// function for checking if team is already full
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

				if (memberCount >= 3) {
					// Team hat das Limit erreicht
					console.log('Team reached the limit:', memberCount);
					resolve(true);
				} else {
					// Team hat weniger als 3 Mitglieder
					console.log('Team did not reach the limit: ', memberCount);
					resolve(false);
				}
			}
        }) 
    })
}


// Function to check if a user with a specific userid already exists in the database.
function checkIfUserExists(userid, db, callback) {
    const checkUserQuery = 'SELECT COUNT(*) AS userCount FROM participant WHERE userid = ?;';
    
    db.get(checkUserQuery, [userid], function(err, row) {
        if (err) {
            return callback(err, null);
        }

        // Check if a user with the same userid already exists.
        const userCount = row.userCount;
        callback(null, userCount > 0);
    });
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId === 'email') {

			// provide the path to the sqlite database
			let db = new sqlite3.Database('Member.db')

			// these are the textinputs and interaction user related data
			const user = interaction.user
			const userid = interaction.user.id
			const username = interaction.user.username
			const email = interaction.fields.getTextInputValue('E-Mail Adress')
			const verificationCodeInput = interaction.fields.getTextInputValue('Verification Code')
			const teamName = interaction.fields.getTextInputValue('teamName')
			const roleID = process.env.roleId

			// The insert satement to insert data in a table correctly
			// note: teamid is autoincrement, so we dont need to specify it
			const sql_team = 'INSERT INTO team (teamname, verificationcode) VALUES (?, ?);'
			const sql_participant = 'INSERT INTO participant (userid, username, email, teamid) VALUES (?, ?, ?, ?);'

			// query to find out if validationcode is valid
			const validationCheck = `SELECT teamid, teamname FROM team WHERE verificationcode = ?`;
			
			checkIfUserExists(userid, db, async (err, userExists) => {
				if (err) {
					console.error(err.message);
				} else if (userExists) {
					// Don't forget to close the database connection when you're done
					db.close();
        			interaction.reply({content: 'You are already a participant!', ephemeral: true})
				}	else {
					// if no verification code provided do this
					if (verificationCodeInput === '') {

						// -> if no verification code, create a new verificatiopn code
						const verificationCode = uuidv4();
						console.log(verificationCode)

							// if no teamname was provided then use the interaction.user.name as teamname
							if (teamName === '') {
								// insert the data under the condition that no verificationcode and teamname was provided

								// insert data in table team (:= create a new team)
								db.run(sql_team, [username, verificationCode], function(err) {
									if (err) {
										return console.log(err.message);
									}
									// get the last insert id
									console.log(`A row has been inserted with rowid ${this.lastID}`);
									const teamId = this.lastID

                                    // insert participant
                                    db.run(sql_participant, [userid, username, email, teamId], function(err) {
                                    if (err) {
                                      return console.log(err.message);
                                    }
                                    // get the last insert id
                                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                                    })
                                })

								// after registration add new role to user
								const role = interaction.guild.roles.cache.get(roleID);  // the role id is hard coded here
								await interaction.member.roles.add(role);

								// 2. send dm to interaction user with onboarding information
								const embed = new EmbedBuilder()
									.setColor(0x2f3136)
									.setTitle('Some Title')
									.setDescription('You are now a participant.')
									.setTimestamp()
									.addFields(
										{name: 'This is the Team-ID:', value: `**${verificationCode}**\n\nSend this Code to your friends and they can join your Team!\nA team can have up to 3 members.`},
										{name: '\u200B', value: '\u200B'},
										{name: 'Team name', value: `${username}`, inline:true},
										{name: 'E-Mail', value: `${email}`, inline: true},
									)
								

								user.send({embeds: [embed]}) // code here the message

								// interaction reply
								// Don't forget to close the database connection when you're done
								db.close();
								await interaction.reply({content: `The registration was successful!`})
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
									const teamId = this.lastID
									console.log(teamId)

									db.run(sql_participant, [userid, username, email, teamId], async(err) => {
									if (err) {
									  return console.log(err.message);
									}
									// get the last insert id
									console.log(`A row has been inserted with rowid ${this.lastID}`);
								  })
								  });

								// after registration add new role to user
									const role = interaction.guild.roles.cache.get(roleID);
									await interaction.member.roles.add(role);

								// dm to user
								const embed = new EmbedBuilder()
									.setColor(0x2f3136)
									.setTitle('Some Title')
									.setDescription('You are now a participant.')
									.setTimestamp()
									.addFields(
										{name: 'This is the Team-ID:', value: `**${verificationCode}**\n\nSend this Code to your friends and they can join your Team!\nA team can have up to 3 members.`},
										{name: '\u200B', value: '\u200B'},
										{name: 'Team name', value: `${newTeamName}`, inline:true},
										{name: 'E-Mail', value: `${email}`, inline: true}
									)
								user.send({embeds: [embed]}) // code here the message

								// interaction reply
								// await interaction.reply('The registration was successful!')
								// Don't forget to close the database connection when you're done
								db.close();
								await interaction.reply({content: `The registration was successful!`})

							}
					}
					// to do:
					// verificationcode was provided and we save it in a variable
					if (verificationCodeInput !== '') {
						  db.get(validationCheck, [verificationCodeInput], async (err, row) => {
							if (err) {
							  console.error(err.message);
							  return;
							}

							if (row) {
							  const teamId = row.teamid;
							  console.log(teamId)
							  const teamName = row.teamname;
							  console.log(teamName)

							  // Now, correctly await the checkMemberCount function
							  const isBelowMemberLimit = await checkMemberCount(teamId, db);
							  console.log(isBelowMemberLimit)

							  if (!isBelowMemberLimit) {
								// If the team is below the member limit, you can add the participan
								  
								  db.run(sql_participant, [userid, username, email, teamId], async(err) => {
									  if (err) {
										return console.log(err.message);
									  }
									  console.log(`A row has been inserted with rowid ${this.lastID}`);
										// after registration add new role to user
										const role = interaction.guild.roles.cache.get(roleID);
										await interaction.member.roles.add(role);
					
										// 2. send dm to interaction user with onboarding information
									  const embed = new EmbedBuilder()
									.setColor(0x2f3136)
									.setTitle('Welcome to the Community Challenge #2')
									.setDescription('You are now a participant.')
									.setTimestamp()
									.addFields(
										{name: 'This is the Team-ID:', value: `**${verificationCodeInput}**\n\nSend this Code to your friends and they can join your Team!\nA team can have up to 3 members.`},
										{name: '\u200B', value: '\u200B'},
										{name: 'Team name', value: `${teamName}`, inline:true},
										{name: 'E-Mail', value: `${email}`, inline: true},
									)					
								user.send({embeds: [embed]}) // code here the message
									  
									  // Don't forget to close the database connection when you're done
										db.close();
										await interaction.reply({content: `The registration was successful!`})

									});
									  } else {
										console.log('Team hat das Limit erreicht');
										interaction.reply({content: 'Team is already full!', ephemeral: true})  
										  // Don't forget to close the database connection when you're done
										db.close();
									  }
									} else {
									  console.log('Verifikationscode ungültig1');
								interaction.reply({content: 'The Code you provided is not valid!', ephemeral: true})
										// Don't forget to close the database connection when you're done
									db.close();
									}
								  });
						 
                    }
                }
            })
        }
	},
}




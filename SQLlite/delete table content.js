const sqlite3 = require('sqlite3').verbose();

// create or open existing db
const db = new sqlite3.Database('Hackathon2.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geöffnet.');
  }
});

// Clear the "participant" table
const clearParticipantTable = () => {
  const sql = 'DELETE FROM participant';

  db.run(sql, [], (err) => {
    if (err) {
      throw err;
    }
    console.log('Cleared the "participant" table.');
  });
};

// Clear the "team" table
const clearTeamTable = () => {
  const sql = 'DELETE FROM team';

  db.run(sql, [], (err) => {
    if (err) {
      throw err;
    }
    console.log('Cleared the "team" table.');
  });
};

// Call the functions to clear the tables
clearParticipantTable();
clearTeamTable();



// close db
db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geschlossen.');
  }
});
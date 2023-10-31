const sqlite3 = require('sqlite3').verbose();

// Erstelle oder öffne die Datenbank
const db = new sqlite3.Database('Hackathon2.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geöffnet.');
  }
});

const sql1 = "INSERT INTO team (teamname, verificationcode) VALUES (?, ?)";
const sql = "INSERT INTO participant (userid, username, email, teamid) VALUES (?, ?, ?, ?)";


db.run(sql1, ['team1', 'HGFA'], function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });

db.run(sql, [123, 'jd', 'hi@hi.de', 1], function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });


db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geschlossen.');
  }
});
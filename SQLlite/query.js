const sqlite3 = require('sqlite3').verbose();

// create or open existing db
const db = new sqlite3.Database('meineDatenbank.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geöffnet.');
  }
});


// Code here

let sql = 'SELECT * FROM participant';
let sql1 = 'SELECT * FROM team';

db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.userid, row.username, row.email, row.teamid);
  });
});

db.all(sql1, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.teamid, row.teamname, row.verificationcode);
  });
});

// close db
db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geschlossen.');
  }
});
const sqlite3 = require('sqlite3').verbose();

// create or open existing db
const db = new sqlite3.Database('Hackathon2.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geöffnet.');
  }
});


// Code here


// close db
db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geschlossen.');
  }
});
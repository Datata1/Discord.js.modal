const sqlite3 = require('sqlite3').verbose();

// Erstelle oder öffne die Datenbank
const db = new sqlite3.Database('Hackathon2.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geöffnet.');
  }
});

// SQL-Befehl, um eine Tabelle zu erstellen
const createTableQuery = `
  CREATE TABLE team (
      teamid INTEGER PRIMARY KEY AUTOINCREMENT,
      teamname TEXT UNIQUE,
      verificationcode TEXT UNIQUE
  );
`;

const createTableQuery2 = `
  CREATE TABLE participant (
      userid INTEGER PRIMARY KEY,
      username TEXT,
      email TEXT,
      teamid INTEGER,
      FOREIGN KEY (teamid) REFERENCES team(teamid)
);
`

// Tabelle erstellen
db.run(createTableQuery, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Tabelle erstellt.');
  }
});

db.run(createTableQuery2, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Tabelle erstellt.');
  }
});


db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geschlossen.');
  }
});
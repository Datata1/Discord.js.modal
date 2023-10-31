const sqlite3 = require('sqlite3').verbose();

// Erstelle oder öffne die Datenbank
const db = new sqlite3.Database('Hackathon2.db'', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geöffnet.');
  }
});

// SQL-Befehl, um die Tabelle "team" zu löschen
const dropTableTeamQuery = `
  DROP TABLE IF EXISTS team;
`;

// SQL-Befehl, um die Tabelle "participant" zu löschen
const dropTableParticipantQuery = `
  DROP TABLE IF EXISTS participant;
`;

// Tabellen löschen
db.run(dropTableTeamQuery, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Tabelle "team" gelöscht.');
  }
});

db.run(dropTableParticipantQuery, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Tabelle "participant" gelöscht.');
  }
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Datenbank geschlossen.');
  }
});
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./urlshortener.db');

db.run(`

CREATE TABLE urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  expiry_date TEXT,
  clicks INTEGER DEFAULT 0
)`);

module.exports = db;

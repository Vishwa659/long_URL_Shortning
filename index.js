const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./urlshortener.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to the SQLite database.');
});


db.run(`

INSERT INTO urls (original_url, short_code, created_at, expiry_date)
VALUES ("http://chart.apis.google.com/chart?chs=500x500&chma=0,0,100,100&cht=p&chco=FF0000%2CFFFF00%7CFF8000%2C00FF00%7C00FF00%2C0000FF&chd=t%3A122%2C42%2C17%2C10%2C8%2C7%2C7%2C7%2C7%2C6%2C6%2C6%2C6%2C5%2C5&chl=122%7C42%7C17%7C10%7C8%7C7%7C7%7C7%7C7%7C6%7C6%7C6%7C6%7C5%7C5&chdl=android%7Cjava%7Cstack-trace%7Cbroadcastreceiver%7Candroid-ndk%7Cuser-agent%7Candroid-webview%7Cwebview%7Cbackground%7Cmultithreading%7Candroid-source%7Csms%7Cadb%7Csollections%7Cactivity|Chart", 'mno345', '2025-06-27T10:20:00Z', '2025-07-27T10:20:00Z');
);

`, (err) => {
  if (err) return console.error(err.message);
  console.log('Table created ');
});

module.exports = db;

const { nanoid } = require('nanoid');
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'urlshortener.db');
const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/');
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};
initializeDBAndServer();

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  const domain = new URL(url).hostname;

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  try {
    const isRepeated = await db.get(
      `SELECT original_url, short_code FROM urls WHERE original_url = ?`,
      [url]
    );

    if (isRepeated) {
      const shortCodeURL = `https://${domain}/${isRepeated.short_code}`;
      return res.json({ shortUrl: shortCodeURL });
    } else {
      const created_at = new Date().toISOString();
      const expiry_date = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(); // 28 days

      let shortCode;
      let isUnique = false;

      while (!isUnique) {
        shortCode = nanoid(6);
        const existing = await db.get(
          `SELECT * FROM urls WHERE short_code = ?`,
          [shortCode]
        );
        if (!existing) {
          isUnique = true;
        }
      }

      await db.run(
        `INSERT INTO urls (original_url, short_code, created_at, expiry_date) VALUES (?, ?, ?, ?)`,
        [url, shortCode, created_at, expiry_date]
      );

      const shortCodeURL = `https://${domain}/${shortCode}`;
      res.json({ shortUrl: shortCodeURL });
    }
  } catch (err) {
    return res.json({ error: 'Database error' });
  }
});

app.get('/code', async (req, res) => {
  const { code } = req.params;
  const now = new Date().toISOString();

  try {
    const isURLPresent = await db.get(
      `SELECT * FROM urls WHERE short_code = ?`,
      [code]
    );

    if (!isURLPresent) {
      return res.status(400).send('Not Found');
    }

    if (isURLPresent.expiry_date && isURLPresent.expiry_date < now) {
      let shortCode;
      let isUnique = false;
      const newExpiry = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(); // 28 days

      while (!isUnique) {
        shortCode = nanoid(6);
        const existing = await db.get(
          `SELECT * FROM urls WHERE short_code = ?`,
          [shortCode]
        );
        if (!existing) {
          isUnique = true;
        }
      }

      await db.run(
        `UPDATE urls SET short_code = ?, created_at = ?, expiry_date = ? WHERE original_url = ?`,
        [shortCode, now, newExpiry, isURLPresent.original_url]
      );

      const newShortCodeURL = `https://${req.headers.host}/${shortCode}`;
      return res.redirect(newShortCodeURL);
    }

    await db.run(
      `UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?`,
      [code]
    );

    res.redirect(isURLPresent.original_url);
  } catch (err) {
    console.error(err);
    res.status(400).send('Server error');
  }
});

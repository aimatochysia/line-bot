const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

const POSTGRESQL_URL = process.env.POSTGRESQL_URL;
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const LINE_TO = process.env.LINE_TO;

const client = new Client({
  connectionString: POSTGRESQL_URL,
  ssl: {
    rejectUnauthorized: true
  }
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/force-check', async (req, res) => {
  try {
    await checkAndPushMessage();
    res.json({ message: 'Force check initiated.' });
  } catch (error) {
    console.error('Error during force check:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function checkAndPushMessage() {
  const currentDate = new Date().toISOString().split('T')[0];
  const query = {
    text: `SELECT * FROM line_bot_activity WHERE date = $1 AND isposted = true`,
    values: [currentDate],
  };

  try {
    const result = await client.query(query);
    if (result.rows.length > 0) {
      console.log('Already posted for today, skipping.');
      return;
    }
    const retryKey = uuidv4();
    const body = {
      to: LINE_TO,
      messages: [
        { type: 'text', text: 'JANSEN KERJAIN GENSHIT SAYA, PETRA' },
        { type: 'text', text: 'DING DING DING' }
      ]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
      'X-Line-Retry-Key': retryKey
    };
    const fetch = await import('node-fetch');
    
    const response = await fetch.default('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to push message to LINE API: ${response.statusText}`);
    }
    const insertQuery = {
      text: `INSERT INTO line_bot_activity (date, time, isposted) VALUES ($1, $2, $3)`,
      values: [currentDate, new Date().toLocaleTimeString(), true],
    };

    await client.query(insertQuery);
    console.log('Message pushed and logged.');
  } catch (error) {
    console.error('Error in checkAndPushMessage:', error);
    throw error;
  }
}

const cron = require('node-cron');

cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled check...');
  try {
    await checkAndPushMessage();
  } catch (error) {
    console.error('Error during scheduled check:', error);
  }
});
app.get('/trigger-check', async (req, res) => {
  try {
    await checkAndPushMessage();
    res.send(`<button onclick="window.location='/force-check'">Force Check Now</button>`);
  } catch (error) {
    console.error('Error during trigger check:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

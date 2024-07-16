require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const moment = require('moment');
const { CronJob } = require('cron');

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

let requestBodies = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('*', (req, res) => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  const requestBody = {
    timestamp,
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
  };

  requestBodies.push(requestBody);

  res.json({ message: 'Request received and logged.', requestBody });
});

app.get('/', (req, res) => {
  const formattedRequests = requestBodies.map((req) => ({
    Timestamp: req.timestamp,
    Method: req.method,
    Path: req.path,
    Headers: req.headers,
    Body: req.body,
  }));

  res.json(formattedRequests);
});

const checkDatabaseAndSendMessage = async () => {
  const fetch = (await import('node-fetch')).default; // Dynamic import of node-fetch
  const today = moment().format('YYYY-MM-DD');
  const currentTime = moment().format('HH:mm:ss');

  const res = await client.query(
    'SELECT * FROM line_bot_activity WHERE date = $1',
    [today]
  );

  if (res.rows.length === 0) {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
        'X-Line-Retry-Key': require('crypto').randomUUID(),
      },
      body: JSON.stringify({
        to: process.env.LINE_TO,
        messages: [
          {
            type: 'text',
            text: 'JANSEN KERJAIN GENSHIT SAYA - PETRA',
          },
        ],
      }),
    });

    if (response.ok) {
      await client.query(
        'INSERT INTO line_bot_activity (date, time, isposted) VALUES ($1, $2, $3)',
        [today, currentTime, true]
      );
      console.log('Message sent and logged.');
    } else {
      console.error('Failed to send message.');
    }
  } else {
    console.log('Message already sent today.');
  }
};

const job = new CronJob('*/5 * * * *', checkDatabaseAndSendMessage);
job.start();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

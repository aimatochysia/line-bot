require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { CronJob } = require('cron');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  connectionString: process.env.POSTGRESQL_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

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
  const today = moment().format('YYYY-MM-DD');
  const currentTime = moment().format('HH:mm:ss');

  try {
    const res = await client.query(
      'SELECT * FROM line_bot_activity WHERE date = $1 AND isposted = $2',
      [today, true]
    );

    if (res.rows.length === 0) {
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
          'X-Line-Retry-Key': uuidv4(),
        },
        body: JSON.stringify({
          to: process.env.LINE_TO,
          messages: [
            {
              type: 'text',
              text: 'JANSEN KERJAIN GENSHIT SAYA, PETRA',
            },
            {
              type: 'text',
              text: 'DING DING DING',
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
  } catch (err) {
    console.error('Error checking database or sending message:', err);
  }
};

const job = new CronJob('*/5 * * * *', checkDatabaseAndSendMessage);
job.start();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

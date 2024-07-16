const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const axios = require('axios');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

const POSTGRESQL_URL = process.env.POSTGRESQL_URL || 'your_postgresql_url';
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || 'your_line_access_token';
const LINE_TO = process.env.LINE_TO || 'your_line_to';

const app = express();
const port = process.env.PORT || 3000;

let requestBodies = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
  connectionString: POSTGRESQL_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

const checkAndSendMessage = async () => {
  try {
    const query = `
      SELECT * FROM line_bot_activity 
      WHERE date = CURRENT_DATE 
      AND isposted = true
    `;
    const res = await client.query(query);

    if (res.rows.length === 0) {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
        'X-Line-Retry-Key': uuidv4()
      };

      const body = {
        to: LINE_TO,
        messages: [
          { type: 'text', text: 'JANSEN KERJAIN GENSHIT SAYA, PETRA' },
          { type: 'text', text: 'DING DING DING' }
        ]
      };

      await axios.post('https://api.line.me/v2/bot/message/push', body, { headers });

      const insertQuery = `
        INSERT INTO line_bot_activity (date, time, isposted) 
        VALUES (CURRENT_DATE, CURRENT_TIME, true)
      `;
      await client.query(insertQuery);
    }
  } catch (error) {
    console.error('Error checking database or sending message:', error);
  }
};

cron.schedule('*/5 * * * *', checkAndSendMessage);

app.post('*', (req, res) => {
  const requestBody = {
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers
  };

  requestBodies.push(requestBody);

  res.json({ message: 'Request received and logged.', requestBody });
});

app.get('/', (req, res) => {
  res.json(requestBodies);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

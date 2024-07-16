import express from 'express';
import bodyParser from 'body-parser';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { default as fetch } from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

const connectionString = process.env.POSTGRESQL_URL;
const lineAccessToken = process.env.LINE_ACCESS_TOKEN;
const lineTo = process.env.LINE_TO;

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized:true
  }
});
client.connect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let requestBodies = [];

app.get('/force-check', async (req, res) => {
  try {
    const result = await checkAndPostToLine();
    res.json({ message: 'Force check completed.', result });
  } catch (error) {
    console.error('Error in force check:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function checkAndPostToLine() {
  const currentDate = new Date().toISOString().split('T')[0];
  const queryText = 'SELECT * FROM line_bot_activity WHERE date = $1 AND isposted = true';
  const { rows } = await client.query(queryText, [currentDate]);

  if (rows.length > 0) {
    console.log('Already posted for today.');
    return 'Already posted for today.';
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${lineAccessToken}`,
    'X-Line-Retry-Key': uuidv4()
  };

  const body = {
    to: lineTo,
    messages: [
      { type: 'text', text: 'JANSEN KERJAIN GENSHIT SAYA, PETRA' },
      { type: 'text', text: 'DING DING DING' }
    ]
  };
  const lineApiUrl = 'https://api.line.me/v2/bot/message/push';
  const lineApiResponse = await fetch(lineApiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!lineApiResponse.ok) {
    throw new Error(`Failed to push message to Line API: ${lineApiResponse.statusText}`);
  }
  const insertQuery = 'INSERT INTO line_bot_activity (date, time, isposted) VALUES ($1, $2, $3)';
  const currentTime = new Date().toISOString().split('T')[1].split('.')[0];
  await client.query(insertQuery, [currentDate, currentTime, true]);

  console.log('Posted to Line and updated database.');
  return 'Posted to Line and updated database.';
}
setInterval(async () => {
  try {
    await checkAndPostToLine();
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
}, 5 * 60 * 1000);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

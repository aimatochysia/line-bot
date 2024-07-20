const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const authUsername = process.env.HTTP_AUTH_USERNAME;
const authPassword = process.env.HTTP_AUTH_PASSWORD;

module.exports = async (req, res) => {
    if (req.url === '/api/server') {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const [username, password] = credentials.split(':');
            if (username === authUsername && password === authPassword) {
                try {
                    const { messages } = req.body;

                    if (!messages || !Array.isArray(messages) || messages.length === 0) {
                        return res.status(400).send('Bad Request: Invalid message format');
                    }

                    const url = 'https://api.line.me/v2/bot/message/push';
                    const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
                        'X-Line-Retry-Key': uuidv4()
                    };
                    const body = {
                        to: process.env.LINE_TO,
                        messages: messages.map(text => ({ type: 'text', text }))
                    };

                    const response = await axios.post(url, body, { headers });
                    console.log('Message sent:', response.data);
                    return res.status(200).send('Message sent successfully');
                } catch (error) {
                    console.error('Error sending message:', error.response ? error.response.data : error.message);
                    return res.status(500).send('Error sending message');
                }
            } else {
                return res.status(401).send('Unauthorized');
            }
        } else {
            return res.status(401).send('Unauthorized');
        }
    } else {
        return res.status(401).send('Unauthorized');
    }
};

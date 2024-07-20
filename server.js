const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { json, send } = require('micro');
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
                    const body = await json(req);  // Parse the JSON body

                    const { messages } = body;

                    if (!messages || !Array.isArray(messages) || messages.length === 0) {
                        return send(res, 400, 'Bad Request: Invalid message format');
                    }

                    const url = 'https://api.line.me/v2/bot/message/push';
                    const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
                        'X-Line-Retry-Key': uuidv4()
                    };
                    const lineBody = {
                        to: process.env.LINE_TO,
                        messages: messages.map(text => ({ type: 'text', text }))
                    };

                    const response = await axios.post(url, lineBody, { headers });
                    console.log('Message sent:', response.data);
                    return send(res, 200, 'Message sent successfully');
                } catch (error) {
                    console.error('Error sending message:', error.response ? error.response.data : error.message);
                    return send(res, 500, 'Error sending message');
                }
            } else {
                return send(res, 401, 'Unauthorized');
            }
        } else {
            return send(res, 401, 'Unauthorized');
        }
    } else {
        return send(res, 401, 'Unauthorized');
    }
};

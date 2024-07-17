const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

module.exports = async (req, res) => {
    const url = 'https://api.line.me/v2/bot/message/push';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
        'X-Line-Retry-Key': uuidv4()
    };
    const body = {
        to: process.env.LINE_TO,
        messages: [
            {
                type: 'text',
                text: 'JANSEN KERJAIN GENSHIT SAYA, PETRA'
            },
            {
                type: 'text',
                text: 'DING DING DING'
            }
        ]
    };

    try {
        const response = await axios.post(url, body, { headers });
        console.log('Message sent:', response.data);
        res.status(200).send('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        res.status(500).send('Error sending message');
    }
};

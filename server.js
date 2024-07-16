const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

let requestBodies = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

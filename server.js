const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));

const indexHtmlPath = './public/index.html';
let indexHtmlContent = '';

// Read the initial content of index.html and serve it
fs.readFile(indexHtmlPath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }
  indexHtmlContent = data;
  app.get('/', (req, res) => {
    res.send(indexHtmlContent);
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
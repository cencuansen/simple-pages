const fs = require('fs');
const csv = require('csv-parser');

const inputFile = 'all.csv';
const outputFile = 'all.json';
const results = [];

fs.createReadStream(inputFile)
  .pipe(csv(['expression', 'reading', 'meaning', 'tags']))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log('CSV file successfully converted to JSON');
  });
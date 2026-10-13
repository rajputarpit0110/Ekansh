import fs from 'fs';
import csvParser from 'csv-parser';

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

async function test() {
    const data = await parseCSV('/Users/arpitrajput/Desktop/dummy_products.csv');
    console.log(data);
}
test();

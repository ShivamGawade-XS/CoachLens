const fs = require('fs');
const https = require('https');
const path = require('path');

const LOGOS = {
  emirates: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg',
  aramco: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Saudi_aramco_logo.svg',
  dpworld: 'https://upload.wikimedia.org/wikipedia/commons/2/22/DP_World_2021_logo.svg',
  hyundai: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Hyundai_Motor_Company_logo.svg',
  cocacola: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
  booking: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg',
  mrf: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Madras_Rubber_Factory_Logo.svg',
  indusind: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/IndusInd_Bank_SVG_Logo.svg',
  google: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'
};

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const download = (name, url) => {
  return new Promise((resolve) => {
    const filePath = path.join(dir, `${name}.svg`);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
          res.pipe(file);
        });
      } else {
        response.pipe(file);
      }
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded ${name}.svg`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`Error downloading ${name}.svg:`, err.message);
      resolve();
    });
  });
};

const run = async () => {
  const entries = Object.entries(LOGOS);
  for (const [name, url] of entries) {
    await download(name, url);
    await new Promise((r) => setTimeout(r, 1000)); // 1 second delay
  }
  console.log('All downloads completed sequentially!');
};

run();

// Simple Node.js proxy for economic calendar API (no CORS issues)
import http from 'http';
import https from 'https';

const PORT = process.env.PORT || 3005;
const TARGET_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

const server = http.createServer((req, res) => {
  if (req.url === '/api/economic-calendar') {
    https.get(TARGET_URL, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      });
    }).on('error', (err) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to fetch economic calendar' }));
    });
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Economic calendar proxy running on port ${PORT}`);
});

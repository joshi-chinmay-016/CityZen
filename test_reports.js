import http from 'http';

http.get('http://localhost:5000/api/reports', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Reports length:', parsed.length);
      if (parsed.length > 0) {
        console.log('First report:', parsed[0]);
      }
    } catch(e) {
      console.log('Raw data:', data);
    }
  });
}).on('error', err => {
  console.log('Error:', err.message);
});

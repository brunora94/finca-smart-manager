const fs = require('fs');
const content = `DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="YOUR_OPENAI_KEY_PLACEHOLDER"
GOOGLE_API_KEY="YOUR_GOOGLE_KEY_PLACEHOLDER"`;
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env fixed with Google key');

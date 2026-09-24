const app = require('./src/app');

// If executed directly with `node server.js`
if (require.main === module) {
  require('./src/server');
}

// Export express app for serverless platforms (Vercel) and supertest
module.exports = app;

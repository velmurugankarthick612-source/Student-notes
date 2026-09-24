const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`
  🎓 StudyHub Backend Server Running!
  -----------------------------------------
  🚀 Port:         ${PORT}
  🌍 Environment:  ${process.env.NODE_ENV || 'development'}
  🔗 API Health:   http://localhost:${PORT}/api/health
  -----------------------------------------
    `);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ [Port Error]: Port ${PORT} is already in use by another process.`);
      console.error(`   Please stop the process running on port ${PORT} or configure a different PORT in backend/.env.\n`);
    } else {
      console.error('❌ Server error:', error);
    }
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

module.exports = app;

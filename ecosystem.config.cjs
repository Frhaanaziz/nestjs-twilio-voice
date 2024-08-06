module.exports = {
  apps: [
    {
      name: 'twilio.idb2b.com',
      script: 'dist/main.js',
      autorestart: true,
      watch: false,
    },
  ],
};

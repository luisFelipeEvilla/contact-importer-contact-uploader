var cron = require('node-cron');
const { EXECUTION_FRECUENCY } = require('./config');
const upload = require('./contacts-upload');

cron.schedule(`${EXECUTION_FRECUENCY} * * * *`, () => {
  upload();
});
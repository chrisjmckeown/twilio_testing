const fs = require('fs');
const { Client, LocalAuth, NoAuth, LegacySessionAuth } = require('whatsapp-web.js');

// Path where the session data will be stored
const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

// const client = new Client({
//   puppeteer: {
//     headless: false
//   },
//   authStrategy: new LocalAuth({
//     clientId: "wherewolf"
//   })
// });

// Use the saved values
const client = new Client({
  authStrategy: new LegacySessionAuth({
    session: sessionData
  })
});

client.on('ready', () => {
  console.log('whatsapp-web.js client is ready!');
});
// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
  console.log('whatsapp-web.js authenticated', session);
  sessionData = session;
  if (!session) {
    console.log('whatsapp-web.js session is empty');
    return;
  }
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    if (err) {
      console.error(err);
    }
  });
});


client.initialize();


module.exports = client;
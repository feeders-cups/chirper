const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const config = require('./config');
const mongoose = require('mongoose');

// use node A+ promises
mongoose.Promise = Promise;

// check for connection string
if (!config.MONGO_URL) {
  throw new Error('MONGO_URL env variable not set.');
}

var isConn;
// initialize MongoDB connection
if (mongoose.connections.length === 0) {
  mongoose.connect(config.MONGO_URL);
} else {
  mongoose.connections.forEach(function(conn) {
    if (!conn.host) {
      isConn = false;
    }
  })

  if (isConn === false) {
    mongoose.connect(config.MONGO_URL);
  }
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// GET /answer route to handle the incoming call and provide NCCO actions
app.get('/answer', (req, res) => {
  let from = req.query.from;
  let to = req.query.to;
  let conferenceId = req.query.conference_id;

  const ncco = [
    {
      action: 'talk',
      voiceName: 'Jennifer',
      text: 'Welcome to Ednut OTP bypass powered call, ' + conferenceId.substr(-4),
      language: 'en-US',
      style: 2,
      bargeIn: false
    },
    {
      action: 'talk',
      text: 'Please enter the 6-digit code you received, followed by the hash key.',
      language: 'en-US',
      style: 2,
      bargeIn: true
    },
    {
      action: 'input',
      type: ['dtmf'],
      dtmf: {
        maxDigits: 6,
        submitOnHash: true,
        timeOut: 20
      }
    },
    {
      action: 'talk',
      text: 'Thanks for your input, goodbye.',
      language: 'en-US',
      style: 2
    }
  ];

  res.json(ncco);
});

// POST /event route to handle DTMF input and log it to the console
app.post('/event', (req, res) => {
  if (req.body.dtmf) {
    console.log(`User input received: ${req.body.dtmf.digits}`);
  } else {
    console.log('Event received:', req.body);
  }
  res.status(204).end();
});

// Start the server
const server = app.listen(process.env.PORT || 4001, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

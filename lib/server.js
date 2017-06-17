const express = require('express');
const path    = require('path');
const request = require('request');
const config = process.env.keys || require('./config.js');

const app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../index.html'));
});

app.get('/bundle.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/javascripts/bundle.js'));
});

app.get('/loading.svg', function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/loading.svg'));
});

app.get('/tweettones.png', function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/tweettones.png'));
});

app.get('/tweets', function (req, res) {
  let screen_name = req.query.screen_name;

  let oauth = {
          consumer_key: config.consumer_key,
          consumer_secret: config.consumer_secret,
          token: config.token,
          token_secret: config.token_secret
        };

  request.get({
      url: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
      oauth,
      qs: { screen_name: screen_name, include_rts: false, count: 5 },
      json: true
    },
    function (error, response, body) {
      if (error) {
        res.status(422).send(`Failed to connect`);
      } else {
        res.send(body);
      }
    }
  );
});

app.get('/sentiments', function (req, res) {
  let inputText = req.query.inputText;

  request.get({
      url: "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone",
      auth: {
        user: config.watsonUsername,
        password: config.watsonPassword
      },
      qs: {
        text: inputText,
        version:'2016-05-19',
        tones: 'emotion, language, social'
      },
      json: true
    },
    function (error, response, body) {
      if (error) {
        res.status(422).send('Failed to connect');
      } else {
        res.send(body);
      }
    }
  );
});

const port = process.env.PORT || 8080
app.listen(port, function () {
  console.log(`Express server listening on port ${port}`);
});

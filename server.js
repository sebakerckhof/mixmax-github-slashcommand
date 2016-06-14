'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sync = require('synchronize');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

// Use fibers in all routes so we can use sync.await() to make async code easier to work with.
app.use(function(req, res, next) {
  sync.fiber(next);
});

// Since Mixmax calls this API directly from the client-side, it must be whitelisted.
const corsOptions = {
  origin: /^[^.\s]+\.mixmax\.com$/,
  credentials: true
};

const serverOptions = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

app.get('/typeahead', cors(corsOptions), require('./api/typeahead'));
app.get('/resolver', cors(corsOptions), require('./api/resolver'));

const port = process.env.PORT || 9145;
https.createServer(serverOptions, app).listen(port, function(){
  console.log(`Listening on port ${port}`);
});
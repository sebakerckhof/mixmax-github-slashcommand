'use strict';
const express = require('express');
const app = express();
const sync = require('synchronize');
const cors = require('cors');
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

app.get('/typeahead', cors(corsOptions), require('./api/typeahead'));
app.get('/resolver', cors(corsOptions), require('./api/resolver'));

const port = process.env.PORT || 9145;
app.listen(port, function(){
  console.log(`Listening on port ${port}`);
});
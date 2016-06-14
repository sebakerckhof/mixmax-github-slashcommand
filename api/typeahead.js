'use strict';
const request = require('request');
const search = require('./search');

// The Type Ahead API.
module.exports = function(req, res) {
  if(!req.query.text){
    res.status(500).send('Error');
    return;
  }

  const term = req.query.text.trim();
  if (!term) {
    res.json([{
      title: '<i>(enter a search term)</i>',
      text: ''
    }]);
    return;
  }

  let response;
  try{
    response = search(term);
  }catch(e){
    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body || !response.body.items) {
    res.status(500).send('Error');
    return;
  }

  if(!response.body.items.length){
    res.json([{
      title: '<i>(no results)</i>',
      text: ''
    }]);
    return;
  }

  const results = response.body.items
    .map(repo =>
        ({
        title: `<b>${repo.name}</b> <span style="color: #888;">&#9733; ${repo.stargazers_count}</span><br><span style="color: #888;">${ repo.description ? repo.description.substr(0,200) : repo.full_name}</span>`,
        text: repo.url
      })
    );
  return res.json(results);
};

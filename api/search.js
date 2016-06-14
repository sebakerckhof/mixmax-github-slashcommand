'use strict';
const sync = require('synchronize');
const request = require('request');

module.exports = function search(term){
    return sync.await(request({
        url: 'https://api.github.com/search/repositories',
        headers: {
            'Accept': 'application/vnd.github.v3.text-match+json',
            'User-Agent': 'Mixmax slash command'
        },
        qs: {
            q: term,
        },
        gzip: true,
        json: true,
        timeout: 10 * 1000
    }, sync.defer()));
};
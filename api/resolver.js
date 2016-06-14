'use strict';
const sync = require('synchronize');
const request = require('request');
const search = require('./search');

// The API that returns the in-email representation.
module.exports = function(req, res) {

  if(!req.query.text){
    res.status(500).send('Error');
    return;
  }

  const term = req.query.text.trim();

  const re = new RegExp('https://api.github.com/repos/');
  if (re.test(term)) {
    // Special-case: handle strings in the special URL form that are suggested by the /typeahead
    // API. This is how the command hint menu suggests an exact Giphy image.
    handleUrl(term, req, res);
  } else {
    // Else, if the user was typing fast and press enter before the /typeahead API can respond,
    // Mixmax will just send the text to the /resolver API (for performance). Handle that here.
    handleSearchString(term, req, res);
  }
};

function buildPanel(repo){
  return `
<div style="height:4px; font-size:4px;"><br></div>
<!--[if mso]>
<table class="mso-card-v3" width="578" cellpadding="0" cellspacing="0" style="border:1px solid #f5ffff;">
    <tr>
        <td style="border:1px solid #d5ecff; background-color:#99b0e1; padding:1px;">
<![endif]-->

<table class="card-v3" cellpadding="0" cellspacing="0" style="border:1px solid #f5ffff; border-radius:4px; width:100%; max-width:578px; mso-border-alt: none;">
    <tr style="border:1px solid #d5ecff; mso-border-alt:none; display:block; border-radius: 3px;">
        <td style="display:block; padding:8px; border-radius:2px; border:1px solid #99b0e1; font-size:0; vertical-align:top; background-color:white; mso-border-alt:none;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" valign="top" style="border-collapse:separate; text-align:left;">
                <tr>
                    <td class="palm-one-whole" rowspan="" valign="top" style="font-size:13px;">
                        <table width="100%" class="inner" border="0" cellpadding="0" cellspacing="0" valign="top" style="border-collapse:separate; font-size:13px;">
                            <tr>
                                <td valign="top">
                                    <table cellpadding="0" cellspacing="0" valign="top" style="border-collapse:collapse">
                                        <tr>
                                            <td colspan="2" valign="top" style="min-width:100%;  padding-bottom: 2px; font-size:16px; line-height:22px;  font-weight:600;  font-family:'proxima-nova', 'Avenir Next', 'Segoe UI', 'Calibri', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                                <a href="${repo.html_url}" target="_blank" style="text-decoration:none;  display:block;  color:#333;  border:none;">
                                                    ${repo.name} <span style="color: #888;">&#9733; ${repo.stargazers_count}</span>
                                                </a>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td colspan="2" valign="top" style="min-width:100%;  padding-bottom: 4px;  font-size:13px; line-height:17px;  font-family:'Segoe UI', 'Helvetica Neue', Helvetica, 'Calibri', Arial, sans-serif;">
                                                <a href="${repo.html_url}" target="_blank" style="text-decoration:none;  display:block;  color:#333;  border:none;">
                                                   ${ repo.description ? repo.description.substr(0,300) : repo.full_name}
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>
                    </td>

                <tr>
                    <td valign="bottom">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" valign="top" style="border-collapse:separate; ">
                            <tr>
                                <td valign="bottom" style="line-height:11px; font-family:'proxima-nova', 'Avenir Next', 'Segoe UI', 'Calibri', 'Helvetica Neue', Helvetica, Arial, sans-serif;" class="hostname">
                                    <a style="color:#aab; display:block;  font-size:11px;  margin:0;  letter-spacing:1px;  padding-left: 1px; text-decoration:none;  text-transform:uppercase;" href="${repo.html_url}" target="_blank">github.org</a>
                                </td>
                                <td align="right" valign="bottom">
                                    <a href="https://mixmax.com/r/nZHd88mN8LZbYmdR6" style="display:block;  vertical-align:top;  font-size:0;" target="_blank">
                                        <img src="https://emailapps.mixmax.com/img/badge_mixmax.png" align="top" height="20" style="display:block;" alt="Mixmax"  border="0"/>
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                </tr>
            </table>

        </td>
    </tr>
</table>

<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->

<div style="height:4px; font-size:4px;"><br></div>
  `;
}

function handleUrl(url, req, res) {

  let response;
  try{
    response = sync.await(request({
      url,
      headers: {
        'User-Agent': 'Mixmax slash command'
      },
      gzip: true,
      json: true,
      timeout: 10 * 1000
    }, sync.defer()));
  }catch(e){
    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body) {
    res.status(500).send('Error');
    return;
  }

  const html = buildPanel(response.body);
  res.json({
    body: html
  });
}

function handleSearchString(term, req, res) {
  let response;
  try {
    response = search(term);
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body || !response.body.items) {
    res.status(500).send('Error');
    return;
  }

  if(!response.body.items.length){
    res.status(200).send('No result');
  }

  const html = buildPanel(response.body.items[0]);
  res.json({
    body: html
  });
}

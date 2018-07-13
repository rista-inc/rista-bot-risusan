const functions = require('firebase-functions');
const request = require('request');

exports.PRsNotification = functions.https.onRequest((req, res) => {

  const SLACK_USER_IDS = {
    'mikeda':       'U0EGJFH9R',
    'dim0627':      'U32BT5NSU',
    'fumihumi':     'U98U6KB33',
    'daijiro108':   'U3X8ZN1NH',
    'jtakahashi64': 'T0EGJFH99',
  };

  const GITHUB_TOKEN = functions.config().tokens.github;
  const SLACK_TOKEN  = functions.config().tokens.slack;

  const githubRequestOptions = {
    url: 'https://api.github.com/repos/rista-inc/joblist/pulls',
    method: 'GET',
    headers: {
      'user-agent': 'node.js',
      'Authorization': `token ${GITHUB_TOKEN}`
    }
  };

  request(githubRequestOptions, (error, response, body) => {
    const pulls = JSON.parse(body);

    let message = '';

    pulls.forEach((pull) => {
      let reviewerNames = '';

      if (0 < pull['requested_reviewers'].length) {
        for (let i = 0; i < pull['requested_reviewers'].length; i++) {
          const id = SLACK_USER_IDS[pull['requested_reviewers'][i]['login']];
          reviewerNames = reviewerNames + `<@${id}>\n`;
        }

        message = message + `こちらのレビューをお願いリスよ〜\n${pull['html_url']}\n${reviewerNames}\n`;
      }
    });

    if (message === '') {
      message = '未レビューのPRはないリスよ〜、みんなでコーヒーでも飲むがよいリスよ〜';
    }

    request.post('https://slack.com/api/chat.postMessage',
      {
        form: {
          token: SLACK_TOKEN,
          channel: '#dev',
          username: 'リスさん',
          text: message
        }
      }
      , (error, response, body) => {
        console.log(error);

        res.status(200).send(null);
      }
    );
  });
});

'use strict'

const ghpages = require('gh-pages');
const path = require('path');
const targets = require('./targets');

(function() {
  var target = targets[process.argv[2]];
  var message = process.argv[3]
  if (!target) return console.error("Invalid target!");

  ghpages.publish(path.join(__dirname, '..', target.directory), {
    dotfiles: true,
    repo: target.repo,
    branch: target.branch || "master",
    message: message || "Publish to Github",
    logger: function(message) { console.log(message) }
  }, function(err) {
    if (err) throw new Error(err)
  })
})()
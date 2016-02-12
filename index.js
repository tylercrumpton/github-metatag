var request = require("request");
var FastSet = require("collections/fast-set");
var async = require("async");
var config = require("config");
var jsonfile = require('jsonfile')



module.exports = {
  getTagMap: function(username, apiKey, callback) {
    var searchUrl = 'https://api.github.com/search/code';
    var headers = { 'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'user-agent': 'github-metatag' };
    var searchParams = { q: 'meta-tags in:readme user:' + username };

    // Set the auth header if a key was provided:
    if (apiKey !== undefined) {
      headers['authorization'] = 'token ' + apiKey;
    }

    var requestOptions = { method: 'GET',
                           url: searchUrl,
                           qs: searchParams,
                           headers: headers };

    request(requestOptions, function (error, response, body) {
      if (error) throw new Error(error);

      var tagMap = {};

      console.log("Retrieved list of repos with metatags.");

      repos = JSON.parse(body);
      async.each(repos['items'], function(repo, done) {
        var repoName = repo['repository']['name'];
        console.log("Found repo: " + repoName);
        var repoReqOptions = requestOptions;
        repoReqOptions['url'] = repo['url']
        request(repoReqOptions, function (error, response, body) {
          if (error) throw new Error(error);

          repoResponse = JSON.parse(body);
          var readmeReqOptions = requestOptions;
          readmeReqOptions['url'] = repoResponse['download_url'];
          request(readmeReqOptions, function (error, response, body) {
            if (error) throw new Error(error);

            var metastring = body.match(/<!-- meta-tags:.*/)[0];
            var tags = metastring.match(/vvv-[^, ]*/g);

            tags = tags.map(function (tag) {
              return tag.replace('vvv-', '');
            });

            tagMap[repoName] = tags;
            done();
          });
        });
      }, function(error) {
        if (error) throw new Error(error);

        callback(tagMap);
      });
    });
  }
};

var request = require("request");
var FastSet = require("collections/fast-set");
var async = require("async");
var config = require("config");
var jsonfile = require('jsonfile')

var url = 'https://api.github.com/search/code';
var headers = { 'cache-control': 'no-cache',
                'content-type': 'application/json',
                'user-agent': 'github-metatag',
                'authorization': 'token ' + config.get('api_key') };

var outFile = config.get('output');

var alloptions = { method: 'GET',
  url: url,
  qs: { q: 'meta-tags in:readme user:' + config.get('username') },
  headers: headers };

var uniqueTags = FastSet();

var tagMap = {};

console.log("Getting metatags in repos for user: " + config.get('username'));

request(alloptions, function (error, response, body) {
  if (error) throw new Error(error);

  repos = JSON.parse(body);
  //console.log(repos);
  //response['items'].forEach(function(repo) {
  async.each(repos['items'], function(repo, done) {
      var repoName = repo['repository']['name'];
      //console.log("Getting tags for repo: " + repo['url']);
      var options = { 
        method: 'GET',
        url: repo['url'],
        headers: headers 
      };
      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        //console.log("re: " + body);

        response = JSON.parse(body);
        var options = {
          method: 'GET',
          url: response['download_url'],
          headers: headers
        };
        //console.log("Getting README: " + response['download_url']);
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          var metastring = body.match(/<!-- meta-tags:.*/)[0];
          var tags = metastring.match(/vvv-[^, ]*/g);

          tags = tags.map(function (tag) {
            return tag.replace('vvv-', '');
          });

          tagMap[repoName] = tags;

          uniqueTags = uniqueTags.union(tags);
          done();
        });

      });
  }, function(err) {
    console.log("Repos found: " + getRepoList(tagMap));
    console.log("Unique tags: " + uniqueTags.toArray());
    jsonfile.writeFile(outFile, tagMap, function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
});

var getRepoList = function(tagMap) {
  return Object.keys(tagMap);
}

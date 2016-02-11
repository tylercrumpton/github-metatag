var request = require("request");
var FastSet = require("collections/fast-set");
var async = require("async");
var config = require("config");

var url = 'https://api.github.com/search/code';
var headers = { 'cache-control': 'no-cache',
                'content-type': 'application/json',
                'user-agent': 'github-metatag' };

var alloptions = { method: 'GET',
  url: url,
  qs: { q: 'meta-tags in:readme user:' + config.get('username') },
  headers: headers };

var allTags = FastSet();

console.log("Getting metatags in repos for user: " + config.get('username'));

request(alloptions, function (error, response, body) {
  if (error) throw new Error(error);

  response = JSON.parse(body);
  //response['items'].forEach(function(repo) {
  async.each(response['items'], function(repo, done) {
      //console.log("Getting: " + repo['url']);
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
          allTags = allTags.union(tags);
          //console.log(allTags);
          done();
        });

      });
  }, function(err) {
    console.log('All tags: ' + allTags.toArray().map(function (tag) {
      return tag.replace('vvv-', '');
    }));
  });
  

});

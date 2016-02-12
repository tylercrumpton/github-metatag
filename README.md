# github-metatag

This package provides the ability to find GitHub "meta-tags" in a user's GitHub repos.

## Installation
Install this package for use in your project using `npm`:
```bash
npm install github-metatag --save
```

## Usage
There is only one function in this package: `getTagMap`. It calls a provided callback function with an object that contains repo names and associated meta-tags.

For example, the following code will search for tags in repos owned by `foouser`:

```js
var ghmeta = require('github-metatag');

ghmeta.getTagMap("foouser", "myapikey", function(tagMap) {
  console.log(tagMap);
})
```

The above will print out an object that looks like:

```js
{ 'my-repo-name': [ 'thistag', 'othertag', 'anothertag' ],
  'my-other-repo': [ 'thistag', 'differenttag', 'besttag' ] }
```

If a GitHub API key is presented, GItHub's search API limits are lightened allowing more thatn a few searches per hour. 
Providing an API key with the proper permissions allows private repos to be searched as well.
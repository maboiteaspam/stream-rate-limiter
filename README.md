# stream rate limiter

A transform to limit the rate of a stream.

## Install

    npm i maboiteaspam/stream-rate-limiter --save

## API

It return a `through2.obj` stream, and take a callback(chunk, done) as parameter.

```js
var rateLimiter = require('stream-rate-limiter')
var concurrency = 250;
var stream = rateLimiter(concurrency, function damnSlowProcess (chunk, done) {
  setTimeout(function(){
    //console.log(chunk.some+'');
    done();
  }, 250)
});
```

## Example

Take a look to the example, it s using `multimeter` module to visualize the stream activity.

    git clone git@github.com:maboiteaspam/stream-rate-limiter.git
    cd stream-rate-limiter
    npm i && node test.js && node test2.js

## Read more

 - https://github.com/rvagg/through2
 - https://github.com/nodejs/readable-stream/blob/master/doc/stream.markdown#stream_event_data
 - https://github.com/substack/stream-handbook

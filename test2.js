
var minimist = require('minimist')(process.argv.slice(2));

if (minimist.verbose || minimist.v)
  process.env['DEBUG'] = 'stream-rate-limiter';

process.env['DEBUG'] = 'stream-visualizer';

var debug = require('debug')('stream-rate-limiter')
var through2 = require('through2')
var rateLimiter = require('./index')
var sVisualizer = require('./stream-visualizer')

var concurrency=1000;
var streamSize=5000;

var visualizer = new sVisualizer();
visualizer.start(streamSize);

var streamC = through2.obj();

var stream = rateLimiter(concurrency, function damnSlowProcess (chunk, done) {
  setTimeout(function(){
    //console.log(chunk.some+'');
    done();
  }, 250)
});
stream.resume();


streamC
  .pipe(visualizer.jobSent('stream'))
  .pipe(visualizer.jobProcessing('stream'))
  .pipe(stream)
  .pipe(visualizer.jobRemains('stream', true))


for (var e=0; e<streamSize;e++) {
  streamC.write({some:' data '+e})
}
streamC.end()



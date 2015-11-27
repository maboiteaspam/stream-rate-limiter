
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

var streamC = through2.obj(function(chunk, enc, cb) {
  debug('streamC=%s', chunk.some)
  cb(null, chunk);
}, function (cb){
  debug('streamC flushing')
  cb()
});

var stream = rateLimiter(concurrency, function damnSlowProcess (chunk, done) {
  setTimeout(function(){
    //console.log(chunk.some+'');
    done();
  }, getRandomInt(500,3000))
});

var streamB = through2.obj(function(chunk, enc, cb) {
  setTimeout(function (){
    debug('streamB=%s', chunk.some)
    cb(null, chunk);
  }, 2)
}, function (cb){
  debug('streamB flushing')
  cb()
});
streamB.resume()  /// WHY DOES IT NEED FLOWING MODE !!!?

streamC
  .pipe(visualizer.jobSent('stream'))
  .pipe(visualizer.jobProcessing('stream'))
  .pipe(stream)
  .pipe(visualizer.jobSent('streamB'))
  .pipe(visualizer.jobProcessing('streamB'))
  .pipe(streamB)
  .pipe(visualizer.jobPushed('streamB', true))
  .pipe(visualizer.jobRemains('stream', true))
;

for (var e=0; e<streamSize;e++) {
  streamC.write({some:' data '+e})
}

stream.resume();

streamC.end()


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
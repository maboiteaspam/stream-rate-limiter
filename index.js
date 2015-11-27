
var debug = require('debug')('stream-rate-limiter')
var through2 = require('through2')

module.exports = function (rate, damnSlowFunction) {

  var processing      = 0;
  var queuedProcess   = [];

  var streamDelayedFn = function (stream, chunk, cb) {
    return function (){
      processing++;
      damnSlowFunction(chunk, function (err, newChunk) {
        if (queuedProcess.length) queuedProcess.shift()();
        if (cb) cb(err, newChunk||chunk);
        else stream.push(newChunk||chunk);
        processing--;
      });
    }
  };

  var fnTransform = function (chunk, enc, cb){
    var that = this;
    debug('transform=%s', chunk.some)
    if(processing>=rate) {
      queuedProcess.push(streamDelayedFn(that, chunk, cb));
    } else {
      cb(null);
      streamDelayedFn(that, chunk)();
    }
  };
  var fnFlush = function (cb){
    debug('flushing')
    debug('processing=%s', processing)
    debug('queued=%s', queuedProcess.length)
    var waitForThemToFinish = function () {
      if(!(processing + queuedProcess.length)) cb()
      else setTimeout(waitForThemToFinish, 10);
    };
    waitForThemToFinish();
  };

  var rateLimitedStream = through2.obj(fnTransform, fnFlush);
  var debugInterval = setInterval(function () {
    debug('processing=%s', processing);
    debug('queued=%s', queuedProcess.length);
  }, 500);
  rateLimitedStream.on('end', function(){
    debug('end')
    clearInterval(debugInterval)
  });

  return rateLimitedStream;
};

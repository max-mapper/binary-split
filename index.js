var os = require('os')
var through = require('through')

module.exports = BinarySplit

function BinarySplit(matcher) {
  if (!(this instanceof BinarySplit)) return new BinarySplit(matcher)
  var matcher = new Buffer(matcher || os.EOL)
  var buffered
  return through(write, end)
  
  function write(buf) {
    if (buffered) {
      buf = Buffer.concat(buffered, buf)
      buffered = undefined
    }
    var split = splitFirstNewline(buf)
    if (!split) {
      buffered = buf
      return
    }
    this.queue(split[0])
    buffered = split[1]
  }
  
  function end() {
    var self = this
    while (buffered) {
      var split = splitFirstNewline(buffered)
      if (!split) {
        self.queue(buffered)
        buffered = undefined
      } else {
        self.queue(split[0])
        buffered = split[1]
      }
    }
    this.queue(null)
  }
  
  function splitFirstNewline(buf) {
    var newlineIdx = false
    var i = 0
    while (!newlineIdx) {
      if (buf[i] === matcher[0]) {
        var match = true
        // make sure multibyte matches fully match
        for (var j = i; j < matcher.length; j++)
          if (buf[j] !== matcher[j]) match = false
        if (match) newlineIdx = i
      }
      i++
      if (i === buf.length + 1) return false
    }
    var split = [buf.slice(0, newlineIdx)]
    var idx = newlineIdx + matcher.length
    if (buf.length > idx) split.push(buf.slice(idx, buf.length))
    return split
  }
}

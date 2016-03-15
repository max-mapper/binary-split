var through = require('through2')
var os = require('os')

module.exports = BinarySplit

function BinarySplit (matcher) {
  if (!(this instanceof BinarySplit)) return new BinarySplit(matcher)
  matcher = Buffer(matcher || os.EOL)
  var buffered
  var bufcount = 0
  return through(write, end)

  function write (buf, enc, done) {
    bufcount++
    var offset = 0
    var lastMatch = 0
    if (buffered) {
      buf = Buffer.concat([buffered, buf])
      offset = buffered.length
      buffered = undefined
    }

    while (true) {
      var idx = firstMatch(buf, offset)
      if (idx !== -1 && idx < buf.length) {
        this.push(buf.slice(lastMatch, idx))
        offset = idx + matcher.length
        lastMatch = offset
      } else {
        buffered = buf.slice(lastMatch)
        break
      }
    }

    done()
  }

  function end (done) {
    if (buffered) this.push(buffered)
    done()
  }

  function firstMatch (buf, offset) {
    if (offset >= buf.length) return -1

    for (var i = offset, m = matcher.length; i < buf.length - m; i++) {
      for (var j = 0; j < m; j++) {
        if (buf[i + j] !== matcher[j]) break
      }
      if (j === m) return i
    }
    return buf.length
  }
}

var bops = require('bops')
var through = require('through2')
var os = require('os')

module.exports = BinarySplit

function BinarySplit (matcher) {
  if (!(this instanceof BinarySplit)) return new BinarySplit(matcher)
  matcher = bops.from(matcher || os.EOL)
  var buffered
  var bufcount = 0
  var offset = 0
  return through(write, end)

  function write (buf, enc, done) {
    bufcount++

    if (buffered) {
      buf = bops.join([buffered, buf])
      buffered = undefined
    }

    while (buf) {
      var idx = firstMatch(buf, offset)
      if (idx !== -1 && idx < buf.length) {
        this.push(bops.subarray(buf, 0, idx))
        buf = bops.subarray(buf, idx + matcher.length)
        offset = 0
      } else {
        buffered = buf
        offset = buf.length
        buf = undefined
      }
    }

    done()
  }

  function end (done) {
    if (buffered) this.push(buffered)
    this.push(null)
    done()
  }

  function firstMatch (buf, offset) {
    if (offset >= buf.length) return -1
    for (var i = offset; i < buf.length; i++) {
      if (buf[i] === matcher[0]) {
        if (matcher.length > 1) {
          var fullMatch = true
          for (var j = i, k = 0; j < i + matcher.length; j++, k++) {
            if (buf[j] !== matcher[k]) {
              fullMatch = false
              break
            }
          }
          if (fullMatch) return j - matcher.length
        } else {
          break
        }
      }
    }

    var idx = i + matcher.length - 1
    return idx
  }
}

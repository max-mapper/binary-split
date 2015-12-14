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

    if (buffered) {
      buf = Buffer.concat([buffered, buf])
      buffered = undefined
    }

    while (buf) {
      var idx = firstMatch(buf, offset)
      if (idx) {
        var line = buf.slice(offset, idx)
        if (idx === buf.length) {
          buffered = line
          buf = undefined
          offset = idx
        } else {
          this.push(line)
          offset = idx + matcher.length
        }
      } else if (idx === 0) {
        buf = buf.slice(offset + matcher.length)
      } else {
        if (offset >= buf.length) {
          buffered = undefined
        } else {
          buffered = buf
        }
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
    if (offset >= buf.length) return false
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

var through = require('through2')
var os = require('os')

module.exports = BinarySplit

function BinarySplit (splitOn) {
  if (!(this instanceof BinarySplit)) return new BinarySplit(splitOn)
  splitOn = splitOn || os.EOL
  var matcher = Buffer.from && Buffer.from !== Uint8Array.from
    ? Buffer.from(splitOn)
    : new Buffer(splitOn) // eslint-disable-line
  var buffered
  return through(write, end)

  function write (buf, enc, done) {
    var offset = 0
    var lastMatch = 0
    if (buffered) {
      buf = Buffer.concat([buffered, buf])
      offset = buffered.length
      buffered = undefined
    }

    while (true) {
      var idx = firstMatch(buf, offset - matcher.length + 1)
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

var bops = require('bops')
var through = require('through')
var os = require('os')

module.exports = BinarySplit

function BinarySplit(matcher) {
  if (!(this instanceof BinarySplit)) return new BinarySplit(matcher)
  var matcher = bops.from(matcher || os.EOL)
  var buffered
  var bufcount = 0
  return through(write, end)
  
  function write(buf) { 
    bufcount++
    var offset = 0
        
    if (buffered) {
      buf = bops.join([buffered, buf])
      buffered = undefined
    }
    
    while (buf) {
      var idx = firstMatch(buf, offset)
      if (idx) {
        var line = bops.subarray(buf, offset, idx)
        if (idx === buf.length) {
          buffered = line
          buf = undefined
          offset = idx
        } else {
          this.queue(line)
          offset = idx + matcher.length
        }
      } else if (idx === 0) {
        buf = bops.subarray(buf, offset + matcher.length)
      } else {
        if (offset >= buf.length) {
          buffered = undefined
        } else {
          buffered = buf
        }
        buf = undefined
      }
    }
  }
  
  function end() {
    if (buffered) this.queue(buffered)
    this.queue(null)
  }
  
  function firstMatch(buf, offset) {
    var i = offset
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

const through = require('through2')
const os = require('os')

module.exports = BinarySplit

function BinarySplit (splitOn) {
  if (!(this instanceof BinarySplit)) return new BinarySplit(splitOn)
  splitOn = splitOn || os.EOL
  const matcher = Buffer.from(splitOn)
  let buffered
  return through(write, end)

  function write (buf, enc, done) {
    let offset = 0
    let lastMatch = 0
    if (buffered) {
      buf = Buffer.concat([buffered, buf])
      offset = buffered.length
      buffered = undefined
    }

    while (true) {
      const idx = firstMatch(buf, offset - matcher.length + 1)
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
    let i
    for (i = offset; i < buf.length; i++) {
      if (buf[i] === matcher[0]) {
        if (matcher.length > 1) {
          let fullMatch = true
          let j = i
          for (let k = 0; j < i + matcher.length; j++, k++) {
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

    const idx = i + matcher.length - 1
    return idx
  }
}

import { Transform } from 'node:stream'

function BinarySplit (splitOn = '\n') {
  const matcher = Buffer.from(splitOn)
  if (matcher.length === 0) throw new Error('splitOn must not be empty')

  // indexOf with a byte value is much faster than with a 1-byte Buffer, which matters for short lines
  const needle = matcher.length === 1 ? matcher[0] : matcher
  // a multi-byte delimiter may straddle a chunk boundary, so we keep that many trailing bytes around
  const overlap = matcher.length - 1

  // unterminated data is collected as a list of chunks and concatenated only once a delimiter arrives,
  // so a long line spanning many chunks is copied once rather than on every chunk
  let pending = []
  let pendingLength = 0
  let edge // last `overlap` bytes of pending data

  return new Transform({
    readableObjectMode: true,

    transform (chunk, enc, done) {
      let buf = chunk
      let offset = 0

      if (pendingLength > 0) {
        const straddles = overlap > 0 && Buffer.concat([edge, chunk.subarray(0, overlap)]).indexOf(matcher) !== -1
        if (!straddles && chunk.indexOf(needle) === -1) {
          pending.push(chunk)
          pendingLength += chunk.length
          if (overlap > 0) edge = Buffer.concat([edge, chunk.subarray(-overlap)]).subarray(-overlap)
          return done()
        }
        pending.push(chunk)
        buf = Buffer.concat(pending, pendingLength + chunk.length)
        offset = Math.max(0, pendingLength - overlap)
        pending = []
        pendingLength = 0
      }

      let start = 0
      let idx
      while ((idx = buf.indexOf(needle, offset)) !== -1) {
        if (idx > start) this.push(buf.subarray(start, idx))
        start = offset = idx + matcher.length
      }
      if (start < buf.length) {
        const rest = buf.subarray(start)
        pending.push(rest)
        pendingLength = rest.length
        if (overlap > 0) edge = rest.subarray(-overlap)
      }

      done()
    },

    flush (done) {
      if (pendingLength > 0) this.push(Buffer.concat(pending, pendingLength))
      done()
    }
  })
}

export { BinarySplit as default, BinarySplit as 'module.exports' }

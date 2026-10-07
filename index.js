import { Transform } from 'node:stream'

function BinarySplit (splitOn = '\n') {
  const matcher = Buffer.from(splitOn)
  // indexOf with a byte value is much faster than with a 1-byte Buffer, which matters for short lines
  const needle = matcher.length === 1 ? matcher[0] : matcher
  let buffered

  return new Transform({
    readableObjectMode: true,

    transform (chunk, enc, done) {
      let buf = chunk
      let offset = 0
      if (buffered) {
        buf = Buffer.concat([buffered, chunk])
        // a multi-byte delimiter may straddle the previous chunk boundary
        offset = Math.max(0, buffered.length - matcher.length + 1)
        buffered = undefined
      }

      let start = 0
      let idx
      while ((idx = buf.indexOf(needle, offset)) !== -1) {
        if (idx > start) this.push(buf.subarray(start, idx))
        start = offset = idx + matcher.length
      }
      if (start < buf.length) buffered = buf.subarray(start)

      done()
    },

    flush (done) {
      if (buffered) this.push(buffered)
      done()
    }
  })
}

export { BinarySplit as default, BinarySplit as 'module.exports' }

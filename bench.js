'use strict'

const { Transform } = require('stream')
const split = require('./')

let str = ''
for (let i = 0; i < 1000000; i++) {
  str += 'Hello beautiful world\n'
}

const stream = new Transform()
  .pipe(split())
  .on('data', function () {})
  .on('end', function () {
    console.timeEnd('split')
  })

console.time('split')

stream.write(str)
stream.end()

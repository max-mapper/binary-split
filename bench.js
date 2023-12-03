'use strict'

const through = require('through2')
const split = require('./')

let str = ''
for (let i = 0; i < 1000000; i++) {
  str += 'Hello beautiful world\n'
}

const stream = through()
  .pipe(split())
  .on('data', function () {})
  .on('end', function () {
    console.timeEnd('split')
  })

console.time('split')

stream.write(str)
stream.end()

'use strict'

var through = require('through2')
var split = require('./')

var str = ''
for (var i = 0; i < 1000000; i++) {
  str += 'Hello beautiful world\n'
}

var stream = through()
.pipe(split())
.on('data', function () {})
.on('end', function () {
  console.timeEnd('split')
})

console.time('split')

stream.write(str)
stream.end()

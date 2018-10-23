var test = require('tape')
var fs = require('fs')
var split = require('./')

var bufferFrom = Buffer.from && Buffer.from !== Uint8Array.from

function splitTest (matcher, cb) {
  if (!cb) {
    cb = matcher
    matcher = undefined
  }
  var splitter = split(matcher)
  var items = []
  splitter.on('data', function (item) {
    items.push(item)
  })
  splitter.on('error', function (e) {
    cb(e)
  })
  splitter.on('end', function () {
    cb(null, items)
  })
  return splitter
}

test('ldjson file', function (t) {
  fs.createReadStream('test.json').pipe(splitTest(function (err, items) {
    if (err) throw err
    t.equals(items.length, 3)
    t.end()
  }))
})

test('custom matcher', function (t) {
  var splitStream = splitTest(' ', function (err, items) {
    if (err) throw err
    t.equals(items.length, 5)
    t.equals(items.join(' '), 'hello yes this is dog')
    t.end()
  });

  ['hello yes ', 'this', ' is d', 'og'].map(function (chunk) {
    return bufferFrom ? Buffer.from(chunk) : new Buffer(chunk) // eslint-disable-line
  }).forEach(function (chunk) {
    splitStream.write(chunk)
  })
  splitStream.end()
})

test('long matcher', function (t) {
  var data = 'hello yes this is dog'
  var splitStream = splitTest('this', function (err, items) {
    if (err) throw err
    t.equals(items.length, 2)
    t.equals(items[0].toString(), 'hello yes ')
    t.equals(items[1].toString(), ' is dog')
    t.end()
  })
  splitStream.write(bufferFrom ? Buffer.from(data) : new Buffer(data)) // eslint-disable-line
  splitStream.end()
})

test('matcher at index 0 check', function (t) {
  var data = '\nhello\nmax'
  var splitStream = splitTest(function (err, items) {
    if (err) throw err

    t.equals(items.length, 2)
    t.equals(items[0].toString(), 'hello')
    t.equals(items[1].toString(), 'max')
    t.end()
  })

  splitStream.write(bufferFrom ? Buffer.from(data) : new Buffer(data)) // eslint-disable-line
  splitStream.end()
})

test('chunked input', function (t) {
  fs.createReadStream('test.json')
    .pipe(split('\n'))
    .pipe(split('i'))
    .pipe(splitTest(':', function (err, items) {
      if (err) throw err
      t.equals(items.length, 4)
      t.end()
    }))
})

test('chunked input with long matcher', function (t) {
  fs.createReadStream('test.json')
    .pipe(split('\n'))
    .pipe(splitTest('hello', function (err, items) {
      if (err) throw err
      t.equals(items.length, 2)
      t.equals(items[0].toString(), '{"')
      t.end()
    }))
})

test('lookbehind in multi character matcher', function (t) {
  var splitStream = splitTest('\r\n\r', function (err, items) {
    if (err) throw err
    t.equals(items.length, 2)
    t.equals(items[0].toString(), 'a')
    t.equals(items[1].toString(), 'b')
    t.end()
  })

  splitStream.write('a\r')
  splitStream.write('\n')
  splitStream.write('\rb')
  splitStream.end()
})

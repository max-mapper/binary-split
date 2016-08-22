var test = require('tape')
var fs = require('fs')
var split = require('./')

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
    cb(false, items)
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
  })
  splitStream.write(new Buffer('hello yes '))
  splitStream.write(new Buffer('this'))
  splitStream.write(new Buffer(' is d'))
  splitStream.write(new Buffer('og'))
  splitStream.end()
})

test('long matcher', function (t) {
  var splitStream = splitTest('this', function (err, items) {
    if (err) throw err
    t.equals(items.length, 2)
    t.equals(items[0].toString(), 'hello yes ')
    t.equals(items[1].toString(), ' is dog')
    t.end()
  })
  splitStream.write(new Buffer('hello yes this is dog'))
  splitStream.end()
})

test('matcher at index 0 check', function (t) {
  var splitStream = splitTest(function (err, items) {
    if (err) throw err

    t.equals(items.length, 2)
    t.equals(items[0].toString(), 'hello')
    t.equals(items[1].toString(), 'max')
    t.end()
  })

  splitStream.write(new Buffer('\nhello\nmax'))
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

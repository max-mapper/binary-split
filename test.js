const test = require('tape')
const fs = require('fs')
const PassThrough = require('stream').PassThrough
const split = require('./')

function splitTest (matcher, cb) {
  if (!cb) {
    cb = matcher
    matcher = undefined
  }
  const splitter = split(matcher)
  const items = []
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
  const splitStream = splitTest(' ', function (err, items) {
    if (err) throw err
    t.equals(items.length, 5)
    t.equals(items.join(' '), 'hello yes this is dog')
    t.end()
  });

  ['hello yes ', 'this', ' is d', 'og'].map(function (chunk) {
    return Buffer.from(chunk)
  }).forEach(function (chunk) {
    splitStream.write(chunk)
  })
  splitStream.end()
})

test('long matcher', function (t) {
  const data = 'hello yes this is dog'
  const splitStream = splitTest('this', function (err, items) {
    if (err) throw err
    t.equals(items.length, 2)
    t.equals(items[0].toString(), 'hello yes ')
    t.equals(items[1].toString(), ' is dog')
    t.end()
  })
  splitStream.write(Buffer.from(data))
  splitStream.end()
})

test('matcher at index 0 check', function (t) {
  const data = '\nhello\nmax'
  const splitStream = splitTest(function (err, items) {
    if (err) throw err

    t.equals(items.length, 2)
    t.equals(items[0].toString(), 'hello')
    t.equals(items[1].toString(), 'max')
    t.end()
  })

  splitStream.write(Buffer.from(data))
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
  const splitStream = splitTest('\r\n\r', function (err, items) {
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

test('should not combine outputs', function (t) {
  const pt = new PassThrough()
  const stream = pt.pipe(split('.'))
  pt.write('a.b')
  pt.end('c.d')
  setImmediate(function () {
    t.equal(stream.read().toString(), 'a')
    t.equal(stream.read().toString(), 'bc')
    t.equal(stream.read().toString(), 'd')
    t.end()
  })
})

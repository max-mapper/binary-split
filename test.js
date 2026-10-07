import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { PassThrough } from 'node:stream'
import { setImmediate } from 'node:timers/promises'
import { createRequire } from 'node:module'
import split from './index.js'

async function splitChunks (chunks, matcher) {
  const stream = split(matcher)
  for (const chunk of chunks) stream.write(chunk)
  stream.end()
  return (await stream.toArray()).map(String)
}

test('ldjson file', async () => {
  const items = await fs.createReadStream('test.json').pipe(split()).toArray()
  assert.equal(items.length, 3)
})

test('custom matcher', async () => {
  const items = await splitChunks(['hello yes ', 'this', ' is d', 'og'], ' ')
  assert.deepEqual(items, ['hello', 'yes', 'this', 'is', 'dog'])
})

test('long matcher', async () => {
  assert.deepEqual(await splitChunks(['hello yes this is dog'], 'this'), ['hello yes ', ' is dog'])
})

test('matcher at index 0', async () => {
  assert.deepEqual(await splitChunks(['\nhello\nmax']), ['hello', 'max'])
})

test('chunked input', async () => {
  const items = await fs.createReadStream('test.json')
    .pipe(split('\n'))
    .pipe(split('i'))
    .pipe(split(':'))
    .toArray()
  assert.equal(items.length, 4)
})

test('chunked input with long matcher', async () => {
  const items = await fs.createReadStream('test.json')
    .pipe(split('\n'))
    .pipe(split('hello'))
    .toArray()
  assert.equal(items.length, 2)
  assert.equal(items[0].toString(), '{"')
})

test('lookbehind in multi character matcher', async () => {
  assert.deepEqual(await splitChunks(['a\r', '\n', '\rb'], '\r\n\r'), ['a', 'b'])
})

test('multi-byte matcher split across many chunks', async () => {
  assert.deepEqual(await splitChunks(['a', 'b\r', '\n', 'c', '\r', '\nd\r'], '\r\n'), ['ab', 'c', 'd\r'])
})

test('does not combine outputs on read()', async () => {
  const pt = new PassThrough()
  const stream = pt.pipe(split('.'))
  pt.write('a.b')
  pt.end('c.d')
  await setImmediate()
  assert.equal(stream.read().toString(), 'a')
  assert.equal(stream.read().toString(), 'bc')
  assert.equal(stream.read().toString(), 'd')
})

test('async iteration yields separate lines', async () => {
  const stream = split()
  stream.write('a\nb')
  stream.end('c\n\nd\n')
  const items = []
  for await (const item of stream) items.push(item.toString())
  assert.deepEqual(items, ['a', 'bc', 'd'])
})

test('long line spanning many chunks', async () => {
  const chunks = ['a\nb', ...Array(100).fill('x'), 'y\r', '\nz']
  assert.deepEqual(await splitChunks(chunks), ['a', 'b' + 'x'.repeat(100) + 'y\r', 'z'])
  assert.deepEqual(await splitChunks(chunks, '\r\n'), ['a\nb' + 'x'.repeat(100) + 'y', 'z'])
})

test('multi-byte matcher straddling deferred chunks', async () => {
  assert.deepEqual(await splitChunks(['a', 'b', 'c', '<', '-', '>', 'd'], '<->'), ['abc', 'd'])
  assert.deepEqual(await splitChunks(['ab<', '-', '>cd<-', '>e'], '<->'), ['ab', 'cd', 'e'])
})

test('empty matcher throws', () => {
  assert.throws(() => split(''), /must not be empty/)
})

test('require() returns the function directly', () => {
  assert.equal(createRequire(import.meta.url)('./index.js'), split)
})

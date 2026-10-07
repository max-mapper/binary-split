# binary-split

Split streams of binary data. Similar to [split](https://www.npmjs.com/package/split) but for Buffers.
Whereas split is String specific, this library never converts binary data into non-binary data.

[![Node](https://github.com/max-mapper/binary-split/actions/workflows/node.yml/badge.svg)](https://github.com/max-mapper/binary-split/actions/workflows/node.yml)

## How fast is it?

It finds delimiters with native `Buffer#indexOf` and emits zero-copy slices of the input, so throughput
is mostly bound by I/O and stream overhead — typically hundreds of MB/s to GB/s depending on line length.

## Example usage

```js
import fs from 'node:fs'
import split from 'binary-split'

for await (const line of fs.createReadStream('log.txt').pipe(split())) {
  console.log(line.toString())
}
```

## API

#### split([splitOn])

Returns a stream.
You can `.pipe` other streams to it or `.write` them yourself
(if you `.write` don't forget to `.end`).

The readable side is in object mode: each line is emitted as a separate `Buffer` (a slice of the input,
without the delimiter), whether you consume it with `'data'` events, `.read()` or `for await`. Empty lines
are skipped.

Pass in the optional `splitOn` argument (a string or `Buffer`) to specify where to split the data.
The default is `'\n'`. Throws if `splitOn` is empty.

## Collaborators

binary-split is only possible due to the excellent work of the following collaborators:

- Max Ogden ([@max-mapper](https://github.com/max-mapper))
- Volodymyr Agafonkin ([@mourner](https://github.com/mourner))
- Martin Raifer ([@tyrasd](https://github.com/tyrasd))
- Julian Gruber ([@juliangruber](https://github.com/juliangruber))


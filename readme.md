# binary-split

Split streams of binary data. Similar to [split](http://npmjs.org/split) but for Buffers.
Whereas split is String specific, this library never converts binary data into non-binary data.

[![travis][travis-image]][travis-url]

[travis-image]: https://img.shields.io/travis/maxogden/binary-split.svg?style=flat
[travis-url]: https://travis-ci.org/maxogden/binary-split

## How fast is it?

On a SSD w/ a Haswell i5 1.3ghz CPU and 4GB RAM reading a 2.6GB, 5.2 million entry line delimited JSON file takes 15 seconds. Using `split` for the same benchmark takes 1m23s.

## Example usage

```js
const split = require('binary-split')

fs.createReadStream('log.txt')
  .pipe(split())
  .on('data', line => console.log(line))
```

## API

#### split([splitOn])

Returns a stream.
You can `.pipe` other streams to it or `.write` them yourself
(if you `.write` don't forget to `.end`).

The stream will emit a stream of binary objects representing the split data.

Pass in the optional `splitOn` argument to specify where to split the data.
The default is your current operating systems EOL sequence (via `require('os').EOL`).

For more examples of usage see `test.js`.

## Collaborators

binary-split is only possible due to the excellent work of the following collaborators:

- Max Ogden ([@maxogden](https://github.com/maxogden))
- Vladimir Agafonkin ([@mourner](https://github.com/mourner))
- Martin Raifer ([@tyrasd](https://github.com/tyrasd))
- Julian Gruber ([@juliangruber](https://github.com/juliangruber))


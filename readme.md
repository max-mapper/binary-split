# binary-split

Split streams of binary data. Similar to [split](http://npmjs.org/split) but for [bops](http://npmjs.org/bops), e.g. Buffers in node or Uint8Arrays in the browser. Whereas split is String specific, this library never converts binary data into non-binary data.

[![NPM](https://nodei.co/npm/binary-split.png)](https://nodei.co/npm/binary-split/)

## how fast is it?

on a SSD w/ a Haswell i5 1.3ghz CPU and 4GB RAM reading a 2.6GB, 5.2 million entry line delimited JSON file takes 15 seconds. using `split` for the same benchmark takes 1m23s.

## usage

```
var split = require('binary-split')
```

#### split(splitOn)

Returns a stream. You can `.pipe` other streams to it or `.write` them yourself (if you `.write` don't forget to `.end`)

The stream will emit a stream of binary objects representing the split data.

Pass in the optional `splitOn` argument to specify where to split the data. The default is your current operating systems EOL sequence (via `require('os').EOL`).

For more examples of usage see `test.js`

### license

BSD

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


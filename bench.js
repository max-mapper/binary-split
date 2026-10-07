import split from './index.js'

const str = 'Hello beautiful world\n'.repeat(1000000)

const stream = split()
  .on('data', function () {})
  .on('end', function () {
    console.timeEnd('split')
  })

console.time('split')

stream.write(str)
stream.end()

const Benchmark = require('benchmark')

/**
 *
 *  bench({
 *    tests: [
 *      // arguments for lib.func
 *      {
 *        p: 2,
 *        px: [ 4, 5 ],
 *        m: 0,
 *        mb: 4,
 *      }
 *    ],
 *    libs: [
 *      {
 *        name: 'styled-system',
 *        func: space,
 *      },
 *    ]
 *  })
 */

module.exports = async ({
  name,
  tests = [],
  libs = []
}) => {
  const suite = new Benchmark.Suite()
  const runs = []

  tests.forEach((args, i) => {
    libs.forEach(lib => {
      const run = () => lib.func(args)
      // console.log(lib.name, run())
      suite.add(`${name} ${i}: ${lib.name}`, run)
    })
  })

  return new Promise(resolve => {
    suite
      .on('cycle', event => {
        console.log(String(event.target))
      })
      .on('complete', function onComplete() {
        console.log(`Fastest is ${this.filter('fastest').map('name')}`)
        resolve()
      })
      .run({ async: true })
  })
}

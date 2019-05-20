const bench = require('./bench')
const system = require('styled-system')
const smooth = require('smooth-system')
const next = require('..')

const theme = {
  space: [ 0, 4, 8, 16, 32, 64, 128 ],
  fontSizes: [ 12, 14, 16, 20, 24, 32, 48 ],
  colors: {
    text: 'black',
    primary: 'tomato',
  },
}

bench({
  tests: [
    {
      theme,
      m: 0,
      mb: 4,
      px: [ 2, 3 ],
      py: [ 4, 5 ]
    }
  ],
  libs: [
    {
      name: 'styled-system',
      func: system.space,
    },
    {
      name: 'smooth-system',
      func: smooth.space,
    },
    {
      name: 'next-system',
      func: next.space,
    },
  ]
})

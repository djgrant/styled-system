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

const run = async () => {
  await bench({
    name: 'space',
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

  await bench({
    name: 'compose',
    tests: [
      {
        theme,
        fontSize: 4,
        m: 0,
        mb: 4,
        // seems to be broken in v4??
        px: 2,
        color: 'text',
        bg: 'primary',
      }
    ],
    libs: [
      {
        name: 'styled-system',
        func: system.compose(
          system.space,
          system.color,
          system.fontSize
        ),
      },
      {
        name: 'smooth-system',
        func: smooth.compose(
          smooth.space,
          smooth.color,
          smooth.fontSize
        )
      },
      {
        name: 'next-system',
        func: next.compose(
          next.space,
          next.color,
          next.fontSize
        ),
      },
    ]
  })

  await bench({
    name: 'compose vs core',
    tests: [
      {
        theme,
        fontSize: [5, 6],
        m: 0,
        mb: 4,
        px: [ 2, 3 ],
        py: [ 4, 5 ],
        color: 'text',
        bg: 'primary',
      }
    ],
    libs: [
      {
        name: 'styled-system',
        func: system.compose(
          system.fontSize,
          system.space,
          system.color
        ),
      },
      {
        name: 'smooth-system',
        func: smooth.compose(
          smooth.fontSize,
          smooth.space,
          smooth.color
        ),
      },
      {
        name: 'next-system',
        func: next.core,
      },
    ]
  })
}

run()

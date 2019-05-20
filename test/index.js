import test from 'ava'
import {
  style,
  themeGet,
  num,
  compose,
  variant,
  mapProps,
  merge,
  fontSize,
} from '../src'

const width = style({
  prop: 'width',
})

const color = style({
  prop: 'color',
  key: 'colors',
})

const backgroundColor = style({
  prop: 'backgroundColor',
  alias: 'bg',
  key: 'colors',
})

const theme = {
  colors: {
    blue: '#07c',
    black: '#111',
  },
}

test('returns a style function', t => {
  const func = style({ prop: 'width' })
  t.is(typeof func, 'function')
})

test('function returns a style object', t => {
  const style = width({ width: '50%' })
  t.deepEqual(style, {
    width: '50%',
  })
})

test('returns values from theme', t => {
  const style = color({ theme, color: 'blue' })
  t.deepEqual(style, {
    color: '#07c',
  })
})

test('handles aliased props', t => {
  const style = backgroundColor({
    theme,
    bg: 'blue',
  })
  t.deepEqual(style, {
    backgroundColor: '#07c',
  })
})

test('prop order overrides previous props', t => {
  const style = backgroundColor({
    theme,
    bg: 'blue',
    backgroundColor: 'black',
  })
  t.deepEqual(style, {
    backgroundColor: '#111',
  })
})

test.skip('returns null', t => {
  const style = color({})
  t.is(style, null)
})

test('returns 0', t => {
  const style = width({ width: 0 })
  t.deepEqual(style, { width: 0 })
})

test('returns a responsive style object', t => {
  const style = width({
    width: ['100%', '50%'],
  })
  t.deepEqual(style, {
    width: '100%',
    '@media screen and (min-width: 40em)': { width: '50%' },
  })
})

test('returns a responsive style object for all breakpoints', t => {
  const style = width({
    width: ['100%', '75%', '50%', '33%', '25%'],
  })
  t.deepEqual(style, {
    width: '100%',
    '@media screen and (min-width: 40em)': { width: '75%' },
    '@media screen and (min-width: 52em)': { width: '50%' },
    '@media screen and (min-width: 64em)': { width: '33%' },
  })
})

test('skips undefined responsive values', t => {
  const style = width({
    width: ['100%', , '50%'],
  })
  t.deepEqual(style, {
    width: '100%',
    '@media screen and (min-width: 52em)': { width: '50%' },
  })
})

test.skip('parses object values', t => {
  const style = width({
    width: {
      _: '100%',
      2: '50%',
    },
  })
  t.deepEqual(style, {
    width: '100%',
    '@media screen and (min-width: 64em)': { width: '50%' },
  })
})

test('themeGet returns values from the theme', t => {
  const a = themeGet('colors.blue')({ theme })
  t.is(a, '#07c')
})

test('themeGet does not throw when value doesnt exist', t => {
  const a = themeGet('colors.blue.5')({ theme })
  t.is(a, null)
})

test('themeGet accepts a fallback', t => {
  const a = themeGet('colors.lightblue', '#0cf')({ theme })
  t.is(a, '#0cf')
})

test('compose combines style functions', t => {
  const colors = compose(
    color,
    backgroundColor
  )
  const styles = colors({
    color: 'tomato',
    bg: 'black',
  })
  t.is(typeof colors, 'function')
  t.deepEqual(styles, { color: 'tomato', backgroundColor: 'black' })
})

test('num returns true for numbers', t => {
  const isNumber = num(0)
  t.true(isNumber)
})

test('num returns false for non-numbers', t => {
  const isNumber = num(null)
  t.false(isNumber)
})

test('variant returns style objects from theme', t => {
  const buttons = variant({ key: 'buttons' })
  const a = buttons({
    theme: {
      buttons: {
        primary: {
          padding: '32px',
          backgroundColor: 'tomato',
        },
      },
    },
    variant: 'primary',
  })
  t.deepEqual(a, {
    padding: '32px',
    backgroundColor: 'tomato',
  })
})

test('variant prop can be customized', t => {
  const buttons = variant({ key: 'buttons', prop: 'type' })
  const a = buttons({
    theme: {
      buttons: {
        primary: {
          padding: '32px',
          backgroundColor: 'tomato',
        },
      },
    },
    type: 'primary',
  })
  t.deepEqual(a, {
    padding: '32px',
    backgroundColor: 'tomato',
  })
})

test('array values longer than breakpoints does not reset returned style object', t => {
  const a = width({
    width: ['100%', , , , , '50%', '25%'],
  })
  t.deepEqual(a, { width: '100%' })
})

test.skip('merge deeply merges', t => {
  const result = merge(
    { hello: { hi: 'beep', merge: 'me', and: 'me' } },
    { hello: { hey: 'boop', merge: 'me', and: 'all of us' } },
  )
  t.deepEqual(result, {
    hello: {
      hi: 'beep',
      hey: 'boop',
      merge: 'me',
      and: 'all of us'
    }
  })
})

test.skip('variant can be composed', t => {
  const system = compose(
    variant({ key: 'typography' }),
    fontSize,
    color
  )
  const result = system({
    theme: {
      typography: {
        primary: {
          fontSize: '32px',
          color: '#fff'
        },
      },
    },
    variant: 'primary',
    color: '#111'
  })
  t.deepEqual(result, {
    fontSize: '32px',
    color: '#111'
  })
})

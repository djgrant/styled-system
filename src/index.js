import assign from 'object-assign'
import get from 'lodash.get'

export const defaultBreakpoints = [40, 52, 64].map(n => n + 'em')
export const defaultSpace = [0, 4, 8, 16, 32, 64, 128, 256, 512]
export const defaultFontSizes = [12, 14, 16, 20, 24, 32, 48, 64, 72]

export const is = n => n !== undefined && n !== null

export const themeGet = (path, fallback = null) => props =>
  get(props.theme, path, fallback)

export const num = n => typeof n === 'number' && !isNaN(n)

// new api/implementation
const createStyleFunction = (
  properties = [],
  scale,
  transform = get,
  defaultScale
) => {
  const style = (scale, value) => {
    const result = {}
    const n = transform(scale, value, value)
    properties.forEach(prop => {
      result[prop] = n
    })
    return result
  }
  style.scale = scale
  style.defaultScale = defaultScale
  return style
}

const createMediaQuery = n => `@media screen and (min-width: ${n})`
const getMediaQueries = breakpoints => [
  null,
  ...breakpoints.map(createMediaQuery)
]

const getResponsiveStyle = (props, getStyle, scale, values) => {
  const breakpoints = get(props.theme, 'breakpoints', defaultBreakpoints)
  const mediaQueries = getMediaQueries(breakpoints)
  let styles = {}
  values.slice(0, mediaQueries.length).forEach((n, i) => {
    const media = mediaQueries[i]
    if (!media) {
      assign(styles, getStyle(scale, n))
    } else {
      assign(styles, {
        [media]: assign({}, styles[media], getStyle(scale, n))
      })
    }
  })
  return styles
}

export const system = config => {
  const keys = Object.keys(config)

  const funcs = {}
  keys.forEach(key => {
    const conf = config[key]
    if (typeof conf === 'function') {
      funcs[key] = conf
    }
    const {
      property,
      properties = [],
      scale,
      defaultScale,
      transform,
    } = conf
    funcs[key] = createStyleFunction(
      [ property, ...properties ].filter(Boolean),
      scale,
      transform,
      defaultScale
    )
  })

  const parse = props => {
    let styles = {}
    for (const key in props) {
      if (!funcs[key]) continue
      const getStyle = funcs[key]
      const raw = props[key]
      const scale = get(props.theme, getStyle.scale, getStyle.defaultScale || {})
      if (Array.isArray(raw)) {
        assign(styles, getResponsiveStyle(
          props, getStyle, scale, raw
        ))
        continue
      }
      assign(styles, getStyle(scale, raw))
    }
    return styles
  }

  parse.config = config
  parse.keys = keys

  return parse
}

// v4 compat
export const style = ({
  prop,
  cssProperty,
  properties,
  alias,
  key,
  scale,
  transformValue
}) => {
  const config = {
    [prop]: {
      properties: properties || [ cssProperty || prop ],
      scale: key,
      transform: transformValue ? (s, n) => transformValue(n, s) : undefined,
      defaultScale: scale
    }
  }
  if (alias) config[alias] = config[prop]
  return system(config)
}

export const compose = (...args) => {
  let config = {}
  args.forEach(arg => {
    assign(config, arg.config)
  })
  return system(config)
}

export const variant = ({ key, prop = 'variant' }) => {
  const fn = props => get(props.theme, [key, props[prop]].join('.'), null)
  return fn
}

const getMargin = (n, scale) => {
  if (!num(n)) {
    return get(scale, n, n)
  }

  const isNegative = n < 0
  const absolute = Math.abs(n)
  const value = get(scale, absolute, absolute)
  if (!num(value)) {
    return isNegative ? '-' + value : value
  }
  return value * (isNegative ? -1 : 1)
}

export const margin = style({
  prop: 'margin',
  alias: 'm',
  key: 'space',
  transformValue: getMargin,
  scale: defaultSpace,
})

export const marginTop = style({
  prop: 'marginTop',
  alias: 'mt',
  key: 'space',
  transformValue: getMargin,
  scale: defaultSpace,
})

export const marginBottom = style({
  prop: 'marginBottom',
  alias: 'mb',
  key: 'space',
  transformValue: getMargin,
  scale: defaultSpace,
})

export const marginLeft = style({
  prop: 'marginLeft',
  alias: 'ml',
  key: 'space',
  transformValue: getMargin,
  scale: defaultSpace,
})

export const marginRight = style({
  prop: 'marginRight',
  alias: 'mr',
  key: 'space',
  transformValue: getMargin,
  scale: defaultSpace,
})

export const marginX = style({
  prop: 'marginX',
  alias: 'mx',
  properties: [ 'marginLeft', 'marginRight' ],
  transformValue: getMargin,
  scale: defaultSpace,
})

export const marginY = style({
  prop: 'marginY',
  alias: 'my',
  properties: [ 'marginTop', 'marginBottom' ],
  transformValue: getMargin,
  scale: defaultSpace,
})

export const padding = style({
  prop: 'padding',
  alias: 'p',
  key: 'space',
  scale: defaultSpace,
})

export const paddingTop = style({
  prop: 'paddingTop',
  alias: 'pt',
  key: 'space',
  scale: defaultSpace,
})

export const paddingBottom = style({
  prop: 'paddingBottom',
  alias: 'pb',
  key: 'space',
  scale: defaultSpace,
})

export const paddingLeft = style({
  prop: 'paddingLeft',
  alias: 'pl',
  key: 'space',
  scale: defaultSpace,
})

export const paddingRight = style({
  prop: 'paddingRight',
  alias: 'pr',
  key: 'space',
  scale: defaultSpace,
})

export const paddingX = style({
  prop: 'paddingX',
  alias: 'px',
  properties: [ 'paddingLeft', 'paddingRight' ],
  scale: defaultSpace,
})

export const paddingY = style({
  prop: 'paddingY',
  alias: 'py',
  properties: [ 'paddingTop', 'paddingBottom' ],
  scale: defaultSpace,
})

export const space = compose(
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  marginX,
  marginY,
  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingX,
  paddingY
)

export const textColor = style({
  prop: 'color',
  key: 'colors',
})

export const backgroundColor = style({
  prop: 'backgroundColor',
  alias: 'bg',
  key: 'colors',
})

export const color = compose(
  textColor,
  backgroundColor
)

export const getWidth = (n, scale) => (!num(n) || n > 1 ? n : n * 100 + '%')

export const width = style({
  prop: 'width',
  key: 'widths',
  transformValue: getWidth,
})

export const fontSize = style({ prop: 'fontSize', key: 'fontSizes', scale: defaultFontSizes })
export const fontFamily = style({ prop: 'fontFamily', key: 'fonts' })
export const fontWeight = style({ prop: 'fontWeight', key: 'fontWeights' })
export const lineHeight = style({ prop: 'lineHeight', key: 'lineHeights' })
export const textAlign = style({ prop: 'textAlign' })
export const fontStyle = style({ prop: 'fontStyle' })
export const letterSpacing = style({ prop: 'letterSpacing', key: 'letterSpacings' })

export const display = style({ prop: 'display' })

export const maxWidth = style({ prop: 'maxWidth', key: 'sizes' })
export const minWidth = style({ prop: 'minWidth', key: 'sizes' })
export const height = style({ prop: 'height', key: 'sizes' })
export const maxHeight = style({ prop: 'maxHeight', key: 'sizes' })
export const minHeight = style({ prop: 'minHeight', key: 'sizes' })

export const size = style({ prop: 'size', properties: [ 'width', 'height' ], key: 'sizes' })

export const alignItems = style({ prop: 'alignItems' })
export const alignContent = style({ prop: 'alignContent' })
export const justifyItems = style({ prop: 'justifyItems' })
export const justifyContent = style({ prop: 'justifyContent' })
export const flexWrap = style({ prop: 'flexWrap' })
export const flexBasis = style({ prop: 'flexBasis', transformValue: getWidth })
export const flexDirection = style({ prop: 'flexDirection' })
export const flex = style({ prop: 'flex' })
export const justifySelf = style({ prop: 'justifySelf' })
export const alignSelf = style({ prop: 'alignSelf' })
export const order = style({ prop: 'order' })

export const gridGap = style({ prop: 'gridGap', key: 'space', scale: defaultSpace })
export const gridColumnGap = style({ prop: 'gridColumnGap', key: 'space', scale: defaultSpace })
export const gridRowGap = style({ prop: 'gridRowGap', key: 'space', scale: defaultSpace })
export const gridColumn = style({ prop: 'gridColumn' })
export const gridRow = style({ prop: 'gridRow' })
export const gridAutoFlow = style({ prop: 'gridAutoFlow' })
export const gridAutoColumns = style({ prop: 'gridAutoColumns' })
export const gridAutoRows = style({ prop: 'gridAutoRows' })
export const gridTemplateColumns = style({ prop: 'gridTemplateColumns' })
export const gridTemplateRows = style({ prop: 'gridTemplateRows' })
export const gridTemplateAreas = style({ prop: 'gridTemplateAreas' })
export const gridArea = style({ prop: 'gridArea' })

export const border = style({ prop: 'border', key: 'borders' })
export const borderWidth = style({ prop: 'borderWidth', key: 'borderWidths' })
export const borderStyle = style({ prop: 'borderStyle', key: 'borderStyles' })
export const borderColor = style({ prop: 'borderColor', key: 'colors' })
export const borderTop = style({ prop: 'borderTop', key: 'borders' })
export const borderRight = style({ prop: 'borderRight', key: 'borders' })
export const borderBottom = style({ prop: 'borderBottom', key: 'borders' })
export const borderLeft = style({ prop: 'borderLeft', key: 'borders' })
export const borderRadius = style({ prop: 'borderRadius', key: 'radii' })

export const borders = compose(
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  borderWidth,
  borderStyle,
  borderColor,
  borderRadius
)

export const boxShadow = style({ prop: 'boxShadow', key: 'shadows' })
export const opacity = style({ prop: 'opacity' })
export const overflow = style({ prop: 'overflow' })
export const verticalAlign = style({ prop: 'verticalAlign' })

export const background = style({ prop: 'background' })
export const backgroundImage = style({ prop: 'backgroundImage' })
export const backgroundSize = style({ prop: 'backgroundSize' })
export const backgroundPosition = style({ prop: 'backgroundPosition' })
export const backgroundRepeat = style({ prop: 'backgroundRepeat' })

export const position = style({ prop: 'position' })
export const zIndex = style({ prop: 'zIndex', key: 'zIndices' })
export const top = style({ prop: 'top' })
export const right = style({ prop: 'right' })
export const bottom = style({ prop: 'bottom' })
export const left = style({ prop: 'left' })

export const buttonStyle = variant({ key: 'buttons' })
export const textStyle = variant({ key: 'textStyles', prop: 'textStyle' })
export const colorStyle = variant({ key: 'colorStyles', prop: 'colors' })

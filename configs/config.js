import {
  author,
  description,
  homepage,
  license,
  name,
  version,
} from '../package.json'

const loose = true

const babelSetup = {
  babelrc: false,
  presets: [['@babel/preset-env', { modules: false, loose }]],
  runtimeHelpers: true,
  exclude: 'node_modules/**',
}

const banner = `/**
  ${name} - ${description}
  @version v${version}
  @link ${homepage}
  @author ${author}
  @license ${license}
**/`

export {
  babelSetup,
  banner,
  name,
  version,
}

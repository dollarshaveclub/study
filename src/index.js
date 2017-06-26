
// this is the build for webpack and UMD builds
// try not to use this!
import Study from './study'

import browserCookie from './stores/browser-cookie'
import local from './stores/local'
import memory from './stores/memory'

export default Study

const stores = {
  browserCookie: browserCookie(),
  local: local(),
  memory: memory(),
}

window.Study = Study
Study.stores = stores

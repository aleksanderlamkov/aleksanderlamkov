import {configure} from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import {enableFetchMocks} from 'jest-fetch-mock'
import {removeChildNodes} from '../utils/removeChildNodes'

configure({adapter: new Adapter()})
enableFetchMocks()

const sideEffects = {
  document: {
    addEventListener: {
      fn: document.addEventListener,
      refs: [],
    },
    keys: Object.keys(document),
  },
  window: {
    addEventListener: {
      fn: window.addEventListener,
      refs: [],
    },
    keys: Object.keys(window),
  },
}

beforeAll(async () => {
  ['document', 'window'].forEach(obj => {
    const fn = sideEffects[obj].addEventListener.fn
    const refs = sideEffects[obj].addEventListener.refs

    function addEventListenerSpy(type, listener, options) {
      refs.push({type, listener, options})
      fn(type, listener, options)
    }

    sideEffects[obj].keys.push('addEventListener')
    global[obj].addEventListener = addEventListenerSpy
  })
})

beforeEach(async () => {
  const root = document.documentElement;
  [...root.attributes].forEach(attr => root.removeAttribute(attr.name))
  removeChildNodes(root);
  ['document', 'window'].forEach(obj => {
    const refs = sideEffects[obj].addEventListener.refs
    while (refs.length) {
      const {type, listener, options} = refs.pop()
      global[obj].removeEventListener(type, listener, options)
    }
  })
  root.innerHTML = '<head></head><body></body>'
})

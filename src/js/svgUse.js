import Eventing from './generic/eventing'
import {render} from './utils/render'
import {makeRequest} from './utils/makeRequest'
import {removeChildNodes} from './utils/removeChildNodes'

export default class SvgUse extends Eventing {

  path = '/build/'

  name = 'icons.svg'

  attrs = {
    id: 'data-js-svg-id',
    exclude: 'data-js-svg-exclude'
  }

  constructor() {
    super('SvgUse')
    this.data = null
    this.init()
  }

  validate(src, svg, use) {
    if (svg.hasAttribute(this.attrs.exclude)) {
      removeChildNodes(svg)
      svg.appendChild(use)
      return false
    } else {
      const originID = src.replace('#', '')
      svg.setAttribute(this.attrs.id, originID)
      svg.classList.add(originID)
      return true
    }
  }

  createSprite() {
    const sprite = document.createElement('div')
    sprite.id = 'svg-sprite'
    sprite.hidden = true
    document.body.appendChild(sprite)
    render(sprite, this.data)
    window.svg4everybody({
      polyfill: true,
      validate: (src, svg, use) => this.validate(src, svg, use)
    })
    this.markAsInit()
  }

  insert() {
    (document.body) ? this.createSprite() : document.addEventListener('DOMContentLoaded', () => {
      this.createSprite()
    })
  }

  init() {
    let url = window.App.tplPath ? (window.App.tplPath + this.path + this.name) : (window.App.debug) ? './' + this.name : this.path + this.name
    const revision = window.App.svgSpriteRevision || false
    if (window.App.tplPath) {
      url = `${window.App.tplPath}/build/icons.svg?revision=${revision ? revision : 0}`
    }
    makeRequest({url, type: 'text', mode: 'same-origin'}).then((sprite) => {
      this.data = sprite
      this.insert()
      localStorage.setItem('inlineSVGdata', this.data)
      localStorage.setItem('inlineSVGrev', revision.toString())
      this.data = null
    }, (status) => {
      console.error('SVG Sprite are not loaded: ', status)
    })
  }
}

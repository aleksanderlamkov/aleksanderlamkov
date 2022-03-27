import svg4everybody from 'svg4everybody'
import Observer from '../generic/observer'
import Eventing from '../generic/eventing'
import {render} from '../utils/render'
import {makeRequest} from '../utils/makeRequest'
import {removeChildNodes} from '../utils/removeChildNodes'
import {onDOMContentLoaded} from '../utils/onDOMContentLoaded'

/**
 * Иконки вставляются на страницу как:
 * <svg class="i-icon"><use href="#icon-name"></svg>
 * (имя иконки соответствует имени файла в папке app/icons)
 */
export default class Icons extends Eventing {
  static path = '/build/'

  static name = 'icons.svg'

  static attrs = {
    id: 'data-js-svg-id',
    exclude: 'data-js-svg-exclude'
  }

  constructor() {
    super('Icons')
    this.data = null
    this.init()
  }

  static isIconValid(src, svg, use) {
    const {exclude, id} = Icons.attrs
    if (svg.hasAttribute(exclude)) {
      removeChildNodes(svg)
      svg.appendChild(use)
      return false
    } else {
      const originID = src.replace('#', '')
      svg.setAttribute(id, originID)
      svg.classList.add(originID)
      return true
    }
  }

  createSprite() {
    window.svg4everybody = svg4everybody
    const sprite = document.createElement('div')
    sprite.id = 'svg-sprite'
    sprite.classList.add('visually-hidden')
    Observer.setElObservableState(sprite, false)
    document.body.appendChild(sprite)
    render(sprite, this.data)
    window.svg4everybody({
      polyfill: true,
      validate: (src, svg, use) => Icons.isIconValid(src, svg, use)
    })
    this.markAsInit()
  }

  init() {
    const {tplPath, isDebug, svgSpriteRevision, isTest} = window.App
    if (!isTest) {
      let url = tplPath ? (tplPath + Icons.path + Icons.name) : (isDebug) ? './' + Icons.name : Icons.path + Icons.name
      const revision = svgSpriteRevision || false
      if (window.App.tplPath) {
        url = `${window.App.tplPath}/build/icons.svg?revision=${revision ? revision : 0}`
      }
      makeRequest({url, type: 'text', mode: 'same-origin'}).then(sprite => {
        this.data = sprite
        onDOMContentLoaded(() => this.createSprite())
        localStorage.setItem('inlineSVGData', this.data)
        localStorage.setItem('inlineSVGRev', revision.toString())
        this.data = null
      }, (status) => console.error('SVG Sprite are not loaded: ', status))
    }
  }
}

import '@fancyapps/ui/dist/carousel.css'
import {Fancybox} from '@fancyapps/ui'
import {parseJSON} from './utils/parseJSON'
import {getAttr} from './utils/getAttr'
import {els as sliderEls} from './sliders'
import {getNodeIndex} from './utils/getNodeIndex'
import {modalOptions} from './modals'

const els = {
  items: '[data-js-gallery-item]',
  gallery: '[data-js-gallery-container]',
}

const defaultCfg = {
  ...modalOptions,
  animated: true,
  Thumbs: false,
  Image: {
    animateThumbnail: false,
  },
  closeButton: 'outside',
  on: false,
  trapFocus: true,
  autoFocus: false,
  placeFocusBack: false,
  infinite: false,
  defaultType: 'image'
}

export default class Gallery {

  constructor() {
    this.bindEvents()
  }

  bindEvents() {
    document.addEventListener('click', (e) => this.handleClick(e))
  }

  static getCfg(container, extraParams = {}) {
    return {
      ...defaultCfg,
      ...parseJSON(container.getAttribute(getAttr(els.gallery))),
      ...extraParams
    }
  }

  static open(items, cfg, isCloseOther = true) {
    if (isCloseOther) {
      Fancybox.close(true)
    }
    Fancybox.show(items, cfg)
  }

  static getItems(container) {
    const items = []
    container.querySelectorAll(els.items).forEach((node) => {
      items.push({
        src: node.getAttribute('href'),
        type: defaultCfg.defaultType,
        ...parseJSON(node.getAttribute(getAttr(els.items)))
      })
    })
    return items
  }

  static getStartIndex(el) {
    const slide = el.closest(sliderEls.slide)
    return getNodeIndex(slide ? slide : el)
  }

  handleClick(e) {
    const {target} = e
    if (target.matches(els.items) && target.hasAttribute('href')) {
      e.preventDefault()
      const container = target.closest(els.gallery)
      if (container) {
        const itemsArray = Gallery.getItems(container)
        const cfg = Gallery.getCfg(container, {
          startIndex: Gallery.getStartIndex(target)
        })
        Gallery.open(itemsArray, cfg)
      } else {
        throw new Error(`No closest el ${els.gallery} for this item`)
      }
    }
  }
}

import {wrap} from './utils/wrap'
import Dispatcher from './generic/dispatcher'

const instance = '[data-js-adaptive-table]'

export const els = {
  instance,
  customAdaptiveTable: '[data-js-adaptive-table-custom]'
}

export default class AdaptiveTables {
  static classStates = {
    leftEdge: 'is-left-edge',
    rightEdge: 'is-right-edge'
  }

  static layouts = {
    wrap: `<div class="adaptive-table" data-js-adaptive-table><div class="adaptive-table__wrapper"></div></div>`
  }

  constructor() {
    AdaptiveTables.init()
    AdaptiveTables.bindEvents()
  }

  static bindEvents() {
    Dispatcher.initiator = {
      selector: els.instance,
      initiator: (context) => AdaptiveTables.init(context),
      getCollection: () => []
    }
  }

  static isAdaptive(table) {
    return !table.parentNode.matches(els.instance) && !table.matches(els.customAdaptiveTable) && !table.closest(els.customAdaptiveTable)
  }

  static init(context = document) {
    context.querySelectorAll('table').forEach((table) => {
      if (AdaptiveTables.isAdaptive(table)) {
        const wrapped = wrap(table, AdaptiveTables.layouts.wrap, true)

        wrapped.scrollLeft = 0
        AdaptiveTables.bindScrollEvent(wrapped)
        AdaptiveTables.setEdges(AdaptiveTables.getContainer(wrapped))
      }
    })
  }

  static getContainer(el) {
    return el.closest(els.instance)
  }

  static setEdges(el) {
    const container = AdaptiveTables.getContainer(el)
    const {scrollLeft, scrollWidth, offsetWidth} = el;

    if (scrollLeft === 0) {
      container.classList.add(AdaptiveTables.classStates.leftEdge)
    } else {
      container.classList.remove(AdaptiveTables.classStates.leftEdge);
    }

    if (scrollLeft === scrollWidth - offsetWidth) {
      container.classList.add(AdaptiveTables.classStates.rightEdge)
    } else {
      container.classList.remove(AdaptiveTables.classStates.rightEdge)
    }
  }

  static bindScrollEvent(table) {
    const handler = (e) => AdaptiveTables.setEdges(e.target)
    table.addEventListener('scroll', (e) => handler(e))
  }
}

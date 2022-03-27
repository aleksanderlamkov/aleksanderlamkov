import './style.pcss';
import {getCfg} from '../../js/utils/getCfg'
import {clearAnimationsArray} from '../../js/utils/clearAnimationsArray'
import Collection from '../../js/generic/collection'

export const instance = '[data-js-accordion]'

export class Accordion {
  els = {
    instance,
    item: '[data-js-accordion-item]',
    summary: '[data-js-accordion-summary]',
    content: '[data-js-accordion-content]',
    button: '[data-js-accordion-button]',
  }

  stateClasses = {
    isOpen: 'is-open',
    isFullyExpanded: 'is-fully-expanded',
  }

  defaultCfg = {
    isAutoClosing: true,
    wholeSummaryClickable: true,
    animationParams: {
      duration: 500,
      easing: 'ease',
    },
  }

  constructor(instance) {
    this.instance = instance
    this.items = this.instance.querySelectorAll(`:scope > ${this.els.item}`)
    this.summaryEls = this.instance.querySelectorAll(`:scope > ${this.els.item} > ${this.els.summary}`)
    this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg)
    this.clickableEls = this.getClickableEls()
    this.init()
    this.bindEvents()
  }

  getClickableEls() {
    if (this.cfg.wholeSummaryClickable || this.cfg.isExtraView) {
      return this.summaryEls
    } else {
      return this.instance.querySelectorAll(`:scope > ${this.els.item} > ${this.els.summary} ${this.els.button}`)
    }
  }

  isOpen = (item) => item.classList.contains(this.stateClasses.isOpen)

  open(item) {
    const content = item.querySelector(this.els.content)

    clearAnimationsArray(content.getAnimations())
    item.open = true
    item.classList.add(this.stateClasses.isOpen)

    content.animate([
      {height: '0'},
      {height: `${content.scrollHeight}px`},
    ], this.cfg.animationParams).onfinish = () => {
      item.classList.add(this.stateClasses.isFullyExpanded)
    }

    if (this.cfg.isAutoClosing) {
      this.closeAllExcludeOne(item)
    }
  }

  close(item) {
    const content = item.querySelector(this.els.content)

    clearAnimationsArray(content.getAnimations())
    item.classList.remove(this.stateClasses.isOpen)
    item.classList.remove(this.stateClasses.isFullyExpanded)
    content.animate([
      {height: `${content.scrollHeight}px`},
      {height: '0'},
    ], this.cfg.animationParams).onfinish = () => {
      item.open = false
    }
  }

  closeAllExcludeOne(excludeEl) {
    this.items.forEach((item) => {
      if (item !== excludeEl) {
        this.close(item)
      }
    })
  }

  handleSummaryClick(e) {
    if (e.target instanceof HTMLAnchorElement) {
      return
    }
    e.preventDefault()
  }

  handleClickableElClick(e) {
    const item = e.target.closest(this.els.item)

    this.isOpen(item) ?
      this.close(item) :
      this.open(item)
  }

  setInitialFullyExpandedState() {
    this.items.forEach(item => {
      if (this.isOpen(item)) {
        item.classList.add(this.stateClasses.isFullyExpanded)
      }
    })
  }

  init() {
    this.setInitialFullyExpandedState()
  }

  bindEvents() {
    this.summaryEls.forEach((summary) => {
      summary.addEventListener('click', (e) => this.handleSummaryClick(e))
    })
    this.clickableEls.forEach((clickableEl) => {
      clickableEl.addEventListener('click', (e) => this.handleClickableElClick(e))
    })
  }
}

export class AccordionCollection extends Collection {
  constructor() {
    super(instance, Accordion)
  }
}

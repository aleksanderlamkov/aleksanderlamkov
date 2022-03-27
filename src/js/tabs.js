import Collection from './generic/collection'
import {getNodeIndex} from './utils/getNodeIndex'
import {getCfg} from './utils/getCfg'
import {els as sliderEls} from './sliders'
import {wait} from './utils/wait'

export const instance = '[data-js-tabs]'

export class Tabs {
  els = {
    instance,
    navItem: '[data-js-tabs-nav-item]',
    tabItem: '[data-js-tabs-content-item]',
  }

  stateClasses = {
    isActive: 'is-active',
  }

  defaultCfg = {
    animationParams: {
      duration: 1000,
      easing: 'ease-in-out',
    },
  }

  constructor(instance) {
    this.instance = instance
    this.navItems = this.instance.querySelectorAll(this.els.navItem)
    this.tabItems = this.instance.querySelectorAll(this.els.tabItem)
    this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg)
    this.init()
    this.bindEvents()
  }

  switchTabs(openedTabIndex) {
    this.switchTabsNav(openedTabIndex)
    this.switchTabsContent(openedTabIndex)
  }

  switchTabsNav(index) {
    this.navItems.forEach((navItem, i) => {
      (i === index) ?
        navItem.classList.add(this.stateClasses.isActive) :
        navItem.classList.remove(this.stateClasses.isActive)
    })
  }

  switchTabsContent(index) {
    this.tabItems.forEach((tabItem, i) => {
      (i === index) ?
        this.openTab(tabItem) :
        this.closeTab(tabItem)
    })
  }

  isTabOpen(tab) {
    return tab.classList.contains(this.stateClasses.isActive)
  }

  openTab(tab) {
    tab.classList.add(this.stateClasses.isActive)
    wait(100).then(() => {
      this.updateInnerSliders(tab)
    })
    tab.animate([
      {opacity: '0'},
      {opacity: '1'},
    ], this.cfg.animationParams)
  }

  closeTab(tab) {
    tab.classList.remove(this.stateClasses.isActive)
  }

  updateInnerSliders(tab) {
    const sliders = tab.querySelectorAll(sliderEls.container)

    sliders.forEach(slider => {
      const swiper = App.SlidersCollection.getByDOMElement(slider).instance.swiper

      swiper.update()
      swiper.animating = false

      if (swiper.params.autoplay.enabled) {
        swiper.autoplay.start()
      }
    })
  }

  handleNavItemClick(e) {
    this.switchTabs(getNodeIndex(e.target))
  }

  setDefaultSlidersCfg() {
    this.tabItems.forEach((tabItem) => {
      if (!this.isTabOpen(tabItem)) {
        const sliders = tabItem.querySelectorAll(sliderEls.container)

        sliders.forEach(slider => {
          const swiper = App.SlidersCollection.getByDOMElement(slider).instance.swiper

          if (swiper.params.autoplay.enabled) {
            swiper.autoplay.stop()
          }
        })
      }
    })
  }

  init() {
    this.setDefaultSlidersCfg()
  }

  bindEvents() {
    this.navItems.forEach(navItem => {
      navItem.addEventListener('click', (e) => this.handleNavItemClick(e))
    })
  }
}

export class TabsCollection extends Collection {
  constructor() {
    super(instance, Tabs)
  }
}

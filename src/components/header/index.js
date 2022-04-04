import './style.pcss'
import { debounce } from '../../js/utils/debounce'
import { setCSSVar } from '../../js/utils/setCSSVar'

export const instance = '[data-js-header]'

export default class Header {
  els = {
    instance,
  }

  stateClasses = {
    isScrolled: 'is-scrolled',
  }

  constructor() {
    this.instance = document.querySelector(instance)
    if (!this.instance) return
    this.bindEvents()
  }

  handleScroll() {
    if (window.scrollY > 30) {
      this.instance.classList.add(this.stateClasses.isScrolled)
    } else {
      this.instance.classList.remove(this.stateClasses.isScrolled)
      // this.setBodyHeaderHeightProperty()
    }
  }

  setBodyHeaderHeightProperty() {
    setCSSVar(document.querySelector('html'), 'headerHeight', `${this.instance.offsetHeight}px`)
  }

  bindEvents() {
    const debounceHandleResize = debounce(() => this.setBodyHeaderHeightProperty(), 150)
    // const debounceHandleScroll = debounce(() => this.handleScroll(), 30)
    document.addEventListener('scroll', () => this.handleScroll())
    window.addEventListener('resize', () => debounceHandleResize())
    window.addEventListener('load', () => this.setBodyHeaderHeightProperty())
  }
}

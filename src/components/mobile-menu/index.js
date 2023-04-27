import './style.pcss'
import { lock, unlock } from 'tua-body-scroll-lock'
import getAllFocusableElements from '../../js/utils/getAllFocusableElements'

export const instance = '[data-js-mobile-menu]'

export default class MobileMenu {
  els = {
    instance,
  }

  stateClasses = {
    isOpen: 'is-open',
    isMobileMenuOpen: 'is-mobile-menu-open',
  }

  constructor() {
    this.instance = document.querySelector(instance)
    if (!this.instance) return
    this.allFocusableElements = getAllFocusableElements(this.instance)
    this.firstFocusableElement = this.allFocusableElements.at(0)
    this.lastFocusableElement = this.allFocusableElements.at(-1)
    this.state = {
      isOpen: false
    }
    this.bindEvents()
  }

  close() {
    unlock()
    this.state.isOpen = false
    this.instance.classList.remove(this.stateClasses.isOpen)
    document.documentElement.classList.remove(this.stateClasses.isMobileMenuOpen)
  }

  open() {
    lock()
    this.state.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
    document.documentElement.classList.add(this.stateClasses.isMobileMenuOpen)
  }

  toggle() {
    if (this.state.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  handleLastFocusableElementBlur(event) {
    const isFocusOutOfMenu = !event.relatedTarget.closest(this.els.instance)

    if (isFocusOutOfMenu) {
      App.BurgerButton.instance.focus()
    }
  }

  bindEvents() {
    this.lastFocusableElement.addEventListener('blur', (event) => this.handleLastFocusableElementBlur(event))
  }
}

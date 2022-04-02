import './style.pcss'
import { lock, unlock } from 'tua-body-scroll-lock'

export const instance = '[data-js-mobile-menu]'

export default class MobileMenu {
  els = {
    instance,
  }

  stateClasses = {
    isOpen: 'is-open'
  }

  constructor() {
    this.instance = document.querySelector(instance)
    if (!this.instance) return
    this.state = {
      isOpen: false
    }
  }

  close() {
    unlock()
    this.state.isOpen = false
    this.instance.classList.remove(this.stateClasses.isOpen)
  }

  open() {
    lock()
    this.state.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
  }

  toggle() {
    if (this.state.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }
}

import './style.pcss'

export const instance = '[data-js-burger-button]'

export default class BurgerButton {
  els = {
    instance,
  }

  stateClasses = {
    isOpen: 'is-open'
  }

  constructor() {
    this.instance = document.querySelector(instance)
    if (!this.instance) return
    this.bindEvents()
    this.state = {
      isOpen: false
    }
  }

  close() {
    this.state.isOpen = false
    this.instance.classList.remove(this.stateClasses.isOpen)
  }

  open() {
    this.state.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
  }

  toggle() {
    if (this.state.isOpen) {
      this.close()
      App.MobileMenu.close()
    } else {
      this.open()
      App.MobileMenu.open()
    }
  }

  handleClick(event) {
    event.preventDefault()
    this.toggle()
  }

  bindEvents() {
    this.instance.addEventListener('click', (event) => this.handleClick(event))
  }
}

import Collection from './generic/collection'
import {locales} from '../js/locales/index'

export const instance = '[data-js-password]'

export class Password {
  els = {
    instance,
    input: '[data-js-password-input]',
    button: '[data-js-password-button]',
  }

  stateClasses = {
    isActive: 'is-active',
  }

  constructor(instance) {
    this.instance = instance
    this.input = this.instance.querySelector(this.els.input)
    this.button = this.instance.querySelector(this.els.button)
    this.state = {
      isShown: false
    }
    this.bindEvents()
  }

  toggle() {
    this.state.isShown ?
      this.hide() :
      this.show()
  }

  show() {
    this.state.isShown = true
    this.input.setAttribute('type', 'text')
    this.button.classList.add(this.stateClasses.isActive)
    this.button.setAttribute('title', locales.form('HIDE_PASSWORD'))
    this.button.setAttribute('aria-label', locales.form('HIDE_PASSWORD'))
  }

  hide() {
    this.state.isShown = false
    this.input.setAttribute('type', 'password')
    this.button.classList.remove(this.stateClasses.isActive)
    this.button.setAttribute('title', locales.form('SHOW_PASSWORD'))
    this.button.setAttribute('aria-label', locales.form('SHOW_PASSWORD'))
  }

  handleButtonClick(e) {
    e.preventDefault()
    this.toggle()
  }

  bindEvents() {
    this.button.addEventListener('click', (e) => this.handleButtonClick(e))
  }
}

export class PasswordCollection extends Collection {
  constructor() {
    super(instance, Password)
  }
}

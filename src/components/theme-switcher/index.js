import './style.pcss';
import { getCookie, setCookie } from '../../js/utils/cookie'
import { isMedia } from '../../js/utils/isMedia'

export const instance = '[data-js-theme-switcher]'

export default class ThemeSwitcher {
  els = {
    instance,
    checkbox: '[data-js-theme-switcher-checkbox]',
  }

  stateClasses = {
    isLightThemeEnabled: 'is-light-theme-enabled'
  }

  cookieKeys = {
    isLightThemeEnabled: 'isLightThemeEnabled'
  }

  constructor() {
    this.instance = document.querySelector(instance)
    if (!this.instance) return
    this.checkbox = this.instance.querySelector(this.els.checkbox)
    this.state = {
      isLightThemeEnabled: false
    }
    this.init()
    this.bindEvents()
  }

  toggle() {
    if (this.state.isLightThemeEnabled) {
      this.disableLightTheme()
    } else {
      this.enableLightTheme()
    }
  }

  enableLightTheme() {
    setCookie(this.cookieKeys.isLightThemeEnabled, 'true')
    this.state.isLightThemeEnabled = true
    document.documentElement.classList.add(this.stateClasses.isLightThemeEnabled)
    this.checkbox.checked = true
  }

  disableLightTheme() {
    setCookie(this.cookieKeys.isLightThemeEnabled, '')
    this.state.isLightThemeEnabled = false
    document.documentElement.classList.remove(this.stateClasses.isLightThemeEnabled)
    this.checkbox.checked = false
  }

  setInitialState() {
    const isPrefersLightTheme = isMedia('(prefers-color-scheme: light)')
    if (isPrefersLightTheme) {
      this.enableLightTheme()
      return
    }

    const isPrefersDarkTheme = isMedia('(prefers-color-scheme: dark)')
    if (isPrefersDarkTheme) {
      this.disableLightTheme()
      return
    }

    const isLightThemeEnabled = getCookie(this.cookieKeys.isLightThemeEnabled)
    if (isLightThemeEnabled) {
      this.enableLightTheme()
    }
  }

  init() {
    this.setInitialState()
  }

  handleCheckboxChange() {
    this.toggle()
  }

  bindEvents() {
    this.checkbox.addEventListener('change', () => this.handleCheckboxChange())
  }
}

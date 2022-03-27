export const instance = '[data-js-example-module]'

export default class ExampleModule {
  els = {
    instance,
  }

  constructor() {
    this.instance = document.querySelector(instance)
    if (!this.instance) return
    this.bindEvents()
  }

  bindEvents() {

  }
}

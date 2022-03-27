import Collection from './generic/collection'

export const instance = '[data-js-example]'

export class Example {
  els = {
    instance,
  }

  constructor(instance) {
    this.instance = instance
    this.bindEvents()
  }

  bindEvents() {

  }
}

export class ExampleCollection extends Collection {
  constructor() {
    super(instance, Example)
  }
}

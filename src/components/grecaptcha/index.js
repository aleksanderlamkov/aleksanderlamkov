import './style.pcss'
import Collection from '../../js/generic/collection'
import {bubble} from '../../js/utils/bubble'
import {getJS} from '../../js/utils/getJS'
import {getCfg} from '../../js/utils/getCfg'
import {stateClasses as inputStateClasses} from '../../js/forms'
import Dispatcher from '../../js/generic/dispatcher'

export let state = {
  isScriptLoaded: false,
  isScriptLoading: false,
  isAPIReady: false
}

export const instance = '[data-js-google-captcha]'
export const name = 'g-recaptcha-response'
export const bubbles = {
  ready: 'googleCaptchaReady',
  render: 'googleCaptchaRender',
  reset: 'googleCaptchaReset',
  verify: 'googleCaptchaVerify',
  expire: 'googleCaptchaExpire',
  error: 'googleCaptchaError'
}

export class GoogleCaptcha {
  els = {
    instance
  }

  stateClasses = {
    rendered: 'is-rendered',
    expired: 'is-expired',
    error: 'is-error',
    verify: 'is-verify'
  }

  defaultCfg = {
    'sitekey': window.App.googleCaptchaKey || '0',
    'theme': 'light',
    'callback': (response) => this.handleVerify(response),
    'size': 'normal',
    'error-callback': () => this.handleError(),
    'expired-callback': () => this.handleExpired()
  }

  constructor(instance) {
    this.instance = instance
    this.id = null
    this.state = {
      render: false,
      ready: false,
      expired: false,
      error: false,
      verify: false
    }
    if (state.isAPIReady) {
      if (!this.state.render) {
        this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg)
        this.bindEvents()
      } else if (App.debug) {
        console.debug('Google Captcha object are not defined or already rendered: ', instance)
      }
    }
  }

  updateState(data = {}) {
    this.state = {
      ...this.state,
      ...data,
    }
  }

  handleError() {
    this.instance.classList.add(this.stateClasses.error)
    this.instance.classList.remove(this.stateClasses.verify, inputStateClasses.valid)
    this.updateState({
      error: true,
      ready: false,
      verify: false
    })
    bubble(document, bubbles.error, this.getBubbleData())
  }

  handleExpired() {
    this.instance.classList.add(this.stateClasses.expired)
    this.instance.classList.remove(this.stateClasses.verify, inputStateClasses.valid)
    this.updateState({
      ready: false,
      verify: false,
      expired: true
    })
    bubble(document, bubbles.expire, this.getBubbleData())
  }

  handleVerify(response) {
    this.instance.classList.add(this.stateClasses.verify, inputStateClasses.valid)
    this.instance.classList.remove(inputStateClasses.invalid)
    this.updateState({
      verify: true
    })
    bubble(document, bubbles.verify, this.getBubbleData(response))
  }

  render() {
    this.id = window.grecaptcha.render(this.instance, this.cfg)
    this.instance.classList.add(this.stateClasses.rendered)
    this.updateState({
      render: true
    })
    window.grecaptcha.ready(() => bubble(document, bubbles.render, this.getBubbleData()))
  }

  getBubbleData(data = {}) {
    return {
      el: this.instance,
      state: this.state,
      id: this.id,
      ...data
    }
  }

  getResponse() {
    return window.grecaptcha.getResponse(this.id)
  }

  reset() {
    try {
      window.grecaptcha.reset(this.id)
    } catch (e) {
      console.debug(e)
    }
    this.updateState({
      verify: false
    })
    this.instance.classList.remove(this.stateClasses.verify)
    bubble(document, bubbles.reset, this.getBubbleData())
  }

  handleReady() {
    this.updateState({
      ready: true
    })
    if (this.instance.children.length) {
      this.reset()
    } else {
      this.render()
    }
  }

  bindEvents() {
    window.grecaptcha.ready(() => this.handleReady())
  }

}

class GoogleCaptchaApiManager {
  static apiUrl = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=bubbleCaptchaAPIReady'

  static instance = null

  constructor() {
    if (GoogleCaptchaApiManager.instance) {
      return GoogleCaptchaApiManager.instance
    }
    window.bubbleCaptchaAPIReady = () => GoogleCaptchaApiManager.handleScriptReady()
    GoogleCaptchaApiManager.instance = this
  }

  static handleScriptReady() {
    state.isAPIReady = true
    bubble(document, bubbles.ready)
    if (window.App.isDebug) {
      console.debug('Google Captcha API are ready')
    }
  }

  static async load() {
    if (state.isScriptLoaded) {
      GoogleCaptchaApiManager.handleScriptReady()
    } else if (!this.isScriptLoading) {
      this.isScriptLoading = true
      return await getJS({
        defer: true,
        includeToObserver: true,
        src: GoogleCaptchaApiManager.apiUrl
      })
    }
  }

  static handleScriptError(script) {
    console.error('Google Captcha API are not loaded: ', script)
  }

  static handleScriptLoad() {
    state = {
      ...state,
      isScriptLoaded: true,
      isScriptLoading: false
    }
  }
}

export class GoogleCaptchaCollection extends Collection {
  constructor() {
    new GoogleCaptchaApiManager()
    super(instance, GoogleCaptcha)
  }

  getByDOMElement(DOMElement) {
    return this.collection.find(item => item.instance === DOMElement && state.isAPIReady)
  }

  loadAPI() {
    if (!state.isScriptLoading) {
      GoogleCaptchaApiManager.load().then((script) => GoogleCaptchaApiManager.handleScriptLoad(script), (script) => GoogleCaptchaApiManager.handleScriptError(script))
    }
  }

  init(context = document) {
    const items = context.querySelectorAll(instance)
    if (items.length) {
      state.isAPIReady ? items.forEach((el) => this.addToCollection(new GoogleCaptcha(el))) : this.loadAPI()
    }
  }

  bindEvents() {
    document.addEventListener(bubbles.ready, () => this.init())
    Dispatcher.initiator = {
      selector: instance,
      initiator: (context) => this.init(context),
      getCollection: () => this.collection
    }
  }
}


import './style.pcss'
import { lock, unlock } from 'tua-body-scroll-lock'
import { wait } from '../../js/utils/wait'
import { bubble } from '../../js/utils/bubble'

export const instance = '[data-js-preloader]'

export const bubbles = {
  fadeAway: 'preloader::fadeAway'
}

export default class Preloader {
  els = {
    lastPart: '[data-js-preloader-last-part]'
  }

  cfg = {
    startAnimationDelay: 100,
    minimumAnimationCounter: 1
  }

  stateClasses = {
    isShown: 'is-shown',
    isAnimationStarted: 'is-animation-started',
  }

  state = {
    animationCounter: 0,
    isPageLoaded: false,
    isFadeAway: false
  }

  constructor() {
    this.instance = document.querySelector(instance)
    if (!this.instance) return
    this.lastPartElement = this.instance.querySelector(this.els.lastPart)
    this.init()
  }

  open() {
    lock()
    this.instance.classList.add(this.stateClasses.isShown)
  }

  close() {
    if (this.state.isFadeAway) return
    unlock()
    this.instance.classList.remove(this.stateClasses.isShown)
    this.state.isFadeAway = true
    bubble(document, bubbles.fadeAway)
    console.debug('Bubble!')
  }

  destroy() {
    unlock()
    this.instance.remove()
  }

  startAnimation() {
    this.instance.classList.add(this.stateClasses.isAnimationStarted)
  }

  manageAnimationEnd() {
    if (this.state.animationCounter >= this.cfg.minimumAnimationCounter && this.state.isPageLoaded) {
      this.close()
    }
  }

  handleWindowLoad() {
    this.state.isPageLoaded = true
    this.manageAnimationEnd()
  }

  handleLastPartElementTransitionEnd(event) {
    if (event.propertyName === 'transform') {
      this.state.animationCounter++
      console.debug('handleLastPartElementTransitionEnd')
      this.manageAnimationEnd()
    }
  }

  init() {
    wait(this.cfg.startAnimationDelay).then(() => {
      this.startAnimation()
      this.bindEvents()
    })
  }

  bindEvents() {
    window.addEventListener('load', () => this.handleWindowLoad())
    this.lastPartElement.addEventListener('transitionend', (event) => this.handleLastPartElementTransitionEnd(event))
  }
}

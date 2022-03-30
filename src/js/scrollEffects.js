/*
 (c) Yuri Moskvin
 v. 1.2.5
*/

import {bubble} from './utils/bubble'
import {debounce} from './utils/debounce'
import {setCSSVar} from './utils/setCSSVar'
import {removeCSSVar} from './utils/removeCSSVar'
import {isMedia} from './utils/isMedia'
import {removeAttrs} from './utils/removeAttrs'
import {removeClasses} from './utils/removeClasses'

import ScrollMagic from 'scrollmagic/scrollmagic/uncompressed/ScrollMagic'
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators'

export const els = {
  blocks: '[data-js-scroll-effect]',
  unlock: '[data-js-scroll-effect-unlock]',
  spacer: '[data-scrollmagic-pin-spacer]'
}

export const nameSpace = 'scrollEffects'

export const bubbles = {
  module: `${nameSpace}::inited`,
  end: `${nameSpace}::end`,
  leave: `${nameSpace}::leave`,
  enter: `${nameSpace}::enter`,
  update: `${nameSpace}::update`,
  destroy: `${nameSpace}::destroy`,
  progress: `${nameSpace}::progress`,
  transitionEnd: `${nameSpace}::transitionEnd`
}

export const stateClasses = {
  effect: 'scroll-effect',
  visible: 'scroll-effect--visible',
  locked: 'scroll-effect--locked',
  playing: 'scroll-effect--playing',
  init: 'scroll-effect--init',
  transition: {
    end: 'scroll-effect--transition-end'
  },
  page: {
    loaded: 'dom-is-ready',
    ready: 'page-is-loaded'
  },
  progress: {
    scrolledQuarter: 'scroll-effect--progress-quarter',
    scrolledMiddle: 'scroll-effect--progress-middle',
    scrolledFull: 'scroll-effect--progress-full',
  }
}

export default class ScrollEffects {
  stateClasses = {
    ...stateClasses,
  }

  utils = {
    modules: {
      nameSpace: 'ModuleLoaded',
      classPrefix: 'module-is-loaded'
    }
  }

  cssVars = {
    progress: '--scrollEffectsSceneProgress'
  }

  defaultSettings = {
    triggerHook: .9,
    duration: '80%',
    offset: 25,
    reverse: false,
    media: false,
    lock: false,
    loadingStates: true,
    progress: false,
    progressSteps: 2,
    delegatedID: false,
    delegatedVar: this.cssVars.progress,
    delegatedSelector: document.documentElement,
    progressIndicators: true, // TODO
    defaultVideoDelay: 300,
    disabled: false,
    triggers: {
      enter: false,
      leave: false,
      end: false,
      update: false,
      destroy: false,
      transitionEnd: false
    },
    exclude: false,
    wait: false,
    addToGlobal: false,
  }

  constructor() {
    const attr = els.blocks.slice(1, -1)
    this.attrs = {
      main: attr,
      scrolled: attr + '-progress',
      videoAutoPlay: attr + '--video-autoplay',
      unlock: attr + '-unlocker'
    }

    this.isOff = (location.search.indexOf('?light') > -1)
    this.isDebug = !!(location.port.length) || App.debug
    this.isCSS3VarsMode = (window.CSS && window.CSS.supports && window.CSS.supports('(--a: b)'))
    this.controller = new ScrollMagic.Controller({
      addIndicators: this.isDebug
    })
    this.windowWidth = window.innerWidth
    this.instances = []
    this.bindEvents()
    this.init()
  }

  init() {
    this.windowWidth = window.innerWidth
    const nodes = document.querySelectorAll(els.blocks)
    if (nodes.length && !this.isOff) {
      nodes.forEach((item) => {
        this.sceneCreate(item)
      })
      bubble(document, bubbles.module)
    }
  }

  handleResize() {
    if (window.innerWidth === this.windowWidth) return
    this.init()
  }

  handleScroll() {
    const activeEl = document.activeElement
    const isBlur = (activeEl && activeEl.matches('input') && activeEl.closest(els.spacer))
    if (isBlur) {
      activeEl.blur()
    }
  }

  bindEvents() {
    // const debouncedHandler = debounce(() => this.handleResize())
    window.addEventListener('scroll', () => {
      this.handleScroll()
    })
    // window.addEventListener('resize', () => {
    //   debouncedHandler()
    // })
  }

  getSettings(from) {
    let settings = {}
    if (from instanceof Element || from instanceof HTMLDocument) {
      if (from.hasAttribute(this.attrs.main)) settings = ScrollEffects.getData(from)
    } else settings = from
    return settings
  }

  static getRandomNumber() {
    return Math.floor(Math.random() * (Math.round((Math.random())) - 1 + 1) + 1)
  }

  static getData(from) {
    const dataset = from.dataset.jsScrollEffect
    return (dataset.length) ? JSON.parse(dataset) : {}
  }


  static getBrowser() {
    return {
      ie11: !!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/)),
      safari: !!navigator.userAgent.match(/Version\/[\d.]+.*Safari/)
    }
  }

  static excludeByBrowser(list) {
    let isExcluded = false
    if (list) {
      const ie11 = ScrollEffects.getBrowser().ie11
      const safari = ScrollEffects.getBrowser().safari
      if (!Array.isArray(list)) list = list.split(',')
      list.forEach((i, browserName) => {
        if ((browserName.indexOf('ie') !== -1 && ie11) || (browserName.indexOf('safari') !== -1) && safari) isExcluded = true
      })
    }
    return isExcluded
  }

  static excludeByMedia(query) {
    return (query && !isMedia(query))
  }

  static isMultiple100(number) {
    return (100 % number) === 0
  }

  unlock(item, e) {
    if (e) {
      const fn = () => {
        item.classList.remove(this.stateClasses.locked)
        item.removeEventListener('transitionend', (e) => {
          this.unlock(item, e)
        })
      }
      const unlockEl = item.querySelector(els.unlock)
      if (unlockEl) {
        const unlockProp = unlockEl.getAttribute(this.attrs.unlock)
        if (document.querySelector(e.target).isEqualNode(unlockEl) && e.propertyName === unlockProp) {
          fn()
        }
      } else {
        if (e.target === item) fn()
      }
    } else item.classList.remove(this.stateClasses.locked)
  }

  sceneUnlockHandler(item, isForced) {
    if (isForced) {
      item.classList.remove(this.stateClasses.locked)
    } else {
      item.addEventListener('transitionend', (e) => {
        this.unlock(item, e)
      })
    }
  }

  delegateProgress(params) {
    if (params.delegatedID) {
      document.documentElement.setAttribute(`${this.attrs.scrolled}--${params.delegatedID}`, params.value)
    }
    if (params.delegatedVar && this.isCSS3VarsMode) {
      setCSSVar(params.delegatedVar, params.value, params.delegatedSelector)
    }
  }

  sceneProgressHandler(currentValue, domElement, values, delegatedID, delegatedVar, delegatedSelector) {
    currentValue = currentValue.toFixed(2) * 100
    values.some((num) => {
      if (currentValue >= num) this.delegateProgress({
        value: num,
        el: domElement,
        delegatedID, delegatedVar, delegatedSelector,
      })
    });
    (currentValue >= 25) ? domElement.classList.add(this.stateClasses.progress.scrolledQuarter) : domElement.classList.remove(this.stateClasses.progress.scrolledQuarter);
    (currentValue >= 50) ? domElement.classList.add(this.stateClasses.progress.scrolledMiddle) : domElement.classList.remove(this.stateClasses.progress.scrolledMiddle);
    (currentValue === 100) ? domElement.classList.add(this.stateClasses.progress.scrolledFull) : domElement.classList.remove(this.stateClasses.progress.scrolledFull)
  }

  playSceneVideo(el) {
    const video = el.querySelector('video')
    if (video && video.paused) {
      const delay = el.getAttribute(this.attrs.videoAutoPlay) || this.defaultSettings.defaultVideoDelay
      window.setTimeout(() => {
        video.play()
        el.classList.add(this.stateClasses.playing)
      }, Number(delay))
    }
  }

  pauseSceneVideo(el) {
    const video = el.querySelector('video')
    if (video && !video.paused) {
      video.pause()
      el.classList.remove(this.stateClasses.playing)
    }
  }

  sceneEnterHandler(el) {
    const scene = this.getScene(el)
    if (scene.passedSettings.lock) {
      this.sceneUnlockHandler(el)
    }
    if ((el).hasAttribute(this.attrs.videoAutoPlay)) this.playSceneVideo(el)
    if (scene.passedSettings.triggers.enter) {
      bubble(el, bubbles.enter)
    }
    if (this.isDebug) console.debug('Enter scene:', el)
  }

  sceneLeaveHandler(el) {
    const scene = this.getScene(el)
    this.sceneUnlockHandler(el, true)
    if (el.hasAttribute(this.attrs.videoAutoPlay)) this.pauseSceneVideo(el)
    if (scene.passedSettings.triggers.leave) bubble(el, bubbles.leave)
    if (this.isDebug) console.debug('Leave scene:', el)
  }

  sceneEndHandler(el) {
    const scene = this.getScene(el)
    scene.scene.removeClassToggle()
    if (scene.passedSettings.triggers.end) bubble(el, bubbles.end)
  }

  sceneTransitionEndHandler(e, params, sceneEl) {
    const {target, propertyName} = e
    if (!sceneEl.classList.contains(this.stateClasses.transition.end) && params.property && params.el && params.property === propertyName && target.matches(params.el)) {
      sceneEl.classList.add(this.stateClasses.transition.end)
      bubble(sceneEl, bubbles.transitionEnd)
    }
  }

  sceneDestroy(from, isDestroyPin) {
    const scene = this.getScene(from)
    const attrsToRemove = [this.attrs.scrolled, this.attrs.scrolledMiddle, this.attrs.scrolledFull]
    const classesToRemove = Object.values(this.stateClasses).filter((className) => typeof className === 'string' && className.indexOf(nameSpace))
    scene.scene.destroy(isDestroyPin)
    removeClasses(scene.dom, classesToRemove)
    removeAttrs(scene.dom, attrsToRemove)
    if (isDestroyPin) {
      scene.scene.removePin(true)
      if (scene.pinnedScene) {
        scene.pinnedScene.destroy(true)
        if (scene.pinnedSceneDOM) {
          removeAttrs(scene.pinnedSceneDOM, attrsToRemove)
          removeClasses(scene.pinnedSceneDOM, classesToRemove)
        }
      }
      if (scene.passedSettings.delegatedVar && this.isCSS3VarsMode) {
        removeCSSVar(scene.passedSettings.delegatedVar, scene.passedSettings.delegatedSelector)
      }
    }
    this.controller.removeScene(scene.scene)
    this.controller.update(true)
    if (scene.passedSettings.triggers.destroy) bubble(scene.dom, bubbles.destroy)
    if (this.isDebug) console.debug('Destroying scene:', scene.dom)
  }

  sceneUpdate(from, isImmediately) {
    const scene = this.getScene(from)
    scene.scene.update(isImmediately)
    if (scene.passedSettings.triggers.update) bubble(scene.dom, bubbles.update)
    if (this.isDebug) console.debug('Updating scene:', scene.dom)
  }

  sceneDisable(from) {
    const scene = this.getScene(from)
    scene.scene.enabled(false)
    if (this.isDebug) console.debug('Disabling scene:', scene.dom)
  }

  sceneEnable(from) {
    const scene = this.getScene(from)
    scene.scene.enabled(true)
    if (this.isDebug) console.debug('Enabling scene:', scene.dom)
  }

  sceneOn(el, event, handler) {
    const scene = this.getScene(el).scene
    scene.on(event, (e) => handler(e))
  }

  sceneOff(el, event, handler) {
    const scene = this.getScene(el).scene
    scene.off(event, (e) => handler(e))
  }

  getScene(from) {
    if (typeof from === 'string') {
      const el = document.querySelector(from)
      if (document.querySelectorAll(from).length > 1 && this.isDebug) console.debug(`Warning: page contains multiple elements with selector "${from}". Result shown for:`, el)
      from = el
    }
    if (typeof from.scrollEffects === undefined) console.error('Error: this element was not initialized:', from)
    else return from.scrollEffects
  }

  getScenePosition(from) {
    return this.getScene(from).scene.state()
  }

  getSceneState(from) {
    return this.getScene(from).scene.enabled()
  }

  getSceneOffsets(from) {
    const scene = this.getScene(from).scene
    return {
      start: scene.scrollOffset(),
      end: scene.scrollOffset() + scene.duration()
    }
  }

  getSceneDuration(from) {
    return this.getScene(from).scene.duration()
  }

  getSceneProgress(from, isPercent) {
    return this.getScene(from).scene.progress() * ((isPercent) ? 100 : 1)
  }

  pushInstance(params) {
    const instance = {
      scene: params.scene,
      pinnedScene: params.pinnedScene,
      passedSettings: params.passedSettings,
      pinnedSceneDOM: params.pinnedSceneDOM,
      dom: params.domElement
    }
    if (params.passedSettings.addToGlobal) {
      this.instances.push({
        el: params.domElement,
        instance: instance
      })
    }
    params.domElement.scrollEffects = instance
  }

  sceneCreate(domElement) {
    let settings = {...this.defaultSettings, ...this.getSettings(domElement)}
    let pinnedScene = false
    let pinnedSceneDOM = false
    let isDestroyed = false

    if (ScrollEffects.excludeByBrowser(settings.exclude)) {
      if (this.isDebug) console.debug('Warning: This browser has been excluded for element', domElement)
      return
    }

    if (domElement.classList.contains(this.stateClasses.init) && domElement.classList.contains(this.stateClasses.effect)) {
      this.sceneDestroy(domElement, true)
      isDestroyed = true
    }

    if (ScrollEffects.excludeByMedia(settings.media)) {
      if (this.isDebug) console.debug('Warning: This element has been excluded by @media rule', domElement)
      return
    }

    domElement.classList.add(this.stateClasses.effect)
    if (settings.lock) domElement.classList.add(this.stateClasses.locked)

    if (settings.progress) {
      if (Array.isArray(settings.progressSteps)) {
        if (settings.progressSteps[0] !== 0) settings.progressSteps.unshift(0)
      } else {
        const divider = (ScrollEffects.isMultiple100(settings.progressSteps)) ? (settings.progressSteps) : (2 * Math.round(settings.progressSteps / 2))
        settings.progressSteps = Array(Math.ceil((100 + divider) / divider)).fill(0).map((value, i) => {
          return (i === 0) ? value : divider * i
        })
      }
    }

    if (typeof settings.delegatedSelector === 'string') {
      settings.delegatedSelector = document.querySelector(settings.delegatedSelector)
    }

    if (settings.pin) {
      pinnedSceneDOM = document.querySelector(settings.pin)
      const delegatedID = settings.delegatedID // `tmp-id${scrollEffects.getRandomNumber()}`
      if (pinnedSceneDOM) {
        pinnedScene = new ScrollMagic.Scene({
          triggerElement: settings.pin,
          triggerHook: 0,
          duration: '100%',
        }).setPin(settings.pin, {
          pushFollowers: false
        }).addTo(this.controller)
        if (settings.progress) {
          pinnedScene.on('progress', (e) => {
            this.sceneProgressHandler(e.progress, pinnedSceneDOM, settings.progressSteps, delegatedID, settings.delegatedVar, settings.delegatedSelector)
          })
        }
      } else console.error('Pinned el not found:', settings.pin)
    }

    settings.triggerElement = (settings.triggerElement) ? document.querySelector(settings.triggerElement) : domElement

    const scene = new ScrollMagic.Scene(settings)
      .setClassToggle(domElement, this.stateClasses.visible)
      .on('end', () => this.sceneEndHandler(domElement))
      .on('enter', () => this.sceneEnterHandler(domElement))
      .on('leave', () => this.sceneLeaveHandler(domElement))

    if (settings.progress) scene.on('progress', (e) => this.sceneProgressHandler(e.progress, domElement, settings.progressSteps, false, settings.delegatedVar, settings.delegatedSelector))
    if (settings.pin && document.querySelector(settings.pin)) scene.setPin(settings.pin, {
      pushFollowers: false
    })

    if (settings.triggers.transitionEnd) {
      domElement.addEventListener('transitionend', (e) => this.sceneTransitionEndHandler(e, settings.triggers.transitionEnd, domElement))
    }

    this.pushInstance({
      scene,
      pinnedScene,
      pinnedSceneDOM,
      domElement,
      passedSettings: settings,
    })

    if (settings.disabled && !domElement.classList.contains(this.stateClasses.init)) this.sceneDisable(domElement)
    domElement.classList.add(this.stateClasses.init)

    if (settings.wait) {
      const eventClass = (settings.wait.indexOf(this.utils.modules.nameSpace) > -1) ? `${this.utils.modules.classPrefix}--${settings.wait.replace(this.utils.modules.nameSpace, '')}` : false
      const createSceneAfterBubble = () => {
        scene.addTo(this.controller)
        if (this.isDebug) console.debug('Scene created after event:', settings.wait, domElement)
      }
      if (eventClass) {
        if (document.documentElement.classList.contains(eventClass)) createSceneAfterBubble()
      } else {
        if (isDestroyed) {
          createSceneAfterBubble()
        } else {
          document.addEventListener(settings.wait, () => {
            createSceneAfterBubble()
          })
        }
      }
    } else scene.addTo(this.controller)
    if (this.isDebug) {
      scene.addIndicators()
    }
  }
}

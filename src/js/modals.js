import '@fancyapps/ui/dist/fancybox.css'
import {Fancybox} from '@fancyapps/ui'
import {locales} from './locales'
import {getLocaleMsg} from './utils/getLocaleMsg'
import {dispatchContentLoaded} from './generic/eventing'
import {isUrl} from './utils/isUrl'
import {parseJSON} from './utils/parseJSON'
import {getAttr} from './utils/getAttr'
import {bubble} from './utils/bubble'
import {isEmptyObj} from './utils/isEmptyObj'
import {getLastFromNodeList} from './utils/getLastFromNodeList'
import {getFormDataFromObj} from './utils/getFormDataFromObj'
import {makeRequest} from './utils/makeRequest'
import {getCurrentLang} from './utils/getCurrentLang'
import {wait} from './utils/wait'
import {stateClasses as formStateClasses} from './forms'

export const els = {
  modal: '[data-js-modal]',
  errorText: '[data-js-modal-error-text]',
  open: '[data-js-modal-open]',
  close: '[data-js-modal-close]',
  submit: '[data-js-modal-submit]',
  cancel: '[data-js-modal-cancel]',
  defaultAnchors: {
    success: '#modal-success',
    error: '#modal-error'
  }
}

export const layouts = {
  closeButton: `
    <svg class="i-icon">
      <use href="#icon-close"></use>
    </svg>
  `,
  nextButton: `
    <svg class="i-icon">
      <use href="#icon-page-next"></use>
    </svg>
  `,
  prevButton: `
    <svg class="i-icon i-icon--large">
      <use href="#icon-page-prev"></use>
    </svg>
  `
}

const l10n = Object.entries(locales.modals).map((pair) => {
  return {[pair[0]]: pair[1][getCurrentLang()]}
}).reduce((a, b) => Object.assign(a, b), {})

export const modalOptions = {
  animated: false,
  Thumbs: false,
  Image: false,
  hideScrollbar: true,
  infinite: false,
  on: {
    reveal: (instance, slide) => {
      Modals.handleModalReveal(instance, slide)
    },
    closing: (instance) => {
      Modals.handleModalClose(instance)
    }
  },
  l10n,
  template: {
    closeButton: layouts.closeButton
  },
  trapFocus: true,
  autoFocus: false,
  placeFocusBack: false,
  preload: false,
  modal: true,
  touch: false,
  fullScreen: false,
  defaultActionCfg: {
    redirectAfterClose: false,
    reloadAfterClose: false,
    bubbleAfterClose: false,
    afterConfirm: (instance, event) => {
      Modals.handleModalConfirm(instance, event)
    },
    afterCancel: (instance, event) => {
      Modals.handleModalCancel(instance, event)
    }
  },
  draggable: false,
  lockAxis: true,
  method: 'GET',
  data: {},
  showClass: 'modal-show',
  hideClass: 'modal-hide'
}

export default class Modals {

  constructor() {
    this.bindEvents()
  }

  static getActionCfg(modal) {
    return {
      ...modalOptions.defaultActionCfg,
      ...parseJSON(modal.getAttribute(getAttr(els.modal)))
    }
  }

  static getCfg(handler) {
    return {
      handler,
      src: handler.hasAttribute('href') ? handler.getAttribute('href') : '',
      isLockHandler: true,
      ...modalOptions,
      ...parseJSON(handler.getAttribute(getAttr(els.open)))
    }
  }

  static handleModalConfirm(instance, event) {
    event.preventDefault()
    Modals.closeModal(instance)
  }

  static handleModalCancel(instance, event) {
    event.preventDefault()
    Modals.closeModal(instance)
  }

  static handleModalReveal(instance, slide) {
    const modal = slide.$el.querySelector(els.modal)
    if (modal) {
      const slideContent = modal.parentNode
      if (slide.type !== 'inline') {
        const attr = getAttr(els.modal)
        slideContent.setAttribute(attr, (modal.hasAttribute(attr)) ? modal.getAttribute(attr) : '')
        slideContent.classList.add(...modal.classList)
        slideContent.id = modal.id
        modal.replaceWith(...modal.childNodes)
      }
      dispatchContentLoaded({content: slideContent})
    }
  }

  static getModalContent(instance) {
    return instance.$carousel.querySelector(els.modal)
  }

  static handleModalClose(instance) {
    const modal = Modals.getModalContent(instance)
    if (modal) {
      const {bubbleAfterClose, redirectAfterClose, reloadAfterClose} = Modals.getActionCfg(modal)
      if (bubbleAfterClose) {
        bubble(document, bubbleAfterClose.toString(), modal)
      }
      if (typeof redirectAfterClose === 'string') {
        window.location.href = redirectAfterClose
      } else if (reloadAfterClose) {
        window.location.reload()
      } else {
        const {isLockHandler, handler} = instance.options
        if (isLockHandler && handler) {
          Modals.setModalHandlerLock(handler, false)
        }
      }
    }
  }

  static closeAllModals() {
    Fancybox.close(true)
  }

  static closeModal(instance = Modals.getActiveInstance()) {
    if (instance) {
      instance.close()
    }
  }

  static openInlineModal(cfg) {
    const {src} = cfg
    Fancybox.show([{src, type: 'inline'}], {
      ...modalOptions,
      ...cfg,
    })
  }

  static openConfirmModal(cfg, confirmFn, cancelFn) {
    Modals.openInlineModal({
      src: '#modal-confirm',
      defaultActionCfg: {
        ...modalOptions.defaultActionCfg,
        afterConfirm: (instance, e) => {
          e.preventDefault()
          if (typeof confirmFn === 'function') {
            confirmFn(instance, e)
          } else {
            Modals.handleModalConfirm(instance, e)
          }
        },
        afterCancel: (instance, e) => {
          e.preventDefault()
          if (typeof cancelFn === 'function') {
            cancelFn(instance, e)
          } else {
            Modals.handleModalCancel(instance, e)
          }
        }
      },
      ...cfg
    })
  }

  static openHTMLModal(cfg) {
    const {src} = cfg
    Fancybox.show([{src, type: 'html'}], {
      ...modalOptions,
      ...cfg,
    })
  }

  static handleRequestError(status = 404, callback) {
    let msg = getLocaleMsg('ERROR')
    switch (status) {
      case 408:
        msg = getLocaleMsg('TIMEOUT')
        break
      case 404:
        msg = getLocaleMsg('AJAX_NOT_FOUND')
        break
      case 403:
        msg = getLocaleMsg('AJAX_FORBIDDEN')
        break
    }
    Modals.openErrorModal(msg)
    if (typeof callback === 'function') {
      callback()
    }
  }

  static openAjaxModal(cfg) {
    const {src = '', method = 'GET', data = {}, on} = cfg
    if (src) {
      const body = getFormDataFromObj(data)
      const handleError = () => {
        if (typeof on.error === 'function') {
          on.error()
        }
      }
      makeRequest({url: src, type: 'text', method, body}).then((data) => {
        if (cfg.data) {
          delete cfg.data
        }
        const json = parseJSON(data)
        if (isEmptyObj(json)) {
          Modals.openHTMLModal({
            ...cfg,
            src: data
          })
        } else if (json.errors) {
          Modals.openErrorModal(json.errors)
          handleError()
        }
      }, (errorCode) => Modals.handleRequestError(errorCode, handleError))
    } else {
      console.error('Can\'t open ajax modal with invalid cfg:', cfg)
    }
  }

  static setErrorText(errorText, slide, isReset = false) {
    const context = (typeof slide.$content === 'undefined') ? slide : slide.$content
    const errorBlock = context.querySelector(els.errorText)
    if (errorBlock && errorText) {
      errorBlock.innerHTML = (isReset) ? getLocaleMsg('ERROR') : (Array.isArray(errorText) ? errorText.join('<br />') : errorText)
    }
  }

  static openErrorModal(errorText = getLocaleMsg('ERROR'), isCloseOthers = true, debugInfo) {
    if (isCloseOthers) {
      Modals.closeAllModals()
    }
    Modals.openInlineModal({
      src: els.defaultAnchors.error,
      on: {
        ...modalOptions.on,
        reveal: (instance, slide) => {
          Modals.setErrorText(errorText, slide)
        },
        destroy: () => {
          Modals.setErrorText(errorText, document.querySelector(els.defaultAnchors.error), true)
        },
        closing: (instance) => {
          Modals.handleModalClose(instance)
        }
      }
    })
    if (debugInfo) {
      console.debug(debugInfo)
    }
  }

  static getActiveInstance() {
    let instance = Fancybox.getInstance()
    const modals = document.querySelectorAll('[id^="fancybox-"][aria-modal]')
    if (modals.length && !instance) {
      const lastModal = getLastFromNodeList(modals)
      instance = lastModal.Fancybox || null
    }
    return instance
  }

  static setModalHandlerLock(handler, isLock = true) {
    if (handler) {
      (isLock) ? handler.classList.add(formStateClasses.disabled) : handler.classList.remove(formStateClasses.disabled)
      if (handler.matches('button')) {
        handler.disabled = isLock
      }
    }
  }

  handleOpenClick(e) {
    e.preventDefault()
    const cfg = Modals.getCfg(e.target)
    const {src, isLockHandler, handler, on} = cfg
    const setLock = (isLock = true) => {
      if (handler && isLockHandler) {
        Modals.setModalHandlerLock(handler, isLock)
      }
    }
    if (typeof on.error === 'undefined') {
      on.error = () => setLock(false)
    }
    if (src) {
      setLock()
      switch (true) {
        case isUrl(src) || src.startsWith('/') || src.startsWith('.'):
          Modals.openAjaxModal(cfg)
          break
        case src.startsWith('#'):
          Modals.openInlineModal(cfg)
          break
        default:
          Modals.openHTMLModal(cfg)
          break
      }
    } else {
      throw new Error('No src for modal')
    }
  }

  handleCloseClick(e) {
    e.preventDefault()
    wait(50).then(() => e.target.blur())
    Modals.closeModal()
  }

  handleConfirmClick(e) {
    e.preventDefault()
    const instance = Modals.getActiveInstance()
    if (typeof instance.options.defaultActionCfg.afterConfirm === 'function') {
      instance.options.defaultActionCfg.afterConfirm(instance, e)
    }
  }

  handleCancelClick(e) {
    e.preventDefault()
    const instance = Modals.getActiveInstance()
    if (typeof instance.options.defaultActionCfg.afterCancel === 'function') {
      instance.options.defaultActionCfg.afterCancel(instance, e)
    }
  }

  handleMouseDown(e) {
    const { target, button } = e

    if (button !== 0) return

    const isMatch = (selector) => target.matches(selector)
    const { open, close, cancel, submit } = els

    if (isMatch(open) && isMatch(close)) {
      this.handleCloseClick(e)
      this.handleOpenClick(e)
      return
    }

    switch (true) {
      case isMatch(open):
        this.handleOpenClick(e)
        break
      case isMatch(close):
        this.handleCloseClick(e)
        break
      case isMatch(cancel):
        this.handleCancelClick(e)
        break
      case isMatch(submit):
        this.handleConfirmClick(e)
        break
      default:
        break
    }
  }

  bindEvents() {
    document.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e)
    })
  }
}

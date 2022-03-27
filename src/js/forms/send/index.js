import {instance as fileAttachInstance} from '../../../components/file-attach'
import Forms, {bubbles as formBubbles, els as formEls, stateClasses} from '../'
import Modals from '../../../js/modals'
import FormValidation from '../validation'
import {bubble} from '../../utils/bubble'
import {render} from '../../utils/render'
import {removeChildNodes} from '../../utils/removeChildNodes'
import {dispatchContentLoaded} from '../../generic/eventing'
import {parseHTML} from '../../utils/parseHTML'
import {getAttr} from '../../utils/getAttr'
import {parseJSON} from '../../utils/parseJSON'
import {getLocaleMsg} from '../../utils/getLocaleMsg'
import {makeRequest} from '../../utils/makeRequest'
import {getCheckedBoxes} from '../../utils/getCheckedBoxes'
import {wait} from '../../utils/wait'

export default class FormSend {
  constructor() {
    this.bindEvents()
  }

  bindEvents() {
    document.addEventListener(formBubbles.formValid, (e) => {
      this.handleFormValid(e)
    })
  }

  handleFormValid(e) {
    const form = e.target
    const cfg = Forms.getFormCfg(form)
    const {isIgnoreAutoSend, isUseFetch, isConfirmBeforeSubmit, handler} = cfg
    if (!isIgnoreAutoSend) {
      const fn = () => (isUseFetch) ? FormSend.send(form, FormSend.getFormData(form, false, [], false)) : form.submit()
      if (isConfirmBeforeSubmit) {
        if (handler && handler.matches(formEls.skipConfirmation)) {
          fn()
        } else {
          Modals.openConfirmModal({}, (instance, e) => {
            e.preventDefault()
            fn()
            Modals.closeModal(instance)
          })
        }
      } else fn()
    }
  }

  /**
   * Получение данных формы
   * @param form{HTMLFormElement} - форма
   * @param isGetAll{Boolean=} - получение всех input, включая disabled
   * @param excludedParams{Array=} - исключаемые из данных названия имён
   * @param isTrim{Boolean=} - trim для значений внутри данных
   */
  static getFormData(form, isGetAll = false, excludedParams = [], isTrim = true) {
    const cfg = Forms.getFormCfg(form)
    const fd = new FormData(form)
    if (cfg.isSerializeDisabledInputs || isGetAll) {
      const disabledInputs = form.querySelectorAll('[disabled]')
      disabledInputs.forEach(({name, value, type}) => {
        const set = (name, value) => fd.set(name, value)
        if (type === 'radio') {
          const radios = getCheckedBoxes(document.querySelectorAll(`[name=${name}]`))
          if (radios.length) {
            set(name, radios[0].value)
          }
        } else {
          set(name, value)
        }
      })
    }
    [...fd.entries()].forEach(([name, value]) => {
      if ((isTrim && typeof value === 'string' && !value.trim().length) || excludedParams.includes(name)) {
        fd.delete(name)
      }
    })
    return fd
  }

  /**
   * Добавление новых элементов на страницу
   * @param elements{Array} - массив с объектами новых элементов
   */
  static appendNodes(elements) {
    elements.forEach((item) => {
      const {to, html} = item
      const position = item.position || undefined
      const dest = document.querySelector(to)
      if (dest) {
        render(dest, html, position)
        dispatchContentLoaded({
          content: dest
        })
        bubble(dest, formBubbles.formAppendNodes, html)
      } else {
        console.debug('Can\'t find nodes with selector: ', dest)
      }
    })
  }

  /**
   * Замена элементов на странице
   * @param elements{Array} - массив с объектами заменяемых элементов
   */
  static replaceNodes(elements) {
    elements.forEach(item => {
      const {selector, html} = item
      const dest = document.querySelector(selector)
      const newNodes = parseHTML(html)
      if (dest && newNodes.length) {
        dest.replaceWith(newNodes[0])
        dispatchContentLoaded({content: dest})
        bubble(dest, formBubbles.formReplaceNodes, html)
      } else {
        console.debug('Can\'t find nodes with selector: ', dest)
      }
    })
  }

  /**
   * Скрытие элементов со страницы
   * @param selectors{Array} - массив с селекторами элементов
   */
  static hideNodes(selectors) {
    selectors.forEach(selector => {
      const nodes = document.querySelectorAll(selector)
      if (nodes.length) {
        nodes.forEach(node => {
          node.classList.add(stateClasses.hidden)
          bubble(node, formBubbles.formRemoveNodes)
        })
      } else {
        console.debug('Can\'t find nodes with selector: ', selector)
      }
    })
  }

  /**
   * Обработчик успешной отправки формы
   * @param cfg{Object} - конфигурация формы
   * @param resp{Object} - ответ сервера
   */
  static handleSuccess(cfg, resp) {
    const {
      form,
      isShowErrorsAsModals,
      errorsListPosition,
      errorsListLayout,
      errorsListItemLayout,
      isResetAfterSuccess,
      isShowModals,
      successModalId,
      isCloseAllModalsAfterSuccess
    } = cfg
    const {file, reload, redirect, errors, hideElements, appendElements, replaceElements, innerHTML, modals} = resp
    const bubbleDetail = {resp, cfg, form}
    if (file) {
      window.open(resp.file, 'downloadFile').focus()
    }
    if (reload) {
      window.location.reload()
      return
    }
    if (redirect) {
      window.location.href = redirect
      return
    }
    if (errors && Array.isArray(errors)) {
      bubble(form, formBubbles.formError, bubbleDetail)
      if (isShowErrorsAsModals) {
        Modals.openErrorModal(errors, false)
      } else {
        render(form, errorsListLayout, errorsListPosition)
        const errorsBlock = form.querySelector(formEls.errorsList)
        errors.forEach(errorText => render(errorsBlock, errorsListItemLayout(errorText), 'afterbegin'))
        FormValidation.resetGoogleCaptcha(form)
      }
    } else {
      bubble(form, formBubbles.formSuccess, bubbleDetail)
      if (innerHTML && typeof innerHTML === 'string') {
        removeChildNodes(form)
        render(form, innerHTML)
        dispatchContentLoaded({content: form})
      }
      if (hideElements) {
        FormSend.hideNodes(hideElements)
      }
      if (appendElements) {
        FormSend.appendNodes(appendElements)
      }
      if (replaceElements) {
        FormSend.replaceNodes(replaceElements)
      }
      if (isResetAfterSuccess) {
        form.reset()
        FormValidation.resetFiles(form)
      }
      if (isShowModals) {
        if (isCloseAllModalsAfterSuccess) {
          Modals.closeAllModals()
        }
        if (modals) {
          if (Array.isArray(modals)) {
            modals.forEach(src => {
              if (src.length) {
                Modals.openHTMLModal({src})
              }
            })
          } else Modals.openHTMLModal({src: modals})
        } else {
          Modals.openInlineModal({src: successModalId})
        }
      }
    }
  }

  /**
   * Обработчик неудачной отправки формы
   * @param cfg{Object} - конфигурация формы
   * @param err{Object} - ответ сервера
   */
  static handleError(cfg, err) {
    const {form, isResetAfterSuccess, successTimeOut = 1000} = cfg
    FormValidation.resetGoogleCaptcha(form)
    if (isResetAfterSuccess) {
      form.reset()
      FormValidation.resetFiles(form)
    }
    Modals.openErrorModal(getLocaleMsg('NETWORK_ERROR'), false, err)
    FormSend.setLoadingState(form, false, successTimeOut)
  }

  /**
   * Обработчик отправки формы вне зависимости от ответа сервера
   * @param form{HTMLFormElement} - форма
   */
  static handleDone(form) {
    FormSend.setLoadingState(form, false)
    FormValidation.resetGoogleCaptcha(form)
  }

  /**
   * Управление состоянием блокировки формы во время отправки данных
   * @param form{HTMLFormElement} - форма
   * @param isLoading{Boolean=} - состояние блокировки
   * @param timeOut{Number=} - задержка перехода в состояние
   */
  static setLoadingState(form, isLoading = true, timeOut = 0) {
    const cfg = Forms.getFormCfg(form)
    const {successTimeOut, handler} = cfg
    timeOut = timeOut || successTimeOut
    const fn = () => {
      (isLoading) ? form.classList.add(stateClasses.loading) : form.classList.remove(stateClasses.loading)
      if (handler && (handler.matches('button') || handler.matches('[type="submit"]'))) {
        handler.disabled = isLoading
      }
    }
    (typeof timeOut === 'number' && timeOut > 0) ? wait(timeOut).then(() => fn()) : fn()
  }

  /**
   * Отправка данных формы на сервер
   * @param form{HTMLFormElement} - форма
   * @param formData{FormData} - данные формы
   * @param onSuccess{Function=} - custom callback для успешной отправки
   * @param onError{Function=} - custom callback для ошибки отправки
   * @param onDone{Function=} - custom callback для действия после отправки
   */
  static send(form, formData, onSuccess, onError, onDone) {
    const cfg = Forms.getFormCfg(form)
    const {handler, isClearErrorsBeforeSend, url, method, isReturnJSON, successTimeOut} = cfg
    const {submitAppend, errorsList} = formEls
    const isFiles = !!form.querySelectorAll(fileAttachInstance).length
    const delayedCallback = (callback) => (successTimeOut && typeof successTimeOut === 'number') ? wait(successTimeOut).finally(() => callback()) : callback()
    formData = formData || FormSend.getFormData(form)
    FormSend.setLoadingState(form)
    if (handler && handler.matches(submitAppend)) {
      const extraData = parseJSON(handler.getAttribute(getAttr(submitAppend)))
      extraData.forEach((item) => Object.entries(item).forEach(([name, value]) => formData.append(name, value.toString())))
    }
    if (isFiles) {
      FormValidation.extendFiles(form, formData)
    }
    if (isClearErrorsBeforeSend) {
      const errorList = form.querySelector(errorsList)
      if (errorList) {
        errorList.remove()
      }
    }
    if (form.hasAttribute('method')) {
      const nativeMethod = form.getAttribute('method')
      if (nativeMethod !== method) {
        cfg.method = nativeMethod
      }
    }
    if (!url) {
      cfg.url = (form.hasAttribute('action')) ? form.getAttribute('action') : window.location.origin + window.location.pathname
    }
    cfg.data = formData
    if (isReturnJSON) {
      cfg.type = 'json'
    }
    makeRequest(cfg).then(resp => {
      if (typeof onSuccess === 'function') {
        onSuccess(resp)
      } else {
        if (isReturnJSON) {
          delayedCallback(() => FormSend.handleSuccess(cfg, resp))
        } else {
          return resp
        }
      }
    }, err => delayedCallback(() => (typeof onError === 'function') ? onError(err) : FormSend.handleError(cfg, err))).finally(() => {
      if (App.debug) {
        console.debug('Form send:', form, cfg, 'data: ', [...formData.entries()])
      }
      (typeof onDone === 'function') ? onDone(cfg, form) : FormSend.handleDone(form)
    })
  }
}

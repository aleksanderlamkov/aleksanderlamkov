import FormValidation from './validation'
import FormSend from './send'
import FormMask from './mask'
import {instance as greCaptchaInstance} from '../../components/grecaptcha'
import {getAttr} from '../utils/getAttr'
import {parseJSON} from '../utils/parseJSON'
import {bubble} from '../utils/bubble'

export const bubbles = {
  formValid: 'form::valid',
  formInvalid: 'form::invalid',
  formSuccess: 'form::successful',
  formError: 'form::error',
  formReplaceNodes: 'form::replaceNodes',
  formAppendNodes: 'form::appendNodes',
  formRemoveNodes: 'form::removeNodes'
}

export const els = {
  form: '[data-js-form]',
  errorsList: '[data-js-form-errors]',
  formInput: '[data-js-input-required]',
  formInputMsgBlock: '[data-js-input-msg-block]',
  formInputMsg: '[data-js-input-msg]',
  formInputPlaceholder: '[data-js-input-placeholder]',
  formBlock: '.form__block',
  formRow: '.form__row',
  formCol: '.form__col',
  customCfg: '[data-js-form-cfg]',
  inputs: 'input, select, textarea',
  submitAppend: '[data-js-form-append-params]',
  skipConfirmation: '[data-js-form-skip-confirmation]',
  greCaptcha: `${greCaptchaInstance} textarea`
}

export const defaultCfg = {
  isPreventSubmitByEnter: true,
  isLiveValidation: false, // true for validation after inputs blur event
  isUseFetch: true, // false for direct sending
  isShowLoader: false, // true for showing loader
  isResetAfterSuccess: false, // false for keeping data after sending
  isClearErrorsBeforeSend: true, // false for keeping errors before sending
  isReturnJSON: true, // false for returning text
  url: false,
  successModalId: '#modal-success', // id of success modal window
  errorModalId: '#modal-error', // id of error modal window
  method: 'POST',  // sending method,
  cache: 'default', // fetch cache param,
  errorsListLayout: `<div ${getAttr(els.errorsList)} class="form__row form__row--large-offset form__row--errors"></div>`, // errors list wrapper tpl
  errorsListPosition: 'afterbegin', // see insertAdjacentElement() positions
  errorsListItemLayout: (errorText) => `<div class="form-error" title="${errorText}"><span>${errorText}</span></div>`,
  isShowModals: true,
  isCloseAllModalsAfterSuccess: true,
  validateOnlySelector: false,
  isIgnoreAutoSend: false,
  successTimeOut: 0,
  isSerializeDisabledInputs: true,
  isSerializeReadOnlyInputs: true,
  isConfirmBeforeSubmit: false,
  handler: null,
  isShowErrorsAsModals: true
}

export const stateClasses = {
  hidden: 'is-hidden',
  invalid: 'is-invalid',
  valid: 'is-valid',
  loading: 'is-loading',
  disabled: 'is-disabled'
}

export default class Forms {
  FormValidation = new FormValidation()

  FormSend = new FormSend()

  FormMask = new FormMask()

  constructor() {
    defaultCfg.url = (typeof window.App.tplPath !== 'undefined') ? `${window.App.tplPath}/ajax/form.php` : false
    this.bindEvents()
  }

  static getFormCfg(form) {
    const isCustomCfg = form.matches(els.customCfg)
    const {id, handler} = form
    return {
      id,
      form,
      ...defaultCfg,
      ...parseJSON(form.getAttribute(getAttr(
        (isCustomCfg) ? els.customCfg : els.form
      ))),
      handler: (typeof handler === 'undefined') ? null : handler
    }
  }

  handleClick(e) {
    const {target} = e
    if (target.matches('[type="submit"]')) {
      const fn = (form) => {
        e.preventDefault()
        form.handler = target
        bubble(form, 'submit')
      }
      const closestForm = target.closest(els.form)
      if (closestForm) {
        fn(closestForm)
      } else if (target.hasAttribute('form')) {
        const delegatedForm = document.getElementById(target.getAttribute('form'))
        fn(delegatedForm)
      }
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => this.handleClick(e))
  }
}

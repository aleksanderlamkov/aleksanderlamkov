import {getLocaleMsg} from '../../utils/getLocaleMsg'
import {getAttr} from '../../utils/getAttr'
import {bubble} from '../../utils/bubble'
import {removeChildNodes} from '../../utils/removeChildNodes'
import {getMapFromObj} from '../../utils/getMapFromObj'
import Forms, {els as formEls, stateClasses, bubbles} from '../'
import {instance as greCaptchaInstance} from '../../../components/grecaptcha'
import {els as fileAttachEls, instance as fileAttachInstance} from '../../../components/file-attach'
import FormSend from '../send'
import {parseJSON} from '../../utils/parseJSON'
import {isEmptyObj} from '../../utils/isEmptyObj'

export const patterns = {
  email: /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  phone: /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/
}

const defaultErrorsKeys = {
  empty: 'EMPTY_FIELD',
  invalid: 'INVALID_FIELD',
  valid: 'VALID_FIELD'
}

export default class FormValidation {
  static rules = getMapFromObj({
    'email': {
      fn: (input) => FormValidation.isValidEmail(input),
      errorKeys: {...defaultErrorsKeys, invalid: 'INVALID_EMAIL'}
    },
    'phone': {
      fn: (input) => FormValidation.isValidPhone(input),
      errorKeys: defaultErrorsKeys
    },
    'checkbox': {
      fn: (input) => FormValidation.isValidCheckbox(input),
      errorKeys: {empty: false, valid: false, invalid: 'EMPTY_CHECKBOX'}
    },
    'radio': {
      fn: (input) => FormValidation.isValidRadio(input),
      errorKeys: {empty: false, valid: false, invalid: 'EMPTY_CHECKBOX'}
    },
    'file': {
      fn: (input) => FormValidation.isValidFile(input),
      errorKeys: {empty: false, invalid: 'INVALID_FILE', valid: false}
    },
    'greCaptcha': {
      fn: (input) => FormValidation.isValidGreCaptcha(input),
      errorKeys: {empty: false, invalid: false, valid: false}
    },
    '': {
      fn: (input) => FormValidation.isValidText(input),
      errorKeys: defaultErrorsKeys
    },
  })

  constructor() {
    this.bindEvents()
  }

  bindEvents() {
    document.addEventListener('submit', (e) => this.handleSubmit(e))
    document.addEventListener('blur', (e) => this.handleInputBlur(e), true)
    document.addEventListener('keydown', (e) => this.handleKeyDown(e))
  }

  handleKeyDown(e) {
    const {target, key} = e
    if (key === 'Enter' && target.closest(formEls.form) && !target.matches('textarea')) {
      const cfg = Forms.getFormCfg(target.closest(formEls.form))
      if (cfg.isPreventSubmitByEnter) {
        e.preventDefault()
      }
    }
  }

  handleSubmit(e) {
    const {target} = e
    if (target.matches(formEls.form)) {
      e.preventDefault()
      FormValidation.validateForm(target)
      return false
    }
  }

  handleInputBlur(e) {
    const {target} = e
    if (target.nodeType !== 9 && target.matches(formEls.formInput)) {
      const form = target.closest(formEls.form)
      if (form && Forms.getFormCfg(form).isLiveValidation) {
        FormValidation.validateForm(form, target)
      }
    }
  }

  /**
   * Валидация формы
   * @param form{HTMLFormElement} - форма
   * @param inputs{NodeList=} - список отдельных полей для проверки
   * @param isIncludeDisabled{Boolean=} - включать в проверку поля с disabled и readonly
   * @param isBubble{Boolean=} - всплытие о результатах валидации
   */
  static validateForm(form, inputs, isIncludeDisabled = false, isBubble = true) {
    const getInputs = () => inputs ? [...inputs].filter(input => !(isIncludeDisabled && (input.disabled || input.readonly))) : null
    const inputsToValidate = getInputs() || FormValidation.getInputsToValidate(form, isIncludeDisabled)
    inputsToValidate.forEach(input => FormValidation.validateInput(input))
    if (isBubble) {
      const {formValid, formInvalid} = bubbles
      bubble(form, FormValidation.isInputsValid(inputsToValidate) ? formValid : formInvalid)
    }
  }

  /**
   * Получение списка полей для валидации внутри формы
   * @param form{HTMLFormElement} - форма
   * @param isIncludeDisabled{Boolean=} - включать в проверку поля с disabled и readonly
   * @return {[]} - возвращает массив полей
   */
  static getInputsToValidate(form, isIncludeDisabled = false) {
    const {validateOnlySelector, id} = Forms.getFormCfg(form)
    const validateEl = (validateOnlySelector) ? form.querySelector(validateOnlySelector) : form
    const formInputs = [...validateEl.querySelectorAll(`${formEls.formInput}, ${formEls.greCaptcha}`)]
    const outInputs = (id) ? [...document.querySelectorAll(`${formEls.formInput}[form="${id}"]`)] : []
    return formInputs.concat(outInputs).filter(input => !(isIncludeDisabled && (input.disabled || input.readonly)))
  }

  /**
   * "Тихо" проверяет валидность формы и возвращает результат
   * @param form{HTMLFormElement} - форма
   * @param isIncludeDisabled{Boolean=} - включать в проверку поля с disabled и readonly
   * @param additionalInputs{Array=} - массив дополнительных полей для проверки
   * @return {Boolean}
   */
  static isFormValid(form, isIncludeDisabled = false, additionalInputs = []) {
    const inputsToValidate = FormValidation.getInputsToValidate(form, isIncludeDisabled).concat(additionalInputs)
    return FormValidation.isInputsValid(inputsToValidate)
  }

  /**
   * Получает тип валидации поля
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   * @return {string}
   */
  static getInputValidationType(input) {
    let validationType = ''
    const {greCaptcha, formInput} = formEls
    if (input.matches(greCaptcha)) {
      validationType = 'greCaptcha'
    } else if (input.value) {
      validationType = input.getAttribute(getAttr(formInput))
    }
    return validationType
  }

  /**
   * Получает метод валидации для поля
   * @param validationType{String=}
   * @return {Object}
   */
  static getValidationRuleForType(validationType = '') {
    return FormValidation.rules.has(validationType) ? FormValidation.rules.get(validationType) : FormValidation.rules.get('')
  }

  /**
   * Добавление файлов, прикрепленных с помощью коллекции fileAttach
   * @param form{HTMLFormElement} - форма
   * @param formData{FormData=} - данные формы
   */
  static extendFiles(form, formData) {
    formData = formData || FormSend.getFormData(form)
    const files = form.querySelectorAll(fileAttachInstance)
    files.forEach((fileElem) => {
      const instance = App.FileAttachCollection.getByDOMElement(fileElem)
      if (instance) {
        const {input, isMultiple} = instance
        const name = input.getAttribute('name')
        if (isMultiple) {
          formData.delete(name)
          instance.files.forEach(file => {
            formData.append(name, file.file)
          })
        }
      }
    })
  }

  /**
   * Сброс файлов, прикрепленных с помощью коллекции fileAttach
   * @param form{HTMLFormElement} - форма
   */
  static resetFiles(form) {
    const files = form.querySelectorAll(fileAttachInstance)
    files.forEach(fileElem => {
      const fileAttach = App.FileAttachCollection.getByDOMElement(fileElem)
      if (fileAttach) {
        fileAttach.clear()
      }
    })
  }

  /**
   * Сброс Google Captcha, находящейся в форме посредством коллекции GoogleCaptchaCollection
   * @param form{HTMLFormElement} - форма
   */
  static resetGoogleCaptcha(form) {
    const node = form.querySelector(greCaptchaInstance)
    if (node) {
      const instance = App.GoogleCaptchaCollection.getByDOMElement(node)
      if (instance && instance.states.render) {
        instance.reset()
      }
    }
  }

  /**
   * "Тихо" проверяет валидность поля
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   * @param customType{String=} - желаемый тип валидации
   * @param isDetailResult{Boolean=} - детальный отчет о валидации
   * @return {{reason: (string), isValid: *}|*}
   */
  static isInputValid(input, customType = '', isDetailResult = false) {
    const {type, value} = input
    const isSpecialType = type === 'checkbox' || type === 'radio' || type === 'file' || input.matches(formEls.greCaptcha)
    const validationType = customType || (value || isSpecialType) ? FormValidation.getInputValidationType(input) : ''
    const validationRule = FormValidation.getValidationRuleForType(validationType)
    const isValid = validationRule.fn(input)
    return isDetailResult ? {
      isValid,
      reason: isValid ? 'valid' : (validationType === '') ? 'empty' : 'invalid'
    } : isValid
  }

  /**
   * "Тихо" проверяет массив полей
   * @param inputs{Array} - массив полей
   * @return {Boolean}
   */
  static isInputsValid(inputs = []) {
    return inputs.every(input => FormValidation.isInputValid(input))
  }

  /**
   * Валидация Google Captcha
   * @param textarea{HTMLTextAreaElement} - скрытое textarea-поле GreCaptcha
   * @return Boolean
   */
  static isValidGreCaptcha(textarea) {
    const instance = App.GoogleCaptchaCollection.getByDOMElement(textarea.closest(greCaptchaInstance))
    return window.App.isDebug ? true : (instance ? instance.state.verify : false)
  }

  /**
   * Валидация email
   * @param input{HTMLInputElement} - поле
   * @return Boolean
   */
  static isValidEmail(input) {
    const {value} = input
    return patterns.email.test(value)
  }

  /**
   * Валидация номера телефона
   * @param input{HTMLInputElement} - поле
   * @return Boolean
   */
  static isValidPhone(input) {
    const cleanPhone = input.value.replaceAll(/\s/g, '')
    return patterns.phone.test(cleanPhone) && (cleanPhone.length === 16)
  }

  /**
   * Валидация radio input
   * @param input{HTMLInputElement} - поле типа "radio"
   * @return Boolean
   */
  static isValidRadio(input) {
    const {name} = input
    return (name) ? [...document.querySelectorAll(`[name="${name}"]`)].some(item => item.checked) : false
  }

  /**
   * Валидация файла
   * @param input{HTMLInputElement} - поле типа "file"
   * @return Boolean
   */
  static isValidFile(input) {
    const isInputValid = !!(input.files.length && input.value)
    const instance = input.closest(fileAttachEls.instance)
    if (instance) {
      const inst = App.FileAttachCollection.getByDOMElement(instance)
      return inst ? !!inst.files.length : isInputValid
    } else {
      return isInputValid
    }
  }

  /**
   * Валидация checkbox
   * @param input{HTMLInputElement} - поле типа "checkbox"
   * @return Boolean
   */
  static isValidCheckbox(input) {
    return input.checked
  }

  /**
   * Валидация текстового поля
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   * @return Boolean
   */
  static isValidText(input) {
    const {value} = input
    return !!(value.trim().length)
  }

  /**
   * Управление блоком ошибки у поля ввода
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   * @param msgCodes{Object=} - объект с сообщениями об ошибке или успехе
   * @param reason{String} - тип ошибки или успешного сообщения
   */
  static setInputMsg(input, msgCodes = {}, reason = 'valid') {
    const msgBlock = FormValidation.getInputMsgBlock(input)
    if (msgBlock) {
      if (reason in msgCodes && msgCodes[reason] !== false) {
        msgBlock.innerHTML = `<span class="${reason === 'valid' ? 'is-valid' : 'is-invalid'}">${getLocaleMsg(msgCodes[reason])}</span>`
      }
    }
  }

  /**
   * Получает блок с сообщениями для поля
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   * @return {Element|null}
   */
  static getInputMsgBlock(input) {
    const {formBlock, formInputMsgBlock} = formEls
    const block = input.closest(formBlock) || input.parentNode
    return (block) ? block.querySelector(formInputMsgBlock) : null
  }

  /**
   * Получает коды сообщений для поля
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   * @param validationType{String} - тип валидации
   * @return {Object}
   */
  static getInputErrorCodes(input, validationType) {
    validationType = validationType || FormValidation.getInputValidationType(input)
    const errorAttr = getAttr(formEls.formInputMsg)
    const errors = FormValidation.getValidationRuleForType(validationType).errorKeys
    const getErrors = () => {
      let customErrors = errors
      if (input.hasAttribute(errorAttr)) {
        const custom = parseJSON(input.getAttribute(errorAttr))
        if (!isEmptyObj(custom) && 'empty' in custom && 'invalid' in custom) {
          customErrors = custom
        }
      }
      return customErrors
    }
    return getErrors()
  }

  /**
   * Очищает блок с сообщениями поля
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   */
  static clearInputMsgBlock(input) {
    const errorBlock = FormValidation.getInputMsgBlock(input)
    if (errorBlock) {
      removeChildNodes(errorBlock)
    }
  }

  /**
   * Валидация поля ввода
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле ввода
   */
  static validateInput(input) {
    const validationType = FormValidation.getInputValidationType(input)
    const msgCodes = FormValidation.getInputErrorCodes(input, validationType)
    const {isValid, reason} = FormValidation.isInputValid(input, validationType, true)
    FormValidation.clearInputMsgBlock(input)
    FormValidation.setInputValidState(input, isValid, msgCodes, reason)
  }

  /**
   * Управление состоянием ошибки или корректности поля ввода
   * @param input{HTMLInputElement||HTMLTextAreaElement} - поле
   * @param isValid{Boolean=} - валидность поля
   * @param msgCodes{Object=} - объект с сообщениями об ошибке или успехе
   * @param reason{String=} - причина успешной или неуспешной валидации
   * @return Boolean
   */
  static setInputValidState(input, isValid = true, msgCodes = defaultErrorsKeys, reason = 'valid') {
    FormValidation.setInputMsg(input, msgCodes, reason)
    const {invalid, valid} = stateClasses
    const isMatches = (selector) => input.matches(selector)
    const getContainer = (selector) => input.closest(selector) || input
    const setClass = (node = input) => {
      node.classList.remove(isValid ? invalid : valid)
      node.classList.add(isValid ? valid : invalid)
    }
    let container = input
    switch (true) {
      case isMatches(fileAttachEls.input):
        container = getContainer(fileAttachEls.instance)
        break
      case isMatches(formEls.greCaptcha):
        container = getContainer(greCaptchaInstance)
        break
    }
    setClass(container)
  }
}

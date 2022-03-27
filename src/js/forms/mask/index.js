import IMask from 'imask'
import {getAttr} from '../../utils/getAttr'
import {parseJSON} from '../../utils/parseJSON'
import {isEmptyObj} from '../../utils/isEmptyObj'
import {getMapFromObj} from '../../utils/getMapFromObj'
import Dispatcher from '../../generic/dispatcher'

export const instance = '[data-js-input-mask]'

export default class FormMask {

  static patterns = getMapFromObj({
    'phone': {
      mask: '+{7} (000) 000-00-00'
    },
    'date': {
      mask: Date
    },
    'date-period': {
      mask: 'from - to',
      blocks: {
        from: {
          mask: Date,
        },
        to: {
          mask: Date,
        }
      }
    }
  })

  constructor() {
    FormMask.init()
    this.bindEvents()
  }

  bindEvents() {
    Dispatcher.initiator = {
      selector: instance,
      initiator: (context) => FormMask.init(context),
      getCollection: () => []
    }
  }

  static getPattern(type) {
    return FormMask.isPatternExist(type) ? {...FormMask.patterns.get(type), type} : null
  }

  static isPatternExist(type) {
    return FormMask.patterns.has(type)
  }

  static getMaskCfg(input, customCfg = {}) {
    const attrContent = input.getAttribute(getAttr(instance))
    if (FormMask.isPatternExist(attrContent)) {
      return {
        ...FormMask.getPattern(attrContent),
        ...customCfg
      }
    } else {
      const userCfg = parseJSON(attrContent)
      if (userCfg.type && FormMask.isPatternExist(userCfg.type)) {
        return {
          ...FormMask.getPattern(userCfg.type),
          ...userCfg,
          ...customCfg
        }
      } else {
        console.debug('Missing \'type\' prop in custom mask params or type are not defined in \'patterns\': ', input, {...userCfg, ...customCfg})
        return {}
      }
    }
  }

  static init(context = document) {
    context.querySelectorAll(instance).forEach(input => FormMask.createInstance(input))
  }

  static updateOptions(input, options = {}, isUpdateValue = true) {
    const maskInstance = FormMask.getInstance(input)
    if (maskInstance) {
      maskInstance.updateOptions(options)
      if (isUpdateValue) {
        FormMask.updateValue(input, input.value)
      }
    } else if (input.matches(instance)) {
      const cfg = FormMask.getMaskCfg(input, options)
      FormMask.createInstance(input, cfg)
    }
  }

  static getInstance(input) {
    return (typeof input.iMask === 'undefined') ? null : input.iMask
  }

  static createInstance(input, options) {
    options = options || FormMask.getMaskCfg(input)
    if (isEmptyObj(options)) {
      console.debug('Missing options for mask input', input)
    } else {
      if (FormMask.getInstance(input) === null) {
        input.iMask = new IMask(input, options)
        if (options.on) {
          Object.entries(options.on).forEach(([event, callback]) => {
            input.addEventListener(event, (e) => callback(e, input.iMask))
          })
        }
      } else {
        FormMask.updateValue(input, input.value)
      }
    }
  }

  static destroyInstance(input) {
    const instance = FormMask.getInstance(input)
    if (instance) {
      instance.destroy()
    }
  }

  static updateValue(input, value) {
    const maskInstance = FormMask.getInstance(input)
    if (maskInstance) {
      if (value === '') {
        maskInstance.masked.reset()
        maskInstance.typedValue = ''
      } else if (!value) {
        maskInstance.updateValue()
        maskInstance.value = input.value
      } else {
        maskInstance.updateValue()
        maskInstance.value = value.toString()
      }
    }
  }
}

import {getAttr} from '../utils/getAttr'

/**
 * Единый наблюдатель для изменений документа для динамического добавления или удаления элементов коллекций
 */
export default class Observer {
  /**
   * Селектор элементов, исключаемых из наблюдения
   * @type {string}
   */
  static excludedSelector = '[data-js-no-observe]'

  /**
   * Массив наименований тегов, исключаемых из наблюдения
   * @type {Array}
   */
  static excludedTags = ['iframe', 'script', 'svg', 'ymaps', 'object', 'img']

  /**
   * Селектор элементов, включаемых в наблюдение (вне зависимости от попадания в excludedTags)
   * @type {string}
   */
  static includedSelector = '[data-js-force-observe]'

  /**
   * Целевой элемент для наблюдения
   * @type {HTMLElement}
   */
  static target = document.body

  /**
   * Конфигурация наблюдателя
   * @type {MutationObserverInit}
   */
  static observerCfg = {
    attributes: false,
    childList: true,
    subtree: true,
    characterData: false,
    attributeOldValue: false,
    characterDataOldValue: false
  }

  /**
   * Карта callback-функций
   * @type {Map}
   */
  static callbacks = new Map()

  /**
   * Наблюдатель
   * @type {MutationObserver}
   */
  static collectionObserver = new MutationObserver(Observer._collectionObserveCallback)

  constructor() {
    if (Observer.callbacks.size) {
      Observer.connect()
    }
  }

  /**
   * Включение наблюдателя
   */
  static connect() {
    const {target, observerCfg} = Observer
    Observer.collectionObserver.observe(target, observerCfg)
  }

  /**
   * Управление состоянием видимости для наблюдателя у конкретного элемента
   * @param el{Element} - DOM-элемент
   * @param isObservable{Boolean=} - состояние
   */
  static setElObservableState(el, isObservable = true) {
    const {includedSelector, excludedSelector} = Observer
    const included = getAttr(includedSelector)
    const excluded = getAttr(excludedSelector)
    el.setAttribute(isObservable ? included : excluded, '')
    el.removeAttribute(isObservable ? excluded : included)
  }

  /**
   * Проверка на исключение из наблюдения
   * @param mutationList{MutationRecord} - запись из наблюдателя
   * @return {Boolean}
   */
  static isExcludedMutationRecord(mutationList) {
    const isExcludedTag = (tagName) => Observer.excludedTags.includes(tagName.toLowerCase())
    const isExcludedEls = (nodes = []) => nodes.length && [...nodes].every(el => {
      const {nodeType, tagName} = el
      return nodeType === 1 && !el.closest(Observer.includedSelector) && isExcludedTag(tagName)
    })
    return [...mutationList].some(({target, addedNodes = [], removedNodes = []}) => {
      const {nodeType, tagName} = target
      return isExcludedEls(addedNodes) || isExcludedEls(removedNodes) || (nodeType === 1 && (target.closest(Observer.excludedSelector) || isExcludedTag(tagName)))
    })
  }

  /**
   * Callback-функция, вызываемая при изменениях содержимого документа
   * @type {MutationCallback}
   * @param mutationsList{MutationRecord} - принимает список массив мутауий
   * @private
   */
  static _collectionObserveCallback(mutationsList) {
    if (!Observer.isExcludedMutationRecord(mutationsList)) {
      Observer.callbacks.forEach(callback => callback())
    }
  }

  /**
   * Проверка, добавлен для callback для указанного селектора класса
   * @type Boolean
   * @param selector{String} - селектор класса
   * @return {boolean}
   */
  static isCallbackExist(selector) {
    return Observer.callbacks.has(selector)
  }

  /**
   * Установка callback для класса
   * @param selector{string} - селектор класса
   * @param callback{function} - callback-функция - как правило, инициатор класса this.init()
   */
  static set subscribe({selector, callback}) {
    if (typeof selector === 'string' && typeof callback === 'function' && !Observer.isCallbackExist(selector)) {
      Observer.callbacks.set(selector, callback)
    }
  }

  /**
   * Удаление callback по селектору класса
   * @param selector{String} - селектор класса
   */
  static set unsubscribe(selector) {
    if (typeof selector === 'string' && Observer.isCallbackExist(selector)) {
      Observer.callbacks.delete(selector)
    }
  }

  /**
   * Отключение наблюдателя
   */
  static disconnect() {
    this.collectionObserver.disconnect()
    Observer.callbacks.clear()
  }
}

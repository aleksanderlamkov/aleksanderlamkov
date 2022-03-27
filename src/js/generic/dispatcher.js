import {onContentLoaded} from './eventing'

/**
 * Единый слушатель обновления контента документа
 */
export default class Dispatcher {
  /**
   * Карта callback-функций
   * @type {Map}
   */
  static initiators = new Map()

  constructor() {
    this.bindEvents()
  }

  /**
   * Прослушивание событий изменения контента
   */
  bindEvents() {
    onContentLoaded((e) => Dispatcher.initiators.forEach(({initiator}) => initiator(e.detail.content)))
  }

  /**
   * Проверка на существование callback в карте по селектору класса
   * @param selector{String} - селектор класса
   * @return {boolean}
   */
  static isInitiatorExist(selector) {
    return Dispatcher.initiators.has(selector)
  }

  /**
   * Установка callback-функции в карту
   * @param selector{String} - селектор класса
   * @param initiator{Function} - callback-функция
   * @param getCollection{Function=} - функция доступа к коллекции элементов
   */
  static set initiator({selector, initiator, getCollection = () => []}) {
    if (!Dispatcher.isInitiatorExist(selector)) {
      Dispatcher.initiators.set(selector, {initiator, getCollection})
    }
  }

  /**
   * Вызов общего метода для всех коллекций, инициализированных внутри указанного элемента
   * @param el{HTMLElement=} - элемент
   * @param action{String} - вызываемый метод класса
   */
  static dispatchAction(el = document.body, action) {
    Dispatcher.initiators.forEach(({getCollection = () => []}) => {
      getCollection().forEach(instance => {
        if (el.contains(instance.instance) && typeof instance[action] === 'function') {
          instance[action]()
        }
      })
    })
  }

  /**
   * Удаление callback-функции из карты по селектору класса
   * @param selector{String} - селектор класса
   */
  static removeInitiator(selector) {
    if (Dispatcher.isInitiatorExist(selector)) {
      Dispatcher.initiators.delete(selector)
    }
  }

  /**
   * Очистка карты
   */
  static clear() {
    Dispatcher.initiators.clear()
  }
}

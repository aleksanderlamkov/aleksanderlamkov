import Dispatcher from './dispatcher'
import Observer from './observer'
import {isNode} from '../utils/isNode'

export default class Collection {
  /**
   * Коллекция экземпляров
   * @type {Array}
   * @private
   */
  _collection = []

  /**
   * Инициализация коллекции
   * @param selector{String} - селектор для идентификации класса
   * @param _class{Function} - класс, добавляемый в коллекцию
   * @param isAutoInit{Boolean=} - автоматический вызов методов init и bindEvents (подходит для большинства обычных коллекций)
   */
  constructor(selector, _class, isAutoInit = true) {
    if (typeof selector === 'string' && typeof _class === 'function') {
      this.collectionObserverSelector = selector
      this.collectionObserverClass = _class
      Observer.subscribe = {
        selector,
        callback: this.collectionObserveCallback.bind(this)
      }
      if (isAutoInit) {
        this.init()
        this.bindEvents()
      }
    } else {
      Collection._error('Selector or class are not defined while extending', this)
    }
  }

  /**
   * Callback для добавления в коллекцию
   * @param context{Object} - контекст, в котором будут искаться новые элементы для коллекции
   */
  init(context = document) {
    context.querySelectorAll(this.collectionObserverSelector).forEach(el => this.addToCollection(el))
  }

  /**
   * Подписка на обновления страницы для вызова callback (по умолчанию через Dispatcher)
   */
  bindEvents() {
    Dispatcher.initiator = {
      selector: this.collectionObserverSelector,
      initiator: (context) => this.init(context),
      getCollection: () => this.collection || []
    }
  }

  /**
   * Информирование об ошибках
   * @param msg{String} - сообщение
   * @param obj{Object} - объект с информацией
   * @private
   */
  static _error(msg, obj) {
    console.error(`[Collection]: ${msg}`, obj)
  }

  /**
   * Добавление экземпляра класса в коллекцию. По-умолчанию проверяет, существует ли экземпляр с таким instance. Если существует, то добавления не происходит
   * @param newClass{Function}
   */
  set collection(newClass) {
    const {instance} = newClass
    if (instance && !instance.isInCollection) {
      const itemInCollection = this.getByDOMElement(instance)
      if (!itemInCollection) {
        this.beforeAddCallback(instance)
        this._collection = [...this._collection, newClass]
        this.afterAddCallback(instance)
      }
    } else {
      Collection._error('Missed instance field for item: ', newClass)
    }
  }

  /**
   * Получение актуальной коллекции
   * @return {Array}
   */
  get collection() {
    return this._collection
  }

  /**
   * Поиск внутри коллекции по DOM-элементу путем сверки поля instance
   * @param el{Element}
   * @returns {Function}
   */
  getByDOMElement(el) {
    return this.collection.find(item => item.instance === el)
  }

  /**
   * Callback, вызываемый перед удалением их коллекции
   * @param el{Element} - удаляемый из коллекции элемент
   */
  beforeRemoveCallback(el) {
  }

  /**
   * Callback, вызываемый после удаления их коллекции
   * @param el{Element} - удалённый из коллекции элемент
   */
  afterRemoveCallback(el) {
  }

  /**
   * Callback, вызываемый перед добавлением в коллекцию
   * @param el{Element} - добавляемый в коллекцию элемент
   */
  beforeAddCallback(el) {
  }

  /**
   * Callback, вызываемый после добавления в коллекцию
   * @param el{Element} - добавленный в коллекцию элемент
   */
  afterAddCallback(el) {
  }

  /**
   * Удаление из коллекции по экземпляру класса
   * @param collectionClass{Function}
   */
  removeFromCollection(collectionClass) {
    const {instance} = collectionClass
    if (instance) {
      this.beforeRemoveCallback(instance)
      const collectionItemIndex = this.collection.indexOf(collectionClass)
      this._collection.splice(collectionItemIndex, 1)
      this.setElementState(instance, false)
      this.afterRemoveCallback(instance)
    }
  }

  /**
   * Callback, вызываемый при изменении содержимого страниц, поступающих через Watcher
   */
  collectionObserveCallback() {
    this.collectionObserveRemoving()
    this.collectionObserveAdding()
  }

  /**
   * Проверка отсутствия DOM-элементов коллекции на странице после изменений и удаление пустых классов
   */
  collectionObserveRemoving() {
    this.collection.forEach(collectionItem => {
      if (!Observer.target.contains(collectionItem.instance)) {
        this.removeFromCollection(collectionItem)
      }
    })
  }

  /**
   * Маркировка DOM-элементов как инициализированных либо удаленных из коллекции
   * @param el{Element} - DOM-элемент
   * @param isInCollection{Boolean=} - маркер
   */
  setElementState(el, isInCollection = true) {
    el.isInCollection = isInCollection
  }

  /**
   * Добавление элемента или класса в коллекцию
   * @param item(Element||Function}
   * @param params{Object=} - любые остаточные параметры
   * @return {item||null} - возвращает экземпляр класса, если был найден
   */
  addToCollection(item, params = {}) {
    const el = isNode(item) ? item : item.instance
    if (el) {
      if (!this.getByDOMElement(el) && !el.isInCollection) {
        const collectionClass = (item instanceof this.collectionObserverClass) ? item : new this.collectionObserverClass(el, params)
        collectionClass.instance = collectionClass.instance || el
        this.collection = collectionClass
        this.setElementState(el)
        return collectionClass
      } else {
        return null
      }
    } else {
      Collection._error('Can\'t find instance of item: ', item)
      return null
    }
  }

  /**
   * Проверка присутствия DOM-элементов коллекции на странице после изменений и добавление новых классов
   */
  collectionObserveAdding() {
    [...Observer.target.querySelectorAll(this.collectionObserverSelector)].forEach(el => this.addToCollection(el))
  }
}

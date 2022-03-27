export const ajaxContentLoadedEvent = 'contentLoaded'

/**
 * Класс для событий
 * Пример подписки на успешную инициализацию класса:
 * document.addEventListener('Icons', (e) => {
 *  console.debug(e);
 * });
 */
export default class Eventing {
  event

  loaded = false

  constructor(eventName) {
    this.event = document.createEvent('Event')
    this.event.initEvent(`${eventName}ModuleLoaded`, true, true)
  }

  preInit() {
  }

  postInit() {
  }

  markAsInit() {
    this.loaded = true
    document.dispatchEvent(this.event)
  }
}

/**
 * Функция для инициализации события выполнения запроса (AJAX, Fetch, etc.)
 * @param detail{Object}
 */
export const dispatchContentLoaded = (detail) => {
  document.dispatchEvent(
    new CustomEvent(ajaxContentLoadedEvent, {detail})
  )
}

/**
 * Функция для подписки на событие выполнения запроса (AJAX, Fetch, etc.)
 * @param callback{Function}
 */
export const onContentLoaded = (callback) => {
  document.addEventListener(ajaxContentLoadedEvent, e => callback(e))
}

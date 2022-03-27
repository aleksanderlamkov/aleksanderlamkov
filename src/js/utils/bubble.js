/**
 * Всплывающее событие
 * @param targetEl{Node|String} - целевой элемент, на котором будет всплытие
 * @param name{String} - название события
 * @param detail{Object=} - объект с дополнительной информацией
 * @param params{Object=} - параметры всплытия
 */
export const bubble = (targetEl = document, name, detail = null, params = {
  cancelable: true,
  bubbles: true
}) => {
  params.detail = detail || null
  if (typeof targetEl === 'string') {
    targetEl = document.querySelector(targetEl)
  }
  const event = new CustomEvent(name, params)
  targetEl.dispatchEvent(event)
}

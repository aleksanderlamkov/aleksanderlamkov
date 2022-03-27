/**
 * Динамическая обертка элемента другим элементом
 * @param el{Node} - исходный элемент
 * @param wrap{String} - HTML-обертка (допустима вложенность)
 * @param isReturn{Boolean} - возвращение нового узла
 */
export const wrap = (el, wrap, isReturn = false) => {
  const temp = document.createElement('div')
  const parent = el.parentNode
  const insertWhere = el.previousSibling
  let target
  temp.innerHTML = wrap
  target = temp.firstChild
  while (target.firstChild) {
    target = target.firstChild
  }
  target.appendChild(el)
  parent.insertBefore(temp.firstChild, (insertWhere ? insertWhere.nextSibling : parent.firstChild))
  if (isReturn) {
    return target
  }
}

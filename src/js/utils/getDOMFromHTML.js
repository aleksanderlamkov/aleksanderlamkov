/**
 * Возвращает DOM элемент из HTML-строки
 * @param htmlString{HTMLDivElement} - HTML-строка
 * @param onlyFirstChild{Boolean} - вернуть первый элемент или все
 * @return node{Element}
 */
export const getDOMFromHTML = (htmlString, onlyFirstChild = true) => {
  const template = document.createElement('div')

  template.innerHTML = htmlString
  return onlyFirstChild ? template.firstElementChild : [...template.children]
}

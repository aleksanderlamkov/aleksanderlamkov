
/**
 * Получение индекса элемента
 * @param el{Element} - исходный элемент
 * @param closestParent{String=} - ближайший родительский элемент, по которому можно выполнить поиск
 * @return Number
 */
export const getNodeIndex = (el, closestParent) => {
  return [...((closestParent) ? el.closest(closestParent) : el.parentNode.children) ].indexOf(el);
}

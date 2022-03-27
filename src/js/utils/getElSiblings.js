
/**
 * Получение всех узлов элемента, лежащих на одном уровне с заданным
 * @param elem{Node} - DOM-узел для поиска
 * @return Array
 */
export const getSiblings = (elem) => {
  let siblings = [];
  let sibling = elem.parentNode.firstChild;
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling
  }
  return siblings;
};

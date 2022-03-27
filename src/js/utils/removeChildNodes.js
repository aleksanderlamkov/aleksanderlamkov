
/**
 * Удаляет все дочерние узлы из элемента
 * @param node{Node} - очищаемый DOM-элемент
 */
export const removeChildNodes = (node) => {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}
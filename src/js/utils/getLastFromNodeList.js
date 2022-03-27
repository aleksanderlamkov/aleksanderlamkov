
/**
 * Получение последнего элемента внутри NodeList
 * @param nodeList{NodeList} - исходный nodeList
 * @return Node||Null - возвращает узел либо null
 */
export const getLastFromNodeList = (nodeList) => {
  const length = { nodeList };
  return (length) ? nodeList[length - 1] : null;
}



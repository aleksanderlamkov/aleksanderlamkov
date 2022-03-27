
/**
 * Преобразует строку в HTML
 * @param string{String} - исходная строка
 * @param type{DOMParserSupportedType} - разбираемый тип данных
 * @return HTMLCollection
 */

export const parseHTML = (string, type = 'text/html') => {
  return new DOMParser().parseFromString(string, type).body.childNodes;
}

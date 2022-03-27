import { parseJSON } from './parseJSON';
import { getAttr } from './getAttr';

/**
 * Получение конфига элемента
 * @param instance{HTMLElement} - DOM-узел
 * @param selector{String} - селектор
 * @param defaultCfg{Object=} - объект с конфигурацией по умолчанию
 * @return Object
 */
export const getCfg = (instance, selector, defaultCfg = {}) => {
  return {
    ...defaultCfg,
    ...parseJSON(instance.getAttribute(getAttr(selector)))
  }
}

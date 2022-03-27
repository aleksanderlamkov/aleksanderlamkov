import { parseJSON } from './parseJSON'

/**
 * Получение текущего языка сайта
 * @return String
 */
export const getCurrentLang = () => {
  return (window.App && window.App.lang) ? window.App.lang : 'ru';
}

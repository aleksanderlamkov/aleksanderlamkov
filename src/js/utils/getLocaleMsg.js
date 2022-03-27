import {getCurrentLang} from './getCurrentLang'
import {getByPropFromObj} from './getByPropFromObj'
import {locales} from '../locales'

/**
 * Получение сообщения в зависимости от языка сайта
 * @param key{String} - ключ
 * @param lang{String=} - наименование языка
 * @return String
 */
export const getLocaleMsg = (key, lang = getCurrentLang()) => {
  const msg = getByPropFromObj(locales, key)
  if (msg.length && msg[0].hasOwnProperty(lang)) {
    return msg[0][lang]
  } else {
    console.debug(`Locale key "${key}" not found for lang "${lang}"`)
    return ''
  }
}

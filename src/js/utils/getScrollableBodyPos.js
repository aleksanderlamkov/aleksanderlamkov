
import { getScrollableBody } from './getScrollableBody'

/**
 * Получение текущей позиции скроллинга
 * @return Object - возвращает объект с координатами left и top
 */
export const getScrollableBodyPos = () => {
  const el = getScrollableBody();
  return {
    left: (window.pageXOffset || el.scrollLeft) - (el.clientLeft || 0),
    top: (window.pageYOffset || el.scrollTop)  - (el.clientTop || 0)
  }
}

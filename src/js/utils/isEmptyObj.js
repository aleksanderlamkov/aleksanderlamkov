/**
 * Проверка на пустоту объекта
 * @param obj{Object} - объект для проверки
 * @return Boolean
 */
export const isEmptyObj = (obj) => {
  return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

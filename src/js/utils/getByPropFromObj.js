/**
 * Получение определенного ключа внутри объекта
 * @param o{Object} - объект для поиска
 * @param prop{String} - свойство, которое нужно найти
 * @return Array
 */
export const getByPropFromObj = (o, prop) => {
  return (res => (JSON.stringify(o, (key, value) => (key === prop && res.push(value), value)), res))([]);
}


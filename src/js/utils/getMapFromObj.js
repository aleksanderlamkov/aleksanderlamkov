/**
 * Преобразует Object в Map
 * @param obj{Object} - исходный объект
 * @return Map
 */
export const getMapFromObj = (obj) => {
  const map = new Map()
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value)
  })
  return map
}

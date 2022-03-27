
/**
 * Получение атрибута из селектора по атрибуту
 * @param attr{String} - название атрибута
 * @return String - возвращает строку
 */
export const getAttr = (attr) => {
    return attr.substring(1, attr.length - 1)
}

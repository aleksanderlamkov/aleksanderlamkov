
/**
 * Проверка на совпадение медиа-запроса
 * @param query{string} - @media-query
 * @return Boolean
 */
export const isMedia = (query) => {
    return window.matchMedia(query).matches;
}

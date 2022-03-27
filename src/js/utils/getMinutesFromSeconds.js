
/**
 * Получение форматированной строки минуты:секунды из секунд
 * @param seconds{String|Number} - секунды (строка или число)
 * @return String - возвращает строку в формате минут:секунд (прим.: 1:59)
 */
export const getMinutesFromSeconds = (seconds) => {
    return Math.floor(+seconds / 60) + ':' + ('0' + Math.floor(+seconds % 60)).slice(-2);
}

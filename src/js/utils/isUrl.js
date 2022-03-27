
/**
 * Проверка, является ли указанная строка URL-адресом
 * @param str{String} - проверяемая строка
 * @return Boolean
 */
export const isUrl = (str) => {
  const res = str.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
}

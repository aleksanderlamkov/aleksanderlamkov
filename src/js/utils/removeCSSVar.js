
/**
 * Удаляет CSS3-переменную у элемента
 * @param name{String} - название переменной
 * @param el{Element} - элемент, содержащий переменную
 * @return Object
 */
export const removeCSSVar = (name, el = document.documentElement) => {
  el.style.removeProperty(name);
}

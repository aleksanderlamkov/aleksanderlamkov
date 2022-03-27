
/**
 * Преобразование объекта в интерфейс FormData
 * @param obj{Object} - исходный объект
 * @param fd{FormData=} - существующая или новая formData
 * @param excludedNames{Array} - массив с именами-исключениями из добавления
 * @return FormData
 */

export const getFormDataFromObj = (obj = {}, fd = new FormData(), excludedNames = []) => {
  Object.entries(obj).forEach((pair) => {
    if(!excludedNames.includes(pair[0])) {
      fd.set(pair[0], pair[1].toString())
    }
  });
  return fd;
}

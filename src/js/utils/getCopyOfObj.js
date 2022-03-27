
/**
 * Создаёт копию заданного без указателя к исходному
 * @param mainObj{Object} - копируемый объект
 * @return Object
 */
export const getCopyOfObj = (mainObj) => {
  const objCopy = {};
  let key;
  for (key in mainObj) {
    if(mainObj.hasOwnProperty(key)) {
      objCopy[key] = mainObj[key];
    }
  }
  return objCopy;
}

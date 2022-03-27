
/**
 * Глубокое слияние объектов или массивов
 * @param target{Object} - выбранный объект
 * @param source{Object} - исходный объект
 * @param isMergingArrays{Boolean=} - слияние массивов внутри объектов
 * @return Object
 */
export const deepMerge = (target, source, isMergingArrays = false) => {
  target = ((obj) => {
    let cloneObj;
    try {
      cloneObj = JSON.parse(JSON.stringify(obj));
    } catch(err) {
      cloneObj = Object.assign({}, obj);
    }
    return cloneObj;
  })(target);

  const isObject = (obj) => obj && typeof obj === 'object';

  if (!isObject(target) || !isObject(source))
    return source;

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue))
      if (isMergingArrays) {
        target[key] = targetValue.map((x, i) => sourceValue.length <= i
          ? x
          : deepMerge(x, sourceValue[i], isMergingArrays));
        if (sourceValue.length > targetValue.length)
          target[key] = target[key].concat(sourceValue.slice(targetValue.length));
      } else {
        target[key] = targetValue.concat(sourceValue);
      }
    else if (isObject(targetValue) && isObject(sourceValue))
      target[key] = deepMerge(Object.assign({}, targetValue), sourceValue, isMergingArrays);
    else
      target[key] = sourceValue;
  });

  return target;
};

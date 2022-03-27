
/**
 * Получение строки с параметрами из формы
 * @param form{HTMLFormElement} - HTML-элемент (форма)
 * @param isAddDisabled{Boolean=} - обработка выключенных input
 * @param exclude{Array=} - массив имён-исключений
 * @return String
 */
export const serialize = (form, isAddDisabled = true, exclude = []) => {
  const fixedEncodeURIComponent = (str) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
  const serialized = [];
  for (let i = 0; i < form.elements.length; i++) {
    const field = form.elements[i];
    if (!field.name || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button' || exclude.includes(field.name)) continue;
    if (field.type === 'select-multiple') {
      for (let n = 0; n < field.options.length; n++) {
        if (!field.options[n].selected) continue;
        serialized.push(fixedEncodeURIComponent(field.name) + '=' + fixedEncodeURIComponent(field.options[n].value));
      }
    }
    else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
      serialized.push(fixedEncodeURIComponent(field.name) + '=' + fixedEncodeURIComponent(field.value));
    }
  }
  return serialized.join('&');
}

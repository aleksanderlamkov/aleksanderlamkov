
/**
 * Присваивание состояния чекбоксу или радиокнопке
 * @param checkbox{Element} - input[type="radio"] или input[type="checkbox"]
 * @param isChecked{Boolean=} - состояние
 */
export const setCheckboxState = (checkbox, isChecked) => {
  isChecked = (typeof isChecked === 'boolean') ? isChecked : checkbox.checked;
  checkbox.checked = isChecked;
  if(isChecked) {
    checkbox.setAttribute('checked', '');
    checkbox.value = 'Y';
  } else {
    checkbox.removeAttribute('checked');
    checkbox.value = 'N';
  }
}

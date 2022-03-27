
/**
 * Получение корневого прокручиваемого элемента
 * @return Node||window
 */
export const getScrollableBody = () => {
  return (document.querySelector(window.App.scrollableBody).isEqualNode(document.body)) ? window : document.querySelector(window.App.scrollableBody);
}

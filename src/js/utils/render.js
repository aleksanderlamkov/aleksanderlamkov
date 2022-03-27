
/**
 * Рендер HTML-строки в указанную позицию
 * @param container{Element} - элемент, куда вставляется HTML
 * @param template{String=} - HTML-строка
 * @param position{InsertPosition=} - позиция вставки контента
 */
export const render = (container = document.body, template = '', position = `beforeend`) => {
    container.insertAdjacentHTML(position, template);
}

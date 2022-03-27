import { debounce } from './debounce';
import { parseJSON } from './parseJSON'
import { getAttr } from './getAttr'
import { isMedia } from './isMedia'

const instance = '[data-js-teleport]';

/**
 * Динамически вырезает и уставляет DOM-узел в зависимости от разрешения экрана
 * Использовать как data-js-teleport={
 *   to: String, // селектор, куда данный элемент будет вставлен в зависимости от разрешения
 *   media: String,  // Разрешение для вставки
 *   from: String  // селектор, откуда данный элемент будет вставлен в зависимости от разрешения
 * }
 */
export class Teleport {

  els = {
    instance
  };

  constructor() {
    this.teleport();
    this.bindEvents();
  }

  static appendNode(node, destination) {
    const clone = node.cloneNode(true);
    node.remove();
    destination.appendChild(clone);
  }

  teleport() {
    document.querySelectorAll(this.els.instance).forEach((item) => {
      const { to, media, from } = parseJSON(item.getAttribute(getAttr(instance)));
      const destinationTo = document.querySelector(to);
      const destinationFrom = document.querySelector(from);
      if(destinationTo && destinationFrom) {
        if(isMedia(media)) {
          Teleport.appendNode(item, destinationTo);
        } else {
          Array.from(destinationTo.children).forEach((child) => {
            if(child.isEqualNode(item)) {
              Teleport.appendNode(child, destinationFrom);
            }
          })
        }
      } else {
        console.debug(`Elements for teleport are not found: '${to}' or '${from}'`)
      }
    });
  }

  handleResize() {
    this.teleport();
  }

  bindEvents() {
    const debouncedHandler = debounce(() => this.handleResize());
    window.addEventListener('resize', () => {
      debouncedHandler();
    });
  }
}

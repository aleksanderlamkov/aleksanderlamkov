import {getAttr} from './utils/getAttr';
import {parseJSON} from './utils/parseJSON';
import {error} from './utils/error';
import {getScrollableBody} from './utils/getScrollableBody';

export default class ScrollTo {
  els = {
    button: '[data-js-scroll-to]'
  };

  anchorCfg = {
    anchor: null,
    block: 'start',
    behavior: 'smooth'
  };

  constructor() {
    this.bindEvents();
  }

  static get isLegacy() {
    return !CSS.supports('scroll-margin-top: 0');
  }

  static getScrollMargin(element) {
    let value = parseInt(window.getComputedStyle(element).getPropertyValue('scroll-snap-margin-top'), 10);
    return isNaN(value) ? 0 : value;
  }

  static legacyScrollTo(element, duration = 300) {
    if (duration <= 0) {
      return;
    }
    let offset = element.offsetTop;
    let scrollMarginTop = ScrollTo.getScrollMargin(element);
    let difference = offset - element.scrollTop;
    let perTick = difference / duration * 10;
    setTimeout(() => {
      element.scrollTop = element.scrollTop + perTick;
      if (element.scrollTop === offset) return;
      window.scrollTo(element, offset - scrollMarginTop, duration - 10);
    }, 10);
  }

  getCfg(el) {
    let cfg = el.getAttribute(getAttr(this.els.button));
    if (cfg !== 'top' && cfg !== 'bottom') {
      let parsedCfg = parseJSON(cfg);
      if (parsedCfg.anchor) {
        cfg = {
          ...this.anchorCfg,
          ...parsedCfg
        };
        cfg.anchor = document.querySelector(parsedCfg.anchor);
        if (!cfg.anchor) {
          error(`Element not found: ${cfg.anchor}`);
        }
      } else {
        error(`No anchor for element ${el.nodeName}`);
      }
    }
    return cfg;
  }

  static scroll(cfg, isNoSmooth = false, wait = 0) {
    let fn = () => {
      if (typeof cfg === 'string') {
        if (cfg === 'top') {
          console.debug((isNoSmooth) ? 'instant' : 'smooth');
          window.scrollTo({
            top: 0,
            behavior: (isNoSmooth) ? 'instant' : 'smooth'
          });
        } else {
          window.scrollTo(0, getScrollableBody().scrollHeight);
        }
      } else {
        if (ScrollTo.isLegacy) {
          ScrollTo.legacyScrollTo(cfg.anchor);
        } else {
          cfg.anchor.scrollIntoView(cfg);
        }
      }
    };
    if (wait) {
      window.setTimeout(() => {
        fn();
      }, wait);
    } else {
      fn();
    }
  }

  handleClick(e) {
    if (e.target.matches(this.els.button)) {
      e.preventDefault();
      ScrollTo.scroll(this.getCfg(e.target));
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      this.handleClick(e);
    });
  }
}

import Collection from './generic/collection'
import {Swiper, Navigation} from 'swiper'
import 'swiper/css/bundle'
import {mq} from '../app'
import {getCopyOfObj} from './utils/getCopyOfObj'
import {isMedia} from './utils/isMedia'
import {bubble} from './utils/bubble'
import {getMapFromObj} from './utils/getMapFromObj'

Swiper.use([Navigation])

export const instance = '[data-js-slider]'

export const els = {
  instance,
  container: '.swiper',
  slide: '.swiper-slide',
}

const classStates = {
  transition: 'is-transition',
  disabled: 'is-disabled',
}

export const bubbles = {
  sliderInit: 'slider::init',
  sliderChange: 'slider::change',
}

const autoplayMouseControl = (instance) => {
  if (instance.params.autoplay?.enabled) {
    instance.el.addEventListener('mouseover', () => instance.autoplay.stop())
    instance.el.addEventListener('mouseout', () => instance.autoplay.start())
  }
}

const defaultFns = {
  init() {
    bubble(this.wrapperEl.parentNode, bubbles.sliderInit)
    autoplayMouseControl(this)
  },
  slideChange() {
    bubble(this.wrapperEl.parentNode, bubbles.sliderChange)
    this.el.closest(els.instance).setAttribute(attrs.slideNumber, this.activeIndex)
  },
  slideChangeTransitionStart() {
    this.el.closest(els.instance).classList.add(classStates.transition)
  },
  slideChangeTransitionEnd() {
    this.el.closest(els.instance).classList.remove(classStates.transition)
  },
}

const defaultParams = {
  slidesPerView: 'auto',
  speed: 500,
  watchSlidesProgress: true,
  waitForTransition: true,
  followFinger: false,
  preventInteractionOnTransition: true,
  preventClicks: true,
  roundLengths: true,
  touchRatio: 0.2,
  preloadImages: false,
  updateOnImagesReady: false,
  noSwipingClass: classStates.disabled,
  uniqueNavElements: false,
  navigation: false,
  pagination: false,
  on: defaultFns,
  requiredMediaQuery: false,
}

export const attrs = {
  slideNumber: 'data-js-slider-current-slide',
  multipleInstance: 'data-js-slider-instance'
}

const paginationCfg = {
  type: 'bullets',
  bulletElement: 'button',
  bulletClass: 'slider-pagination__button',
  bulletActiveClass: 'is-active',
  clickable: true,
}

export class Slider {
  constructor(sliderDOMElem, options) {
    this.instance = sliderDOMElem
    this.parentContainer = this.instance.closest(els.instance)
    this.params = getCopyOfObj(options)
    this.sliderDOMElem = sliderDOMElem
    if (this.parentContainer) {
      if (this.parentContainer.hasAttribute(attrs.multipleInstance)) {
        const {pagination, navigation, scrollbar} = this.params
        if (pagination) {
          this.params.pagination = {
            ...pagination,
            el: this.getUniqueInstanceNode(pagination.el),
          }
        }
        if (navigation) {
          this.params.navigation = {
            ...navigation,
            prevEl: this.getUniqueInstanceNode(navigation.prevEl),
            nextEl: this.getUniqueInstanceNode(navigation.nextEl)
          }
        }
        if (scrollbar) {
          this.params.scrollbar = {
            ...scrollbar,
            el: this.getUniqueInstanceNode(scrollbar.el),
          }
        }
      }
    } else {
      console.debug(`Missed parent attr "${els.instance}" in slider: `, this.instance)
    }
    if (this.params.requiredMediaQuery) {
      this.manageSliderInitialization()
      this.createDynamicSliderInitialization()
    } else {
      this.createSlider()
    }
  }

  createSlider() {
    this.swiperInstance = new Swiper(this.sliderDOMElem, this.params)
  }

  manageSliderInitialization() {
    if (isMedia(this.params.requiredMediaQuery)) {
      if (!this.instance.classList.contains('swiper-initialized')) {
        this.createSlider()
      }
    } else if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true)
    }
  }

  createDynamicSliderInitialization() {
    const mediaQuery = window.matchMedia(this.params.requiredMediaQuery)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', () => this.manageSliderInitialization())
    } else {
      // Deprecated "MediaQueryList" API, <Safari 14, IE, <Edge 16
      mediaQuery.addListener(() => this.manageSliderInitialization())
    }
  }

  getUniqueInstanceNode(paginationSelector) {
    let selector = paginationSelector.trim()
    const parent = `[${attrs.multipleInstance}="${this.parentContainer.getAttribute(attrs.multipleInstance)}"]`
    const splitSelector = selector.split(' ')
    if (splitSelector.length > 1) {
      selector = splitSelector.pop()
    }
    return document.querySelector(`${parent} ${selector}`)
  }
}

export class SlidersCollection extends Collection {
  static slidersCfg = getMapFromObj({
    '.slider .swiper': {
      ...defaultParams, // use this to add default params and overwrite it
      slidesPerView: 1,
      spaceBetween: 10,
      navigation: {
        prevEl: '.slider .slider-buttons__button--prev',
        nextEl: '.slider .slider-buttons__button--next'
      },
      pagination: {
        ...paginationCfg,
        el: '.slider .slider-pagination',
      },
      speed: 500,
      breakpoints: {
        1025: {
          allowTouchMove: false,
        },
      },
    },
    '.product-preview__main-slider .swiper': {
      ...defaultParams,
      slidesPerView: 1,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      thumbs: {
        swiper: {
          ...defaultParams,
          el: '.product-preview__secondary-slider .swiper',
          slidesPerView: 4,
          spaceBetween: 10,
          navigation: {
            prevEl: '.product-preview__secondary-slider .slider-buttons__button--prev',
            nextEl: '.product-preview__secondary-slider .slider-buttons__button--next'
          },
        }
      },
      allowTouchMove: false,
    },
  })

  constructor() {
    super(instance, Slider)
  }

  init(context = document) {
    [...SlidersCollection.slidersCfg.entries()].forEach(([selector, options], i, array) => {
      context.querySelectorAll(selector).forEach((sliderDOMElem, i) => {
        if (typeof sliderDOMElem.swiper === 'undefined') {
          if (array.length > 1) {
            sliderDOMElem.setAttribute(attrs.multipleInstance, i.toString())
          }
          this.addToCollection(new Slider(sliderDOMElem, options))
        } else {
          sliderDOMElem.swiper.update()
        }
      })
    })
  }
}

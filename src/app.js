// import utils
import { isTouchEnabled } from './js/utils/isTouchEnabled'
import { isMobileDevice } from './js/utils/isMobileDevice'
import { parseJSON } from './js/utils/parseJSON'
import { wait } from './js/utils/wait'
import { debounce } from './js/utils/debounce'
import { setCSSVar } from './js/utils/setCSSVar'
import { onDOMContentLoaded } from './js/utils/onDOMContentLoaded'
import { requireAll } from './js/utils/webpack/requireAll'
import { getScrollBarWidth } from './js/utils/getScrollBarWidth'

// media queries (if used in js)
export const mq = {
  tabletAbove: '(min-width: 1281px)',
  tablet: '(max-width: 1280px)',
  tabletXsAbove: '(min-width: 921px)',
  tabletXs: '(max-width: 920px)',
  mobileAbove: '(min-width: 768px)',
  mobile: '(max-width: 767px)',
}

// Create global App object
window.App = {
  scrollableBody: 'body',
  isDebug: window.location.port.length > 0 || window.location.host === 'localhost' || (window.location.search.indexOf('debug') > -1) || window.location.pathname.indexOf('/build/') > -1,
  isTest: process.env.NODE_ENV === 'test',
  stateClasses: {
    domReady: 'dom-is-ready',
    pageLoaded: 'page-is-loaded',
    touchscreen: 'is-touchscreen',
    mobileDevice: 'is-mobile-device'
  },
  ...parseJSON(document.body.getAttribute('data-js-app-globals')),
  utils: { // utils functions
    setVhVar: () => setCSSVar(document.documentElement, 'vh', `${(window.innerHeight * 0.01).toFixed(3)}px`),
    checkMobile: () => (isMobileDevice()) ? document.documentElement.classList.add(App.stateClasses.mobileDevice) : document.documentElement.classList.remove(App.stateClasses.mobileDevice),
    checkTouch: () => (isTouchEnabled()) ? document.documentElement.classList.add(App.stateClasses.touchscreen) : document.documentElement.classList.remove(App.stateClasses.touchscreen),
    checkSpecificBrowser: () => {
      let browserClass = ''
      switch (true) {
        case !!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/)):
          browserClass = 'ie11'
          break
        case !!navigator.userAgent.match(/Version\/[\d.]+.*Safari/):
          browserClass = 'safari'
          break
        case /Edge/.test(navigator.userAgent):
          browserClass = 'edge'
          break
        default:
          break
      }
      if (browserClass) {
        document.documentElement.classList.add(browserClass)
      }
    },
    getScrollBarWidth: () => setCSSVar(document.documentElement, 'scrollBarWidth', `${getScrollBarWidth()}px`)
  }
}

// load icons
if (!window.App.isTest) {
  requireAll(require.context('./icons', true, /\.svg$/))
}

// load modules
import Preloader from './components/preloader'
import Dispatcher from './js/generic/dispatcher'
import Observer from './js/generic/observer'
import Icons from './js/icons'
import ScrollTo from './js/scrollTo'
import ScrollEffects from './js/scrollEffects'
import Button from './components/button'
import ThemeSwitcher from './components/theme-switcher'
import MobileMenu from './components/mobile-menu'
import BurgerButton from './components/burger-button'
import Header from './components/header'

// Load components
import './components/preloader'
import './components/header'
import './components/footer'
import './components/logo'
import './components/button'
import './components/theme-switcher'
import './components/mobile-menu'
import './components/burger-button'
import './components/portfolio-card'
import './components/skill-card'
import './components/stack'
import './components/work-experience-card'
import './components/socials'

// Load collections
import { LiveTypingCollection } from './js/liveTyping'
import { SlidersCollection } from './js/sliders'

// Load styles
import './styles'

const handleDOMReady = () => {
  // run utils
  Object.values(App.utils).forEach(fn => typeof fn === 'function' && fn())

  // standalone components
  new Preloader()
  new Icons()
  new Button()

  // app components
  App.ThemeSwitcher = new ThemeSwitcher()
  App.MobileMenu = new MobileMenu()
  App.BurgerButton = new BurgerButton()
  App.Header = new Header()
  App.LiveTypingCollection = new LiveTypingCollection()
  App.SlidersCollection = new SlidersCollection()

  new ScrollTo()

  // prevent transition flicker
  wait(100).then(() => {
    document.documentElement.classList.add(App.stateClasses.domReady)
  })

  wait(1200).then(() => {
    App.ScrollEffects = new ScrollEffects()
  })
}

const debouncedResizeHandler = debounce(App.utils.setVhVar)
const handleResize = () => {
  debouncedResizeHandler()
  App.utils.checkTouch()
  App.utils.checkMobile()
  App.utils.getScrollBarWidth()
}
const handleWindowLoad = () => document.documentElement.classList.add(App.stateClasses.pageLoaded)

onDOMContentLoaded(() => handleDOMReady())
window.addEventListener('resize', () => handleResize())
window.addEventListener('load', () => handleWindowLoad())

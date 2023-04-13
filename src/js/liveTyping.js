import Collection from './generic/collection'
import {stateClasses as scrollEffectsStateClasses} from './scrollEffects'
import {bubbles as preloaderBubbles} from '../components/preloader'
import { getCfg } from './utils/getCfg'
import { wait } from './utils/wait'
import { isMedia } from './utils/isMedia'

export const instance = '[data-js-live-typing]'

export class LiveTyping {
  els = {
    instance,
    stage: '[data-js-live-typing-stage]',
    letter: '[data-js-live-typing-char]',
  }

  stateClasses = {
    isVisible: 'is-visible',
    isTypingFinished: 'is-typing-finished'
  }

  regExp = {
    excludeTabulationAndLineFeedChar: /\n\t/g,
    excludeTags: /(?![^<]*>)[^<]/g
  }

  defaultCfg = {
    delayBetweenCharsTyping: 90,
    delayBetweenCharsRemoving: 35,
    delayBetweenStages: 400
  }

  constructor(instance) {
    if (isMedia('(prefers-reduced-motion)')) return
    this.instance = instance
    this.stages = this.instance.querySelectorAll(this.els.stage)
    this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg)
    this.state = {
      currentStage: 0,
      totalStages: this.stages.length,
      stagesInfo: [...this.stages].map((stage) => {
        const letterNodes = stage.querySelectorAll(this.els.letter)
        return {
          charsNodes: [...letterNodes],
          totalChars: letterNodes.length,
          isHideAfterTyping: getCfg(stage, this.els.stage).isHideAfterTyping
        }
      })
    }
    // this.init()
    this.bindEvents()
  }

  // formatText() {
  //   this.stages.forEach((stage) => {
  //     const clearText = stage.innerHTML.trim().replace(this.regExp.excludeTabulationAndLineFeedChar, ' ')
  //     const textFormatted = clearText.replace(this.regExp.excludeTags, (char) => {
  //       return `<span class="live-typing__char" data-js-live-typing-char>${char}</span>`
  //     })
  //
  //     stage.innerHTML = textFormatted
  //   })
  // }

  removeChars(stage, chars) {
    const reverseChars = [...chars].reverse()
    const totalChars = chars.length
    let hiddenChars = 0

    reverseChars.forEach((char, index) => {
      wait(index * this.cfg.delayBetweenCharsRemoving).then(() => {
        char.classList.remove(this.stateClasses.isVisible)
        hiddenChars++
        if (hiddenChars === totalChars) {
          wait(this.cfg.delayBetweenStages).then(() => {
            stage.classList.remove(this.stateClasses.isVisible)
            this.state.currentStage++
            this.startTyping()
          })
        }
      })
    })
  }

  startTyping() {
    if (this.state.currentStage === this.state.totalStages) {
      this.instance.classList.add(this.stateClasses.isTypingFinished)
      return
    }

    const currentStage = this.stages[this.state.currentStage]
    const {charsNodes, totalChars, isHideAfterTyping} = this.state.stagesInfo[this.state.currentStage]
    let visibleChars = 0

    currentStage.classList.add(this.stateClasses.isVisible)
    charsNodes.forEach((char, index) => {
      wait(index * this.cfg.delayBetweenCharsTyping).then(() => {
        char.classList.add(this.stateClasses.isVisible)
        visibleChars++
        if (visibleChars === totalChars) {
          wait(this.cfg.delayBetweenStages).then(() => {
            if (isHideAfterTyping) {
              this.removeChars(currentStage, charsNodes)
            } else {
              this.state.currentStage++
              this.startTyping()
            }
          })
        }
      })
    })
  }

  handlePreloaderFadeAway() {
    // this.startTyping()
    wait(300).then(() => {
      this.startTyping()
    })
  }

  init() {
    // this.formatText()
    // this.startTyping()
  }

  bindEvents() {
    document.addEventListener(preloaderBubbles.fadeAway, () => this.handlePreloaderFadeAway())
  }
}

export class LiveTypingCollection extends Collection {
  constructor() {
    super(instance, LiveTyping)
  }
}

import Collection from './generic/collection'
import {stateClasses as scrollEffectsStateClasses} from './scrollEffects'
import { getCfg } from './utils/getCfg'
import { wait } from './utils/wait'

export const instance = '[data-js-live-typing]'

export class LiveTyping {
  els = {
    instance,
    stage: '[data-js-live-typing-stage]',
    letter: '[data-js-live-typing-char]',
  }

  stateClasses = {
    isVisible: 'is-visible',
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
    this.instance = instance
    this.stages = this.instance.querySelectorAll(this.els.stage)
    this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg)
    this.state = {
      currentStage: 0,
      totalStages: this.stages.length
    }
    this.init()
    this.bindEvents()
  }

  formatText() {
    this.stages.forEach((stage) => {
      const clearText = stage.innerHTML.trim().replace(this.regExp.excludeTabulationAndLineFeedChar, ' ')
      const textFormatted = clearText.replace(this.regExp.excludeTags, (char) => {
        return `<span class="live-typing__char" data-js-live-typing-char>${char}</span>`
      })

      stage.innerHTML = textFormatted
    })
  }

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
    if (this.state.currentStage === this.state.totalStages) return

    const currentStage = this.stages[this.state.currentStage]
    const chars = currentStage.querySelectorAll(this.els.letter)
    const totalChars = chars.length
    let visibleChars = 0

    currentStage.classList.add(this.stateClasses.isVisible)
    chars.forEach((char, index) => {
      wait(index * this.cfg.delayBetweenCharsTyping).then(() => {
        char.classList.add(this.stateClasses.isVisible)
        visibleChars++
        if (visibleChars === totalChars) {
          wait(this.cfg.delayBetweenStages).then(() => {
            const isHideAfterTyping = getCfg(currentStage, this.els.stage).isHideAfterTyping
            if (isHideAfterTyping) {
              this.removeChars(currentStage, chars)
            } else {
              this.state.currentStage++
              this.startTyping()
            }
          })
        }
      })
    })
  }

  init() {
    // this.formatText()
    this.startTyping()
  }

  bindEvents() {

  }
}

export class LiveTypingCollection extends Collection {
  constructor() {
    super(instance, LiveTyping)
  }
}

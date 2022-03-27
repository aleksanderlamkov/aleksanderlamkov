import './style.pcss'
import Collection from '../../js/generic/collection'
import Modals from '../../js/modals'
import {render} from '../../js/utils/render'
import {removeChildNodes} from '../../js/utils/removeChildNodes'
import {getAttr} from '../../js/utils/getAttr'
import {bubble} from '../../js/utils/bubble'
import {getLocaleMsg} from '../../js/utils/getLocaleMsg'
import {getCfg} from '../../js/utils/getCfg'
import {stateClasses as formStates} from '../../js/forms'
import FormValidation from '../../js/forms/validation'

export const instance = '[data-js-file-attach]'

export const els = {
  instance,
  input: '[data-js-file-attach-input]',
  addButton: '[data-js-file-attach-add-button]',
  fileList: '[data-js-file-attach-file-list]',
  fileRemove: '[data-js-file-attach-file-remove]',
  fileItem: '[data-js-file-attach-file]',
  types: '[data-js-file-attach-filter]',
  maxSize: '[data-js-file-attach-max-size]',
  maxFiles: '[data-js-file-attach-max-files]',
  name: '[data-js-file-attach-file-info="name"]',
  size: '[data-js-file-attach-file-info="size"]'
}

export const bubbles = {
  fileAttached: 'file::attached',
  fileRemoved: 'file::removed'
}

const fileSizes = ['FILE_SIZE_BYTE', 'FILE_SIZE_KB', 'FILE_SIZE_MB', 'FILE_SIZE_GB', 'FILE_SIZE_TB'].map((key) => getLocaleMsg(key))

export class FileAttach {

  els = {
    instance
  }

  defaultCfg = {
    isCustomRenderer: false,
    isRefInput: false
  }

  constructor(instance) {
    this.instance = instance
    this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg)
    this.addButton = this.instance.querySelector(els.addButton)
    this.input = this.getInput()
    this.fileList = this.instance.querySelector(els.fileList)
    this.isMultiple = this.input.hasAttribute('multiple')
    this.files = this.getInitialFiles()
    this.bindEvents()
  }

  getInput() {
    const insideInput = this.instance.querySelector(els.input)
    return (insideInput) ? insideInput : document.querySelector(`[name="${this.addButton.getAttribute('for')}"]`)
  }

  getInitialFiles() {
    return [...this.getFileListNodes].map((node) => {
      const getInfo = (selector) => node.querySelector(selector).textContent.trim()
      return {
        file: {
          name: getInfo(els.name),
          size: getInfo(els.size)
        },
        index: Number(node.getAttribute(getAttr(els.fileItem))),
        isInitial: true
      }
    })
  }

  getExtension(name) {
    return (name.substring(name.lastIndexOf('.') + 1, name.length) || name).toLowerCase()
  }

  get getFileListNodes() {
    return this.fileList.querySelectorAll(els.fileItem)
  }

  setInvalid() {
    this.instance.classList.add(formStates.invalid)
    this.input.classList.add(formStates.invalid)
  }

  setValid() {
    this.instance.classList.remove(formStates.invalid)
    this.input.classList.remove(formStates.invalid)
  }

  attach() {
    if (!this.isMultiple) {
      this.clear()
    }

    const allowedTypes = (this.input.hasAttribute(getAttr(els.types))) ? this.input.getAttribute(getAttr(els.types)).split(', ') : []

    const prevent = (index, msg) => {
      this.setInvalid()
      this.removeFile(index)
      if (!this.isMultiple) {
        this.clear(true)
      }
      Modals.openErrorModal(msg)
    }

    for (let i = 0; i < this.input.files.length; i++) {
      const file = this.input.files[i]
      const index = this.files.length ? Number(this.files[this.files.length - 1].index) + 1 : 0
      const maxSize = this.input.hasAttribute(getAttr(els.maxSize)) ? Number(this.input.getAttribute(getAttr(els.maxSize))) : 10
      const isValidSize = FileAttach.validateSize(file.size, maxSize)
      const maxFiles = this.input.hasAttribute(getAttr(els.maxFiles)) ? Number(this.input.getAttribute(getAttr(els.maxFiles))) : 10
      const isMaxFiles = (this.files.length >= maxFiles)
      const data = {
        name: file.name,
        size: FileAttach.bytesToSize(file.size),
        index
      }

      if (!this.files.find(file => file.file.name === data.name)) {
        this.setValid()
        const type = this.getExtension(data.name)

        if (isMaxFiles) {
          prevent(index, getLocaleMsg('FILE_UPLOAD_ERROR_MAX'))
          return
        }

        if (type.length && allowedTypes.length && !allowedTypes.includes(type)) {
          prevent(index, getLocaleMsg('FILE_UPLOAD_ERROR_FORMAT'))
          return
        }

        if (!isValidSize) {
          prevent(index, () => Modals.openErrorModal(getLocaleMsg('FILE_UPLOAD_ERROR_SIZE')))
          return
        }

        this.files.push({index, file, isInitial: false})

        if (!this.cfg.isCustomRenderer) {
          render(this.fileList, FileAttachCollection.getFileTemplate(data, true))
        }

        if (this.input.hasAttribute('required')) {
          const isValid = FormValidation.isValidFile(this.input)
          if (isValid) {
            FormValidation.clearInputMsgBlock(this.input)
          }
        }

        bubble(this.instance, bubbles.fileAttached, {
          ...data,
          input: this.input,
          files: this.files
        })
      }
    }
  }

  removeFile(index) {
    const file = this.fileList.querySelector(`[${getAttr(els.fileItem)}="${index}"]`)
    if (file) {
      const inArrIndex = this.files.findIndex((el) => el.index === Number(index))
      this.files.splice(inArrIndex, 1)
      if (!this.cfg.isCustomRenderer) {
        this.input.value = ''
        file.remove()
        if (!this.files.length) {
          removeChildNodes(this.fileList)
        }
      }
      bubble(this.instance, bubbles.fileRemoved, {
        index,
        name: file.name,
        size: FileAttach.bytesToSize(file.size),
        input: this.input,
        files: this.files
      })
    }
  }

  clear(isResetValue = false) {
    this.files.forEach((file) => {
      bubble(this.instance, bubbles.fileRemoved, {
        index: file.index,
        name: file.name,
        size: FileAttach.bytesToSize(file.size),
        input: this.input,
        files: this.files
      })
    })
    this.files = []
    removeChildNodes(this.fileList)
    this.setValid()
    if (this.isMultiple || isResetValue) {
      this.input.value = ''
    }
  }

  static validateSize(bytes, maxSizeMb = 10) {
    return (parseInt((Number(bytes) / 1024 / 1024).toString(), 10) <= maxSizeMb)
  }

  static bytesToSize(bytes) {
    bytes = Number(bytes)
    if (bytes === 0) {
      return `0 ${fileSizes[0]}`
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + fileSizes[i]
  }

  handleClick(e) {
    const {target} = e
    if (target.matches(els.fileRemove)) {
      e.preventDefault()
      const index = target.closest(els.fileItem).getAttribute(getAttr(els.fileItem))
      this.removeFile(index)
    }
  }

  handleChange() {
    this.attach()
  }

  bindEvents() {
    this.input.addEventListener('change', () => this.handleChange())
    this.instance.addEventListener('click', (e) => {
      this.handleClick(e)
    })
  }
}

export class FileAttachCollection extends Collection {
  constructor() {
    super(instance, FileAttach)
  }

  static getFileTemplate({name, size, index}, isRenderRemoveButton = true) {
    return `
      <div class="file-attach__list-item attachment" data-js-file-attach-file="${index}">
        <div class="attachment__icon">
          <svg class="i-icon">
            <use href="#icon-attachment"></use>
          </svg>
        </div>
        <div class="attachment__info">
          <div class="attachment__name" title="${name}" data-js-file-attach-file-info="name">${name}</div>
          <small class="attachment__size"  data-js-file-attach-file-info="size">${size}</small>
          ${isRenderRemoveButton ? '<button class="attachment__remove" type="button" data-js-file-attach-file-remove><svg class="i-icon"><use href="#icon-remove"></use></svg></button>' : ''}
        </div> 
       </div>
    `
  }
}

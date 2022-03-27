export const onDOMContentLoaded = (callback = () => {}) => {
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => callback()) : callback()
}

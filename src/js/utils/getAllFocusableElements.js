const getAllFocusableElements = (context = document) => {
  const selectors = [
    'a[href]',
    'button',
    'input',
    'textarea',
    'select',
    'details',
    '[tabindex]:not([tabindex="-1"])',
  ]

  const selector = selectors.join(', ')

  return [...context.querySelectorAll(selector)]
}

export default getAllFocusableElements
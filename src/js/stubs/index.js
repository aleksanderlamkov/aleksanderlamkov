module.exports = {
  success: {
    url: '/api/success',
    resp: {
      success: true,
      modals: []
    }
  },
  error: {
    url: '/api/error',
    resp: {
      success: false,
      errors: []
    }
  }
}

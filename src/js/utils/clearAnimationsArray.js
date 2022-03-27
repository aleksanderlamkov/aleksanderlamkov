export const clearAnimationsArray = (arr) => {
  arr.forEach((animation) => {
    animation.cancel()
  })
}

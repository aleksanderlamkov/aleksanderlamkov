
/**
 * Обновление текущего URL
 * @param formData{FormData} - объект с данными FormData
 */
export const updateURLFromFormData = (formData) => {
  const queryParams = new URLSearchParams(window.location.search)

  for (let pair of formData.entries()) {
    queryParams.set(pair[0], pair[1])
  }
  history.replaceState(null, null, '?' + queryParams.toString())
}


/**
 * Выполняет асинхронный запрос с указанной конфигурацией
 * @param cfg{Object} - конфигурация
 * @return Promise
 */

export async function makeRequest(cfg) {
  let { method = 'GET', mode = 'cors', controller = null, data = null, type = 'json', url = window.location.href } = cfg;
  const resp = await fetch(url, {
    method,
    mode,
    controller,
    body: (typeof method === 'string' && method.toUpperCase() === 'POST') ? data : null,
  });
  return (resp.ok) ? await (type === 'json') ? resp.json() : resp.text() : Promise.reject(resp.statusText);
}

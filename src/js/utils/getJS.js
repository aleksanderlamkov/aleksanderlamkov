/**
 * Создание и загрузка внешнего скрипта
 * @param params{Object} - параметры скрипта
 * @return Promise
 */
export const getJS = (params) => {
  // params example
  const defaults = {
    async: true,
    defer: false,
    return: false,
    src: false,
    appendTo: document.body,
    id: null
  }
  const cfg = {
    ...defaults,
    ...params
  }
  if(cfg.src) {
    return new Promise((resolve, reject) => {
      let isReady = false;
      const script = document.createElement('script');
      script.src = cfg.src;
      script.async = cfg.async;
      script.defer = cfg.defer;
      if(cfg.id) {
        script.id = cfg.id;
      }
      script.onerror = (err) => {
        reject(err);
        script.onerror = null;
      };
      script.onload = script.onreadystatechange = function() {
        if (!isReady && (!this.readyState || this.readyState === 'complete')) {
          isReady = true;
          resolve(script);
          script.onload = null;
          script.onerror = null;
        }
      };
      cfg.appendTo.appendChild(script);
    });
  } else {
    console.debug('createJS: Missing src attr in', cfg);
    return Promise.reject();
  }
}

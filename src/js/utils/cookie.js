
/**
 * Получение cookie
 * @param name{String} - название cookie
 */
export const getCookie = (name) => {
    const matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([$?*|{}\]\\^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * Установка cookie
 * @param name{String} - название cookie
 * @param value{String} - значение cookie
 * @param options{Object=} = опции cookie
 */
export const setCookie = (name, value, options = {}) => {
    let expires = options.expires;
    if (typeof expires == 'number' && expires) {
        let d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }
    value = encodeURIComponent(value);
    let updatedCookie = name + '=' + value;
    for (let propName in options) {
        updatedCookie += '; ' + propName;
        let propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += '=' + propValue;
        }
    }
    document.cookie = updatedCookie;
}


/**
 * Преобразует строку в JSON-объект
 * @param string{String} - исходная строка
 * @return Object
 */
export const parseJSON = (string) => {
    let json = {};
    try  {
        json = JSON.parse(string);
    } catch (err) {
        if(App.debug) {
            // console.debug(err);
        }
    }
    return json;
}

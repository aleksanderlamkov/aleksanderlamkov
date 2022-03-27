
/**
 * Проверка, поддерживается ли пользователем touch-ввод
 * @return Boolean
 */
export const isTouchEnabled = () =>  {
	return ('ontouchstart' in window || typeof navigator.maxTouchPoints !== 'undefined' || typeof navigator.msMaxTouchPoints !== 'undefined' || (window.DocumentTouch && document instanceof DocumentTouch) || window.navigator.msPointerEnabled && window.MSGesture);
}

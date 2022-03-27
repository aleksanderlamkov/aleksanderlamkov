
/**
 * Получение значения CSS-трансформаций
 * @param element{Element} - исходный элемент
 * @param isRound{Boolean=} - округление значений
 * @return Object - возвращает объект, содержащий ключи x, y, z
 */
export const getTranslateValues = (element, isRound) => {
	const style = window.getComputedStyle(element)
	const matrix = style.transform;

	if (matrix === 'none') {
		return {
			x: 0,
			y: 0,
			z: 0
		}
	}

	const matrixType = matrix.includes('3d') ? '3d' : '2d'
	const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')
	if (matrixType === '2d') {
		return {
			x: (isRound) ? parseInt(matrixValues[4], 10) : matrixValues[4],
			y: (isRound) ? parseInt(matrixValues[5], 10) : matrixValues[5],
			z: 0
		}
	}

	if (matrixType === '3d') {
		return {
			x: (isRound) ? parseInt(matrixValues[12], 10) : matrixValues[12],
			y: (isRound) ? parseInt(matrixValues[13], 10) : matrixValues[13],
			z: (isRound) ? parseInt(matrixValues[14], 10) : matrixValues[14],
		}
	}
};

import debounce from 'lodash.debounce';

export const updateEquationQueryParam = debounce((equation) => {
	if (equation) {
		history.replaceState(null, null, `${window.location.pathname}?equation=${encodeURI(equation)}`)
	} else {
		history.replaceState(null, null, window.location.pathname)
	}
}, 500)

export const getEmbedSnippet = (equation) => {
	return `<iframe title="Tex Block" width="600" height="600" frameBorder="0" src="${window.location.href}"></iframe>`
}

export const getTextWidth = (text, fontSize, fontFamily) => {
	// Copied from https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
	// re-use canvas object for better performance
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
	var context = canvas.getContext("2d");
	context.font = `${fontSize} ${fontFamily}`;
	var metrics = context.measureText(text);
	return metrics.width;
}

export const getCursorPosition = (text, cursorIndex) => {
	text = text
    .slice(0, cursorIndex) // text before cursor
    .replace(/\n$/, '') // strip trailing newline

	return {
		offset: text.split('\n').pop().length,
		line: text.match(/\n/g) ? text.match(/\n/g).length : 0
	}
}

export const addPoints = (p1, p2) => {
	return {
		x: p1.x + p2.x,
		y: p1.y + p2.y,
	}
}

export const stringSplice = (str, ind, insertionStr) => {
	return `${str.slice(0, ind)}${insertionStr}${str.slice(ind)}`
}

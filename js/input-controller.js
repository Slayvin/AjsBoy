//INPUT handler
var keyMap = {
	'j': 'A',
	'i': 'B',
	'z': 'up',
	's': 'down',
	'q': 'left',
	'd': 'right',
	' ': 'select',
	'Enter': 'start'
};

document.addEventListener('keydown', (event) => {
	const keyName = event.key;
	Object.keys(keyMap).forEach((key) => {
		if (key === keyName) {
//			window.console.log(keyMap[key]+' Down');
			document.getElementById('key-' + keyMap[key]).classList.add('pressed');
			// Add interrupt
			// Update memory input register
		}
	});
});
document.addEventListener('keyup', (event) => {
	const keyName = event.key;
	Object.keys(keyMap).forEach((key) => {
		if (key === keyName) {
//			window.console.log(keyMap[key]+' Up');
			document.getElementById('key-' + keyMap[key]).classList.remove('pressed');
			// Update memory input register
		}
	});
	event.preventDefault();
});

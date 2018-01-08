//INPUT handler
var keyMap = {
	'j': 'A',
	'i': 'B',
	'z': 'Up',
	's': 'Down',
	'q': 'Left',
	'd': 'Right',
	' ': 'Select',
	'Enter': 'Start'
};

document.addEventListener('keydown', (event) => {
	const keyName = event.key;
	Object.keys(keyMap).forEach((key) => {
		if (key === keyName) {
//			window.console.log(keyMap[key]+' Down');
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
	// Update memory input register
		}
	});
	event.preventDefault();
});

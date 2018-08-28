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
/**
 * 
 * @param {gbEmu} emulator
 * @returns {InputController}
 */
function InputController(emulator) {

	this.keyState = [0xFF, 0xFF];
	const keyPressedMasks = {'A': 0xFE, 'B': 0xFD, 'select': 0xFB, 'start': 0xF7, 'right': 0xFE, 'left': 0xFD, 'up': 0xFB, 'down': 0xF7};
	const keyReleasedMasks = {'A': 0x01, 'B': 0x02, 'select': 0x04, 'start': 0x08, 'right': 0x01, 'left': 0x02, 'up': 0x04, 'down': 0x08};
	const keyIndex = {'A': 0, 'B': 0, 'select': 0, 'start': 0, 'right': 1, 'left': 1, 'up': 1, 'down': 1};

	document.addEventListener('keydown', (event) => {
		event.preventDefault();
		const keyName = event.key;
		Object.keys(keyMap).forEach((key) => {
			if (key === keyName) {
				var keyPressed = keyMap[key];
				this.keyState[keyIndex[keyPressed]] &= keyPressedMasks[keyPressed];
				document.getElementById('key-' + keyPressed).classList.add('pressed');

				// Add interrupt
				emulator.imu.IF = 0x10;

			}
		});
//		window.console.log(this.keyState);
		return false;
	});

	document.addEventListener('keyup', (event) => {
		event.preventDefault();
		const keyName = event.key;
		Object.keys(keyMap).forEach((key) => {
			if (key === keyName) {
				var keyReleased = keyMap[key];
				this.keyState[keyIndex[keyReleased]] |= keyReleasedMasks[keyReleased];
				document.getElementById('key-' + keyReleased).classList.remove('pressed');

				// Update memory input register
			}
		});
//		window.console.log(this.keyState);
		return false;
	});

	var keys = document.querySelectorAll('.key-map button');
	keys.forEach(function (button) {
		button.addEventListener('click', (event) => {
			emulator.imu.IF = 0x10;
			event.preventDefault();
		});
	});
}

InputController.prototype.getKeyState = function (inputRegister) {
	inputRegister |= 0xCF; // 11??1111
	if ((inputRegister & 0x10) > 0) {
		var keyState = this.keyState[0];
		return (inputRegister & keyState);
	} else if ((inputRegister & 0x20) > 0) {
		var keyState = this.keyState[1];
		return (inputRegister & keyState);
	}
	return 0xFF;
};

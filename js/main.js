/* global Palettes */
/* global Lcd */
console.log('Starting main program');

var emulator = new gbEmu();
var testRomsPath = 'tests/';
var gameRomsPath = 'games/';
var demoRomsPath = 'demo/';

// Tests
// emulator.loadProgram(testRomsPath + 'bgbtest.gb').then(function () {
// emulator.loadProgram(testRomsPath + 'blargg/cpu_instrs.gb').then(function () {
// emulator.loadProgram(testRomsPath + 'blargg/cpu_instrs/02-interrupts.gb').then(function () {
// emulator.loadProgram(testRomsPath + 'blargg/cpu_instrs/06-ld r,r.gb').then(function () {
// emulator.loadProgram(testRomsPath + 'blargg/cpu_instrs/10-bit ops.gb').then(function () {

// emulator.loadProgram(testRomsPath + 'blargg/instr_timing.gb').then(function () {


// Games
emulator.loadProgram(gameRomsPath + 'placeholder.gb').then(function () {

// Demos
//emulator.loadProgram(demoRomsPath + 'adjtris.gb').then(function () {
//emulator.loadProgram(demoRomsPath + 'pocket.gb').then(function () {
//emulator.loadProgram(demoRomsPath + 'Hangman (PD).gb').then(function () {
//emulator.loadProgram(demoRomsPath + 'ttt.gb').then(function () {
//emulator.loadProgram(demoRomsPath + 'opus5.gb').then(function () {

	// Start emulation
	emulator.init();
});


var stepBtn = document.querySelector('#step');
var pauseBtn = document.querySelector('#pause');

stepBtn.onclick = function () {
	emulator.step();
};
pauseBtn.onclick = function () {
	emulator.pause();
};

document.addEventListener('keydown', (event) => {
	event.preventDefault();
	const keyName = event.key;
	if ('n' === keyName) {
		emulator.step();
	}
	if ('p' === keyName) {
		emulator.pause();
	}
	return false;
});

const debugCheckboxes = document.getElementsByClassName('debug-cb');
for (let i = 0; i < debugCheckboxes.length; i++) {
	const checkbox = debugCheckboxes[i];
	checkbox.addEventListener("change", updateDebugStates, false);
}
function updateDebugStates() {
	const isChecked = this.checked;
	if (isChecked) { //checked
		emulator.debugger.states[this.id] = true;
	} else { //unchecked
		emulator.debugger.states[this.id] = false;
	}
}

var mainDebugCheckbox = document.getElementById('debug');
mainDebugCheckbox.onchange = function () {
	emulator.debug = this.checked;
};

var paletteSelector = document.getElementById('lcd-palette');
paletteSelector.onchange = function () {
	Lcd.colors = Palettes[this.value];
};

console.log('Starting main program');

var emulator = new gbEmu();
var testRomsPath = 'test/';
var gameRomsPath = 'games/';
var demoRomsPath = 'demo/';

// Tests
//emulator.loadProgram(testRomsPath + 'bgbtest.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'blargg-tests/cpu_instrs/cpu_instrs.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'blargg-tests/cpu_instrs/individual/02-interrupts.gb').then(function () {
// Games
//emulator.loadProgram(gameRomsPath + 'Boxxle 2 (U).gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Double Dragon (U) [!].gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Dr. Mario (JU) (V1.0) [!].gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Pipe Dream (U) [!].gb').then(function () {
emulator.loadProgram(gameRomsPath + 'Tetris (World).gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Super Mario Land (JUE) (V1.0) [!].gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Super Mario Land 2 - 6 Golden Coins (UE) (V1.2) [!].gb').then(function () {
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

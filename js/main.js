console.log('Starting main program');

var emulator = new gbEmu();
var testRomsPath = 'blargg-tests/cpu_instrs/';
var gameRomsPath = 'games/';
var demoRomsPath = 'demo/';


//emulator.loadProgram(demoRomsPath + 'bgbtest.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'cpu_instrs.gb').then(function () {
emulator.loadProgram(testRomsPath + 'individual/02-interrupts.gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Dr. Mario (JU) (V1.0) [!].gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Tetris (World).gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Super Mario Land (JUE) (V1.0) [!].gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Super Mario Land 2 - 6 Golden Coins (UE) (V1.0) [!].gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Super Mario Land 2 - 6 Golden Coins (UE) (V1.2) [!].gb').then(function () {
//emulator.loadProgram(demoRomsPath + 'pocket.gb').then(function () {
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

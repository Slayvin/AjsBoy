console.log('Starting main program');

var emulator = new gbEmu();
var testRomsPath = 'blargg-tests/cpu_instrs/';
var gameRomsPath = 'games/';


emulator.loadProgram(testRomsPath + 'cpu_instrs.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'individual/01-special.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'individual/02-interrupts.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'individual/03-op sp,hl.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'individual/04-op r,imm.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'individual/05-op rp.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'individual/06-ld r,r.gb').then(function () {
//emulator.loadProgram(testRomsPath + 'individual/07-jr,jp,call,ret,rst.gb').then(function () {
//emulator.loadProgram(gameRomsPath + 'Tetris (World).gb').then(function () {
	// Start emulation
	emulator.init();
});


var stepBtn = document.querySelector('#step');
var runBtn = document.querySelector('#run');
var pauseBtn = document.querySelector('#pause');

stepBtn.onclick = function () {
	emulator.step();
};
runBtn.onclick = function () {
	emulator.run();
};
pauseBtn.onclick = function () {
	emulator.pause();
};

// TEST =============================================
function test() {
	var memory = new MemController();
	memory.write(0, 64);
	console.log(memory.read8(0));

	var cpu = new Cpu(memory);
	cpu.A = 0x10;
	cpu.C = 0x10;
	cpu.H = 0xab;
	cpu.L = 0xcd;
	console.log('HL: ', cpu.H.toString(16), cpu.L.toString(16), cpu.HL.toString(16));

	console.log('AF:', cpu.AF.toString(16));
	console.log('BC:', cpu.BC.toString(16));
	console.log('DE:', cpu.DE.toString(16));

	cpu.HL = 0xa5de;
	console.log('HL:', cpu.H.toString(16), cpu.L.toString(16), cpu.HL.toString(16));

	cpu.A = 0x31;
	console.log(cpu.A, cpu.flags);
	cpu.execute(0x17);
	console.log(cpu.A, cpu.flags);
}

// Run tests
//test();

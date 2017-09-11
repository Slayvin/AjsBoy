console.log('Starting main program');

var emulator = new gbEmu();
var testRomsPath = 'blargg-tests/cpu_instrs/individual';


//emulator.loadProgram(testRomsPath + '/01-special.gb').then(function () {
	// Start emulation
	emulator.init();
//});

var stepBtn = document.querySelector('#step');
var runBtn = document.querySelector('#run');

// TEST
var cpu = new Cpu();
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



stepBtn.onclick = function () {
	emulator.step();
};
stepBtn.onclick = function () {
	emulator.run();
};
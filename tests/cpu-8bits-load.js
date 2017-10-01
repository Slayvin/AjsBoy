var assert = require('assert');
var cpuModule = require('../js/cpu.js');
var cpu_instructionsModule = require('../js/cpu-instructions.js');
//var cpu_extended_instructions = require('../js/cpu-instructions-extended.js');
var memoryModule = require('../js/memory-controller.js');

var memController = new memoryModule.MemController();
var cpu = new cpuModule.Cpu(memController);
var memory = memController.memory;

function randomByte() {
	var byte = Math.floor(Math.random() * 255) & 0xFF;
	return byte;
}
function randomWord() {
	var word = Math.floor(Math.random() * 0xFFFF) & 0xFFFF;
	return word;
}

function randomizeRegisters() {
	cpu.A = randomByte();
	cpu.B = randomByte();
	cpu.C = randomByte();
	cpu.D = randomByte();
	cpu.E = randomByte();
	cpu.H = randomByte();
	cpu.L = randomByte();
}


describe('Cpu', function () {
	describe('[LD r,n]', function () {
		it('should load 1 into register B', function () {
			cpu['LD r,n']('B', 1);
			assert.equal(1, cpu.B);
		});
		it('should load 5 into register A', function () {
			cpu['LD r,n']('A', 5);
			assert.equal(5, cpu.A);
		});
	});
	describe('[LD r2,r2]', function () {
		it('should load register C into register B', function () {
			randomizeRegisters();
			cpu['LD r1,r2']('B', 'C');
			assert.equal(cpu.C, cpu.B);
		});
		it('should load register H into register A', function () {
			randomizeRegisters();
			cpu['LD r1,r2']('A', 'H');
			assert.equal(cpu.A, cpu.H);
		});
	});
	describe('[LD A,addr]', function () {
		it('should load memory[addr] into register A', function () {
			randomizeRegisters();
			var addr = randomByte();
			cpu['LD A,addr'](addr);
			assert.equal(cpu.A, memory[addr]);
		});
	});
	describe('[LD addr,n]', function () {
		it('should load n in memory[addr]', function () {
			var n = randomByte();
			var addr = randomWord();
			cpu['LD addr,n'](addr, n);
			assert.equal(memory[addr], n);
		});
	});
});


var assert = require('assert');
var cpuModule = require('../js/cpu.js');
var cpu_instructionsModule = require('../js/cpu-instructions.js');
//var cpu_extended_instructions = require('../js/cpu-instructions-extended.js');
var memoryModule = require('../js/memory-controller.js');

var memController = new memoryModule.MemController();
var cpu = new cpuModule.Cpu(memController);

function randomByte() {
	var byte = Math.floor(Math.random() * 254) & 0xFF;
	return byte | 1;
}
function randomWord() {
	var word = Math.floor(Math.random() * 0xFFFF) & 0xFFFF;
	return word;
}

function getSmallerThan(x) {
	var r = randomByte();
	while (r >= x) {
		var r = randomByte();
	}
	return r;
}
function getLargerThan(x) {
	var r = randomByte();
	while (r < x) {
		var r = randomByte();
	}
	return r;
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

describe('Cpu 8-bits ALU', function () {
	describe('[SUB n]', function () {
		it('should substract n from register A, with n < A', function () {
			randomizeRegisters();
			var n = getSmallerThan(cpu.A);
			var result = (cpu.A - n) & 0xFF;
			cpu['SUB n'](n);
			assert.equal(result, cpu.A);
			assert.equal(0, cpu.flags.Z);
			assert.equal(1, cpu.flags.N);
//			assert.equal(1, cpu.flags.H);
			assert.equal(0, cpu.flags.C);
		});
		it('should substract n from register A, with n = A', function () {
			randomizeRegisters();
			var n = cpu.A;
			cpu['SUB n'](n);
			assert.equal(0, cpu.A);
			assert.equal(1, cpu.flags.Z);
			assert.equal(1, cpu.flags.N);
//			assert.equal(1, cpu.flags.H);
			assert.equal(0, cpu.flags.C);
		});
		it('should substract n from register A, with n > A', function () {
			randomizeRegisters();
			var n = getLargerThan(cpu.A);
			var result = (cpu.A - n) & 0xFF;
			cpu['SUB n'](n);
			assert.equal(result, cpu.A);
			assert.equal(0, cpu.flags.Z);
			assert.equal(1, cpu.flags.N);
//			assert.equal(1, cpu.flags.H);
			assert.equal(1, cpu.flags.C);
		});
	});
});
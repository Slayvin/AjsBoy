var assert = require('assert');
var cpuModule = require('../js/cpu.js');
var cpu_instructionsModule = require('../js/cpu-instructions.js');
//var cpu_extended_instructions = require('../js/cpu-instructions-extended.js');
var memoryModule = require('../js/memory-controller.js');

var memController = new memoryModule.MemController();
var cpu = new cpuModule.Cpu(memController);

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
});

describe('Cpu 8-bits ALU', function () {
	describe('[SUB n]', function () {
		it('should substract n from register A, with n < A', function () {
			var currentA = cpu.A;
			cpu['SUB n'](1);
			assert.equal(currentA - 1, cpu.A);
			assert.equal(0, cpu.flags.Z);
			assert.equal(1, cpu.flags.N);
//			assert.equal(1, cpu.flags.H);
			assert.equal(0, cpu.flags.C);
		});
		it('should substract n from register A, with n = A', function () {
			var currentA = cpu.A;
			cpu['SUB n'](currentA);
			assert.equal(0, cpu.A);
			assert.equal(1, cpu.flags.Z);
			assert.equal(1, cpu.flags.N);
//			assert.equal(1, cpu.flags.H);
			assert.equal(0, cpu.flags.C);
		});
		it('should substract n from register A, with n > A', function () {
			var currentA = cpu.A;
			cpu['SUB n'](currentA);
			assert.equal(0, cpu.A);
			assert.equal(1, cpu.flags.Z);
			assert.equal(1, cpu.flags.N);
//			assert.equal(1, cpu.flags.H);
			assert.equal(1, cpu.flags.C);
		});
	});
});
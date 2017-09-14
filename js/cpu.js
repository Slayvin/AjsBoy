'use strict';
/**
 * 
 * @param {Uint8Array} mem
 * @returns {Cpu}
 */
function Cpu(mem) {
	// Init memory
	this.memory = mem;

	var TIMA = 0xFF05;
	var TMA = 0xFF06;
	var TMC = 0xFF07;

	// Tells if latest executed instruction is 0xCB
	this.isExtendedInstruction = false;

	// Interrupts flags
	this.IME = 0;
//	this.IF=0;

	// 8-bits registers
	this.A = 0x00; // Used mainly for arithmetic operations
	this.F = 0x00; // Flags
	this.B = 0x00;
	this.C = 0x00;
	this.D = 0x00;
	this.E = 0x00;
	this.H = 0x00;
	this.L = 0x00;

	// 16-bits pointers
	this.PC = 0x0000; // Program counter
	this.SP = 0x0000; // Stack pointer

	// Flags
	this.flags = {};
	// Read from F register	
	// Z: Zero       (bit 7): is set when instructions result equals 0
	// N: Substract  (bit 6): is set when instruction represent a substraction, otherwise it represents an addition
	// H: Half-carry (bit 5): is set when a carry from bit 3 is done in arithmetical operation (useful for decimal adjust)
	// C: Carry      (bit 4): is set when a carry from bit 7 is done in arithmetical operation
	// Lowest 4 bits are unused

	let flags = ['Z', 'N', 'H', 'C'];
	for (let f = 0; f < flags.length; f++) {
		Object.defineProperty(this.flags, flags[f], {
			get: function (offset) {
				let mask = 1 << (7 - offset);
				return ((this.F & mask) !== 0) | 0;
			}.bind(this, f),
			set: function (offset, val) {
				let mask = 1 << (7 - offset);
				if (val == 0) {
					this.F &= ~mask;
				} else {
					this.F |= mask;
				}
			}.bind(this, f)
		});
	}

	// 16-bits registers (8-bits registers used in pairs)
	//	AF = () => this.A << 8 | this.F;
	//	BC = () => this.B << 8 | this.C;
	//	DE = () => this.D << 8 | this.E;
	//	HL = () => this.H << 8 | this.L;
	let registers = ['AF', 'BC', 'DE', 'HL'];
	for (var r = 0; r < registers.length; r++) {
		let hi = registers[r].substring(0, 1);
		let lo = registers[r].substr(-1);
		Object.defineProperty(this, registers[r], {
			get: function () {
				return this[hi] << 8 | this[lo];
			},
			set: function (val) {
				this[hi] = val >> 8;
				this[lo] = val & 0xFF;
			}
		});
	}

	this.stack = {
		pop: function (rr) {
			this[rr] = this.read16(this.SP);
			this.SP += 2;
		}.bind(this),
	};
}

Cpu.prototype.execute = function (opcode) {
	try {
		if (this.isExtendedInstruction) {
			this.instructions.extended[opcode].apply(this);
			this.isExtendedInstruction = false;
		} else {
			this.instructions[opcode].apply(this);
		}
	} catch (err) {
		window.console.log(err);
		window.console.log(this.memory);
		throw 'Instruction 0x' + opcode.toString(16) + ' not implemented.';
	}
};

Cpu.prototype.read16 = function (addr) {
	let lo = this.memory[addr];
	let hi = this.memory[addr + 1];
	return hi << 8 | lo;
};

Cpu.prototype.read8 = function (addr) {
	return this.memory[addr];
};

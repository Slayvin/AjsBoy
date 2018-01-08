'use strict';
/**
 * 
 * @param {MemController} Mmu
 * @returns {Cpu}
 */
function Cpu(Mmu) {
	'use strict';
	// Init memory
	this.memory = Mmu;

	var TIMA = 0xFF05;
	var TMA = 0xFF06;
	var TMC = 0xFF07;

	// Tells if latest executed instruction is 0xCB
	this.isExtendedInstruction = false;

	// Interrupts flags
	this.IME = 0;
//	this.IF=0xFF0F;
//	this.IE=0xFFFF;

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

	var flags = ['Z', 'N', 'H', 'C'];
	for (var f = 0; f < flags.length; f++) {
		Object.defineProperty(this.flags, flags[f], {
			get: function (offset) {
				var mask = 1 << (7 - offset);
				return ((this.F & mask) !== 0) | 0;
			}.bind(this, f),
			set: function (offset, val) {
				var mask = 1 << (7 - offset);
				if (val === 0) {
					this.F &= ~mask;
				} else {
					this.F |= mask;
				}
			}.bind(this, f)
		});
	}

	// 16-bits registers (8-bits registers used in pairs)
	var registers = ['AF', 'BC', 'DE', 'HL'];
	for (var r = 0; r < registers.length; r++) {
		var hi = registers[r].substring(0, 1);
		var lo = registers[r].substr(-1);
		Object.defineProperty(this, registers[r], {
			get: function (registers) {
				return this[registers.hi] << 8 | this[registers.lo];
			}.bind(this, {'hi': hi, 'lo': lo}),
			set: function (registers, val) {
				this[registers.hi] = (val & 0xFF00) >> 8;
				this[registers.lo] = val & 0xFF;
			}.bind(this, {'hi': hi, 'lo': lo})
		});
	}

}

Cpu.prototype.execute = function (opcode) {
	if (this.isExtendedInstruction) {
		this.instructions.extended[opcode].call(this, this.memory);
		this.isExtendedInstruction = false;
	} else {
		this.instructions[opcode].call(this, this.memory);
	}
};

if (typeof exports !== 'undefined') {
	exports.Cpu = Cpu;
}

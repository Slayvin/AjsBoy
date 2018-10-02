'use strict';
/**
 * 
 * @param {gbEmu} Emulator
 * @returns {Cpu}
 */
function Cpu(Emulator) {
	'use strict';
	// Init memory
	this.memory = Emulator.mmu;

	// Tells if latest executed instruction is 0xCB
	this.isExtendedInstruction = false;

	// Interrupts controller
	this.imu = Emulator.imu;

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

	['Z', 'N', 'H', 'C'].forEach((flag, idx) => {
		Object.defineProperty(this.flags, flag, {
			get: function (offset) {
				var mask = 1 << (7 - offset);
				return ((this.F & mask) !== 0) | 0;
			}.bind(this, idx),
			set: function (offset, val) {
				var mask = 1 << (7 - offset);
				if (val === 0) {
					this.F &= ~mask;
				} else {
					this.F |= mask;
				}
			}.bind(this, idx)
		});
	});

	// 16-bits registers (8-bits registers used in pairs)
	['AF', 'BC', 'DE', 'HL'].forEach(register => {
		var hi = register.substring(0, 1);
		var lo = register.substr(-1);
		Object.defineProperty(this, register, {
			get: function (registers) {
				return this[registers.hi] << 8 | this[registers.lo];
			}.bind(this, {'hi': hi, 'lo': lo}),
			set: function (registers, val) {
				this[registers.hi] = (val & 0xFF00) >> 8;
				this[registers.lo] = val & 0xFF;
			}.bind(this, {'hi': hi, 'lo': lo})
		});
	});

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

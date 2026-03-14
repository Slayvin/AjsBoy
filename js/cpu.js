'use strict';
/**
 * 
 * @param {gbEmu} Emulator
 * @returns {Cpu}
 */
class Cpu {
	constructor(Emulator) {
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
				get: () => {
					const mask = 1 << (7 - idx);
					return ((this.F & mask) !== 0) | 0;
				},
				set: (val) => {
					const mask = 1 << (7 - idx);
					if (val === 0) {
						this.F &= ~mask;
					} else {
						this.F |= mask;
					}
				}
			});
		});

		// 16-bits registers (8-bits registers used in pairs)
		['AF', 'BC', 'DE', 'HL'].forEach(register => {
			const hi = register.substring(0, 1);
			const lo = register.substring(1, 2);
			Object.defineProperty(this, register, {
				get: () => {
					return this[hi] << 8 | this[lo];
				},
				set: (val) => {
					this[hi] = (val & 0xFF00) >> 8;
					this[lo] = val & 0xFF;
				}
			});
		});

		this.halted = false;
		this.stopped = false;

	}

	/**
	 *
	 * @param {number} opcode The instruction that should be executed
	 * @returns {number} The number of machine cycles the instruction takes
	 */
	execute(opcode) {
		if (this.halted) {
			return 1; // HALT mode : the CPU does nothing but still consumes power, so it still takes 1 cycle per instruction
		}
		if (this.isExtendedInstruction) {
			const cycles = this.instructions.extended[opcode].call(this, this.memory);
			this.isExtendedInstruction = false;
			return cycles;
		} else {
			const cycles = this.instructions[opcode].call(this, this.memory);
			return cycles;
		}
	}
}

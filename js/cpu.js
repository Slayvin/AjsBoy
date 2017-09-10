'use strict';
function Cpu(memory) {
	this.memory = memory;
	this.code = '';
	// 8-bits registers
	this.A = 0x00; // For arithmetic operations
	this.F = 0x00; // Flags
	this.B = 0x00;
	this.C = 0x00;
	this.D = 0x00;
	this.E = 0x00;
	this.H = 0x00;
	this.L = 0x00;
	// 16-bits registers (8-bits registers used in pairs)
	//	this.BC = () => this.B << 8 | this.C;
	//	this.DE = () => this.D << 8 | this.E;
	//	this.HL = () => this.H << 8 | this.L;

	// 16-bits pointers
	this.PC = 0x0000; // Program counter
	this.SP = 0x0000; // Stack pointer

	// Flags
	// Read from F register	
	this.flags = {
//		Z: 0, // Zero       (bit 7): is set when instructions result equals 0
//		N: 0, // Substract  (bit 6): is set when instruction represent a substraction, otherwise it represents an addition
//		H: 0, // Half-carry (bit 5): is set when a carry from bit 3 is done in arithmetical operation (useful for decimal adjust)
//		C: 0 // Carry       (bit 4): is set when a carry from bit 7 is done in arithmetical operation
		// Lowest 4 bits are unused

	};
	let flags = ['Z', 'N', 'H', 'C'];
	for (var f = 0; f < flags.length; f++) {
		Object.defineProperty(this.flags, flags[f], {
			get: function (offset) {
				let mask = 1 << (7 - offset);
				return ((this.F & mask) !== 0) | 0;
			}.bind(this, f),
			set: function (offset, val) {
				let mask = val << (7 - offset);
				this.F |= mask;
			}.bind(this, f)
		});
	}


	// 16-bits registers (8-bits registers used in pairs)
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
}

Cpu.prototype.execute = function (opcode) {
	try {
		this.instructions[opcode].apply(this);
	} catch (err) {
		window.console.log(err);
		window.console.log(this.memory);
		throw 'Instruction 0x' + opcode.toString(16) + ' not implemented.';
	}
};

(function () {
	this.read16 = function (addr) {
		let lo = this.memory[addr];
		let hi = this.memory[addr + 1];
		return hi << 8 | lo;
	};
	this.read8 = function (addr) {
		return this.memory[addr];
	};
	// 8-bits loads
	// ======================================================
	// LD r,n
	this['LD r,n'] = function (r, n) {
		this.code = 'LD ' + r + ',' + n.toString(16);
		this[r] = n;
		this.PC++;
	};
	this['LD r1,r2'] = function (r1, r2) {
		this.code = 'LD ' + r1 + ',' + r2;
		this[r1] = this[r2];
		this.PC++;
	};
	// 8-bits ALU
	// ======================================================
	// XOR n
	this['XOR n'] = function (n) {
		this.code = 'XOR n';
		this.A = n ^ this.A;
		this.PC++;
	};
	// 16-bits loads
	// ======================================================
	// LD rr,nn
	this['LD rr,nn'] = function (rr, nn) {
		this.code = 'LD ' + rr + ',' + nn.toString(16);
		this[rr] = nn;
		this.PC++;
	};
}).apply(Cpu.prototype);
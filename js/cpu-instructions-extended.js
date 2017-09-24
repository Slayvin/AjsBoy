/* global Cpu */
'use strict';
(function (Cpu) {
// ============================================================================
// Common instructions
// ============================================================================
	(function () {
		// ====================================================================
		// Misc
		// ====================================================================
		this['SWAP n'] = function (n) {
			this.code = 'SWAP ' + n.toString(16);
			var lo = n & 0x0F;
			var hi = n & 0xF0;
			var result = (lo << 4) & (hi >>> 4);
			this.PC++;
			return result;
		};
	}).apply(Cpu.prototype);
// ============================================================================
// All extended Operation codes
// ============================================================================
	Cpu.prototype.instructions.extended = {
// RLCA
// RLA
// RRCA
// RRA
// RLC n
// RL n
		// RL A
		0x17: function () {
			this.code = 'RL A';
			var carry = this.A >>> 7;
			this.A = (this.A << 1) & 0xFF | this.flags.C;
			this.flags.Z = (this.A === 0) | 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = carry;
			this.PC++;
		},
		// RL B
		0x10: function () {
			this.code = 'RL B';
			var carry = this.B >>> 7;
			this.B = (this.B << 1) & 0xFF | this.flags.C;
			this.flags.Z = (this.B === 0) | 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = carry;
			this.PC++;
		},
		// RL C
		0x11: function () {
			this.code = 'RL C';
			var carry = this.C >>> 7;
			this.C = (this.C << 1) & 0xFF | this.flags.C;
			this.flags.Z = (this.C === 0) | 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = carry;
			this.PC++;
		},
// ----------------------------------------------------------------------------
		// BIT 7,H
		0x7c: function () {
			this.code = 'BIT 7,H';
			var mask = 0x1 << 7;
			this.flags.Z = !(mask & this.H) | 0;
			this.flags.N = 0;
			this.flags.H = 1;
			this.PC++;
		},
// ----------------------------------------------------------------------------
		// SWAP A
		0x37: function () {
			this.A = this['SWAP n'](this.A);
		},
		// SWAP B
		0x30: function () {
			this.B = this['SWAP n'](this.B);
		},
		// SWAP C
		0x31: function () {
			this.C = this['SWAP n'](this.C);
		},
		// SWAP D
		0x32: function () {
			this.D = this['SWAP n'](this.D);
		},
		// SWAP E
		0x33: function () {
			this.E = this['SWAP n'](this.E);
		},
		// SWAP H
		0x34: function () {
			this.H = this['SWAP n'](this.H);
		},
		// SWAP L
		0x35: function () {
			this.L = this['SWAP n'](this.L);
		},

	};
})(Cpu);
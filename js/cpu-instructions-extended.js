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
		this['RL n'] = function (n) {
			this.code = 'RL ' + n.toString(16);
			var carry = n >>> 7;
			var result = (n << 1) & 0xFF | this.flags.C;
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = carry;
			this.PC++;
			return result;
		};
		this['RR n'] = function (n) {
			this.code = 'RR ' + n.toString(16);
			var result = (n >>> 1) & (this.flags.C << 7);
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = n & 1;
			this.PC++;
			return result;
		};
		this['SRL n'] = function (n) {
			this.code = 'SRL ' + n.toString(16);
			var result = n >>> 1;
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = n & 1;
			this.PC++;
			return result;
		};
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
		
// RLC n
// ----------------------------------------------------------------------------
		// RL A
		0x17: function () {
			this.A = this['RL n'](this.A);
		},
		// RL B
		0x10: function () {
			this.B = this['RL n'](this.B);
		},
		// RL C
		0x11: function () {
			this.C = this['RL n'](this.C);
		},
// ----------------------------------------------------------------------------
// RRC
// ----------------------------------------------------------------------------
		// RR A
		0x1f: function () {
			this.A = this['RR n'](this.A);
		},
		// RR B
		0x18: function () {
			this.B = this['RR n'](this.B);
		},
		// RR C
		0x19: function () {
			this.C = this['RR n'](this.C);
		},
		// RR D
		0x1a: function () {
			this.D = this['RR n'](this.D);
		},
		// RR E
		0x1b: function () {
			this.E = this['RR n'](this.E);
		},
		// RR H
		0x1c: function () {
			this.H = this['RR n'](this.H);
		},
		// RR L
		0x1d: function () {
			this.L = this['RR n'](this.L);
		},
// ----------------------------------------------------------------------------
		// SRL A
		0x3f: function () {
			this.A = this['SRL n'](this.A);
		},
		// SRL B
		0x38: function () {
			this.B = this['SRL n'](this.B);
		},
		// SRL C
		0x39: function () {
			this.C = this['SRL n'](this.C);
		},
		// SRL D
		0x3a: function () {
			this.D = this['SRL n'](this.D);
		},
		// SRL E
		0x3b: function () {
			this.E = this['SRL n'](this.E);
		},
		// SRL H
		0x3c: function () {
			this.H = this['SRL n'](this.H);
		},
		// SRL L
		0x3d: function () {
			this.L = this['SRL n'](this.L);
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
		// SET 0,B
		0xc0: function () {
			this.B = this.B | 1;
			this.PC++;
		},
		// SET 5,A
		0xef: function () {
			this.A = this.A | 0x20;
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
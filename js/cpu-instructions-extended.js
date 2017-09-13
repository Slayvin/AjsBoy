/* global Cpu */
'use strict';
// All extended Operation codes
Cpu.prototype.instructions.extended = {
// RLCA
// RLA
// RRCA
// RRA
// RLC n
// RL n
	// RL A
	0x17: function () {
		let carry = this.A >>> 7;
		this.A = (this.A << 1) & 0xFF | this.flags.C;
		this.flags.C = carry;
		this.flags.Z = (this.A === 0) | 0;
		this.flags.N = 0;
		this.flags.H = 0;
	},
	// RL B
	0x10: function () {
		let carry = this.B >>> 7;
		this.B = (this.B << 1) & 0xFF | this.flags.C;
		this.flags.C = carry;
		this.flags.Z = (this.B === 0) | 0;
		this.flags.N = 0;
		this.flags.H = 0;
	},
	// RL C
	0x11: function () {
		let carry = this.C >>> 7;
		this.C = (this.C << 1) & 0xFF | this.flags.C;
		this.flags.C = carry;
		this.flags.Z = (this.C === 0) | 0;
		this.flags.N = 0;
		this.flags.H = 0;
	},
// ----------------------------------------------------------------
	// BIT 7,H
	0x7c: function () {
		this.code = 'BIT 7,H';
		let mask = 0x1 << 7;
		this.flags.Z = !(mask & this.H) | 0;
		this.flags.N = 0;
		this.flags.H = 1;
	}

};
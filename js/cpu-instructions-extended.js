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
			var result = (n >>> 1) | (this.flags.C << 7);
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
		this['SET b,n'] = function (b, n) {
			var mask = 1 << b;
			this.PC++;
			return n | mask;
		};
		this['RES b,n'] = function (b, n) {
			var mask = 0xFF ^ (1 << b);
			this.PC++;
			return n & mask;
		};
		this['SWAP n'] = function (n) {
			this.code = 'SWAP ' + n.toString(16);
			var lo = n & 0x0F;
			var hi = n & 0xF0;
			var result = (lo << 4) & (hi >>> 4);
			this.PC++;
			return result;
		};
		// Read bit at position n for register r
		this['BIT n,r'] = function (n, r) {
			this.code = 'BIT ' + n + ',' + r;
			var mask = 0x1 << n;
			this.flags.Z = !(mask & this[r]) | 0;
			this.flags.N = 0;
			this.flags.H = 1;
			this.PC++;
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
		// SRL (HL)
		0x3e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SRL n'](n);
			mem.write(addr, result);
		},
// ----------------------------------------------------------------------------
		// BIT 6,B
		0x70: function () {
			this['BIT n,r'](6, 'B');
		},
		// BIT 6,C
		0x71: function () {
			this['BIT n,r'](6, 'C');
		},
		// BIT 7,H
		0x7c: function () {
			this['BIT n,r'](7, 'H');
		},
// ----------------------------------------------------------------------------
		// SET 0,B
		0xc0: function () {
			this.B = this['SET b,n'](0, this.B);
		},
		// SET 4,E
		0xe3: function () {
			this.E = this['SET b,n'](4, this.E);
		},
		// SET 5,A
		0xef: function () {
			this.A = this['SET b,n'](5, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 0
		// RES 0,B
		0x80: function () {
			this.B = this['RES b,n'](0, this.B);
		},
		// RES 0,C
		0x81: function () {
			this.C = this['RES b,n'](0, this.C);
		},
		// RES 0,D
		0x82: function () {
			this.D = this['RES b,n'](0, this.D);
		},
		// RES 0,E
		0x83: function () {
			this.E = this['RES b,n'](0, this.E);
		},
		// RES 0,H
		0x84: function () {
			this.H = this['RES b,n'](0, this.H);
		},
		// RES 0,L
		0x85: function () {
			this.L = this['RES b,n'](0, this.L);
		},
		// RES 0,(HL)
		0x86: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](0, n);
			mem.write(addr, result);
		},
		// RES 0,A
		0x87: function () {
			this.A = this['RES b,n'](0, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 1
		// RES 1,B
		0x88: function () {
			this.B = this['RES b,n'](1, this.B);
		},
		// RES 1,C
		0x89: function () {
			this.C = this['RES b,n'](1, this.C);
		},
		// RES 1,D
		0x8a: function () {
			this.D = this['RES b,n'](1, this.D);
		},
		// RES 1,E
		0x8b: function () {
			this.E = this['RES b,n'](1, this.E);
		},
		// RES 1,H
		0x8c: function () {
			this.H = this['RES b,n'](1, this.H);
		},
		// RES 1,L
		0x8d: function () {
			this.L = this['RES b,n'](1, this.L);
		},
		// RES 1,(HL)
		0x8e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](1, n);
			mem.write(addr, result);
		},
		// RES 1,A
		0x8f: function () {
			this.A = this['RES b,n'](1, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 2
		// RES 2,B
		0x90: function () {
			this.B = this['RES b,n'](2, this.B);
		},
		// RES 2,C
		0x91: function () {
			this.C = this['RES b,n'](2, this.C);
		},
		// RES 2,D
		0x92: function () {
			this.D = this['RES b,n'](2, this.D);
		},
		// RES 2,E
		0x93: function () {
			this.E = this['RES b,n'](2, this.E);
		},
		// RES 2,H
		0x94: function () {
			this.H = this['RES b,n'](2, this.H);
		},
		// RES 2,L
		0x95: function () {
			this.L = this['RES b,n'](2, this.L);
		},
		// RES 2,(HL)
		0x96: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](2, n);
			mem.write(addr, result);
		},
		// RES 2,A
		0x97: function () {
			this.A = this['RES b,n'](2, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 3
		// RES 3,B
		0x98: function () {
			this.B = this['RES b,n'](3, this.B);
		},
		// RES 3,C
		0x99: function () {
			this.C = this['RES b,n'](3, this.C);
		},
		// RES 3,D
		0x9a: function () {
			this.D = this['RES b,n'](3, this.D);
		},
		// RES 3,E
		0x9b: function () {
			this.E = this['RES b,n'](3, this.E);
		},
		// RES 3,H
		0x9c: function () {
			this.H = this['RES b,n'](3, this.H);
		},
		// RES 3,L
		0x9d: function () {
			this.L = this['RES b,n'](3, this.L);
		},
		// RES 3,(HL)
		0x9e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](3, n);
			mem.write(addr, result);
		},
		// RES 3,A
		0x9f: function () {
			this.A = this['RES b,n'](3, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 4
		// RES 4,B
		0xa0: function () {
			this.B = this['RES b,n'](4, this.B);
		},
		// RES 4,C
		0xa1: function () {
			this.C = this['RES b,n'](4, this.C);
		},
		// RES 4,D
		0xa2: function () {
			this.D = this['RES b,n'](4, this.D);
		},
		// RES 4,E
		0xa3: function () {
			this.E = this['RES b,n'](4, this.E);
		},
		// RES 4,H
		0xa4: function () {
			this.H = this['RES b,n'](4, this.H);
		},
		// RES 4,L
		0xa5: function () {
			this.L = this['RES b,n'](4, this.L);
		},
		// RES 4,(HL)
		0xa6: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](4, n);
			mem.write(addr, result);
		},
		// RES 4,A
		0xa7: function () {
			this.A = this['RES b,n'](4, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 5
		// RES 5,B
		0xa8: function () {
			this.B = this['RES b,n'](5, this.B);
		},
		// RES 5,C
		0xa9: function () {
			this.C = this['RES b,n'](5, this.C);
		},
		// RES 5,D
		0xaa: function () {
			this.D = this['RES b,n'](5, this.D);
		},
		// RES 5,E
		0xab: function () {
			this.E = this['RES b,n'](5, this.E);
		},
		// RES 5,H
		0xac: function () {
			this.H = this['RES b,n'](5, this.H);
		},
		// RES 5,L
		0xad: function () {
			this.L = this['RES b,n'](5, this.L);
		},
		// RES 5,(HL)
		0xae: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](5, n);
			mem.write(addr, result);
		},
		// RES 5,A
		0xaf: function () {
			this.A = this['RES b,n'](5, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 6
		// RES 6,B
		0xb0: function () {
			this.B = this['RES b,n'](6, this.B);
		},
		// RES 6,C
		0xb1: function () {
			this.C = this['RES b,n'](6, this.C);
		},
		// RES 6,D
		0xb2: function () {
			this.D = this['RES b,n'](6, this.D);
		},
		// RES 6,E
		0xb3: function () {
			this.E = this['RES b,n'](6, this.E);
		},
		// RES 6,H
		0xb4: function () {
			this.H = this['RES b,n'](6, this.H);
		},
		// RES 6,L
		0xb5: function () {
			this.L = this['RES b,n'](6, this.L);
		},
		// RES 6,(HL)
		0xb6: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](6, n);
			mem.write(addr, result);
		},
		// RES 6,A
		0xb7: function () {
			this.A = this['RES b,n'](6, this.A);
		},
// ----------------------------------------------------------------------------
// RESET BIT 7
		// RES 7,B
		0xb8: function () {
			this.B = this['RES b,n'](7, this.B);
		},
		// RES 7,C
		0xb9: function () {
			this.C = this['RES b,n'](7, this.C);
		},
		// RES 7,D
		0xba: function () {
			this.D = this['RES b,n'](7, this.D);
		},
		// RES 7,E
		0xbb: function () {
			this.E = this['RES b,n'](7, this.E);
		},
		// RES 7,H
		0xbc: function () {
			this.H = this['RES b,n'](7, this.H);
		},
		// RES 7,L
		0xbd: function () {
			this.L = this['RES b,n'](7, this.L);
		},
		// RES 7,(HL)
		0xbe: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this.result = this['RES b,n'](7, n);
			mem.write(addr, result);
		},
		// RES 7,A
		0xbf: function () {
			this.A = this['RES b,n'](7, this.A);
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
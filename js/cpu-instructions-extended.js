'use strict';

/* global Cpu */

(function (Cpu) {
// ============================================================================
// Common instructions
// ============================================================================
	(function () {
		// ====================================================================
		// Misc
		// ====================================================================
		this['RL n'] = function (n, wCY) {
			// this.code = 'RL' + (wCY ? ' ' : 'C ') + n.toString(16);
			var bit7 = (n & 0xFF) >>> 7;
			var result = (n << 1) & 0xFF | (wCY ? this.flags.C : bit7);
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = bit7;
			this.PC++;
			return result;
		};
		this['RR n'] = function (n, wCY) {
			// this.code = 'RR' + (wCY ? ' ' : 'C ') + n.toString(16);
			var bit0 = n & 1;
			var result = ((n & 0xFF) >>> 1) | (wCY ? this.flags.C << 7 : bit0 << 7);
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = bit0;
			this.PC++;
			return result;
		};
		this['SLA n'] = function (n) {
			// this.code = 'SLA ' + n.toString(16);
			var result = n << 1;
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = (n & 0xFF) >>> 7;
			this.PC++;
			return (result & 0xFF);
		};
		this['SRA n'] = function (n) {
			// this.code = 'SRA ' + n.toString(16);
			var bit7 = n & (1 << 7);
			var result = (n >> 1) | bit7;
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = n & 1;
			this.PC++;
			return (result & 0xFF);
		};
		this['SRL n'] = function (n) {
			// this.code = 'SRL ' + n.toString(16);
			var result = (n & 0xFF) >>> 1;
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = n & 1;
			this.PC++;
			return (result & 0xFF);
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
			// this.code = 'SWAP ' + n.toString(16);
			var lo = n & 0x0F;
			var hi = n & 0xF0;
			var result = (lo << 4) | (hi >>> 4);
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = 0;
			this.PC++;
			return result;
		};
		// Read bit at position n for register r
		this['BIT n,r'] = function (n, r) {
			// this.code = 'BIT ' + n + ',' + r;
			var mask = 0x1 << n;
			this.flags.Z = !(mask & this[r]) | 0;
			this.flags.N = 0;
			this.flags.H = 1;
			this.PC++;
		};
		// Read bit at position b for int n
		this['BIT b,n'] = function (b, n) {
			// this.code = 'BIT ' + b + ',' + n;
			var mask = 0x1 << b;
			this.flags.Z = !(mask & n) | 0;
			this.flags.N = 0;
			this.flags.H = 1;
			this.PC++;
		};
	}).apply(Cpu.prototype);
// ============================================================================
// All extended Operation codes
// ============================================================================
	Cpu.prototype.instructions.extended = {
		// RLC B
		0x00: function () {
			this.B = this['RL n'](this.B, false);
		},
		// RLC C
		0x01: function () {
			this.C = this['RL n'](this.C, false);
		},
		// RLC D
		0x02: function () {
			this.D = this['RL n'](this.D, false);
		},
		// RLC E
		0x03: function () {
			this.E = this['RL n'](this.E, false);
		},
		// RLC H
		0x04: function () {
			this.H = this['RL n'](this.H, false);
		},
		// RLC L
		0x05: function () {
			this.L = this['RL n'](this.L, false);
		},
		// RLC (HL)
		0x06: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['RL n'](n, false);
			mem.write(addr, result);
		},
		// RLC A
		0x07: function () {
			this.A = this['RL n'](this.A, false);
		},
// ----------------------------------------------------------------------------
		// RRC B
		0x08: function () {
			this.B = this['RR n'](this.B, false);
		},
		// RRC C
		0x09: function () {
			this.C = this['RR n'](this.C, false);
		},
		// RRC D
		0x0a: function () {
			this.D = this['RR n'](this.D, false);
		},
		// RRC E
		0x0b: function () {
			this.E = this['RR n'](this.E, false);
		},
		// RRC H
		0x0c: function () {
			this.H = this['RR n'](this.H, false);
		},
		// RRC L
		0x0d: function () {
			this.L = this['RR n'](this.L, false);
		},
		// RRC (HL)
		0x0e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['RR n'](n, false);
			mem.write(addr, result);
		},
		// RRC A
		0x0f: function () {
			this.A = this['RR n'](this.A, false);
		},
// ----------------------------------------------------------------------------
		// RL B
		0x10: function () {
			this.B = this['RL n'](this.B, true);
		},
		// RL C
		0x11: function () {
			this.C = this['RL n'](this.C, true);
		},
		// RL D
		0x12: function () {
			this.D = this['RL n'](this.D, true);
		},
		// RL E
		0x13: function () {
			this.E = this['RL n'](this.E, true);
		},
		// RL H
		0x14: function () {
			this.H = this['RL n'](this.H, true);
		},
		// RL L
		0x15: function () {
			this.L = this['RL n'](this.L, true);
		},
		// RL (HL)
		0x16: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['RL n'](n, true);
			mem.write(addr, result);
		},
		// RL A
		0x17: function () {
			this.A = this['RL n'](this.A, true);
		},
// ----------------------------------------------------------------------------
		// RR B
		0x18: function () {
			this.B = this['RR n'](this.B, true);
		},
		// RR C
		0x19: function () {
			this.C = this['RR n'](this.C, true);
		},
		// RR D
		0x1a: function () {
			this.D = this['RR n'](this.D, true);
		},
		// RR E
		0x1b: function () {
			this.E = this['RR n'](this.E, true);
		},
		// RR H
		0x1c: function () {
			this.H = this['RR n'](this.H, true);
		},
		// RR L
		0x1d: function () {
			this.L = this['RR n'](this.L, true);
		},
		// RR (HL)
		0x1e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['RR n'](n, true);
			mem.write(addr, result);
		},
		// RR A
		0x1f: function () {
			this.A = this['RR n'](this.A, true);
		},
// ----------------------------------------------------------------------------
		// SLA B
		0x20: function () {
			this.B = this['SLA n'](this.B);
		},
		// SLA C
		0x21: function () {
			this.C = this['SLA n'](this.C);
		},
		// SLA D
		0x22: function () {
			this.D = this['SLA n'](this.D);
		},
		// SLA E
		0x23: function () {
			this.E = this['SLA n'](this.E);
		},
		// SLA H
		0x24: function () {
			this.H = this['SLA n'](this.H);
		},
		// SLA L
		0x25: function () {
			this.L = this['SLA n'](this.L);
		},
		// SLA (HL)
		0x26: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SLA n'](n);
			mem.write(addr, result);
		},
		// SLA A
		0x27: function () {
			this.A = this['SLA n'](this.A);
		},
// ----------------------------------------------------------------------------
		// SRA B
		0x28: function () {
			this.B = this['SRA n'](this.B);
		},
		// SRA C
		0x29: function () {
			this.C = this['SRA n'](this.C);
		},
		// SRA D
		0x2a: function () {
			this.D = this['SRA n'](this.D);
		},
		// SRA E
		0x2b: function () {
			this.E = this['SRA n'](this.E);
		},
		// SRA H
		0x2c: function () {
			this.H = this['SRA n'](this.H);
		},
		// SRA L
		0x2d: function () {
			this.L = this['SRA n'](this.L);
		},
		// SRA (HL)
		0x2e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SRA n'](n);
			mem.write(addr, result);
		},
		// SRA A
		0x2f: function () {
			this.A = this['SRA n'](this.A);
		},
// ----------------------------------------------------------------------------
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
		// SRL A
		0x3f: function () {
			this.A = this['SRL n'](this.A);
		},
// ----------------------------------------------------------------------------
// READ BIT 0
		// BIT 0,B
		0x40: function () {
			this['BIT n,r'](0, 'B');
		},
		// BIT 0,C
		0x41: function () {
			this['BIT n,r'](0, 'C');
		},
		// BIT 0,D
		0x42: function () {
			this['BIT n,r'](0, 'D');
		},
		// BIT 0,E
		0x43: function () {
			this['BIT n,r'](0, 'E');
		},
		// BIT 0,H
		0x44: function () {
			this['BIT n,r'](0, 'H');
		},
		// BIT 0,L
		0x45: function () {
			this['BIT n,r'](0, 'L');
		},
		// BIT 0,(HL)
		0x46: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](0, n);
		},
		// BIT 0,A
		0x47: function () {
			this['BIT n,r'](0, 'A');
		},
// ----------------------------------------------------------------------------
// READ BIT 1
		// BIT 1,B
		0x48: function () {
			this['BIT n,r'](1, 'B');
		},
		// BIT 1,C
		0x49: function () {
			this['BIT n,r'](1, 'C');
		},
		// BIT 1,D
		0x4a: function () {
			this['BIT n,r'](1, 'D');
		},
		// BIT 1,E
		0x4b: function () {
			this['BIT n,r'](1, 'E');
		},
		// BIT 1,H
		0x4c: function () {
			this['BIT n,r'](1, 'H');
		},
		// BIT 1,L
		0x4d: function () {
			this['BIT n,r'](1, 'L');
		},
		// BIT 1,(HL)
		0x4e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](1, n);
		},
		// BIT 1,A
		0x4f: function () {
			this['BIT n,r'](1, 'A');
		},
// ----------------------------------------------------------------------------
// READ BIT 2
		// BIT 2,B
		0x50: function () {
			this['BIT n,r'](2, 'B');
		},
		// BIT 2,C
		0x51: function () {
			this['BIT n,r'](2, 'C');
		},
		// BIT 2,D
		0x52: function () {
			this['BIT n,r'](2, 'D');
		},
		// BIT 2,E
		0x53: function () {
			this['BIT n,r'](2, 'E');
		},
		// BIT 2,H
		0x54: function () {
			this['BIT n,r'](2, 'H');
		},
		// BIT 2,L
		0x55: function () {
			this['BIT n,r'](2, 'L');
		},
		// BIT 2,(HL)
		0x56: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](2, n);
		},
		// BIT 2,A
		0x57: function () {
			this['BIT n,r'](2, 'A');
		},
// ----------------------------------------------------------------------------
// READ BIT 3
		// BIT 3,B
		0x58: function () {
			this['BIT n,r'](3, 'B');
		},
		// BIT 3,C
		0x59: function () {
			this['BIT n,r'](3, 'C');
		},
		// BIT 3,D
		0x5a: function () {
			this['BIT n,r'](3, 'D');
		},
		// BIT 3,E
		0x5b: function () {
			this['BIT n,r'](3, 'E');
		},
		// BIT 3,H
		0x5c: function () {
			this['BIT n,r'](3, 'H');
		},
		// BIT 3,L
		0x5d: function () {
			this['BIT n,r'](3, 'L');
		},
		// BIT 3,(HL)
		0x5e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](3, n);
		},
		// BIT 3,A
		0x5f: function () {
			this['BIT n,r'](3, 'A');
		},
// ----------------------------------------------------------------------------
// READ BIT 4
		// BIT 4,B
		0x60: function () {
			this['BIT n,r'](4, 'B');
		},
		// BIT 4,C
		0x61: function () {
			this['BIT n,r'](4, 'C');
		},
		// BIT 4,D
		0x62: function () {
			this['BIT n,r'](4, 'D');
		},
		// BIT 4,E
		0x63: function () {
			this['BIT n,r'](4, 'E');
		},
		// BIT 4,H
		0x64: function () {
			this['BIT n,r'](4, 'H');
		},
		// BIT 4,L
		0x65: function () {
			this['BIT n,r'](4, 'L');
		},
		// BIT 4,(HL)
		0x66: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](4, n);
		},
		// BIT 4,A
		0x67: function () {
			this['BIT n,r'](4, 'A');
		},
// ----------------------------------------------------------------------------
// READ BIT 5
		// BIT 5,B
		0x68: function () {
			this['BIT n,r'](5, 'B');
		},
		// BIT 5,C
		0x69: function () {
			this['BIT n,r'](5, 'C');
		},
		// BIT 5,D
		0x6a: function () {
			this['BIT n,r'](5, 'D');
		},
		// BIT 5,E
		0x6b: function () {
			this['BIT n,r'](5, 'E');
		},
		// BIT 5,H
		0x6c: function () {
			this['BIT n,r'](5, 'H');
		},
		// BIT 5,L
		0x6d: function () {
			this['BIT n,r'](5, 'L');
		},
		// BIT 5,(HL)
		0x6e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](5, n);
		},
		// BIT 5,A
		0x6f: function () {
			this['BIT n,r'](5, 'A');
		},
// ----------------------------------------------------------------------------
// READ BIT 6
		// BIT 6,B
		0x70: function () {
			this['BIT n,r'](6, 'B');
		},
		// BIT 6,C
		0x71: function () {
			this['BIT n,r'](6, 'C');
		},
		// BIT 6,D
		0x72: function () {
			this['BIT n,r'](6, 'D');
		},
		// BIT 6,E
		0x73: function () {
			this['BIT n,r'](6, 'E');
		},
		// BIT 6,H
		0x74: function () {
			this['BIT n,r'](6, 'H');
		},
		// BIT 6,L
		0x75: function () {
			this['BIT n,r'](6, 'L');
		},
		// BIT 6,(HL)
		0x76: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](6, n);
		},
		// BIT 6,A
		0x77: function () {
			this['BIT n,r'](6, 'A');
		},
// ----------------------------------------------------------------------------
// READ BIT 5
		// BIT 7,B
		0x78: function () {
			this['BIT n,r'](7, 'B');
		},
		// BIT 7,C
		0x79: function () {
			this['BIT n,r'](7, 'C');
		},
		// BIT 7,D
		0x7a: function () {
			this['BIT n,r'](7, 'D');
		},
		// BIT 7,E
		0x7b: function () {
			this['BIT n,r'](7, 'E');
		},
		// BIT 7,H
		0x7c: function () {
			this['BIT n,r'](7, 'H');
		},
		// BIT 7,L
		0x7d: function () {
			this['BIT n,r'](7, 'L');
		},
		// BIT 7,(HL)
		0x7e: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			this['BIT b,n'](7, n);
		},
		// BIT 7,A
		0x7f: function () {
			this['BIT n,r'](7, 'A');
		},
// ----------------------------------------------------------------------------
// SET BIT 0
		// SET 0,B
		0xc0: function () {
			this.B = this['SET b,n'](0, this.B);
		},
		// SET 0,C
		0xc1: function () {
			this.C = this['SET b,n'](0, this.C);
		},
		// SET 0,D
		0xc2: function () {
			this.D = this['SET b,n'](0, this.D);
		},
		// SET 0,E
		0xc3: function () {
			this.E = this['SET b,n'](0, this.E);
		},
		// SET 0,H
		0xc4: function () {
			this.H = this['SET b,n'](0, this.H);
		},
		// SET 0,L
		0xc5: function () {
			this.L = this['SET b,n'](0, this.L);
		},
		// SET 0,(HL)
		0xc6: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](0, n);
			mem.write(addr, result);
		},
		// SET 0,A
		0xc7: function () {
			this.A = this['SET b,n'](0, this.A);
		},
// ----------------------------------------------------------------------------
// SET BIT 1
		// SET 1,B
		0xc8: function () {
			this.B = this['SET b,n'](1, this.B);
		},
		// SET 1,C
		0xc9: function () {
			this.C = this['SET b,n'](1, this.C);
		},
		// SET 1,D
		0xca: function () {
			this.D = this['SET b,n'](1, this.D);
		},
		// SET 1,E
		0xcb: function () {
			this.E = this['SET b,n'](1, this.E);
		},
		// SET 1,H
		0xcc: function () {
			this.H = this['SET b,n'](1, this.H);
		},
		// SET 1,L
		0xcd: function () {
			this.L = this['SET b,n'](1, this.L);
		},
		// SET 1,(HL)
		0xce: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](1, n);
			mem.write(addr, result);
		},
		// SET 1,A
		0xcf: function () {
			this.A = this['SET b,n'](1, this.A);
		},
// ----------------------------------------------------------------------------
// SET BIT 2
		// SET 2,B
		0xd0: function () {
			this.B = this['SET b,n'](2, this.B);
		},
		// SET 2,C
		0xd1: function () {
			this.C = this['SET b,n'](2, this.C);
		},
		// SET 2,D
		0xd2: function () {
			this.D = this['SET b,n'](2, this.D);
		},
		// SET 2,E
		0xd3: function () {
			this.E = this['SET b,n'](2, this.E);
		},
		// SET 2,H
		0xd4: function () {
			this.H = this['SET b,n'](2, this.H);
		},
		// SET 2,L
		0xd5: function () {
			this.L = this['SET b,n'](2, this.L);
		},
		// SET 2,(HL)
		0xd6: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](2, n);
			mem.write(addr, result);
		},
		// SET 2,A
		0xd7: function () {
			this.A = this['SET b,n'](2, this.A);
		},
// ----------------------------------------------------------------------------
// SET BIT 3
		// SET 3,B
		0xd8: function () {
			this.B = this['SET b,n'](3, this.B);
		},
		// SET 3,C
		0xd9: function () {
			this.C = this['SET b,n'](3, this.C);
		},
		// SET 3,D
		0xda: function () {
			this.D = this['SET b,n'](3, this.D);
		},
		// SET 3,E
		0xdb: function () {
			this.E = this['SET b,n'](3, this.E);
		},
		// SET 3,H
		0xdc: function () {
			this.H = this['SET b,n'](3, this.H);
		},
		// SET 3,L
		0xdd: function () {
			this.L = this['SET b,n'](3, this.L);
		},
		// SET 3,(HL)
		0xde: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](3, n);
			mem.write(addr, result);
		},
		// SET 3,A
		0xdf: function () {
			this.A = this['SET b,n'](3, this.A);
		},
// ----------------------------------------------------------------------------
// SET BIT 4
		// SET 4,B
		0xe0: function () {
			this.B = this['SET b,n'](4, this.B);
		},
		// SET 4,C
		0xe1: function () {
			this.C = this['SET b,n'](4, this.C);
		},
		// SET 4,D
		0xe2: function () {
			this.D = this['SET b,n'](4, this.D);
		},
		// SET 4,E
		0xe3: function () {
			this.E = this['SET b,n'](4, this.E);
		},
		// SET 4,H
		0xe4: function () {
			this.H = this['SET b,n'](4, this.H);
		},
		// SET 4,L
		0xe5: function () {
			this.L = this['SET b,n'](4, this.L);
		},
		// SET 4,(HL)
		0xe6: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](4, n);
			mem.write(addr, result);
		},
		// SET 4,A
		0xe7: function () {
			this.A = this['SET b,n'](4, this.A);
		},
// ----------------------------------------------------------------------------
// SET BIT 5
		// SET 5,B
		0xe8: function () {
			this.B = this['SET b,n'](5, this.B);
		},
		// SET 5,C
		0xe9: function () {
			this.C = this['SET b,n'](5, this.C);
		},
		// SET 5,D
		0xea: function () {
			this.D = this['SET b,n'](5, this.D);
		},
		// SET 5,E
		0xeb: function () {
			this.E = this['SET b,n'](5, this.E);
		},
		// SET 5,H
		0xec: function () {
			this.H = this['SET b,n'](5, this.H);
		},
		// SET 5,L
		0xed: function () {
			this.L = this['SET b,n'](5, this.L);
		},
		// SET 5,(HL)
		0xee: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](5, n);
			mem.write(addr, result);
		},
		// SET 5,A
		0xef: function () {
			this.A = this['SET b,n'](5, this.A);
		},
// ----------------------------------------------------------------------------
// SET BIT 6
		// SET 6,B
		0xf0: function () {
			this.B = this['SET b,n'](6, this.B);
		},
		// SET 6,C
		0xf1: function () {
			this.C = this['SET b,n'](6, this.C);
		},
		// SET 6,D
		0xf2: function () {
			this.D = this['SET b,n'](6, this.D);
		},
		// SET 6,E
		0xf3: function () {
			this.E = this['SET b,n'](6, this.E);
		},
		// SET 6,H
		0xf4: function () {
			this.H = this['SET b,n'](6, this.H);
		},
		// SET 6,L
		0xf5: function () {
			this.L = this['SET b,n'](6, this.L);
		},
		// SET 6,(HL)
		0xf6: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](6, n);
			mem.write(addr, result);
		},
		// SET 6,A
		0xf7: function () {
			this.A = this['SET b,n'](6, this.A);
		},
// ----------------------------------------------------------------------------
// SET BIT 7
		// SET 7,B
		0xf8: function () {
			this.B = this['SET b,n'](7, this.B);
		},
		// SET 7,C
		0xf9: function () {
			this.C = this['SET b,n'](7, this.C);
		},
		// SET 7,D
		0xfa: function () {
			this.D = this['SET b,n'](7, this.D);
		},
		// SET 7,E
		0xfb: function () {
			this.E = this['SET b,n'](7, this.E);
		},
		// SET 7,H
		0xfc: function () {
			this.H = this['SET b,n'](7, this.H);
		},
		// SET 7,L
		0xfd: function () {
			this.L = this['SET b,n'](7, this.L);
		},
		// SET 7,(HL)
		0xfe: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SET b,n'](7, n);
			mem.write(addr, result);
		},
		// SET 7,A
		0xff: function () {
			this.A = this['SET b,n'](7, this.A);
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
			var result = this['RES b,n'](0, n);
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
			var result = this['RES b,n'](1, n);
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
			var result = this['RES b,n'](2, n);
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
			var result = this['RES b,n'](3, n);
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
			var result = this['RES b,n'](4, n);
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
			var result = this['RES b,n'](5, n);
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
			var result = this['RES b,n'](6, n);
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
			var result = this['RES b,n'](7, n);
			mem.write(addr, result);
		},
		// RES 7,A
		0xbf: function () {
			this.A = this['RES b,n'](7, this.A);
		},
// ----------------------------------------------------------------------------
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
		// SWAP (HL)
		0x36: function (mem) {
			var addr = this.HL;
			var n = mem.read8(addr);
			var result = this['SWAP n'](n);
			mem.write(addr, result);
		},
		// SWAP A
		0x37: function () {
			this.A = this['SWAP n'](this.A);
		}

	};
})(Cpu);
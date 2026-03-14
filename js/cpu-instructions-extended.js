'use strict';

/* global Cpu */

(function (Cpu) {
// ============================================================================
// Common macro instructions
// ============================================================================
	(function () {
		// ====================================================================
		// Misc
		// ====================================================================
		this['RL n'] = function (n, wCY) {
			// this.code = 'RL' + (wCY ? ' ' : 'C ') + n.toString(16);
			const bit7 = (n & 0xFF) >>> 7;
			const result = (n << 1) & 0xFF | (wCY ? this.flags.C : bit7);
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = bit7;
			this.PC++;
			return result;
		};
		this['RR n'] = function (n, wCY) {
			// this.code = 'RR' + (wCY ? ' ' : 'C ') + n.toString(16);
			const bit0 = n & 1;
			const result = ((n & 0xFF) >>> 1) | (wCY ? this.flags.C << 7 : bit0 << 7);
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = bit0;
			this.PC++;
			return result;
		};
		this['SLA n'] = function (n) {
			// this.code = 'SLA ' + n.toString(16);
			const result = n << 1;
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = (n & 0xFF) >>> 7;
			this.PC++;
			return (result & 0xFF);
		};
		this['SRA n'] = function (n) {
			// this.code = 'SRA ' + n.toString(16);
			const bit7 = n & (1 << 7);
			const result = (n >> 1) | bit7;
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = n & 1;
			this.PC++;
			return (result & 0xFF);
		};
		this['SRL n'] = function (n) {
			// this.code = 'SRL ' + n.toString(16);
			const result = (n & 0xFF) >>> 1;
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = n & 1;
			this.PC++;
			return (result & 0xFF);
		};
		this['SET b,n'] = function (b, n) {
			const mask = 1 << b;
			this.PC++;
			return n | mask;
		};
		this['RES b,n'] = function (b, n) {
			const mask = 0xFF ^ (1 << b);
			this.PC++;
			return n & mask;
		};
		this['SWAP n'] = function (n) {
			// this.code = 'SWAP ' + n.toString(16);
			const lo = n & 0x0F;
			const hi = n & 0xF0;
			const result = (lo << 4) | (hi >>> 4);
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
			const mask = 0x1 << n;
			this.flags.Z = !(mask & this[r]) | 0;
			this.flags.N = 0;
			this.flags.H = 1;
			this.PC++;
		};
		// Read bit at position b for int n
		this['BIT b,n'] = function (b, n) {
			// this.code = 'BIT ' + b + ',' + n;
			const mask = 0x1 << b;
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

			return 2; // 2 cycles
		},
		// RLC C
		0x01: function () {
			this.C = this['RL n'](this.C, false);
			
			return 2; // 2 cycles
		},
		// RLC D
		0x02: function () {
			this.D = this['RL n'](this.D, false);

			return 2; // 2 cycles
		},
		// RLC E
		0x03: function () {
			this.E = this['RL n'](this.E, false);

			return 2; // 2 cycles
		},
		// RLC H
		0x04: function () {
			this.H = this['RL n'](this.H, false);

			return 2; // 2 cycles
		},
		// RLC L
		0x05: function () {
			this.L = this['RL n'](this.L, false);

			return 2; // 2 cycles
		},
		// RLC (HL)
		0x06: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RL n'](n, false);
			mem.write(addr, result);

			return 4; // 4 cycles
		},
		// RLC A
		0x07: function () {
			this.A = this['RL n'](this.A, false);

			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// RRC B
		0x08: function () {
			this.B = this['RR n'](this.B, false);

			return 2; // 2 cycles
		},
		// RRC C
		0x09: function () {
			this.C = this['RR n'](this.C, false);

			return 2; // 2 cycles
		},
		// RRC D
		0x0a: function () {
			this.D = this['RR n'](this.D, false);

			return 2; // 2 cycles
		},
		// RRC E
		0x0b: function () {
			this.E = this['RR n'](this.E, false);

			return 2; // 2 cycles
		},
		// RRC H
		0x0c: function () {
			this.H = this['RR n'](this.H, false);

			return 2; // 2 cycles
		},
		// RRC L
		0x0d: function () {
			this.L = this['RR n'](this.L, false);

			return 2; // 2 cycles
		},
		// RRC (HL)
		0x0e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RR n'](n, false);
			mem.write(addr, result);

			return 4; // 4 cycles
		},
		// RRC A
		0x0f: function () {
			this.A = this['RR n'](this.A, false);

			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// RL B
		0x10: function () {
			this.B = this['RL n'](this.B, true);

			return 2; // 2 cycles
		},
		// RL C
		0x11: function () {
			this.C = this['RL n'](this.C, true);

			return 2; // 2 cycles
		},
		// RL D
		0x12: function () {
			this.D = this['RL n'](this.D, true);

			return 2; // 2 cycles
		},
		// RL E
		0x13: function () {
			this.E = this['RL n'](this.E, true);

			return 2; // 2 cycles
		},
		// RL H
		0x14: function () {
			this.H = this['RL n'](this.H, true);

			return 2; // 2 cycles
		},
		// RL L
		0x15: function () {
			this.L = this['RL n'](this.L, true);

			return 2; // 2 cycles
		},
		// RL (HL)
		0x16: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RL n'](n, true);
			mem.write(addr, result);

			return 4; // 4 cycles
		},
		// RL A
		0x17: function () {
			this.A = this['RL n'](this.A, true);

			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// RR B
		0x18: function () {
			this.B = this['RR n'](this.B, true);
			return 2; // 2 cycles
		},
		// RR C
		0x19: function () {
			this.C = this['RR n'](this.C, true);
			return 2; // 2 cycles
		},
		// RR D
		0x1a: function () {
			this.D = this['RR n'](this.D, true);
			return 2; // 2 cycles
		},
		// RR E
		0x1b: function () {
			this.E = this['RR n'](this.E, true);
			return 2; // 2 cycles
		},
		// RR H
		0x1c: function () {
			this.H = this['RR n'](this.H, true);
			return 2; // 2 cycles
		},
		// RR L
		0x1d: function () {
			this.L = this['RR n'](this.L, true);
			return 2; // 2 cycles
		},
		// RR (HL)
		0x1e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RR n'](n, true);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RR A
		0x1f: function () {
			this.A = this['RR n'](this.A, true);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// SLA B
		0x20: function () {
			this.B = this['SLA n'](this.B);
			return 2; // 2 cycles
		},
		// SLA C
		0x21: function () {
			this.C = this['SLA n'](this.C);
			return 2; // 2 cycles
		},
		// SLA D
		0x22: function () {
			this.D = this['SLA n'](this.D);
			return 2; // 2 cycles
		},
		// SLA E
		0x23: function () {
			this.E = this['SLA n'](this.E);
			return 2; // 2 cycles
		},
		// SLA H
		0x24: function () {
			this.H = this['SLA n'](this.H);
			return 2; // 2 cycles
		},
		// SLA L
		0x25: function () {
			this.L = this['SLA n'](this.L);
			return 2; // 2 cycles
		},
		// SLA (HL)
		0x26: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SLA n'](n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SLA A
		0x27: function () {
			this.A = this['SLA n'](this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// SRA B
		0x28: function () {
			this.B = this['SRA n'](this.B);
			return 2; // 2 cycles
		},
		// SRA C
		0x29: function () {
			this.C = this['SRA n'](this.C);
			return 2; // 2 cycles
		},
		// SRA D
		0x2a: function () {
			this.D = this['SRA n'](this.D);
			return 2; // 2 cycles
		},
		// SRA E
		0x2b: function () {
			this.E = this['SRA n'](this.E);
			return 2; // 2 cycles
		},
		// SRA H
		0x2c: function () {
			this.H = this['SRA n'](this.H);
			return 2; // 2 cycles
		},
		// SRA L
		0x2d: function () {
			this.L = this['SRA n'](this.L);
			return 2; // 2 cycles
		},
		// SRA (HL)
		0x2e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SRA n'](n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SRA A
		0x2f: function () {
			this.A = this['SRA n'](this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// SRL B
		0x38: function () {
			this.B = this['SRL n'](this.B);
			return 2; // 2 cycles
		},
		// SRL C
		0x39: function () {
			this.C = this['SRL n'](this.C);
			return 2; // 2 cycles
		},
		// SRL D
		0x3a: function () {
			this.D = this['SRL n'](this.D);
			return 2; // 2 cycles
		},
		// SRL E
		0x3b: function () {
			this.E = this['SRL n'](this.E);
			return 2; // 2 cycles
		},
		// SRL H
		0x3c: function () {
			this.H = this['SRL n'](this.H);
			return 2; // 2 cycles
		},
		// SRL L
		0x3d: function () {
			this.L = this['SRL n'](this.L);
			return 2; // 2 cycles
		},
		// SRL (HL)
		0x3e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SRL n'](n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SRL A
		0x3f: function () {
			this.A = this['SRL n'](this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 0
		// BIT 0,B
		0x40: function () {
			this['BIT n,r'](0, 'B');
			return 2; // 2 cycles
		},
		// BIT 0,C
		0x41: function () {
			this['BIT n,r'](0, 'C');
			return 2; // 2 cycles
		},
		// BIT 0,D
		0x42: function () {
			this['BIT n,r'](0, 'D');
			return 2; // 2 cycles
		},
		// BIT 0,E
		0x43: function () {
			this['BIT n,r'](0, 'E');
			return 2; // 2 cycles
		},
		// BIT 0,H
		0x44: function () {
			this['BIT n,r'](0, 'H');
			return 2; // 2 cycles
		},
		// BIT 0,L
		0x45: function () {
			this['BIT n,r'](0, 'L');
			return 2; // 2 cycles
		},
		// BIT 0,(HL)
		0x46: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](0, n);
			return 3; // 3 cycles
		},
		// BIT 0,A
		0x47: function () {
			this['BIT n,r'](0, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 1
		// BIT 1,B
		0x48: function () {
			this['BIT n,r'](1, 'B');
			return 2; // 2 cycles
		},
		// BIT 1,C
		0x49: function () {
			this['BIT n,r'](1, 'C');
			return 2; // 2 cycles
		},
		// BIT 1,D
		0x4a: function () {
			this['BIT n,r'](1, 'D');
			return 2; // 2 cycles
		},
		// BIT 1,E
		0x4b: function () {
			this['BIT n,r'](1, 'E');
			return 2; // 2 cycles
		},
		// BIT 1,H
		0x4c: function () {
			this['BIT n,r'](1, 'H');
			return 2; // 2 cycles
		},
		// BIT 1,L
		0x4d: function () {
			this['BIT n,r'](1, 'L');
			return 2; // 2 cycles
		},
		// BIT 1,(HL)
		0x4e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](1, n);
			return 3; // 3 cycles
		},
		// BIT 1,A
		0x4f: function () {
			this['BIT n,r'](1, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 2
		// BIT 2,B
		0x50: function () {
			this['BIT n,r'](2, 'B');
			return 2; // 2 cycles
		},
		// BIT 2,C
		0x51: function () {
			this['BIT n,r'](2, 'C');
			return 2; // 2 cycles
		},
		// BIT 2,D
		0x52: function () {
			this['BIT n,r'](2, 'D');
			return 2; // 2 cycles
		},
		// BIT 2,E
		0x53: function () {
			this['BIT n,r'](2, 'E');
			return 2; // 2 cycles
		},
		// BIT 2,H
		0x54: function () {
			this['BIT n,r'](2, 'H');
			return 2; // 2 cycles
		},
		// BIT 2,L
		0x55: function () {
			this['BIT n,r'](2, 'L');
			return 2; // 2 cycles
		},
		// BIT 2,(HL)
		0x56: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](2, n);
			return 3; // 3 cycles
		},
		// BIT 2,A
		0x57: function () {
			this['BIT n,r'](2, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 3
		// BIT 3,B
		0x58: function () {
			this['BIT n,r'](3, 'B');
			return 2; // 2 cycles
		},
		// BIT 3,C
		0x59: function () {
			this['BIT n,r'](3, 'C');
			return 2; // 2 cycles
		},
		// BIT 3,D
		0x5a: function () {
			this['BIT n,r'](3, 'D');
			return 2; // 2 cycles
		},
		// BIT 3,E
		0x5b: function () {
			this['BIT n,r'](3, 'E');
			return 2; // 2 cycles
		},
		// BIT 3,H
		0x5c: function () {
			this['BIT n,r'](3, 'H');
			return 2; // 2 cycles
		},
		// BIT 3,L
		0x5d: function () {
			this['BIT n,r'](3, 'L');
			return 2; // 2 cycles
		},
		// BIT 3,(HL)
		0x5e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](3, n);
			return 3; // 3 cycles
		},
		// BIT 3,A
		0x5f: function () {
			this['BIT n,r'](3, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 4
		// BIT 4,B
		0x60: function () {
			this['BIT n,r'](4, 'B');
			return 2; // 2 cycles
		},
		// BIT 4,C
		0x61: function () {
			this['BIT n,r'](4, 'C');
			return 2; // 2 cycles
		},
		// BIT 4,D
		0x62: function () {
			this['BIT n,r'](4, 'D');
			return 2; // 2 cycles
		},
		// BIT 4,E
		0x63: function () {
			this['BIT n,r'](4, 'E');
			return 2; // 2 cycles
		},
		// BIT 4,H
		0x64: function () {
			this['BIT n,r'](4, 'H');
			return 2; // 2 cycles
		},
		// BIT 4,L
		0x65: function () {
			this['BIT n,r'](4, 'L');
			return 2; // 2 cycles
		},
		// BIT 4,(HL)
		0x66: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](4, n);
			return 3; // 3 cycles
		},
		// BIT 4,A
		0x67: function () {
			this['BIT n,r'](4, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 5
		// BIT 5,B
		0x68: function () {
			this['BIT n,r'](5, 'B');
			return 2; // 2 cycles
		},
		// BIT 5,C
		0x69: function () {
			this['BIT n,r'](5, 'C');
			return 2; // 2 cycles
		},
		// BIT 5,D
		0x6a: function () {
			this['BIT n,r'](5, 'D');
			return 2; // 2 cycles
		},
		// BIT 5,E
		0x6b: function () {
			this['BIT n,r'](5, 'E');
			return 2; // 2 cycles
		},
		// BIT 5,H
		0x6c: function () {
			this['BIT n,r'](5, 'H');
			return 2; // 2 cycles
		},
		// BIT 5,L
		0x6d: function () {
			this['BIT n,r'](5, 'L');
		},
		// BIT 5,(HL)
		0x6e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](5, n);
			return 3; // 3 cycles
		},
		// BIT 5,A
		0x6f: function () {
			this['BIT n,r'](5, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 6
		// BIT 6,B
		0x70: function () {
			this['BIT n,r'](6, 'B');
			return 2; // 2 cycles
		},
		// BIT 6,C
		0x71: function () {
			this['BIT n,r'](6, 'C');
			return 2; // 2 cycles
		},
		// BIT 6,D
		0x72: function () {
			this['BIT n,r'](6, 'D');
			return 2; // 2 cycles
		},
		// BIT 6,E
		0x73: function () {
			this['BIT n,r'](6, 'E');
			return 2; // 2 cycles
		},
		// BIT 6,H
		0x74: function () {
			this['BIT n,r'](6, 'H');
			return 2; // 2 cycles
		},
		// BIT 6,L
		0x75: function () {
			this['BIT n,r'](6, 'L');
			return 2; // 2 cycles
		},
		// BIT 6,(HL)
		0x76: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](6, n);
			return 3; // 3 cycles
		},
		// BIT 6,A
		0x77: function () {
			this['BIT n,r'](6, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// READ BIT 5
		// BIT 7,B
		0x78: function () {
			this['BIT n,r'](7, 'B');
			return 2; // 2 cycles
		},
		// BIT 7,C
		0x79: function () {
			this['BIT n,r'](7, 'C');
			return 2; // 2 cycles
		},
		// BIT 7,D
		0x7a: function () {
			this['BIT n,r'](7, 'D');
			return 2; // 2 cycles
		},
		// BIT 7,E
		0x7b: function () {
			this['BIT n,r'](7, 'E');
			return 2; // 2 cycles
		},
		// BIT 7,H
		0x7c: function () {
			this['BIT n,r'](7, 'H');
			return 2; // 2 cycles
		},
		// BIT 7,L
		0x7d: function () {
			this['BIT n,r'](7, 'L');
			return 2; // 2 cycles
		},
		// BIT 7,(HL)
		0x7e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			this['BIT b,n'](7, n);
			return 3; // 3 cycles
		},
		// BIT 7,A
		0x7f: function () {
			this['BIT n,r'](7, 'A');
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 0
		// SET 0,B
		0xc0: function () {
			this.B = this['SET b,n'](0, this.B);
			return 2; // 2 cycles
		},
		// SET 0,C
		0xc1: function () {
			this.C = this['SET b,n'](0, this.C);
			return 2; // 2 cycles
		},
		// SET 0,D
		0xc2: function () {
			this.D = this['SET b,n'](0, this.D);
			return 2; // 2 cycles
		},
		// SET 0,E
		0xc3: function () {
			this.E = this['SET b,n'](0, this.E);
			return 2; // 2 cycles
		},
		// SET 0,H
		0xc4: function () {
			this.H = this['SET b,n'](0, this.H);
			return 2; // 2 cycles
		},
		// SET 0,L
		0xc5: function () {
			this.L = this['SET b,n'](0, this.L);
			return 2; // 2 cycles
		},
		// SET 0,(HL)
		0xc6: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](0, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 0,A
		0xc7: function () {
			this.A = this['SET b,n'](0, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 1
		// SET 1,B
		0xc8: function () {
			this.B = this['SET b,n'](1, this.B);
			return 2; // 2 cycles
		},
		// SET 1,C
		0xc9: function () {
			this.C = this['SET b,n'](1, this.C);
			return 2; // 2 cycles
		},
		// SET 1,D
		0xca: function () {
			this.D = this['SET b,n'](1, this.D);
			return 2; // 2 cycles
		},
		// SET 1,E
		0xcb: function () {
			this.E = this['SET b,n'](1, this.E);
			return 2; // 2 cycles
		},
		// SET 1,H
		0xcc: function () {
			this.H = this['SET b,n'](1, this.H);
			return 2; // 2 cycles
		},
		// SET 1,L
		0xcd: function () {
			this.L = this['SET b,n'](1, this.L);
			return 2; // 2 cycles
		},
		// SET 1,(HL)
		0xce: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](1, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 1,A
		0xcf: function () {
			this.A = this['SET b,n'](1, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 2
		// SET 2,B
		0xd0: function () {
			this.B = this['SET b,n'](2, this.B);
			return 2; // 2 cycles
		},
		// SET 2,C
		0xd1: function () {
			this.C = this['SET b,n'](2, this.C);
			return 2; // 2 cycles
		},
		// SET 2,D
		0xd2: function () {
			this.D = this['SET b,n'](2, this.D);
			return 2; // 2 cycles
		},
		// SET 2,E
		0xd3: function () {
			this.E = this['SET b,n'](2, this.E);
			return 2; // 2 cycles
		},
		// SET 2,H
		0xd4: function () {
			this.H = this['SET b,n'](2, this.H);
			return 2; // 2 cycles
		},
		// SET 2,L
		0xd5: function () {
			this.L = this['SET b,n'](2, this.L);
			return 2; // 2 cycles
		},
		// SET 2,(HL)
		0xd6: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](2, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 2,A
		0xd7: function () {
			this.A = this['SET b,n'](2, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 3
		// SET 3,B
		0xd8: function () {
			this.B = this['SET b,n'](3, this.B);
			return 2; // 2 cycles
		},
		// SET 3,C
		0xd9: function () {
			this.C = this['SET b,n'](3, this.C);
			return 2; // 2 cycles
		},
		// SET 3,D
		0xda: function () {
			this.D = this['SET b,n'](3, this.D);
			return 2; // 2 cycles
		},
		// SET 3,E
		0xdb: function () {
			this.E = this['SET b,n'](3, this.E);
			return 2; // 2 cycles
		},
		// SET 3,H
		0xdc: function () {
			this.H = this['SET b,n'](3, this.H);
			return 2; // 2 cycles
		},
		// SET 3,L
		0xdd: function () {
			this.L = this['SET b,n'](3, this.L);
			return 2; // 2 cycles
		},
		// SET 3,(HL)
		0xde: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](3, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 3,A
		0xdf: function () {
			this.A = this['SET b,n'](3, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 4
		// SET 4,B
		0xe0: function () {
			this.B = this['SET b,n'](4, this.B);
			return 2; // 2 cycles
		},
		// SET 4,C
		0xe1: function () {
			this.C = this['SET b,n'](4, this.C);
			return 2; // 2 cycles
		},
		// SET 4,D
		0xe2: function () {
			this.D = this['SET b,n'](4, this.D);
			return 2; // 2 cycles
		},
		// SET 4,E
		0xe3: function () {
			this.E = this['SET b,n'](4, this.E);
			return 2; // 2 cycles
		},
		// SET 4,H
		0xe4: function () {
			this.H = this['SET b,n'](4, this.H);
			return 2; // 2 cycles
		},
		// SET 4,L
		0xe5: function () {
			this.L = this['SET b,n'](4, this.L);
			return 2; // 2 cycles
		},
		// SET 4,(HL)
		0xe6: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](4, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 4,A
		0xe7: function () {
			this.A = this['SET b,n'](4, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 5
		// SET 5,B
		0xe8: function () {
			this.B = this['SET b,n'](5, this.B);
			return 2; // 2 cycles
		},
		// SET 5,C
		0xe9: function () {
			this.C = this['SET b,n'](5, this.C);
			return 2; // 2 cycles
		},
		// SET 5,D
		0xea: function () {
			this.D = this['SET b,n'](5, this.D);
			return 2; // 2 cycles
		},
		// SET 5,E
		0xeb: function () {
			this.E = this['SET b,n'](5, this.E);
			return 2; // 2 cycles
		},
		// SET 5,H
		0xec: function () {
			this.H = this['SET b,n'](5, this.H);
			return 2; // 2 cycles
		},
		// SET 5,L
		0xed: function () {
			this.L = this['SET b,n'](5, this.L);
			return 2; // 2 cycles
		},
		// SET 5,(HL)
		0xee: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](5, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 5,A
		0xef: function () {
			this.A = this['SET b,n'](5, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 6
		// SET 6,B
		0xf0: function () {
			this.B = this['SET b,n'](6, this.B);
			return 2; // 2 cycles
		},
		// SET 6,C
		0xf1: function () {
			this.C = this['SET b,n'](6, this.C);
			return 2; // 2 cycles
		},
		// SET 6,D
		0xf2: function () {
			this.D = this['SET b,n'](6, this.D);
			return 2; // 2 cycles
		},
		// SET 6,E
		0xf3: function () {
			this.E = this['SET b,n'](6, this.E);
			return 2; // 2 cycles
		},
		// SET 6,H
		0xf4: function () {
			this.H = this['SET b,n'](6, this.H);
			return 2; // 2 cycles
		},
		// SET 6,L
		0xf5: function () {
			this.L = this['SET b,n'](6, this.L);
			return 2; // 2 cycles
		},
		// SET 6,(HL)
		0xf6: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](6, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 6,A
		0xf7: function () {
			this.A = this['SET b,n'](6, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// SET BIT 7
		// SET 7,B
		0xf8: function () {
			this.B = this['SET b,n'](7, this.B);
			return 2; // 2 cycles
		},
		// SET 7,C
		0xf9: function () {
			this.C = this['SET b,n'](7, this.C);
			return 2; // 2 cycles
		},
		// SET 7,D
		0xfa: function () {
			this.D = this['SET b,n'](7, this.D);
			return 2; // 2 cycles
		},
		// SET 7,E
		0xfb: function () {
			this.E = this['SET b,n'](7, this.E);
			return 2; // 2 cycles
		},
		// SET 7,H
		0xfc: function () {
			this.H = this['SET b,n'](7, this.H);
			return 2; // 2 cycles
		},
		// SET 7,L
		0xfd: function () {
			this.L = this['SET b,n'](7, this.L);
			return 2; // 2 cycles
		},
		// SET 7,(HL)
		0xfe: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SET b,n'](7, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SET 7,A
		0xff: function () {
			this.A = this['SET b,n'](7, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 0
		// RES 0,B
		0x80: function () {
			this.B = this['RES b,n'](0, this.B);
			return 2; // 2 cycles
		},
		// RES 0,C
		0x81: function () {
			this.C = this['RES b,n'](0, this.C);
			return 2; // 2 cycles
		},
		// RES 0,D
		0x82: function () {
			this.D = this['RES b,n'](0, this.D);
			return 2; // 2 cycles
		},
		// RES 0,E
		0x83: function () {
			this.E = this['RES b,n'](0, this.E);
			return 2; // 2 cycles
		},
		// RES 0,H
		0x84: function () {
			this.H = this['RES b,n'](0, this.H);
			return 2; // 2 cycles
		},
		// RES 0,L
		0x85: function () {
			this.L = this['RES b,n'](0, this.L);
			return 2; // 2 cycles
		},
		// RES 0,(HL)
		0x86: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](0, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 0,A
		0x87: function () {
			this.A = this['RES b,n'](0, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 1
		// RES 1,B
		0x88: function () {
			this.B = this['RES b,n'](1, this.B);
			return 2; // 2 cycles
		},
		// RES 1,C
		0x89: function () {
			this.C = this['RES b,n'](1, this.C);
			return 2; // 2 cycles
		},
		// RES 1,D
		0x8a: function () {
			this.D = this['RES b,n'](1, this.D);
			return 2; // 2 cycles
		},
		// RES 1,E
		0x8b: function () {
			this.E = this['RES b,n'](1, this.E);
			return 2; // 2 cycles
		},
		// RES 1,H
		0x8c: function () {
			this.H = this['RES b,n'](1, this.H);
			return 2; // 2 cycles
		},
		// RES 1,L
		0x8d: function () {
			this.L = this['RES b,n'](1, this.L);
			return 2; // 2 cycles
		},
		// RES 1,(HL)
		0x8e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](1, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 1,A
		0x8f: function () {
			this.A = this['RES b,n'](1, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 2
		// RES 2,B
		0x90: function () {
			this.B = this['RES b,n'](2, this.B);
			return 2; // 2 cycles
		},
		// RES 2,C
		0x91: function () {
			this.C = this['RES b,n'](2, this.C);
			return 2; // 2 cycles
		},
		// RES 2,D
		0x92: function () {
			this.D = this['RES b,n'](2, this.D);
			return 2; // 2 cycles
		},
		// RES 2,E
		0x93: function () {
			this.E = this['RES b,n'](2, this.E);
			return 2; // 2 cycles
		},
		// RES 2,H
		0x94: function () {
			this.H = this['RES b,n'](2, this.H);
			return 2; // 2 cycles
		},
		// RES 2,L
		0x95: function () {
			this.L = this['RES b,n'](2, this.L);
			return 2; // 2 cycles
		},
		// RES 2,(HL)
		0x96: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](2, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 2,A
		0x97: function () {
			this.A = this['RES b,n'](2, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 3
		// RES 3,B
		0x98: function () {
			this.B = this['RES b,n'](3, this.B);
			return 2; // 2 cycles
		},
		// RES 3,C
		0x99: function () {
			this.C = this['RES b,n'](3, this.C);
			return 2; // 2 cycles
		},
		// RES 3,D
		0x9a: function () {
			this.D = this['RES b,n'](3, this.D);
			return 2; // 2 cycles
		},
		// RES 3,E
		0x9b: function () {
			this.E = this['RES b,n'](3, this.E);
			return 2; // 2 cycles
		},
		// RES 3,H
		0x9c: function () {
			this.H = this['RES b,n'](3, this.H);
			return 2; // 2 cycles
		},
		// RES 3,L
		0x9d: function () {
			this.L = this['RES b,n'](3, this.L);
			return 2; // 2 cycles
		},
		// RES 3,(HL)
		0x9e: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](3, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 3,A
		0x9f: function () {
			this.A = this['RES b,n'](3, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 4
		// RES 4,B
		0xa0: function () {
			this.B = this['RES b,n'](4, this.B);
			return 2; // 2 cycles
		},
		// RES 4,C
		0xa1: function () {
			this.C = this['RES b,n'](4, this.C);
			return 2; // 2 cycles
		},
		// RES 4,D
		0xa2: function () {
			this.D = this['RES b,n'](4, this.D);
			return 2; // 2 cycles
		},
		// RES 4,E
		0xa3: function () {
			this.E = this['RES b,n'](4, this.E);
			return 2; // 2 cycles
		},
		// RES 4,H
		0xa4: function () {
			this.H = this['RES b,n'](4, this.H);
			return 2; // 2 cycles
		},
		// RES 4,L
		0xa5: function () {
			this.L = this['RES b,n'](4, this.L);
			return 2; // 2 cycles
		},
		// RES 4,(HL)
		0xa6: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](4, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 4,A
		0xa7: function () {
			this.A = this['RES b,n'](4, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 5
		// RES 5,B
		0xa8: function () {
			this.B = this['RES b,n'](5, this.B);
			return 2; // 2 cycles
		},
		// RES 5,C
		0xa9: function () {
			this.C = this['RES b,n'](5, this.C);
			return 2; // 2 cycles
		},
		// RES 5,D
		0xaa: function () {
			this.D = this['RES b,n'](5, this.D);
			return 2; // 2 cycles
		},
		// RES 5,E
		0xab: function () {
			this.E = this['RES b,n'](5, this.E);
			return 2; // 2 cycles
		},
		// RES 5,H
		0xac: function () {
			this.H = this['RES b,n'](5, this.H);
			return 2; // 2 cycles
		},
		// RES 5,L
		0xad: function () {
			this.L = this['RES b,n'](5, this.L);
			return 2; // 2 cycles
		},
		// RES 5,(HL)
		0xae: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](5, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 5,A
		0xaf: function () {
			this.A = this['RES b,n'](5, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 6
		// RES 6,B
		0xb0: function () {
			this.B = this['RES b,n'](6, this.B);
			return 2; // 2 cycles
		},
		// RES 6,C
		0xb1: function () {
			this.C = this['RES b,n'](6, this.C);
			return 2; // 2 cycles
		},
		// RES 6,D
		0xb2: function () {
			this.D = this['RES b,n'](6, this.D);
			return 2; // 2 cycles
		},
		// RES 6,E
		0xb3: function () {
			this.E = this['RES b,n'](6, this.E);
			return 2; // 2 cycles
		},
		// RES 6,H
		0xb4: function () {
			this.H = this['RES b,n'](6, this.H);
			return 2; // 2 cycles
		},
		// RES 6,L
		0xb5: function () {
			this.L = this['RES b,n'](6, this.L);
			return 2; // 2 cycles
		},
		// RES 6,(HL)
		0xb6: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](6, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 6,A
		0xb7: function () {
			this.A = this['RES b,n'](6, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
// RESET BIT 7
		// RES 7,B
		0xb8: function () {
			this.B = this['RES b,n'](7, this.B);
			return 2; // 2 cycles
		},
		// RES 7,C
		0xb9: function () {
			this.C = this['RES b,n'](7, this.C);
			return 2; // 2 cycles
		},
		// RES 7,D
		0xba: function () {
			this.D = this['RES b,n'](7, this.D);
			return 2; // 2 cycles
		},
		// RES 7,E
		0xbb: function () {
			this.E = this['RES b,n'](7, this.E);
			return 2; // 2 cycles
		},
		// RES 7,H
		0xbc: function () {
			this.H = this['RES b,n'](7, this.H);
			return 2; // 2 cycles
		},
		// RES 7,L
		0xbd: function () {
			this.L = this['RES b,n'](7, this.L);
			return 2; // 2 cycles
		},
		// RES 7,(HL)
		0xbe: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['RES b,n'](7, n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// RES 7,A
		0xbf: function () {
			this.A = this['RES b,n'](7, this.A);
			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// SWAP B
		0x30: function () {
			this.B = this['SWAP n'](this.B);
			return 2; // 2 cycles
		},
		// SWAP C
		0x31: function () {
			this.C = this['SWAP n'](this.C);
			return 2; // 2 cycles
		},
		// SWAP D
		0x32: function () {
			this.D = this['SWAP n'](this.D);
			return 2; // 2 cycles
		},
		// SWAP E
		0x33: function () {
			this.E = this['SWAP n'](this.E);
			return 2; // 2 cycles
		},
		// SWAP H
		0x34: function () {
			this.H = this['SWAP n'](this.H);
			return 2; // 2 cycles
		},
		// SWAP L
		0x35: function () {
			this.L = this['SWAP n'](this.L);
			return 2; // 2 cycles
		},
		// SWAP (HL)
		0x36: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			const result = this['SWAP n'](n);
			mem.write(addr, result);
			return 4; // 4 cycles
		},
		// SWAP A
		0x37: function () {
			this.A = this['SWAP n'](this.A);
			return 2; // 2 cycles
		}

	};
})(Cpu);
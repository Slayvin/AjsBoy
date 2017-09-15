/* global Cpu */
'use strict';

(function () {
	// 8-bits loads
	// ======================================================
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
	this['LD A,addr'] = function (rom, addr) {
		this.code = 'LD A,' + addr.toString(16);
		this.A = rom.read8(addr);
		this.PC++;
	};
	this['LD addr,A'] = function (addr) {
		this.code = 'LD ' + addr.toString(16) + ',A';
		this.memory.write(addr, this.A);
		this.PC++;
	};

	// 8-bits ALU
	// ======================================================
	this['XOR n'] = function (n) {
		this.code = 'XOR n';
		this.A = n ^ this.A;
		this.PC++;
	};
	this['INC r'] = function (r) {
		this.code = 'INC ' + r;
		this[r] = (this[r] + 1) & 0xff;
		this.PC++;
	};
	this['DEC r'] = function (r) {
		this.code = 'DEC ' + r;
		this[r] = (this[r] - 1) & 0xff;
		this.PC++;
	};
	this['CP n'] = function (n) {
		this.flags.Z = this.A === n ? 1 : 0;
		this.flags.N = 1;
		this.flags.H = (this.A & 0xF) < (n & 0xF) ? 1 : 0;
		this.flags.C = this.A < n ? 1 : 0;
		this.PC++;
	};

	// 16-bits loads
	// ======================================================
	this['LD rr,nn'] = function (rr, nn) {
		this.code = 'LD ' + rr + ',' + nn.toString(16);
		this[rr] = nn;
		this.PC++;
	};
	this['PUSH nn'] = function (nn) {
		this.code = 'PUSH ' + nn.toString(16);
		this.memory.write(this.SP, nn & 0xFF);
		this.memory.write(this.SP + 1, nn >> 8);
		this.SP -= 2;
	};

	// 16-bits ALU
	// ======================================================
	this['INC rr'] = function (rr) {
		this.code = 'INC ' + rr;
		this[rr] = (this[rr] + 1) & 0xffff;
		this.PC++;
	};
	this['DEC rr'] = function (rr) {
		this.code = 'DEC ' + rr;
		this[rr] = (this[rr] - 1) & 0xffff;
		this.PC++;
	};
}).apply(Cpu.prototype);

// All basic Operation codes
Cpu.prototype.instructions = {
// 8-bits Loads
// ==========================================================
	// LD B,n
	0x06: function (mem) {
		let n = mem.read8(++this.PC);
		this['LD r,n']('B', n);
	},
	// LD C,n
	0x0e: function (mem) {
		let n = mem.read8(++this.PC);
		this['LD r,n']('C', n);
	},
	// LD D,n
	0x16: function (mem) {
		let n = mem.read8(++this.PC);
		this['LD r,n']('D', n);
	},
	// LD E,n
	0x1e: function (mem) {
		let n = mem.read8(++this.PC);
		this['LD r,n']('E', n);
	},
	// LD H,n
	0x26: function (mem) {
		let n = mem.read8(++this.PC);
		this['LD r,n']('H', n);
	},
	// LD L,n
	0x2e: function (mem) {
		let n = mem.read8(++this.PC);
		this['LD r,n']('L', n);
	},
	// ------------------------------------------------------
	// LD B,B
	0x40: function () {
		this['LD r1,r2']('B', 'B');
	},
	// LD B,C
	0x41: function () {
		this['LD r1,r2']('B', 'B');
	},
	// LD B,D
	0x42: function () {
		this['LD r1,r2']('B', 'B');
	},
	// LD B,E
	0x43: function () {
		this['LD r1,r2']('B', 'B');
	},
	// LD B,H
	0x44: function () {
		this['LD r1,r2']('B', 'B');
	},
	// LD B,L
	0x45: function () {
		this['LD r1,r2']('B', 'B');
	},
	// LD B,A
	0x47: function () {
		this['LD r1,r2']('B', 'A');
	},
	// LD C,B
	0x48: function () {
		this['LD r1,r2']('C', 'B');
	},
	// LD C,C
	0x49: function () {
		this['LD r1,r2']('C', 'C');
	},
	// LD C,D
	0x4a: function () {
		this['LD r1,r2']('C', 'D');
	},
	// LD C,E
	0x4b: function () {
		this['LD r1,r2']('C', 'E');
	},
	// LD C,H
	0x4c: function () {
		this['LD r1,r2']('C', 'H');
	},
	// LD C,L
	0x4d: function () {
		this['LD r1,r2']('C', 'L');
	},
	// LD C,A
	0x4f: function () {
		this['LD r1,r2']('C', 'A');
	},
	// LD D,B
	0x50: function () {
		this['LD r1,r2']('D', 'B');
	},
	// LD D,C
	0x51: function () {
		this['LD r1,r2']('D', 'C');
	},
	// LD D,D
	0x52: function () {
		this['LD r1,r2']('D', 'D');
	},
	// LD D,E
	0x53: function () {
		this['LD r1,r2']('D', 'E');
	},
	// LD D,H
	0x54: function () {
		this['LD r1,r2']('D', 'H');
	},
	// LD D,L
	0x55: function () {
		this['LD r1,r2']('D', 'L');
	},
	// LD D,A
	0x57: function () {
		this['LD r1,r2']('D', 'A');
	},
	// LD E,B
	0x58: function () {
		this['LD r1,r2']('E', 'B');
	},
	// LD E,C
	0x59: function () {
		this['LD r1,r2']('E', 'C');
	},
	// LD E,D
	0x5a: function () {
		this['LD r1,r2']('E', 'D');
	},
	// LD E,E
	0x5b: function () {
		this['LD r1,r2']('E', 'E');
	},
	// LD E,H
	0x5c: function () {
		this['LD r1,r2']('E', 'H');
	},
	// LD E,L
	0x5d: function () {
		this['LD r1,r2']('E', 'L');
	},
	// LD E,A
	0x5f: function () {
		this['LD r1,r2']('E', 'A');
	},
	// LD H,B
	0x60: function () {
		this['LD r1,r2']('H', 'B');
	},
	// LD H,C
	0x61: function () {
		this['LD r1,r2']('H', 'C');
	},
	// LD H,D
	0x62: function () {
		this['LD r1,r2']('H', 'D');
	},
	// LD H,E
	0x63: function () {
		this['LD r1,r2']('H', 'E');
	},
	// LD H,H
	0x64: function () {
		this['LD r1,r2']('H', 'H');
	},
	// LD H,L
	0x65: function () {
		this['LD r1,r2']('H', 'L');
	},
	// LD H,A
	0x67: function () {
		this['LD r1,r2']('H', 'A');
	},
// ----------------------------------------------------------
	// LD A,B
	0x78: function () {
		this['LD r1,r2']('A', 'B');
	},
	// LD A,C
	0x79: function () {
		this['LD r1,r2']('A', 'C');
	},
	// LD A,D
	0x7a: function () {
		this['LD r1,r2']('A', 'D');
	},
	// LD A,E
	0x7b: function () {
		this['LD r1,r2']('A', 'E');
	},
	// LD A,H
	0x7c: function () {
		this['LD r1,r2']('A', 'H');
	},
	// LD A,L
	0x7d: function () {
		this['LD r1,r2']('A', 'L');
	},
	// LD A,A
	0x7f: function () {
		this['LD r1,r2']('A', 'A');
	},
	// LD A,n
	0x3e: function (mem) {
		let n = mem.read8(++this.PC);
		this['LD r,n']('A', n);
	},
// LD A,addr
// ----------------------------------------------------------
	// LD A,(BC)
	0x0a: function (mem) {
		let addr = this.BC;
		this['LD A,addr'](mem, addr);
	},
	// LD A,(DE)
	0x1a: function (mem) {
		let addr = this.DE;
		this['LD A,addr'](mem, addr);
	},
	// LD A,(HL)
	0x7e: function (mem) {
		let addr = this.HL;
		this['LD A,addr'](mem, addr);
	},
	// LD A,(nn)
	0xfa: function (mem) {
		let addr = mem.read16(++this.PC);
		this.PC++;
		this['LD A,addr'](addr);
	},
// LD addr,A
// ----------------------------------------------------------
	// LD (BC),A
	0x02: function () {
		let addr = this.BC;
		this['LD addr,A'](addr);
	},
	// LD (DE),A
	0x12: function () {
		let addr = this.DE;
		this['LD addr,A'](addr);
	},
	// LD (HL),A
	0x77: function () {
		let addr = this.HL;
		this['LD addr,A'](addr);
	},
	// LD (nn),A
	0xea: function (mem) {
		let addr = mem.read16(++this.PC);
		this.PC++;
		this['LD addr,A'](addr);
	},
// ----------------------------------------------------------
	// LD A,(C)
	0xf2: function (mem) {
		this.code = 'LD A,(C)';
		let addr = 0xff00 + this.C;
		this.A = mem.read8(addr);
		this.PC++;

	},
	// LD (C),A
	0xe2: function () {
		this.code = 'LD (C),A';
		let addr = 0xff00 + this.C;
		this.memory.write(addr, this.A);
		this.PC++;

	},
	// LD A,(HLD) | LD A,(HL-) | LDD A,(HL)
	0x3a: function (mem) {
		this.code = 'LD A,(HL-)';
		this.A = mem.read8(this.HL);
		this.HL--;
		this.PC++;
	},
	// LD (HLD),A | LD (HL-),A | LDD (HL),A
	0x32: function () {
		this.code = 'LD (HL-),A';
		this.memory.write(this.HL, this.A);
		this.HL--;
		this.PC++;
	},
	// LD A,(HLI) | LD A,(HL+) | LDI A,(HL)
	0x2a: function (mem) {
		this.code = 'LD A,(HL+)';
		this.A = mem.read8(this.HL);
		this.HL++;
		this.PC++;
	},
	// LD (HLI),A | LD (HL+),A | LDI (HL),A
	0x22: function () {
		this.code = 'LD (HL+),A';
		this.memory.write(this.HL, this.A);
		this.HL++;
		this.PC++;
	},
	// LDH (n),A
	0xe0: function (mem) {
		this.code = 'LDH (n),A';
		let n = mem.read8(++this.PC);
		let addr = 0xff00 + n;
		this.memory.write(addr, this.A);
		this.PC++;
	},
	// LDH A,(n)
	0xf0: function (mem) {
		this.code = 'LDH A,(n)';
		let n = mem.read8(++this.PC);
		let addr = 0xff00 + n;
		this.A = mem.read8(addr);
		this.PC++;
	},

// 16-bits loads
// ========================================================== 
	// LD BC,nn
	0x01: function (mem) {
		let nn = mem.read16(++this.PC);
		this.PC++;
		this['LD rr,nn']('BC', nn);
	},
	// LD DE,nn
	0x11: function (mem) {
		let nn = mem.read16(++this.PC);
		this.PC++;
		this['LD rr,nn']('DE', nn);
	},
	// LD HL,nn
	0x21: function (mem) {
		let nn = mem.read16(++this.PC);
		this.PC++;
		this['LD rr,nn']('HL', nn);
	},
	// LD SP,nn
	0x31: function (mem) {
		let nn = mem.read16(++this.PC);
		this.PC++;
		this['LD rr,nn']('SP', nn);
	},
// ----------------------------------------------------------
	// LD SP,HL
	0xf9: function () {
		this['LD rr,nn']('SP', this.HL);
	},
// ----------------------------------------------------------
	// PUSH AF
	0xf5: function () {
		this['PUSH nn'](this.AF);
		this.PC++;
	},
	// PUSH BC
	0xc5: function () {
		this['PUSH nn'](this.BC);
		this.PC++;
	},
	// PUSH DE
	0xd5: function () {
		this['PUSH nn'](this.DE);
		this.PC++;
	},
	// PUSH HL
	0xe5: function () {
		this['PUSH nn'](this.HL);
		this.PC++;
	},
// ----------------------------------------------------------
	// POP AF
	0xf1: function () {
		this.stack.pop('AF');
		this.PC++;
	},
	// POP BC
	0xc1: function () {
		this.stack.pop('BC');
		this.PC++;
	},
	// POP DE
	0xd1: function () {
		this.stack.pop('DE');
		this.PC++;
	},
	// POP HL
	0xe1: function () {
		this.stack.pop('HL');
		this.PC++;
	},
// ----------------------------------------------------------

// 8-bits ALU
// ==========================================================
// 1. ADD A,n
// ----------------------------------------------------------
// 2. ADC A,n
// ----------------------------------------------------------
// 3. SUB n
// ----------------------------------------------------------
// 4. SBC A,n
// ----------------------------------------------------------
// 5. AND n
// ----------------------------------------------------------
// 6. OR n
// ----------------------------------------------------------
	// XOR A
	0xaf: function () {
		this['XOR n'](this.A);
	},
	// XOR B
	0xa8: function () {
		this['XOR n'](this.B);
	},
	// XOR C
	0xa9: function () {
		this['XOR n'](this.C);
	},
	// XOR D
	0xaa: function () {
		this['XOR n'](this.D);
	},
	// XOR E
	0xab: function () {
		this['XOR n'](this.E);
	},
	// XOR H
	0xac: function () {
		this['XOR n'](this.H);
	},
	// XOR L
	0xad: function () {
		this['XOR n'](this.L);
	},
	// XOR (HL)
	0xae: function (mem) {
		let n = mem.read8(this.HL);
		this['XOR n'](n);
	},
// ----------------------------------------------------------
	// CP A
	0xbf: function () {
		this['CP n'](this.A);
	},
	// CP B
	0xb8: function () {
		this['CP n'](this.B);
	},
	// CP C
	0xb9: function () {
		this['CP n'](this.C);
	},
	// CP D
	0xba: function () {
		this['CP n'](this.D);
	},
	// CP E
	0xbb: function () {
		this['CP n'](this.E);
	},
	// CP H
	0xbc: function () {
		this['CP n'](this.H);
	},
	// CP L
	0xbd: function () {
		this['CP n'](this.L);
	},
	// CP (HL)
	0xbe: function (mem) {
		let n = mem.read8(this.HL);
		this['CP n'](n);
	},
	// CP n
	0xfe: function (mem) {
		let n = mem.read8(++this.PC);
		this['CP n'](n);
	},
// ----------------------------------------------------------
	// INC A
	0x3c: function () {
		this['INC r']('A');
	},
	// INC B
	0x04: function () {
		this['INC r']('B');
	},
	// INC C
	0x0c: function () {
		this['INC r']('C');
	},
	// INC D
	0x14: function () {
		this['INC r']('D');
	},
	// INC E
	0x1c: function () {
		this['INC r']('E');
	},
	// INC H
	0x24: function () {
		this['INC r']('H');
	},
	// INC L
	0x2c: function () {
		this['INC r']('L');
	},
// ----------------------------------------------------------
	// DEC A
	0x3d: function () {
		this['DEC r']('A');
	},
	// DEC B
	0x05: function () {
		this['DEC r']('B');
	},
// ----------------------------------------------------------
// 16-bits ALU
// ==========================================================
	// INC BC
	0x03: function () {
		this['INC rr']('BC');
	},
	// INC DE
	0x13: function () {
		this['INC rr']('DE');
	},
	// INC HL
	0x23: function () {
		this['INC rr']('HL');
	},
	// INC SP
	0x33: function () {
		this['INC rr']('SP');
	},

// Rotates & shifts
	// RLCA
	0x07: function () {
		this.flags.C = this.A >>> 7;
		this.A = (this.A << 1) & 0xFF | this.flags.C;
		this.flags.Z = (this.A === 0) | 0;
		this.flags.N = 0;
		this.flags.H = 0;
		this.PC++;
	},
	// RLA
	0x17: function () {
		let carry = this.A >>> 7;
		this.A = (this.A << 1) & 0xFF | this.flags.C;
		this.flags.C = carry;
		this.flags.Z = (this.A === 0) | 0;
		this.flags.N = 0;
		this.flags.H = 0;
		this.PC++;
	},

// Jumps
// ==========================================================
// 1. JP nn
// 2. JP cc,nn
// 3. JP (HL)
// 4. JR n
// 5. JR cc,n
	// JR NZ,n
	0x20: function (mem) {
		this.code = 'JR NZ,n';
		let n = mem.read8(++this.PC);
		n = (n <= 0x7F) ? n : 0xFFFFFF00 | n;// signed
		this.PC++;
		if (!this.flags.Z) {
			this.PC += n;
		}
	},
	// JR Z,n
	0x28: function (mem) {
		this.code = 'JR Z,n';
		let n = mem.read8(++this.PC);
		n = (n <= 0x7F) ? n : 0xFFFFFF00 | n;// signed
		this.PC++;
		if (this.flags.Z) {
			this.PC += n;
		}
	},
	// JR NC,n
	0x30: function (mem) {
		this.code = 'JR NC,n';
		let n = mem.read8(++this.PC);
		n = (n <= 0x7F) ? n : 0xFFFFFF00 | n;// signed
		this.PC++;
		if (!this.flags.C) {
			this.PC += n;
		}
	},
	// JR C,n
	0x38: function (mem) {
		this.code = 'JR C,n';
		let n = mem.read8(++this.PC);
		n = (n <= 0x7F) ? n : 0xFFFFFF00 | n;// signed
		this.PC++;
		if (this.flags.C) {
			this.PC += n;
		}
	},

// Calls
// ==========================================================
	// CALL nn
	0xcd: function (mem) {
		this.code = 'CALL';
		let nn = mem.read16(++this.PC);
		this['PUSH nn'](this.PC + 2);
		this.PC = nn;
	},

// Returns
// ==========================================================
	// RET
	0xc9: function (mem) {
		this.code = 'RET';
		this.SP += 2;
		let nn = mem.read16(this.SP);
		this.PC = nn;
	},

// Extended instructions
	0xcb: function () {
		this.isExtendedInstruction = true;
		this.PC++;
	}

};
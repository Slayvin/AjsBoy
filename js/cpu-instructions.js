'use strict';

/* global Cpu */
/* global Utils */

(function (Cpu) {
// ============================================================================
// Common macro instructions
// ============================================================================
	(function () {
		// ====================================================================
		// 8-bits loads
		// ====================================================================
		
		/**
		 * Load n into register r
		 * @param {string} r 
		 * @param {number} n 
		 * @returns {number} The number of cycles the instruction takes
		 */
		this['LD r,n'] = function (r, n) {
			//this.code = 'LD ' + r + ',' + n.toString(16);
			this[r] = n;
			this.PC++;

			return 2; // 2 cycles
		};

		/**
		 * Load r2 into r1
		 * @param {string} r1 
		 * @param {string} r2 
		 * @returns {number} The number of cycles the instruction takes
		 */
		this['LD r1,r2'] = function (r1, r2) {
			// this.code = 'LD ' + r1 + ',' + r2;
			this[r1] = this[r2];
			this.PC++;

			return 1; // 1 cycle
		};

		/**
		 * Load memory[addr] into A
		 * @param {number} addr 
		 * @returns {number} The number of cycles the instruction takes
		 */
		this['LD A,addr'] = function (addr) {
			// this.code = 'LD A,' + addr.toString(16);
			this.A = this.memory.read8(addr);
			this.PC++;

			return 2; // 2 cycles
		};

		this['LD addr,A'] = function (addr) {
			// this.code = 'LD ' + addr.toString(16) + ',A';
			return this['LD addr,n'](addr, this.A);
		};

		this['LD addr,n'] = function (addr, n) {
			// this.code = 'LD ' + addr.toString(16) + ',' + n.toString(16);
			this.memory.write(addr, n);
			this.PC++;

			return 2; // 2 cycles
		};

		// ====================================================================
		// 8-bits ALU
		// ====================================================================
		this['ADD A,n'] = function (n) {
			// this.code = 'ADD A,' + n.toString(16);
			const result = (this.A + n);
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = Utils.carryFromBit3(this.A, n);
			this.flags.C = Utils.carryFromBit7(this.A, n);
			this.A = result & 0xFF;
			this.PC++;

			return 1; // 1 cycle
		};

		this['ADC A,n'] = function (n) {
			// this.code = 'ADC A,' + n.toString(16);
			const result = (this.A + n + this.flags.C);
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = ((this.A & 0x0F) + (n & 0x0F) + this.flags.C) > 0x0F ? 1 : 0;
			this.flags.C = result > 0xFF ? 1 : 0;
			this.A = result & 0xFF;
			this.PC++;

			return 1; // 1 cycle
		};

		this['SUB n'] = function (n) {
			// this.code = 'SUB n';
			const result = (this.A - n) & 0xFF;
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 1;
			this.flags.H = (this.A & 0x0F) < (n & 0x0F) ? 1 : 0;
			this.flags.C = this.A < n ? 1 : 0;
			this.A = result;
			this.PC++;

			return 1; // 1 cycle
		};

		this['SBC A,n'] = function (n) {
			// this.code = 'SBC A,n';
			const result = this.A - n - this.flags.C;
			this.flags.Z = (result & 0xFF) === 0 ? 1 : 0;
			this.flags.N = 1;
			this.flags.H = ((this.A ^ n ^ (result & 0xFF)) & 0x10) !== 0 ? 1 : 0;
			this.flags.C = result < 0 ? 1 : 0;
			this.A = result & 0xFF;
			this.PC++;

			return 1; // 1 cycle
		};

		this['AND n'] = function (n) {
			this.code = 'AND ' + n.toString();
			this.A = (n & this.A) & 0xFF;
			this.flags.Z = this.A === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 1;
			this.flags.C = 0;
			this.PC++;

			return 1; // 1 cycle
		};

		this['OR n'] = function (n) {
			// this.code = 'OR ' + n.toString();
			this.A = (n | this.A) & 0xFF;
			this.flags.Z = this.A === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = 0;
			this.PC++;

			return 1; // 1 cycle
		};

		this['XOR n'] = function (n) {
			// this.code = 'XOR ' + n.toString();
			this.A = (n ^ this.A) & 0xFF;
			this.flags.Z = this.A === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = 0;
			this.PC++;

			return 1; // 1 cycle
		};

		this['INC n'] = function (n) {
			// this.code = 'INC ' + n.toString(16);
			const result = (n + 1) & 0xff;
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 0;
			this.flags.H = Utils.carryFromBit3(n, 1);
			this.PC++;

			return result;
		};

		this['DEC n'] = function (n) {
			// this.code = 'DEC ' + n.toString(16);
			const result = (n - 1) & 0xff;
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 1;
			this.flags.H = (n ^ 1 ^ result) & 0x10 ? 1 : 0;
			this.PC++;

			return result;
		};

		/** 
		 * Compare A with n (r, (HL) or d8), setting flags accordingly, but never storing the result
		 * @returns {number} The number of cycles the instruction takes
		*/
		this['CP n'] = function (n) {
			const result = (this.A - n) & 0xFF;
			this.flags.Z = result === 0 ? 1 : 0;
			this.flags.N = 1;
			this.flags.H = (this.A & 0x0F) < (n & 0x0F) ? 1 : 0;
			// this.flags.H = (this.A ^ n ^ result) & 0x10;
			this.flags.C = this.A < n ? 1 : 0;
			this.PC++;

			return 1; // 1 cycle
		};

		// 16-bits loads
		// ======================================================
		this['LD rr,nn'] = function (rr, nn) {
			// this.code = 'LD ' + rr + ',' + nn.toString(16);
			this[rr] = nn;
			this.PC++;

			return 3; // 3 cycles
		};

		this['PUSH nn'] = function (nn) {
			// this.code = 'PUSH ' + nn.toString(16);
			this.memory.write(this.SP - 1, nn >>> 8);
			this.memory.write(this.SP - 2, nn & 0xFF);
			this.SP -= 2;

			return 4; // 4 cycles
		};

		this['POP rr'] = function (rr) {
			// this.code = 'POP ';
			this[rr] = this.memory.read16(this.SP);
			this.SP += 2;

			return 3; // 3 cycles
		};

		// 16-bits ALU
		// ======================================================
		this['ADD HL,nn'] = function (nn) {
			// this.code = 'ADD HL,' + nn.toString(16);
			const result = this.HL + nn;
			this.flags.N = 0;
			this.flags.H = Utils.carryFromBit11(this.HL, nn);
			this.flags.C = Utils.carryFromBit15(this.HL, nn);
			this.HL = result & 0xFFFF;
			this.PC++;

			return 2; // 2 cycles
		};

		this['INC rr'] = function (rr) {
			// this.code = 'INC ' + rr;
			this[rr] = (this[rr] + 1) & 0xffff;
			this.PC++;

			return 2; // 2 cycles
		};

		this['DEC rr'] = function (rr) {
			// this.code = 'DEC ' + rr;
			this[rr] = (this[rr] - 1) & 0xffff;
			this.PC++;

			return 2; // 2 cycles
		};
	}).apply(Cpu.prototype);

// ============================================================================
// All basic Operation codes
// ============================================================================
	Cpu.prototype.instructions = {

// ============================================================================
// 8-bits Loads
// ============================================================================
// 
// ----------------------------------------------------------------------------
		// LD A,n
		0x3e: function (mem) {
			const n = mem.read8(++this.PC);

			return this['LD r,n']('A', n);
		},
		// LD B,n
		0x06: function (mem) {
			const n = mem.read8(++this.PC);

			return this['LD r,n']('B', n);
		},
		// LD C,n
		0x0e: function (mem) {
			const n = mem.read8(++this.PC);

			return this['LD r,n']('C', n);
		},
		// LD D,n
		0x16: function (mem) {
			const n = mem.read8(++this.PC);

			return this['LD r,n']('D', n);
		},
		// LD E,n
		0x1e: function (mem) {
			const n = mem.read8(++this.PC);

			return this['LD r,n']('E', n);
		},
		// LD H,n
		0x26: function (mem) {
			const n = mem.read8(++this.PC);

			return this['LD r,n']('H', n);
		},
		// LD L,n
		0x2e: function (mem) {
			const n = mem.read8(++this.PC);

			return this['LD r,n']('L', n);
		},
// ----------------------------------------------------------------------------
		// LD B,(HL)
		0x46: function (mem) {
			const n = mem.read8(this.HL);

			return this['LD r,n']('B', n);
		},
		// LD C,(HL)
		0x4e: function (mem) {
			const n = mem.read8(this.HL);

			return this['LD r,n']('C', n);
		},
		// LD D,(HL)
		0x56: function (mem) {
			const n = mem.read8(this.HL);

			return this['LD r,n']('D', n);
		},
		// LD E,(HL)
		0x5e: function (mem) {
			const n = mem.read8(this.HL);

			return this['LD r,n']('E', n);
		},
		// LD H,(HL)
		0x66: function (mem) {
			const n = mem.read8(this.HL);

			return this['LD r,n']('H', n);
		},
		// LD L,(HL)
		0x6e: function (mem) {
			const n = mem.read8(this.HL);

			return this['LD r,n']('L', n);
		},
// ----------------------------------------------------------------------------
		// LD (HL),B
		0x70: function (mem) {
			const addr = this.HL;

			return this['LD addr,n'](addr, this.B);
		},
		// LD (HL),C
		0x71: function (mem) {
			const addr = this.HL;

			return this['LD addr,n'](addr, this.C);
		},
		// LD (HL),D
		0x72: function (mem) {
			const addr = this.HL;

			return this['LD addr,n'](addr, this.D);
		},
		// LD (HL),E
		0x73: function (mem) {
			const addr = this.HL;

			return this['LD addr,n'](addr, this.E);
		},
		// LD (HL),H
		0x74: function (mem) {
			const addr = this.HL;

			return this['LD addr,n'](addr, this.H);
		},
		// LD (HL),L
		0x75: function (mem) {
			const addr = this.HL;

			return this['LD addr,n'](addr, this.L);
		},
		// LD (HL),n
		0x36: function (mem) {
			const n = mem.read8(++this.PC);
			const addr = this.HL;

			return this['LD addr,n'](addr, n);
		},
// ----------------------------------------------------------------------------
		// LD B,B
		0x40: function () {
			return this['LD r1,r2']('B', 'B');
		},
		// LD B,C
		0x41: function () {
			return this['LD r1,r2']('B', 'C');
		},
		// LD B,D
		0x42: function () {
			return this['LD r1,r2']('B', 'D');
		},
		// LD B,E
		0x43: function () {
			return this['LD r1,r2']('B', 'E');
		},
		// LD B,H
		0x44: function () {
			return this['LD r1,r2']('B', 'H');
		},
		// LD B,L
		0x45: function () {
			return this['LD r1,r2']('B', 'L');
		},
		// LD B,A
		0x47: function () {
			return this['LD r1,r2']('B', 'A');
		},
		// LD C,B
		0x48: function () {
			return this['LD r1,r2']('C', 'B');
		},
		// LD C,C
		0x49: function () {
			return this['LD r1,r2']('C', 'C');
		},
		// LD C,D
		0x4a: function () {
			return this['LD r1,r2']('C', 'D');
		},
		// LD C,E
		0x4b: function () {
			return this['LD r1,r2']('C', 'E');
		},
		// LD C,H
		0x4c: function () {
			return this['LD r1,r2']('C', 'H');
		},
		// LD C,L
		0x4d: function () {
			return this['LD r1,r2']('C', 'L');
		},
		// LD C,A
		0x4f: function () {
			return this['LD r1,r2']('C', 'A');
		},
		// LD D,B
		0x50: function () {
			return this['LD r1,r2']('D', 'B');
		},
		// LD D,C
		0x51: function () {
			return this['LD r1,r2']('D', 'C');
		},
		// LD D,D
		0x52: function () {
			return this['LD r1,r2']('D', 'D');
		},
		// LD D,E
		0x53: function () {
			return this['LD r1,r2']('D', 'E');
		},
		// LD D,H
		0x54: function () {
			return this['LD r1,r2']('D', 'H');
		},
		// LD D,L
		0x55: function () {
			return this['LD r1,r2']('D', 'L');
		},
		// LD D,A
		0x57: function () {
			return this['LD r1,r2']('D', 'A');
		},
		// LD E,B
		0x58: function () {
			return this['LD r1,r2']('E', 'B');
		},
		// LD E,C
		0x59: function () {
			return this['LD r1,r2']('E', 'C');
		},
		// LD E,D
		0x5a: function () {
			return this['LD r1,r2']('E', 'D');
		},
		// LD E,E
		0x5b: function () {
			return this['LD r1,r2']('E', 'E');
		},
		// LD E,H
		0x5c: function () {
			return this['LD r1,r2']('E', 'H');
		},
		// LD E,L
		0x5d: function () {
			return this['LD r1,r2']('E', 'L');
		},
		// LD E,A
		0x5f: function () {
			return this['LD r1,r2']('E', 'A');
		},
		// LD H,B
		0x60: function () {
			return this['LD r1,r2']('H', 'B');
		},
		// LD H,C
		0x61: function () {
			return this['LD r1,r2']('H', 'C');
		},
		// LD H,D
		0x62: function () {
			return this['LD r1,r2']('H', 'D');
		},
		// LD H,E
		0x63: function () {
			return this['LD r1,r2']('H', 'E');
		},
		// LD H,H
		0x64: function () {
			return this['LD r1,r2']('H', 'H');
		},
		// LD H,L
		0x65: function () {
			return this['LD r1,r2']('H', 'L');
		},
		// LD H,A
		0x67: function () {
			return this['LD r1,r2']('H', 'A');
		},
		// LD L,B
		0x68: function () {
			return this['LD r1,r2']('L', 'B');
		},
		// LD L,C
		0x69: function () {
			return this['LD r1,r2']('L', 'C');
		},
		// LD L,D
		0x6a: function () {
			return this['LD r1,r2']('L', 'D');
		},
		// LD L,E
		0x6b: function () {
			return this['LD r1,r2']('L', 'E');
		},
		// LD L,H
		0x6c: function () {
			return this['LD r1,r2']('L', 'H');
		},
		// LD L,L
		0x6d: function () {
			return this['LD r1,r2']('L', 'L');
		},
		// LD L,A
		0x6f: function () {
			return this['LD r1,r2']('L', 'A');
		},
// ----------------------------------------------------------------------------
		// LD A,B
		0x78: function () {
			return this['LD r1,r2']('A', 'B');
		},
		// LD A,C
		0x79: function () {
			return this['LD r1,r2']('A', 'C');
		},
		// LD A,D
		0x7a: function () {
			return this['LD r1,r2']('A', 'D');
		},
		// LD A,E
		0x7b: function () {
			return this['LD r1,r2']('A', 'E');
		},
		// LD A,H
		0x7c: function () {
			return this['LD r1,r2']('A', 'H');
		},
		// LD A,L
		0x7d: function () {
			return this['LD r1,r2']('A', 'L');
		},
		// LD A,A
		0x7f: function () {
			return this['LD r1,r2']('A', 'A');
		},
// ----------------------------------------------------------------------------
		// LD A,(BC)
		0x0a: function () {
			return this['LD A,addr'](this.BC);
		},
		// LD A,(DE)
		0x1a: function () {
			return this['LD A,addr'](this.DE);
		},
		// LD A,(HL)
		0x7e: function () {
			return this['LD A,addr'](this.HL);
		},
		// LD A,(nn)
		0xfa: function (mmu) {
			const addr = mmu.read16(this.PC + 1);
			this['LD A,addr'](addr);
			this.PC += 2;

			return 4; // 4 cycles
		},
// ----------------------------------------------------------------------------
		// LD (BC),A
		0x02: function () {
			return this['LD addr,A'](this.BC);
		},
		// LD (DE),A
		0x12: function () {
			return this['LD addr,A'](this.DE);
		},
		// LD (HL),A
		0x77: function () {
			return this['LD addr,A'](this.HL);
		},
		// LD (nn),A
		0xea: function (mmu) {
			const addr = mmu.read16(this.PC + 1);
			this['LD addr,A'](addr);
			this.PC += 2;

			return 4; // 4 cycles
		},
// ----------------------------------------------------------------------------
		// LD A,(C)
		0xf2: function (mem) {
			// this.code = 'LD A,(C)';
			const addr = 0xFF00 + this.C;
			this.A = mem.read8(addr);
			this.PC++;

			return 2; // 2 cycles
		},
		// LD (C),A
		0xe2: function (mem) {
			// this.code = 'LD (C),A';
			const addr = 0xFF00 + this.C;
			mem.write(addr, this.A);
			this.PC++;

			return 2; // 2 cycles
		},
		// LD A,(HLD) | LD A,(HL-) | LDD A,(HL)
		0x3a: function (mem) {
			// this.code = 'LD A,(HL-)';
			this.A = mem.read8(this.HL);
			this.HL = (this.HL - 1) & 0xFFFF;
			this.PC++;

			return 2; // 2 cycles
		},
		// LD (HLD),A | LD (HL-),A | LDD (HL),A
		0x32: function (mem) {
			// this.code = 'LD (HL-),A';
			mem.write(this.HL, this.A);
			this.HL = (this.HL - 1) & 0xFFFF;
			this.PC++;

			return 2; // 2 cycles
		},
		// LD A,(HLI) | LD A,(HL+) | LDI A,(HL)
		0x2a: function (mem) {
			// this.code = 'LD A,(HL+)';
			this.A = mem.read8(this.HL);
			this.HL = (this.HL + 1) & 0xFFFF;
			this.PC++;

			return 2; // 2 cycles
		},
		// LD (HLI),A | LD (HL+),A | LDI (HL),A
		0x22: function (mem) {
			// this.code = 'LD (HL+),A';
			mem.write(this.HL, this.A);
			this.HL = (this.HL + 1) & 0xFFFF;
			this.PC++;

			return 2; // 2 cycles
		},
		// LDH (n),A
		0xe0: function (mem) {
			// this.code = 'LDH (n),A';
			const n = mem.read8(++this.PC);
			const addr = 0xFF00 + n;
			mem.write(addr, this.A);
			this.PC++;

			return 3; // 3 cycles
		},
		// LDH A,(n)
		0xf0: function (mem) {
			// this.code = 'LDH A,(n)';
			const n = mem.read8(++this.PC);
			const addr = 0xFF00 + n;
			this.A = mem.read8(addr);
			this.PC++;

			return 3; // 3 cycles
		},

// ============================================================================
// 16-bits loads
// ============================================================================
// 
// 1. ----------------------------------------------------------------------------
		// LD BC,nn
		0x01: function (mem) {
			const nn = mem.read16(++this.PC);
			this.PC++;
			
			return this['LD rr,nn']('BC', nn);
		},
		// LD DE,nn
		0x11: function (mem) {
			const nn = mem.read16(++this.PC);
			this.PC++;
			
			return this['LD rr,nn']('DE', nn);
		},
		// LD HL,nn
		0x21: function (mem) {
			const nn = mem.read16(++this.PC);
			this.PC++;

			return this['LD rr,nn']('HL', nn);
		},
		// LD SP,nn
		0x31: function (mem) {
			const nn = mem.read16(++this.PC);
			this.PC++;

			return this['LD rr,nn']('SP', nn);
		},
// 2. ----------------------------------------------------------------------------
		// LD SP,HL
		0xf9: function () {
			this['LD rr,nn']('SP', this.HL);

			return 2; // 2 cycles
		},
// 3-4. ----------------------------------------------------------------------------
		// LD HL,SP+n | LDHL SP,n
		0xf8: function (mem) {
			const n = mem.read8(++this.PC);
			const result = this.SP + Utils.sign(n);
			this['LD rr,nn']('HL', result & 0xFFFF);
			this.flags.Z = 0;
			this.flags.N = 0;
			this.flags.H = Utils.carryFromBit3(this.SP, n);
			this.flags.C = Utils.carryFromBit7(this.SP, n);

			return 3; // 3 cycles
		},
// 5. ----------------------------------------------------------------------------
		// LD (nn),SP
		0x08: function (mem) {
			const addr = mem.read16(++this.PC);
			this.PC += 2;
			mem.write(addr, this.SP & 0xFF);
			mem.write(addr + 1, this.SP >>> 8);

			return 5; // 5 cycles
		},
// 6. ----------------------------------------------------------------------------
		// PUSH AF
		0xf5: function () {
			this.PC++;

			return this['PUSH nn'](this.AF & 0xFFF0);
		},
		// PUSH BC
		0xc5: function () {
			this.PC++;

			return this['PUSH nn'](this.BC);
		},
		// PUSH DE
		0xd5: function () {
			this.PC++;

			return this['PUSH nn'](this.DE);
		},
		// PUSH HL
		0xe5: function () {
			this.PC++;

			return this['PUSH nn'](this.HL);
		},
// 7. ----------------------------------------------------------------------------
		// POP AF
		0xf1: function () {
			this.PC++;

			return this['POP rr']('AF');
		},
		// POP BC
		0xc1: function () {
			this.PC++;

			return this['POP rr']('BC');
		},
		// POP DE
		0xd1: function () {
			this.PC++;

			return this['POP rr']('DE');
		},
		// POP HL
		0xe1: function () {
			this.PC++;

			return this['POP rr']('HL');
		},

// ============================================================================
// 8-bits ALU
// ============================================================================
		// ADD A,A
		0x87: function () {
			const n = this.A;
			
			return this['ADD A,n'](n);
		},
		// ADD A,B
		0x80: function () {
			const n = this.B;
			
			return this['ADD A,n'](n);
		},
		// ADD A,C
		0x81: function () {
			const n = this.C;

			return this['ADD A,n'](n);
		},
		// ADD A,D
		0x82: function () {
			const n = this.D;
			
			return this['ADD A,n'](n);
		},
		// ADD A,E
		0x83: function () {
			const n = this.E;

			return this['ADD A,n'](n);
		},
		// ADD A,H
		0x84: function () {
			const n = this.H;

			return this['ADD A,n'](n);
		},
		// ADD A,L
		0x85: function () {
			const n = this.L;
			
			return this['ADD A,n'](n);
		},
		// ADD A,(HL)
		0x86: function (mem) {
			const n = mem.read8(this.HL);
			this['ADD A,n'](n);

			return 2; // 2 cycles
		},
		// ADD A,n
		0xc6: function (mem) {
			const n = mem.read8(++this.PC);
			this['ADD A,n'](n);

			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// ADC A,A
		0x8f: function () {
			return this['ADC A,n'](this.A);
		},
		// ADC A,B
		0x88: function () {
			return this['ADC A,n'](this.B);
		},
		// ADC A,C
		0x89: function () {
			return this['ADC A,n'](this.C);
		},
		// ADC A,D
		0x8a: function () {
			return this['ADC A,n'](this.D);
		},
		// ADC A,E
		0x8b: function () {
			return this['ADC A,n'](this.E);
		},
		// ADC A,H
		0x8c: function () {
			return this['ADC A,n'](this.H);
		},
		// ADC A,L
		0x8d: function () {
			return this['ADC A,n'](this.L);
		},
		// ADC A,(HL)
		0x8e: function (mem) {
			const n = mem.read8(this.HL);
			this['ADC A,n'](n);

			return 2; // 2 cycles
		},
		// ADC A,n
		0xce: function (mem) {
			const n = mem.read8(++this.PC);
			this['ADC A,n'](n);

			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// SUB A
		0x97: function () {
			return this['SUB n'](this.A);
		},
		// SUB B
		0x90: function () {
			return this['SUB n'](this.B);
		},
		// SUB C
		0x91: function () {
			return this['SUB n'](this.C);
		},
		// SUB D
		0x92: function () {
			return this['SUB n'](this.D);
		},
		// SUB E
		0x93: function () {
			return this['SUB n'](this.E);
		},
		// SUB H
		0x94: function () {
			return this['SUB n'](this.H);
		},
		// SUB L
		0x95: function () {
			return this['SUB n'](this.L);
		},
		// SUB (HL)
		0x96: function (mem) {
			const n = mem.read8(this.HL);
			this['SUB n'](n);

			return 2; // 2 cycles
		},
		// SUB (HL)
		0xd6: function (mem) {
			const n = mem.read8(++this.PC);
			this['SUB n'](n);

			return 2; // 2 cycles

		},
// 4. ----------------------------------------------------------------------------
		// SBC A,A
		0x9f: function () {
			return this['SBC A,n'](this.A);
		},
		// SBC A,B
		0x98: function () {
			return this['SBC A,n'](this.B);
		},
		// SBC A,C
		0x99: function () {
			return this['SBC A,n'](this.C);
		},
		// SBC A,D
		0x9a: function () {
			return this['SBC A,n'](this.D);
		},
		// SBC A,E
		0x9b: function () {
			return this['SBC A,n'](this.E);
		},
		// SBC A,H
		0x9c: function () {
			return this['SBC A,n'](this.H);
		},
		// SBC A,L
		0x9d: function () {
			return this['SBC A,n'](this.L);
		},
		// SBC A,(HL)
		0x9e: function (mem) {
			const n = mem.read8(this.HL);
			this['SBC A,n'](n);
			
			return 2; // 2 cycles
		},
		// SBC A,n
		0xde: function (mem) {
			const n = mem.read8(++this.PC);
			this['SBC A,n'](n);

			return 2; // 2 cycles
		},
// 5. ----------------------------------------------------------------------------
		// AND A
		0xa7: function () {
			return this['AND n'](this.A);
		},
		// AND B
		0xa0: function () {
			return this['AND n'](this.B);
		},
		// AND C
		0xa1: function () {
			return this['AND n'](this.C);
		},
		// AND D
		0xa2: function () {
			return this['AND n'](this.D);
		},
		// AND E
		0xa3: function () {
			return this['AND n'](this.E);
		},
		// AND H
		0xa4: function () {
			return this['AND n'](this.H);
		},
		// AND L
		0xa5: function () {
			return this['AND n'](this.L);
		},
		// AND (HL)
		0xa6: function (mem) {
			const n = mem.read8(this.HL);
			this['AND n'](n);

			return 2; // 2 cycles
		},
		// AND n
		0xe6: function (mem) {
			const n = mem.read8(++this.PC);
			this['AND n'](n);

			return 2; // 2 cycles
		},
// 6. ----------------------------------------------------------------------------
		// OR A
		0xb7: function () {
			return this['OR n'](this.A);
		},
		// OR B
		0xb0: function () {
			return this['OR n'](this.B);
		},
		// OR C
		0xb1: function () {
			return this['OR n'](this.C);
		},
		// OR D
		0xb2: function () {
			return this['OR n'](this.D);
		},
		// OR E
		0xb3: function () {
			return this['OR n'](this.E);
		},
		// OR H
		0xb4: function () {
			return this['OR n'](this.H);
		},
		// OR L
		0xb5: function () {
			return this['OR n'](this.L);
		},
		// OR (HL)
		0xb6: function (mem) {
			const n = mem.read8(this.HL);
			this['OR n'](n);

			return 2; // 2 cycles
		},
		// OR n
		0xf6: function (mem) {
			const n = mem.read8(++this.PC);
			this['OR n'](n);

			return 2; // 2 cycles
		},
// ----------------------------------------------------------------------------
		// XOR A
		0xaf: function () {
			return this['XOR n'](this.A);
		},
		// XOR B
		0xa8: function () {
			return this['XOR n'](this.B);
		},
		// XOR C
		0xa9: function () {
			return this['XOR n'](this.C);
		},
		// XOR D
		0xaa: function () {
			return this['XOR n'](this.D);
		},
		// XOR E
		0xab: function () {
			return this['XOR n'](this.E);
		},
		// XOR H
		0xac: function () {
			return this['XOR n'](this.H);
		},
		// XOR L
		0xad: function () {
			return this['XOR n'](this.L);
		},
		// XOR (HL)
		0xae: function (mem) {
			const n = mem.read8(this.HL);
			this['XOR n'](n);

			return 2;
		},
		// XOR d8
		0xee: function (mem) {
			const n = mem.read8(++this.PC);
			this['XOR n'](n);

			return 2;
		},
// ----------------------------------------------------------------------------
		// CP A
		0xbf: function () {
			return this['CP n'](this.A);
		},
		// CP B
		0xb8: function () {
			return this['CP n'](this.B);
		},
		// CP C
		0xb9: function () {
			return this['CP n'](this.C);
		},
		// CP D
		0xba: function () {
			return this['CP n'](this.D);
		},
		// CP E
		0xbb: function () {
			return this['CP n'](this.E);
		},
		// CP H
		0xbc: function () {
			return this['CP n'](this.H);
		},
		// CP L
		0xbd: function () {
			return this['CP n'](this.L);
		},
		// CP (HL)
		0xbe: function (mem) {
			const n = mem.read8(this.HL);
			this['CP n'](n);

			return 2;
		},
		// CP d8
		0xfe: function (mem) {
			const n = mem.read8(++this.PC);
			this['CP n'](n);

			return 2;
		},
// ----------------------------------------------------------------------------
		// INC A
		0x3c: function () {
			this.A = this['INC n'](this.A);

			return 1;
		},
		// INC B
		0x04: function () {
			this.B = this['INC n'](this.B);

			return 1;
		},
		// INC C
		0x0c: function () {
			this.C = this['INC n'](this.C);

			return 1;
		},
		// INC D
		0x14: function () {
			this.D = this['INC n'](this.D);

			return 1;
		},
		// INC E
		0x1c: function () {
			this.E = this['INC n'](this.E);

			return 1;
		},
		// INC H
		0x24: function () {
			this.H = this['INC n'](this.H);

			return 1;
		},
		// INC L
		0x2c: function () {
			this.L = this['INC n'](this.L);

			return 1;
		},
		// INC (HL)
		0x34: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			mem.write(addr, this['INC n'](n));

			return 3;
		},
// ----------------------------------------------------------------------------
		// DEC A
		0x3d: function () {
			this.A = this['DEC n'](this.A);

			return 1;
		},
		// DEC B
		0x05: function () {
			this.B = this['DEC n'](this.B);

			return 1;
		},
		// DEC C
		0x0d: function () {
			this.C = this['DEC n'](this.C);

			return 1;
		},
		// DEC D
		0x15: function () {
			this.D = this['DEC n'](this.D);

			return 1;
		},
		// DEC E
		0x1d: function () {
			this.E = this['DEC n'](this.E);

			return 1;
		},
		// DEC H
		0x25: function () {
			this.H = this['DEC n'](this.H);

			return 1;
		},
		// DEC L
		0x2d: function () {
			this.L = this['DEC n'](this.L);

			return 1;
		},
		// DEC (HL)
		0x35: function (mem) {
			const addr = this.HL;
			const n = mem.read8(addr);
			mem.write(addr, this['DEC n'](n));

			return 3;
		},

// ============================================================================
// 16-bits ALU
// ============================================================================
		// ADD HL,BC
		0x09: function () {
			return this['ADD HL,nn'](this.BC);
		},
		// ADD HL,DE
		0x19: function () {
			return this['ADD HL,nn'](this.DE);
		},
		// ADD HL,HL
		0x29: function () {
			return this['ADD HL,nn'](this.HL);
		},
		// ADD HL,SP
		0x39: function () {
			return this['ADD HL,nn'](this.SP);
		},
// ----------------------------------------------------------------------------
		// ADD SP,n
		0xe8: function (mem) {
			const n = mem.read8(++this.PC);
			const result = this.SP + Utils.sign(n);
			this.flags.Z = 0;
			this.flags.N = 0;
			this.flags.H = Utils.carryFromBit3(this.SP, n);
			this.flags.C = Utils.carryFromBit7(this.SP, n);

			this.SP = result & 0xFFFF;
			this.PC++;

			return 4; // 4 cycles
		},
// ----------------------------------------------------------------------------
		// INC BC
		0x03: function () {
			return this['INC rr']('BC');
		},
		// INC DE
		0x13: function () {
			return this['INC rr']('DE');
		},
		// INC HL
		0x23: function () {
			return this['INC rr']('HL');
		},
		// INC SP
		0x33: function () {
			return this['INC rr']('SP');
		},
// ----------------------------------------------------------------------------
		// INC BC
		0x0b: function () {
			return this['DEC rr']('BC');
		},
		// INC DE
		0x1b: function () {
			return this['DEC rr']('DE');
		},
		// INC HL
		0x2b: function () {
			return this['DEC rr']('HL');
		},
		// INC SP
		0x3b: function () {
			return this['DEC rr']('SP');
		},

// ============================================================================
// Misc
// ============================================================================
		// DAA
		0x27: function () {
			if (!this.flags.N) {
				// ADDITION
				if (this.flags.C || this.A > 0x99) {
					this.A += 0x60;
					this.flags.C = 1;
				}
				if (this.flags.H || (this.A & 0x0F) > 9) {
					this.A += 6;
				}
			} else {
				// SUBTRACTION
				if (this.flags.C) {
					this.A -= 0x60;
				}
				if (this.flags.H) {
					this.A -= 6;
				}
			}
			this.A &= 0xFF;
			this.flags.Z = this.A === 0 ? 1 : 0;
			this.flags.H = 0;
			this.PC++;

			return 1; // 1 cycle
		},
		// CPL
		0x2f: function () {
			this.A = (~this.A) & 0xFF;
			this.flags.N = 1;
			this.flags.H = 1;
			this.PC++;

			return 1; // 1 cycle
		},
		// CCF
		0x3f: function () {
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = this.flags.C ? 0 : 1;
			this.PC++;

			return 1; // 1 cycle
		},
		// SCF
		0x37: function () {
			this.flags.N = 0;
			this.flags.H = 0;
			this.flags.C = 1;
			this.PC++;

			return 1; // 1 cycle
		},
		// NOP
		0x00: function () {
			this.PC++;
			
			return 1; // 1 cycle
		},
		// HALT
		0x76: function () {
			this.PC++;
			this.halted = true;
			return 1; // 1 cycle
		},
		// STOP
		0x10: function () {
			this.PC++;
			this.stopped = true;
			return 1; // 1 cycle
		},
		// DI
		0xf3: function (mem) {
			this.imu.IME = 0;
			this.PC++;

			return 1; // 1 cycle
		},
		// EI
		0xfb: function (mem) {
			this.imu.IME = 1;
			this.PC++;

			return 1; // 1 cycle
		},

// ============================================================================
// Rotates & shifts
// ============================================================================
		// RLCA
		0x07: function () {
			this.A = this['RL n'](this.A, false);
			this.flags.Z = 0;

			return 1; // 1 cycle
		},
		// RLA
		0x17: function () {
			this.A = this['RL n'](this.A, true);
			this.flags.Z = 0;

			return 1; // 1 cycle
		},
		// RRCA
		0x0f: function () {
			this.A = this['RR n'](this.A, false);
			this.flags.Z = 0;

			return 1; // 1 cycle
		},
		// RRA
		0x1f: function () {
			this.A = this['RR n'](this.A, true);
			this.flags.Z = 0;

			return 1; // 1 cycle
		},

// ============================================================================
// Jumps
// ============================================================================
		// JP nn
		0xc3: function (mem) {
			const addr = mem.read16(++this.PC);
			// this.code = 'JP ' + addr.toString(16);
			this.PC = addr;

			return 4; // 4 cycles
		},
// ----------------------------------------------------------------------------
		// JP NZ,nn
		0xc2: function (mem) {
			const addr = mem.read16(++this.PC);
			this.code = 'JP NZ,' + addr.toString(16);
			if (!this.flags.Z) {
				this.PC = addr;

				return 4; // 4 cycles
			} else {
				this.PC += 2;

				return 3; // 3 cycles
			}
		},
		// JP Z,nn
		0xca: function (mem) {
			const addr = mem.read16(++this.PC);
			this.code = 'JP Z,' + addr.toString(16);
			if (this.flags.Z) {
				this.PC = addr;

				return 4; // 4 cycles
			} else {
				this.PC += 2;

				return 3; // 3 cycles
			}
		},
		// JP NC,nn
		0xd2: function (mem) {
			const addr = mem.read16(++this.PC);
			// this.code = 'JP NC,' + addr.toString(16);
			if (!this.flags.C) {
				this.PC = addr;

				return 4; // 4 cycles
			} else {
				this.PC += 2;

				return 3; // 3 cycles
			}
		},
		// JP C,nn
		0xda: function (mem) {
			const addr = mem.read16(++this.PC);
			// this.code = 'JP C,' + addr.toString(16);
			if (this.flags.C) {
				this.PC = addr;

				return 4; // 4 cycles
			} else {
				this.PC += 2;

				return 3; // 3 cycles
			}
		},
// ----------------------------------------------------------------------------
		// JP (HL)
		0xe9: function (mem) {
			const addr = this.HL;
			// this.code = 'JP (HL)' + addr.toString(16);
			this.PC = addr;

			return 1; // 1 cycle
		},
// ----------------------------------------------------------------------------
		// JR n
		0x18: function (mem) {
			// this.code = 'JR n';
			const n = Utils.sign(mem.read8(++this.PC));
			this.PC += n + 1;

			return 3; // 3 cycles
		},
// ----------------------------------------------------------------------------
		// JR NZ,n
		0x20: function (mem) {
			// this.code = 'JR NZ,n';
			const n = Utils.sign(mem.read8(++this.PC));
			this.PC++;
			if (!this.flags.Z) {
				this.PC += n;

				return 3; // 3 cycles
			}

			return 2; // 2 cycles
		},
		// JR Z,n
		0x28: function (mem) {
			// this.code = 'JR Z,n';
			const n = Utils.sign(mem.read8(++this.PC));
			this.PC++;
			if (this.flags.Z) {
				this.PC += n;

				return 3; // 3 cycles
			}

			return 2; // 2 cycles
		},
		// JR NC,n
		0x30: function (mem) {
			// this.code = 'JR NC,n';
			const n = Utils.sign(mem.read8(++this.PC));
			this.PC++;
			if (!this.flags.C) {
				this.PC += n;

				return 3; // 3 cycles
			}

			return 2; // 2 cycles
		},
		// JR C,n
		0x38: function (mem) {
			// this.code = 'JR C,n';
			const n = Utils.sign(mem.read8(++this.PC));
			this.PC++;
			if (this.flags.C) {
				this.PC += n;

				return 3; // 3 cycles
			}

			return 2; // 2 cycles
		},

// ============================================================================
// Calls
// ============================================================================
		// CALL nn
		0xcd: function (mem) {
			// this.code = 'CALL';
			const nn = mem.read16(++this.PC);
			this['PUSH nn'](this.PC + 2);
			this.PC = nn;

			return 6;
		},
// ----------------------------------------------------------------------------
		// CALL NZ,nn
		0xc4: function (mem) {
			const nn = mem.read16(++this.PC);
			// this.code = 'CALL NZ,' + nn.toString(16);
			if (!this.flags.Z) {
				this['PUSH nn'](this.PC + 2);
				this.PC = nn;

				return 6;
			} else {
				this.PC += 2;

				return 3;
			}
		},
		// CALL Z,nn
		0xcc: function (mem) {
			const nn = mem.read16(++this.PC);
			// this.code = 'CALL Z,' + nn.toString(16);
			if (this.flags.Z) {
				this['PUSH nn'](this.PC + 2);
				this.PC = nn;

				return 6;
			} else {
				this.PC += 2;

				return 3;
			}
		},
		// CALL NC,nn
		0xd4: function (mem) {
			const nn = mem.read16(++this.PC);
			// this.code = 'CALL NC,' + nn.toString(16);
			if (!this.flags.C) {
				this['PUSH nn'](this.PC + 2);
				this.PC = nn;

				return 6;
			} else {
				this.PC += 2;

				return 3;
			}
		},
		// CALL C,nn
		0xdc: function (mem) {
			const nn = mem.read16(++this.PC);
			// this.code = 'CALL C,' + nn.toString(16);
			if (this.flags.C) {
				this['PUSH nn'](this.PC + 2);
				this.PC = nn;

				return 6;
			} else {
				this.PC += 2;

				return 3;
			}
		},
// ============================================================================
// Restarts
// ============================================================================
		// RST $00
		0xc7: function () {
			// this.code = 'RST $00';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x0;

			return 4; // 4 cycles
		},
		// RST $08
		0xcf: function () {
			// this.code = 'RST $08';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x08;

			return 4; // 4 cycles
		},
		// RST $10
		0xd7: function () {
			// this.code = 'RST $10';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x10;

			return 4; // 4 cycles
		},
		// RST $18
		0xdf: function () {
			// this.code = 'RST $18';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x18;

			return 4; // 4 cycles
		},
		// RST $20
		0xe7: function () {
			// this.code = 'RST $20';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x20;

			return 4; // 4 cycles
		},
		// RST $28
		0xef: function () {
			// this.code = 'RST $28';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x28;

			return 4; // 4 cycles
		},
		// RST $30
		0xf7: function () {
			// this.code = 'RST $30';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x30;

			return 4; // 4 cycles
		},
		// RST $38
		0xff: function () {
			// this.code = 'RST $38';
			this['PUSH nn'](this.PC + 1);
			this.PC = 0x38;

			return 4; // 4 cycles
		},
// ============================================================================
// Returns
// ============================================================================
		// RET
		0xc9: function (mem) {
			// this.code = 'RET';
			const nn = mem.read16(this.SP);
			this.SP += 2;
			this.PC = nn;

			return 4; // 4 cycles
		},
// ----------------------------------------------------------------------------
		// RET NZ
		0xc0: function (mem) {
			// this.code = 'RET NZ';
			if (!this.flags.Z) {
				const nn = mem.read16(this.SP);
				this.SP += 2;
				this.PC = nn;

				return 5; // 5 cycles
			} else {
				this.PC++;

				return 2; // 2 cycles
			}
		},
		// RET Z
		0xc8: function (mem) {
			// this.code = 'RET Z';
			if (this.flags.Z) {
				const nn = mem.read16(this.SP);
				this.SP += 2;
				this.PC = nn;

				return 5; // 5 cycles
			} else {
				this.PC++;

				return 2; // 2 cycles
			}
		},
		// RET NC
		0xd0: function (mem) {
			// this.code = 'RET NC';
			if (!this.flags.C) {
				const nn = mem.read16(this.SP);
				this.SP += 2;
				this.PC = nn;

				return 5; // 5 cycles
			} else {
				this.PC++;

				return 2; // 2 cycles
			}
		},
		// RET C
		0xd8: function (mem) {
			// this.code = 'RET C';
			if (this.flags.C) {
				const nn = mem.read16(this.SP);
				this.SP += 2;
				this.PC = nn;

				return 5; // 5 cycles
			} else {
				this.PC++;

				return 2; // 2 cycles
			}
		},
// ----------------------------------------------------------------------------
		// RETI
		0xd9: function (mem) {
			// this.code = 'RETI';
			const addr = mem.read16(this.SP);
			this.SP += 2;
			this.PC = addr;
			// then enable Interrupts
			this.imu.IME = 1;

			return 4; // 4 cycles
		},

// ============================================================================
// Extended instructions
// ============================================================================
		0xcb: function () {
			// this.code = '...';
			this.isExtendedInstruction = true;
			this.PC++;
		}

	};
})(Cpu);
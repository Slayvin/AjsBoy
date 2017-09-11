/* global Cpu */
'use strict';
// All basic Operation codes
Cpu.prototype.instructions = {
// 8-bits Loads
// ==========================================================
	// LD B,n
	0x06: function () {
		let n = this.read8(++this.PC);
		this['LD r,n']('B', n);
	},
	// LD C,n
	0x0e: function () {
		let n = this.read8(++this.PC);
		this['LD r,n']('C', n);
	},
	// LD D,n
	0x16: function () {
		let n = this.read8(++this.PC);
		this['LD r,n']('D', n);
	},
	// LD E,n
	0x1e: function () {
		let n = this.read8(++this.PC);
		this['LD r,n']('E', n);
	},
	// LD H,n
	0x26: function () {
		let n = this.read8(++this.PC);
		this['LD r,n']('H', n);
	},
	// LD L,n
	0x2e: function () {
		let n = this.read8(++this.PC);
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
	0x3e: function () {
		let n = this.read8(++this.PC);
		this['LD r,n']('A', n);
	},
// LD A,addr
// ----------------------------------------------------------
	// LD A,(BC)
	0x0a: function () {
		let addr = this.BC;
		this.A = this.memory[addr];
		this.PC++;
	},
	// LD A,(DE)
	0x1a: function () {
		let addr = this.DE;
		this.A = this.memory[addr];
		this.PC++;
	},
	// LD A,(HL)
	0x7e: function () {
		let addr = this.HL;
		this.A = this.memory[addr];
		this.PC++;
	},
	// LD A,(nn)
	0xfa: function () {
		let addr = this.read16(++this.PC);
		this.PC++;
		this.A = this.memory[addr];
		this.PC++;
	},
// LD addr,A
// ----------------------------------------------------------
	// LD (BC),A
	0x02: function () {
		let addr = this.BC;
		this.memory[addr] = this.A;
		this.PC++;
	},
	// LD (DE),A
	0x12: function () {
		let addr = this.DE;
		this.memory[addr] = this.A;
		this.PC++;
	},
	// LD (HL),A
	0x77: function () {
		let addr = this.HL;
		this.memory[addr] = this.A;
		this.PC++;
	},
	// LD (nn),A
	0xea: function () {
		let addr = this.read16(++this.PC);
		this.PC++;
		this.memory[addr] = this.A;
		this.PC++;
	},
// ----------------------------------------------------------
	// LD A,(C)
	0xf2: function () {
		let addr = 0xff00 + this.C;
		this.A = this.memory[addr];
		this.PC++;

	},
	// LD (C),A
	0xe2: function () {
		let addr = 0xff00 + this.C;
		this.memory[addr] = this.A;
		this.PC++;

	},
	// LD A,(HLD) | LD A,(HL-) | LDD A,(HL)
	0x3a: function () {
		this.A = this.memory[this.HL];
		this.HL--;
		this.PC++;
	},
	// LD (HLD),A | LD (HL-),A | LDD (HL),A
	0x32: function () {
		this.code = 'LD (HL-),A';
		this.memory[this.HL] = this.A;
		this.HL--;
		this.PC++;
	},
	// LD A,(HLI) | LD A,(HL+) | LDI A,(HL)
	0x2a: function () {
		this.A = this.memory[this.HL];
		this.HL++;
		this.PC++;
	},
	// LD (HLI),A | LD (HL+),A | LDI (HL),A
	0x22: function () {
		this.memory[this.HL] = this.A;
		this.HL++;
		this.PC++;
	},
	// LDH (n),A
	0xe0: function () {
		let n = this.read8(++this.PC);
		let addr = 0xff00 + n;
		this.memory[addr] = this.A;
		this.PC++;
	},
	// LDH A,(n)
	0xf0: function () {
		let n = this.read8(++this.PC);
		let addr = 0xff00 + n;
		this.A = this.memory[addr];
		this.PC++;
	},

// 16-bits loads
// ========================================================== 
	// LD BC,nn
	0x01: function () {
		let nn = this.read16(++this.PC);
		this.PC++;
		this['LD rr,nn']('BC', nn);
	},
	// LD DE,nn
	0x11: function () {
		let nn = this.read16(++this.PC);
		this.PC++;
		this['LD rr,nn']('DE', nn);
	},
	// LD HL,nn
	0x21: function () {
		let nn = this.read16(++this.PC);
		this.PC++;
		this['LD rr,nn']('HL', nn);
	},
	// LD SP,nn
	0x31: function () {
		let nn = this.read16(++this.PC);
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
		this.stack.push(this.AF);
		this.PC++;
	},
	// PUSH BC
	0xc5: function () {
		this.stack.push(this.BC);
		this.PC++;
	},
	// PUSH DE
	0xd5: function () {
		this.stack.push(this.DE);
		this.PC++;
	},
	// PUSH HL
	0xe5: function () {
		this.stack.push(this.HL);
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
	0xae: function () {
		let n = this.memory[this.HL];
		this['XOR n'](n);
	},
// 8. CP n
// ----------------------------------------------------------
	// INC A
	0x3c: function () {
		this.A++;
		this.PC++;
	},
	// INC B
	0x04: function () {
		this.B++;
		this.PC++;
	},
	// INC C
	0x0c: function () {
		this.C++;
		this.PC++;
	},
	// INC D
	0x14: function () {
		this.D++;
		this.PC++;
	},
	// INC E
	0x1c: function () {
		this.E++;
		this.PC++;
	},
	// INC H
	0x24: function () {
		this.H++;
		this.PC++;
	},
	// INC L
	0x2c: function () {
		this.L++;
		this.PC++;
	},
// ----------------------------------------------------------
// 10. DEC n
// ----------------------------------------------------------

// Jumps
// ==========================================================
// 1. JP nn
// 2. JP cc,nn
// 3. JP (HL)
// 4. JR n
// 5. JR cc,n
	// JR NZ,n
	0x20: function () {
		this.code = 'JR NZ,n';
		let n = 0xFFFFFF00 | this.memory[this.PC + 1];// signed
		this.PC += 2;
		if (!this.flags.Z) {
			this.PC += n;
		}
	},

// Calls
// ==========================================================
	// CALL nn
	0xcd: function () {
		let nn = this.read16(++this.PC);
		this.stack.push(this.PC + 2);
		this.PC = nn;
	},

// Extended instructions
	0xcb: function () {
		let opcode = this.memory[this.PC + 1];
		try {
			this.instructions.extended[opcode].apply(this);
		} catch (err) {
			window.console.log(err);
			throw 'Extended instruction 0xcb' + opcode.toString(16) + ' not implemented.';
		}
		this.PC += 2;
	}

};
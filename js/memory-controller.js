'use strict';
/**
 * 
 * @param {gbEmu} emulator
 * @returns {MemController}
 */
function MemController(emulator) {
	this.rom = new Uint8Array(0x8000);
	this.rom_bank0 = new Uint8Array(this.rom.buffer, 0x00, 0x4000);
	this.rom_bankX = new Uint8Array(this.rom.buffer, 0x4000, 0x4000);
	this.memory = new Uint8Array(0x10000);
	this.vram = new Uint8Array(this.memory.buffer, 0x8000, 0x2000);
	this.wram = new Uint8Array(this.memory.buffer, 0xC000, 0x2000);
	this.oam = new Uint8Array(this.memory.buffer, 0xFE00, 0xA0);// 0xFE00 -> 0xFE9F
	this.io = new Uint8Array(this.memory.buffer, 0xFF00, 0x80);
	this.hram = new Uint8Array(this.memory.buffer, 0xFF80, 0x80);

	this.vram.tileMap0 = new Uint8Array(this.memory.buffer, 0x9800, 0x400);
	this.vram.tileMap1 = new Uint8Array(this.memory.buffer, 0x9C00, 0x400);
	this.tileMap = new Uint8Array(0x18000);//128*192*4

	/**
	 * 
	 * @param {int} addr
	 * @returns {int}
	 */
	this.read8 = function (addr) {
		if (addr < 0x100 && this.memory[0xFF50] === 1) {//0xFF50 : Boot rom disable flag
			return this.rom[addr] & 0xFF;
		} else if (0x100 <= addr && addr < 0x8000) {
			return this.rom[addr] & 0xFF;
		} else if (addr === 0xFF00) {
			return emulator.inputs.getKeyState(this.memory[0xFF00]);
		} else {
			return this.memory[addr] & 0xFF;
		}
	};

	this.readVram = function (addr) {
		return this.vram[addr];
	};

	/**
	 * 
	 * @param {int} addr
	 * @param {int} data
	 * @returns {undefined}
	 */
	this.write = function (addr, data) {
		// TODO must check if write is allowed, or do memory bank switching
		if (addr < 0x8000) {
//			console.log('Cannot write (' + data + ') in ROM at address 0x' + addr.toString(16));
//			// TODO : handling of ROM/RAM banks
//			this.memory[addr] = data;
		} else {
			this.memory[addr] = data;
		}
	};

	this.read16 = function (addr) {
		var lo = this.read8(addr);
		var hi = this.read8(addr + 1);
		return hi << 8 | lo;
	};
}

if (typeof exports !== 'undefined') {
	exports.MemController = MemController;
}
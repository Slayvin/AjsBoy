'use strict';
/**
 * 
 * @returns {MemController}
 */
function MemController() {
	this.rom;
	this.memory = new Uint8Array(0x10000);
	this.vram = new Uint8Array(this.memory.buffer, 0x8000, 0x2000);
	this.vram.tileMap0 = new Uint8Array(this.memory.buffer, 0x9800, 0x400);
	this.vram.tileMap1 = new Uint8Array(this.memory.buffer, 0x9C00, 0x400);
	this.tileMap = new Uint8Array(0x18000);

	/**
	 * 
	 * @param {int} addr
	 * @returns {int}
	 */
	this.read8 = function (addr) {
		if (addr < 0x100 && this.memory[0xFF50] === 1) {
			return this.rom[addr];
		} else if (0x100 <= addr && addr < 0x8000) {
			return this.rom[addr];
		} else {
			return this.memory[addr];
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
//			throw 'Cannot write (' + data + ') in ROM at address 0x' + addr.toString(16);
			console.log('Cannot write (' + data + ') in ROM at address 0x' + addr.toString(16));
			this.memory[addr] = data;
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
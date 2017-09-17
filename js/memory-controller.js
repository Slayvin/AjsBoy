'use strict';
/**
 * 
 * @returns {MemController}
 */
function MemController() {
	this.memory = new Uint8Array(0x10000);
	this.vram = new Uint8Array(this.memory.buffer, 0x8000, 0x2000);

	this.read8 = function (addr) {
		return this.memory[addr];
	};

	this.write = function (addr, data) {
		// TODO must check if write is allowed
		this.memory[addr] = data;
	};

	this.read16 = function (addr) {
		let lo = this.memory[addr];
		let hi = this.memory[addr + 1];
		return hi << 8 | lo;
	};
}
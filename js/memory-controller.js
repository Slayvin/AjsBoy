'use strict';
/**
 * 
 * @returns {MemController}
 */
function MemController() {
	this.rom = new Uint8Array(0x10000);

	this.read8 = function (addr) {
		return this.rom[addr];
	};

	this.write = function (addr, data) {
		// TODO must check if write is allowed
		this.rom[addr] = data;
	};

	this.read16 = function (addr) {
		let lo = this.rom[addr];
		let hi = this.rom[addr + 1];
		return hi << 8 | lo;
	};
}
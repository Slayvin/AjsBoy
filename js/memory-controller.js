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

	this.write8 = function (addr, data) {
		// TODO must check if write is allowed
		this.rom[addr] = data;
	};
}
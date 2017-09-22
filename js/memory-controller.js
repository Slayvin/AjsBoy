'use strict';
/**
 * 
 * @returns {MemController}
 */
function MemController() {
	this.memory = new Uint8Array(0x10000);
	this.vram = new Uint8Array(this.memory.buffer, 0x8000, 0x2000);

	/**
	 * 
	 * @param {int} addr
	 * @returns {int}
	 */
	this.read8 = function (addr) {
		return this.memory[addr];
	};

	/**
	 * 
	 * @param {int} addr
	 * @param {int} data
	 * @returns {undefined}
	 */
	this.write = function (addr, data) {
		// TODO must check if write is allowed
		this.memory[addr] = data;
	};

	this.read16 = function (addr) {
		var lo = this.memory[addr];
		var hi = this.memory[addr + 1];
		return hi << 8 | lo;
	};
}

if (typeof exports !== 'undefined') {
	exports.MemController = MemController;
}
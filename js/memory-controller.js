'use strict';

class MemController {
	/**
	 * @param {gbEmu} emulator
	 * @returns {MemController}
	 */
	constructor(emulator) {
		this.emulator = emulator;
		this.rom = new Uint8Array(0x8000); // Actually depends on game, might be more (0x8000 = 32kB)
		this.rom.fill(0xFF); // Default value of uninitialized memory, to avoid false positives when debugging
		this.rom_bank = [];
		this.rom_bank[0] = new Uint8Array(this.rom.buffer, 0x00, 0x4000);
		const n = 1; // TODO : create more banks if game is bigger (see MBC)
		this.rom_bank[n] = new Uint8Array(this.rom.buffer, 0x4000, 0x4000);

		this.memory = new Uint8Array(0x10000);
		this.vram = new Uint8Array(this.memory.buffer, 0x8000, 0x2000);
		this.wram = new Uint8Array(this.memory.buffer, 0xC000, 0x2000);
		this.oam = new Uint8Array(this.memory.buffer, 0xFE00, 0xA0); // 0xFE00 -> 0xFE9F
		this.io = new Uint8Array(this.memory.buffer, 0xFF00, 0x80);
		this.hram = new Uint8Array(this.memory.buffer, 0xFF80, 0x80); // or Zero-page RAM

		this.vram_tileMap0 = new Uint8Array(this.memory.buffer, 0x9800, 0x400);
		this.vram_tileMap1 = new Uint8Array(this.memory.buffer, 0x9C00, 0x400);

		this.tileMap = new Uint8Array(0x18000); //128*192*4 (rgba) - preprocessed tile data for faster rendering
	}

	/**
	 *
	 * @param {int} addr
	 * @returns {int}
	 */
	read8(addr) {
		if (addr < 0x100 && this.memory[0xFF50] === 1) { //0xFF50 : Boot rom disable flag
			return this.rom[addr] & 0xFF;
		} else if (0x100 <= addr && addr < 0x8000) {
			return this.rom[addr] & 0xFF;
		} else if (addr === 0xFF00) {
			return emulator.inputs.getKeyState(this.memory[0xFF00]);
		} else if (addr === 0xFF0F) {
			return this.memory[addr] | 0xE0;
		} else {
			return this.memory[addr] & 0xFF;
		}
	}

	readVram(addr) {
		return this.vram[addr];
	}

	/**
	 *
	 * @param {int} addr
	 * @param {int} data
	 * @returns {undefined}
	 */
	write(addr, data) {
		// TODO must check if write is allowed, or do memory bank switching
		if (addr < 0x8000) {
			//			console.log('Cannot write (' + data + ') in ROM at address 0x' + addr.toString(16));
			//			// TODO : handling of ROM/RAM banks
			//			this.memory[addr] = data;
		} else if (addr === 0xFF04) {
			// DIV register
			this.memory[addr] = 0;
			this.emulator.internalCounter = 0;
		} else if (addr === 0xFF0F) {
			this.memory[addr] = data & 0x1F;;
		} else {
			this.memory[addr] = data;
		}
	}

	read16(addr) {
		const lo = this.read8(addr);
		const hi = this.read8(addr + 1);
		return hi << 8 | lo;
	}

}

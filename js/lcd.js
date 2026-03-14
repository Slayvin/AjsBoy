'use strict';
/* global Palettes */

class Lcd {
	/**
	 * 
	 * @param {MemController} memory
	 * @returns {Lcd}
	 * @constructor 
	 */
	constructor(memory) {
		this.memory = memory;
		this.data_background = new Uint8ClampedArray(0x40000); // 256px * 256px * [r,g,b,a]
		this.data = new Uint8ClampedArray(0x16800); // 160px * 144px * [r,g,b,a]

		this.backgroundPalette = new Palette();
		this.spritePalette0 = new Palette();
		this.spritePalette1 = new Palette();
	}

	static colors = Palettes.default;

	reset() {
		this.fill([255, 255, 255], 255);
	}

	/**
	 *
	 * @param {Array<number>} color
	 * @param {number} opacity
	 */
	fill(color, opacity) {
		for (let i = 0; i < 0x40000; i++) {
			const mod4 = i & 0x00000003;
			if (mod4 < 1) {
				this.data[i] = color[0]; // R
			} else if (mod4 < 2) {
				this.data[i] = color[1]; // G
			} else if (mod4 < 3) {
				this.data[i] = color[2]; // B
			} else {
				this.data[i] = opacity;
			}
		}
	}

	updatePalette() {
		this.backgroundPalette.load(this.memory.read8(0xFF47));
		this.spritePalette0.load(this.memory.read8(0xFF48));
		this.spritePalette1.load(this.memory.read8(0xFF49));
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Array}
	 */
	//	getTile__(id) {
	//		var tileData = new Array(8);
	//		var addr = id * 16;
	//		for (var line = 0; line < 8; line++) {
	//			tileData[line] = new Array(8);
	//			var lo = this.mmu.readVram(addr + line * 2 + 0);
	//			var hi = this.mmu.readVram(addr + line * 2 + 1);
	//			for (var pixel = 0; pixel < 8; pixel++) {
	//				var colorId = this.getColorId(lo, hi, pixel);
	//				tileData[line][pixel] = colorId;
	//			}
	//		}
	//		return tileData;
	//
	//	}

	getColorId(lo_byte, hi_byte, pos) {
		const shift = 7 - pos;
		const lo = (lo_byte & (1 << shift)) >>> shift;
		const hi = (hi_byte & (1 << shift)) >>> shift;

		return lo + hi;
	}

}
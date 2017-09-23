'use strict';
/**
 * 
 * @param {MemController} Mmu
 * @returns {Lcd}
 */
function Lcd(Mmu) {
	this.mmu = Mmu;
	this.data_background = new Uint8ClampedArray(0x40000);// 256px * 256px * [r,g,b,a]
	this.data = new Uint8ClampedArray(0x16800);// 160px * 144px * [r,g,b,a]

	this.backgroundPalette = new Palette();
	this.spritePalette0 = new Palette();
	this.spritePalette1 = new Palette();

	this.reset = function () {
		this.fill([255, 255, 255], 0);
	};

	this.fill = function (color, opacity) {
		for (var i = 0; i < 0x40000; i++) {
			var mod4 = i & 0x00000003;
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
	};

	this.updatePalette = function () {
		this.backgroundPalette.load(this.mmu.read8(0xFF47));
		this.spritePalette0.load(this.mmu.read8(0xFF48));
		this.spritePalette1.load(this.mmu.read8(0xFF49));
	};

	this.getTile = function (id) {
		var tileData = new Array(8);
		var addr = id * 16;
		for (var line = 0; line < 8; line++) {
			tileData[line] = new Array(8);
			var lo = this.mmu.readVram(addr + line * 2 + 0);
			var hi = this.mmu.readVram(addr + line * 2 + 1);
			for (var pixel = 0; pixel < 8; pixel++) {
				var colorId = this.getColorId(lo, hi, pixel);
				tileData[line][pixel] = colorId;
			}
		}
		return tileData;

	};

	this.getColorId = function (lo_byte, hi_byte, pos) {
		var shift = 7 - pos;
		var lo = (lo_byte & (1 << shift)) >>> shift;
		var hi = (hi_byte & (1 << shift)) >>> shift;
		return lo + hi + hi;
	};

}

Lcd.colors = [0xFF, 0xAA, 0x55, 0x00];
Lcd.colorsRgba = [
	[0xFF, 0xFF, 0xFF, 0xFF],
	[0xAA, 0xAA, 0xAA, 0xFF],
	[0x55, 0x55, 0x55, 0xFF],
	[0x00, 0x00, 0x00, 0xFF]
];
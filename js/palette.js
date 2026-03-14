/* global Lcd */
'use strict';

/**
 * 
 * @returns {Palette}
 */
class Palette {
	constructor() {
		this.colorsIndex = [0, 1, 2, 3];
	}

	load(data) {
		for (let i = 0; i < 4; i++) {
			const shift = 2 * i;
			const colorId = (data & (3 << shift)) >> shift;
			this.colorsIndex[i] = colorId;
		}
	}

	getColorRgba(id) {
		return Lcd.colors[this.colorsIndex[id]];
	}

	getImageData() {
		return new Uint8ClampedArray([
			...this.getColorRgba(0),
			...this.getColorRgba(1),
			...this.getColorRgba(2),
			...this.getColorRgba(3)
		]);
	}

}
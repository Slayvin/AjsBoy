/* global Lcd */
'use strict';

/**
 * 
 * @returns {Palette}
 */
function Palette() {
	this.colorsIndex = [0, 1, 2, 3];

	this.load = function (data) {
		for (var i = 0; i < 4; i++) {
			var shift = 2 * i;
			var colorId = (data & (3 << shift)) >> shift;
			this.colorsIndex[i] = colorId;
		}
	};

	this.getColorRgba = function (id) {
		return Lcd.colors[this.colorsIndex[id]];
	};

	this.getImageData = function () {
		return new Uint8ClampedArray([
			...this.getColorRgba(0),
			...this.getColorRgba(1),
			...this.getColorRgba(2),
			...this.getColorRgba(3)
		]);
	};

}
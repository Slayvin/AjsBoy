/* global Lcd */
'use strict';

/**
 * 
 * @returns {Palette}
 */
function Palette() {
	this.colors = [0x00, 0x00, 0x00, 0x00];
//	this.colorsRgba = new Uint8ClampedArray([
//		[0xFF, 0xFF, 0xFF, 0xFF],
//		[0xCC, 0xCC, 0xCC, 0xFF],
//		[0x88, 0x88, 0x88, 0xFF],
//		[0x00, 0x00, 0x00, 0xFF]
//	]);

	this.load = function (data) {
		for (var i = 0; i < 4; i++) {
			var shift = 2 * i;
			var colorId = (data & (3 << shift)) >> shift;
			this.colors[i] = Lcd.colors[colorId];
		}
	};

	this.getColor = function (id) {
		return this.colors[id];
	};

	this.getColorRgba = function (id) {
		var col = this.getColor(id);
		return [col, col, col, 0xFF];
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
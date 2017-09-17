'use strict';
/**
 * 
 * @returns {Lcd}
 */
function Lcd() {
	this.background = new Uint8ClampedArray(0x40000);// 256px * 256px * [r,g,b,a]
	this.buffer = new Uint8ClampedArray(0x40000);// 256px * 256px * [r,g,b,a]

	this.reset = function () {
		this.fill([255,255,255],0);
	};

	this.fill = function (color, opacity) {
		for (var i = 0; i < 0x40000; i++) {
			var mod4 = i & 0x00000003;
			if (mod4 < 1) {
				this.buffer[i] = color[0]; // R
			} else if (mod4 < 2) {
				this.buffer[i] = color[1]; // G
			} else if (mod4 < 3) {
				this.buffer[i] = color[2]; // B
			} else {
				this.buffer[i] = opacity;
			}
		}
	};

}
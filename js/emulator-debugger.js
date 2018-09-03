/* global gbEmu */
/* global Lcd */
'use strict';

/**
 * 
 * @param {gbEmu} emulator
 * @returns {gbEmu.debugger}
 */
gbEmu.debugger = function (emulator) {
	this.fps = document.getElementById('fps');
	this.previousTime = 0;

	this.cpu = emulator.cpu;
	this.mmu = emulator.mmu;
	this.lcd = emulator.lcd;

	this.pc = document.querySelector('#pc');
	this.code = document.querySelector('#code');
	this.sp = document.querySelector('#sp');
	this.stack = document.querySelectorAll('#stack .cell');
	const cpuRegisters = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'L'];
	cpuRegisters.forEach((r) => {
		this['reg' + r] = document.querySelector('#reg-' + r);
	});
	const flags = ['Z', 'N', 'H', 'C'];
	flags.forEach((f) => {
		this['flag' + f] = document.querySelector('#flag-' + f);
	});
	this.ly = document.querySelector('#lcd-ly');
	this.lcdc = document.querySelector('#lcd-c');
	const ioRegisters = ['FF00', 'FF01', 'FF02', 'FF04', 'FF05', 'FF06', 'FF07', 'FF0F',
		'FF40', 'FF41', 'FF42', 'FF43'];
	ioRegisters.forEach((ioAddress) => {
		this[ioAddress] = document.getElementById('io-' + ioAddress);
	});
	this.bgMap = document.querySelector('#lcd-background canvas').getContext("2d");
	this.tileMap = document.querySelector('#tile-map canvas').getContext("2d");
	this.bgPalette = document.querySelector('#palette-bg canvas').getContext("2d");
	this.objPalette0 = document.querySelector('#palette-0 canvas').getContext("2d");
	this.objPalette1 = document.querySelector('#palette-1 canvas').getContext("2d");
	this.memoryMap = document.querySelector('#memory canvas').getContext("2d");
	this.lcdBuffer = document.querySelector('#lcd canvas').getContext("2d");

	//Off-screen canvas
	this.tmpCanvas = document.createElement('canvas');
	this.tmpCanvas.width = 256;
	this.tmpCanvas.height = 256;
	this.background = this.tmpCanvas.getContext('2d');
	this.background.lineWidth = 1;
	this.background.strokeStyle = '#55aaff';
};

gbEmu.debugger.prototype.update = function (timestamp) {
	var fps = 1000 / (timestamp - this.previousTime);
	this.fps.innerHTML = fps.toFixed(2);
	this.previousTime = timestamp;
	if (false) {
		this.pc.innerHTML = this.cpu.PC.toString(16);
		this.sp.innerHTML = this.cpu.SP.toString(16);
		for (var s = 0; s < 16; s++) {
			this.stack[s].innerHTML = this.mmu.read16(0xfffe - s * 2).toString(16).toUpperCase();
			// Note: the stack doesn't necessarily starts at 0xFFFE ! A program could set the initial pointer to another address.
			// This means the value displayed from 0xFFFE and below doesn't always represent the stack!
			// TODO : read stack values whenever PUSH or POP functions are triggered, or set correct address when LD SP function is triggered
		}
		this.code.innerHTML = this.cpu.code;
		const cpuRegisters = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'L'];
		cpuRegisters.forEach((r) => {
			this['reg' + r].innerHTML = this.cpu[r].toString(16).toUpperCase();
		});
	}
	if (false) {
		this.flagZ.innerHTML = this.cpu.flags.Z.toString(2);
		this.flagN.innerHTML = this.cpu.flags.N.toString(2);
		this.flagH.innerHTML = this.cpu.flags.H.toString(2);
		this.flagC.innerHTML = this.cpu.flags.C.toString(2);
		this.ly.innerHTML = this.mmu.read8(0xff44);
		this.lcdc.innerHTML = this.mmu.read8(0xff40).toString(16);

		const ioRegisters = {FF00: 0xff00, FF01: 0xff01, FF02: 0xff02, FF04: 0xff04, FF05: 0xff05, FF06: 0xff06, FF07: 0xff07, FF0F: 0xff0f,
			FF40: 0xff40, FF41: 0xff41, FF42: 0xff42, FF43: 0xff43};
		Object.keys(ioRegisters).forEach((ioAddress) => {
			this[ioAddress].innerHTML = this.mmu.read8(ioRegisters[ioAddress]).toString(16).toUpperCase();
		});
	}
	if (false) {
		var iData = new ImageData(new Uint8ClampedArray(this.mmu.memory.buffer), 64, 256);
		this.memoryMap.putImageData(iData, 0, 0);
	}
	if (false) {
		var iData = new ImageData(this.lcd.data, 160, 144);
		this.lcdBuffer.putImageData(iData, 0, 0);
	}

//	var iData = new ImageData(new Uint8ClampedArray(this.mmu.tileMap), 128, 192);
	if (false) {
		for (var tile = 0; tile < 384; tile++) {
			var tileData = this.getTileData(tile);
			this.tileMap.putImageData(tileData, 8 * (tile % 16), 8 * Math.floor(tile / 16));
		}
	}
	if (!false) {// Update background
		for (var addr = 0; addr < (32 * 32); addr++) {
			var tile = this.mmu.vram.tileMap0[addr];
//			if(tile<128){tile+=256;}// depends on LCDC ?
			var tileData = this.getTileData(tile);
			var ctx = this.background;
			ctx.putImageData(tileData, 8 * (addr % 32), 8 * Math.floor(addr / 32));
		}
		var scrollY = this.mmu.read8(0xFF42);
		var scrollX = this.mmu.read8(0xFF43);
		// Test
		this.lcdBuffer.drawImage(this.tmpCanvas, scrollX, scrollY, 160, 144, 0, 0, 160, 144);
		if (!false) {
			ctx.beginPath();
			if (scrollX > (256 - 160)) {
				ctx.rect(scrollX - 256, scrollY, 160, 144);
			}
			if (scrollY > (256 - 144)) {
				ctx.rect(scrollX, scrollY - 256, 160, 144);
			}
			if (scrollX > (256 - 160) && scrollY > (256 - 144)) {
				ctx.rect(scrollX - 256, scrollY - 256, 160, 144);
			}
			ctx.rect(scrollX, scrollY, 160, 144);
			ctx.stroke();
			ctx.closePath();
		}
		if (!false) {
			this.bgMap.drawImage(this.tmpCanvas, 0, 0);
		}
	}

	// Palettes
	if (false) {
		var iData = new ImageData(new Uint8ClampedArray(this.lcd.backgroundPalette.getImageData()), 4, 1);
		this.bgPalette.putImageData(iData, 0, 0);
		var iData = new ImageData(new Uint8ClampedArray(this.lcd.spritePalette0.getImageData()), 4, 1);
		this.objPalette0.putImageData(iData, 0, 0);
		var iData = new ImageData(new Uint8ClampedArray(this.lcd.spritePalette1.getImageData()), 4, 1);
		this.objPalette1.putImageData(iData, 0, 0);
	}
};

gbEmu.debugger.prototype.updateTileMap = function () {
	for (var addr = 0; addr < (6144); addr++) {// 64px * 96px
		var lo = this.mmu.readVram(addr * 2);
		var hi = this.mmu.readVram(addr * 2 + 1);
		for (var i = 0; i < 8; i++) {
			var colorId = this.lcd.getColorId(lo, hi, i);
			var color = this.lcd.backgroundPalette.getColorRgba(colorId);
			var address = (4 * i) + (32 * addr);
			this.mmu.tileMap[address + 0] = color[0];
			this.mmu.tileMap[address + 1] = color[1];
			this.mmu.tileMap[address + 2] = color[2];
			this.mmu.tileMap[address + 3] = 0xFF;
		}
	}
};

/**
 * 
 * @param {type} id
 * @returns {ImageData}
 */
gbEmu.debugger.prototype.getTileData = function (id) {
	var lcdc = this.mmu.read8(0xff40);
	var tile = id;
	if ((0x10 & lcdc) === 0) {
		if (tile < 128) {
			tile += 256;
		}

	}
	var tileArray = new Uint8ClampedArray(this.mmu.tileMap.buffer, tile * 256, 256);
	var tileData = new ImageData(tileArray, 8, 8);
	return tileData;
};

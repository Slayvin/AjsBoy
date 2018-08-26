/* global gbEmu */
/* global Lcd */
'use strict';

/**
 * 
 * @param {gbEmu} Emulator
 * @returns {gbEmu.debugger}
 */
gbEmu.debugger = function (Emulator) {
	this.cpu = Emulator.cpu;
	this.mmu = Emulator.mmu;
	this.lcd = Emulator.lcd;

	this.pc = document.querySelector('#pc');
	this.code = document.querySelector('#code');
	this.sp = document.querySelector('#sp');
	this.stack = document.querySelectorAll('#stack .cell');
	this.regA = document.querySelector('#reg-A');
	this.regB = document.querySelector('#reg-B');
	this.regC = document.querySelector('#reg-C');
	this.regD = document.querySelector('#reg-D');
	this.regE = document.querySelector('#reg-E');
	this.regF = document.querySelector('#reg-F');
	this.regH = document.querySelector('#reg-H');
	this.regL = document.querySelector('#reg-L');
	this.flagZ = document.querySelector('#flag-Z');
	this.flagN = document.querySelector('#flag-N');
	this.flagH = document.querySelector('#flag-H');
	this.flagC = document.querySelector('#flag-C');
	this.ly = document.querySelector('#lcd-ly');
	this.lcdc = document.querySelector('#lcd-c');
	this.bgMap = document.querySelector('#lcd-background canvas').getContext("2d");
	this.tileMap = document.querySelector('#tile-map canvas').getContext("2d");
	this.bgPalette = document.querySelector('#palette-bg canvas').getContext("2d");
	this.objPalette0 = document.querySelector('#palette-0 canvas').getContext("2d");
	this.objPalette1 = document.querySelector('#palette-1 canvas').getContext("2d");
	this.memoryMap = document.querySelector('#memory canvas').getContext("2d");
	this.lcdBuffer = document.querySelector('#lcd canvas').getContext("2d");
};

gbEmu.debugger.prototype.update = function () {
	this.pc.innerHTML = this.cpu.PC.toString(16);
	this.sp.innerHTML = this.cpu.SP.toString(16);
	this.stack[0].innerHTML = this.mmu.read16(0xfffe).toString(16);
	this.stack[1].innerHTML = this.mmu.read16(0xfffc).toString(16);
	this.code.innerHTML = this.cpu.code;
	this.regA.innerHTML = this.cpu.A.toString(16);
	this.regB.innerHTML = this.cpu.B.toString(16);
	this.regC.innerHTML = this.cpu.C.toString(16);
	this.regD.innerHTML = this.cpu.D.toString(16);
	this.regE.innerHTML = this.cpu.E.toString(16);
	this.regF.innerHTML = this.cpu.F.toString(16);
	this.regH.innerHTML = this.cpu.H.toString(16);
	this.regL.innerHTML = this.cpu.L.toString(16);
	this.flagZ.innerHTML = this.cpu.flags.Z.toString(2);
	this.flagN.innerHTML = this.cpu.flags.N.toString(2);
	this.flagH.innerHTML = this.cpu.flags.H.toString(2);
	this.flagC.innerHTML = this.cpu.flags.C.toString(2);
	this.ly.innerHTML = this.mmu.read8(0xff44);
	this.lcdc.innerHTML = this.mmu.read8(0xff40).toString(16);

	var iData = new ImageData(new Uint8ClampedArray(this.mmu.memory.buffer), 64, 256);
	this.memoryMap.putImageData(iData, 0, 0);

	var iData = new ImageData(this.lcd.data, 160, 144);
	this.lcdBuffer.putImageData(iData, 0, 0);

//	var iData = new ImageData(new Uint8ClampedArray(this.mmu.tileMap), 128, 192);
	for (var tile = 0; tile < 384; tile++) {
		var tileData = this.getTileData(tile);
		this.tileMap.putImageData(tileData, 8 * (tile % 16), 8 * Math.floor(tile / 16));
	}

	for (var addr = 0; addr < (32 * 32); addr++) {
		var tile = this.mmu.vram.tileMap0[addr];
//		if(tile<128){tile+=256;}// depends on LCDC ?
		var tileData = this.getTileData(tile);
		this.bgMap.putImageData(tileData, 8 * (addr % 32), 8 * Math.floor(addr / 32));

	}

	// Palettes
	var iData = new ImageData(new Uint8ClampedArray(this.lcd.backgroundPalette.getImageData()), 4, 1);
	this.bgPalette.putImageData(iData, 0, 0);
	var iData = new ImageData(new Uint8ClampedArray(this.lcd.spritePalette0.getImageData()), 4, 1);
	this.objPalette0.putImageData(iData, 0, 0);
	var iData = new ImageData(new Uint8ClampedArray(this.lcd.spritePalette1.getImageData()), 4, 1);
	this.objPalette1.putImageData(iData, 0, 0);
};

gbEmu.debugger.prototype.updateTileMap = function () {
	for (var addr = 0; addr < (64 * 96); addr++) {
		var lo = this.mmu.readVram(addr + addr);
		var hi = this.mmu.readVram(addr + addr + 1);
		for (var i = 0; i < 8; i++) {
			var colorId = this.lcd.getColorId(lo, hi, i);
			this.mmu.tileMap[4 * i + 0 + 32 * addr] = this.lcd.backgroundPalette.getColor(colorId);
			this.mmu.tileMap[4 * i + 1 + 32 * addr] = this.lcd.backgroundPalette.getColor(colorId);
			this.mmu.tileMap[4 * i + 2 + 32 * addr] = this.lcd.backgroundPalette.getColor(colorId);
			this.mmu.tileMap[4 * i + 3 + 32 * addr] = 0xFF;
		}
	}
};
/*
 gbEmu.debugger.prototype.updateBackground__ = function () {
 for (var addr = 0; addr < (32 * 32); addr++) {
 var tile = this.mmu.vram.tileMap0(addr);
 var tileData = this.getTileData(tile);
 this.bgMap.putImageData(tileData, 8 * (addr % 32), 8 * Math.floor(addr / 32));
 
 }
 };*/

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

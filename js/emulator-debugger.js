/* global Lcd */
'use strict';

gbEmu.debugger = class {
	/**
	 * 
	 * @param {gbEmu} emulator
	 * @returns {gbEmu.debugger}
	 */
	constructor(emulator) {
		this.states = {
			'debug-cpu': true,
			'debug-cpu-registers': true,
			'debug-cpu-flags': true,
			'debug-call-stack': true,
			'debug-io-registers': true,
			'debug-lcd-status': true,
			'debug-bg-palette': true,
			'debug-sprite0-palette': true,
			'debug-sprite1-palette': true,
			'debug-vram-map': true,
			'debug-bg-map': true
		};

		this.previousTime = 0;
		this.minFps = 1000;
		this.maxFps = 0;

		this.cpu = emulator.cpu;
		this.mmu = emulator.mmu;
		this.lcd = emulator.lcd;

		this.debuggerUi = {
			fps: document.getElementById('fps'),
			pc: document.querySelector('#pc'),
			sp: document.querySelector('#sp'),
			code: document.querySelector('#code'),
			stack: document.querySelectorAll('#stack .cell'),
			ly: document.querySelector('#lcd-ly'),
			lcdc: document.querySelector('#lcd-c')
		};

		const cpuRegisters = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'L'];
		this.getCpuRegisters = () => cpuRegisters;


		cpuRegisters.forEach((r) => {
			this.debuggerUi['reg' + r] = document.querySelector('#reg-' + r);
		});
		const flags = ['Z', 'N', 'H', 'C'];
		flags.forEach((f) => {
			this.debuggerUi['flag' + f] = document.querySelector('#flag-' + f);
		});

		const ioRegisters = ['FF00', 'FF01', 'FF02', 'FF04', 'FF05', 'FF06', 'FF07', 'FF0F',
			'FF40', 'FF41', 'FF42', 'FF43', 'FFFF'];
		ioRegisters.forEach((ioAddress) => {
			this.debuggerUi[ioAddress] = document.getElementById('io-' + ioAddress);
		});

		this.bgMap = document.querySelector('#lcd-background canvas').getContext("2d");
		this.tileMap = document.querySelector('#tile-map canvas').getContext("2d");
		this.bgPalette = document.querySelector('#palette-bg canvas').getContext("2d");
		this.objPalette0 = document.querySelector('#palette-0 canvas').getContext("2d");
		this.objPalette1 = document.querySelector('#palette-1 canvas').getContext("2d");
		this.lcdBuffer = document.querySelector('#lcd canvas').getContext("2d");

		//Off-screen canvas
		this.tmpCanvas = document.createElement('canvas');
		this.tmpCanvas.width = 256;
		this.tmpCanvas.height = 256;
		this.background = this.tmpCanvas.getContext('2d');
		this.background.lineWidth = 1;
		this.background.strokeStyle = '#55aaff';
	}

	/**
	 *
	 * @param {number} timestamp
	 */
	updateFPS(timestamp) {
		const fps = 1000 / (timestamp - this.previousTime);
		//	if (fps < this.minFps && timestamp>1000) {
		//		this.minFps = fps;
		//	}
		//	if (fps > this.maxFps) {
		//		this.maxFps = fps;
		//	}
		this.debuggerUi.fps.innerHTML = fps.toFixed(2); // + ' (min:' + this.minFps.toFixed(2) + ' - max:' + this.maxFps.toFixed(2) + ')';
		this.previousTime = timestamp;
	}

	update() {

		if (this.states['debug-cpu']) {
			this.debuggerUi.pc.innerHTML = this.cpu.PC.toString(16);
			this.debuggerUi.sp.innerHTML = this.cpu.SP.toString(16);
			this.debuggerUi.code.innerHTML = this.mmu.memory[this.cpu.PC].toString(16);
		}

		if (this.states['debug-call-stack']) {
			for (let s = 0; s < 16; s++) {
				this.debuggerUi.stack[s].innerHTML = this.mmu.read16(0xfffe - s * 2).toString(16).toUpperCase();
				// Note: the stack doesn't necessarily starts at 0xFFFE ! A program could set the initial pointer to another address.
				// This means the value displayed from 0xFFFE and below doesn't always represent the stack!
				// TODO : read stack values whenever PUSH or POP functions are triggered, or set correct address when LD SP function is triggered
			}
		}

		if (this.states['debug-cpu-registers']) {
			this.getCpuRegisters().forEach((r) => {
				this.debuggerUi['reg' + r].innerHTML = this.cpu[r].toString(16).toUpperCase();
			});
		}

		if (this.states['debug-cpu-flags']) {
			this.debuggerUi.flagZ.innerHTML = this.cpu.flags.Z.toString(2);
			this.debuggerUi.flagN.innerHTML = this.cpu.flags.N.toString(2);
			this.debuggerUi.flagH.innerHTML = this.cpu.flags.H.toString(2);
			this.debuggerUi.flagC.innerHTML = this.cpu.flags.C.toString(2);
		}

		if (this.states['debug-lcd-status']) {
			this.debuggerUi.ly.innerHTML = this.mmu.read8(0xff44);
			this.debuggerUi.lcdc.innerHTML = this.mmu.read8(0xff40).toString(16);
		}

		if (this.states['debug-io-registers']) {
			const ioRegisters = {
				FF00: 0xff00, FF01: 0xff01, FF02: 0xff02, FF04: 0xff04, FF05: 0xff05, FF06: 0xff06, FF07: 0xff07, FF0F: 0xff0f,
				FF40: 0xff40, FF41: 0xff41, FF42: 0xff42, FF43: 0xff43, FFFF: 0xffff
			};
			Object.keys(ioRegisters).forEach((ioAddress) => {
				this.debuggerUi[ioAddress].innerHTML = this.mmu.read8(ioRegisters[ioAddress]).toString(16).toUpperCase();
			});
		}

		if (this.states['debug-vram-map']) {
			for (let tile = 0; tile < 384; tile++) {
				const tileData = this.getTileData(tile);
				this.tileMap.putImageData(tileData, 8 * (tile % 16), 8 * Math.floor(tile / 16));
			}
		}

		// Update background
		if (this.states['debug-bg-map']) {
			const ctx = this.background;

			const scrollY = this.mmu.read8(0xFF42);
			const scrollX = this.mmu.read8(0xFF43);

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

			this.bgMap.drawImage(this.tmpCanvas, 0, 0);
		}


		// Palettes
		if (this.states['debug-bg-palette']) {
			const iData = new ImageData(new Uint8ClampedArray(this.lcd.backgroundPalette.getImageData()), 4, 1);
			this.bgPalette.putImageData(iData, 0, 0);
		}
		if (this.states['debug-sprite0-palette']) {
			const iData = new ImageData(new Uint8ClampedArray(this.lcd.spritePalette0.getImageData()), 4, 1);
			this.objPalette0.putImageData(iData, 0, 0);
		}
		if (this.states['debug-sprite1-palette']) {
			const iData = new ImageData(new Uint8ClampedArray(this.lcd.spritePalette1.getImageData()), 4, 1);
			this.objPalette1.putImageData(iData, 0, 0);
		}
	}

	updateLcd() {
		for (let addr = 0; addr < (32 * 32); addr++) {
			const tile = this.mmu.vram_tileMap0[addr];
			const tileData = this.getTileData(tile);
			this.background.putImageData(tileData, 8 * (addr % 32), 8 * Math.floor(addr / 32));
		}

		const scrollY = this.mmu.read8(0xFF42);
		const scrollX = this.mmu.read8(0xFF43);

		this.lcdBuffer.drawImage(this.tmpCanvas, scrollX, scrollY, 160, 144, 0, 0, 160, 144);
	}

	updateTileMap() {
		for (let addr = 0; addr < (6144); addr++) { // 64px * 96px
			const lo = this.mmu.readVram(addr * 2);
			const hi = this.mmu.readVram(addr * 2 + 1);
			for (let i = 0; i < 8; i++) {
				const colorId = this.lcd.getColorId(lo, hi, i);
				const color = this.lcd.backgroundPalette.getColorRgba(colorId);
				const address = (4 * i) + (32 * addr);
				this.mmu.tileMap[address + 0] = color[0];
				this.mmu.tileMap[address + 1] = color[1];
				this.mmu.tileMap[address + 2] = color[2];
				this.mmu.tileMap[address + 3] = 0xFF;
			}
		}
	}

	/**
	 *
	 * @param {number} id
	 * @returns {ImageData}
	 */
	getTileData(id) {
		const lcdc = this.mmu.read8(0xff40);
		let tile = id;

		// Reads tile data from 0x8000 or 0x8800 depending on bit 4 of LCDC register
		if ((0x10 & lcdc) === 0) {
			if (tile < 128) {
				tile += 256;
			}
		}
		const tileArray = new Uint8ClampedArray(this.mmu.tileMap.buffer, tile * 256, 256);
		const tileData = new ImageData(tileArray, 8, 8);

		return tileData;
	}
}

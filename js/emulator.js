'use strict';

function gbEmu() {
	this.name = 'JsBoy';
	this.programLoaded = false;
	this.paused = false;
	this.realBoot = !true;
	this.debug = !false;

	this.mmu = new MemController();
	this.cpu = new Cpu(this.mmu);
	this.lcd = new Lcd(this.mmu);
	this.debugger = new gbEmu.debugger(this.cpu, this.mmu, this.lcd);
}

gbEmu.cyclesPerFrame = 16384 / 1;

/**
 * Load program into rom
 * 
 * @param {string} name
 * @param {boolean} asCartridge
 * @returns {Promise}
 */
gbEmu.prototype.loadProgram = function (name, asCartridge) {
	var isCartridge = typeof asCartridge !== 'undefined' ? asCartridge : true;
	return new Promise(function (resolve, reject) {
		// Load program.
		var xhr = new XMLHttpRequest;

		xhr.open("GET", "./roms/" + name, true);
		xhr.responseType = "arraybuffer";

		xhr.onload = function () {
			var rom = new Uint8Array(xhr.response);
			if (isCartridge) {
				this.mmu.rom = rom;
			} else {
				for (var i = 0; i < rom.length; i++) {
					this.mmu.memory[i] = rom[i];
				}
			}

			if (xhr.readyState === 4) {
				if (isCartridge) {
					var titleData = new Uint8Array(rom.buffer, 0x134, 0xF);
					var title = String.fromCharCode(...titleData);
					console.log("Program loaded: ", title);
				}
				this.programLoaded = true;
				resolve(xhr.response);
			} else {
				reject({
					status: this.status
				});
			}
		}.bind(this);

		xhr.send();
	}.bind(this));

};

gbEmu.prototype.loadBootstrap = function (name) {
	return this.loadProgram(name, false);

};

gbEmu.prototype.setDefaults = function () {
	this.cpu.AF = 0x01B0;
	this.cpu.BC = 0x0013;
	this.cpu.DE = 0x00D8;
	this.cpu.HL = 0x014D;
	this.cpu.SP = 0xFFFE;
};

gbEmu.prototype.init = function () {
	// reset Program counter
	if (this.realBoot) {
		this.cpu.PC = 0x0000;
		this.loadBootstrap('DMG_ROM.bin').then(function () {
			this.run();
		}.bind(this));
	} else {
		this.setDefaults();
		this.cpu.PC = 0x0100;
		this.run();
	}
};

gbEmu.prototype.run = function () {
	var i = 0;
	var breakpoints = [
//		0x0101,
	];
	while (i < gbEmu.cyclesPerFrame) {
		if (!this.paused) {
			this.step();
		}
		i++;
		if (breakpoints.indexOf(this.cpu.PC) > -1) {
			this.paused = true;
//			i = gbEmu.cyclesPerFrame;
		}
		// TEST vblank
		if ((i % 192) === 0) {// TODO: get actual value from instructions
			var line = this.mmu.read8(0xff44) & 0xFF;
			this.mmu.write(0xff44, ++line);
		}
	}

	if (this.debug) {
		this.debugger.update();
	}
	this.lcd.updatePalette();
	this.debugger.updateTileMap();
	if (!this.paused) {
		window.requestAnimationFrame(this.run.bind(this));
	}

};
gbEmu.prototype.step = function () {
	var addr = this.cpu.PC;
	var opcode = this.mmu.read8(addr);
	this.cpu.execute(opcode);
	this.cpu.PC &= 0xFFFF;
	if (this.paused) {
		this.debugger.update();
		this.lcd.updatePalette();
		this.debugger.updateTileMap();
	}
};
gbEmu.prototype.pause = function () {
	this.paused = !this.paused;
	if (this.paused) {
		window.console.log('emulation paused');
	} else {
		this.run();
	}
};


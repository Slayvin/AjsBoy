'use strict';

function gbEmu() {
	this.name = 'JsBoy';
	this.programLoaded = false;
	this.paused = !false;
	this.memory = new MemController();
	this.cpu = new Cpu(this.memory);
	this.lcd = new Lcd();
	this.debugger = new gbEmu.debugger(this.cpu, this.memory, this.lcd);
}

gbEmu.cyclesPerFrame = 4096;

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
			let rom = new Uint8Array(xhr.response);

			for (let i = 0; i < rom.length; i++) {
				this.memory.write(i, rom[i]);
			}
			if (xhr.readyState === 4) {
				if (isCartridge) {
					let titleData = new Uint8Array(rom.buffer, 0x134, 0xF);
					let title = String.fromCharCode(...titleData);
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

gbEmu.prototype.init = function () {
	// reset Program counter
	this.cpu.PC = 0x0000;
	this.loadBootstrap('DMG_ROM.bin').then(function () {
		this.run();
	}.bind(this));
};

gbEmu.prototype.run = function () {
	let i = 0;

	while (i < gbEmu.cyclesPerFrame) {
		this.step();
		i++;
		if (this.cpu.PC === 0x0040) {
			this.pause();
			i = gbEmu.cyclesPerFrame;
		}
	}
	// TEST vblank
	var line = this.memory.read8(0xff44);
	this.memory.write(0xff44, ++line);
	
	this.debugger.update();
	if (!this.paused) {
		window.requestAnimationFrame(this.run.bind(this));
	}

};

gbEmu.prototype.step = function () {
	let addr = this.cpu.PC;
	let opcode = this.memory.read8(addr);
	this.cpu.execute(opcode);
	if (this.paused) {
		this.debugger.update();
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


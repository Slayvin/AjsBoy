'use strict';

function gbEmu() {
	this.name = 'JsBoy';
	this.programLoaded = false;
	this.paused = false;
	this.realBoot = true;
	this.debug = !false;

	this.mmu = new MemController(this);
	this.imu = new InterruptsController(this);
	this.cpu = new Cpu(this);
	this.lcd = new Lcd(this);
	this.inputs = new InputController(this);
	this.debugger = new gbEmu.debugger(this);
}

gbEmu.cyclesPerFrame = 16384 / 2;

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

gbEmu.prototype.setProgramStartState = function () {
	this.cpu.AF = 0x01B0;
	this.cpu.BC = 0x0013;
	this.cpu.DE = 0x00D8;
	this.cpu.HL = 0x014D;
	this.cpu.SP = 0xFFFE;
	this.cpu.PC = 0x0100;

	this.mmu.memory[0xFF05] = 0x00; // TIMA
	this.mmu.memory[0xFF06] = 0x00; // TMA
	this.mmu.memory[0xFF07] = 0x00; // TAC
	this.mmu.memory[0xFF10] = 0x80;
	this.mmu.memory[0xFF11] = 0xBF;
	this.mmu.memory[0xFF12] = 0xF3;
	this.mmu.memory[0xFF14] = 0xBF;
	this.mmu.memory[0xFF16] = 0x3F;
	this.mmu.memory[0xFF17] = 0x00;
	this.mmu.memory[0xFF19] = 0xBF;
	this.mmu.memory[0xFF1A] = 0x7F;
	this.mmu.memory[0xFF1B] = 0xFF;
	this.mmu.memory[0xFF1C] = 0x9F;
	this.mmu.memory[0xFF1E] = 0xBF;
	this.mmu.memory[0xFF20] = 0xFF;
	this.mmu.memory[0xFF21] = 0x00;
	this.mmu.memory[0xFF22] = 0x00;
	this.mmu.memory[0xFF23] = 0xBF;
	this.mmu.memory[0xFF24] = 0x77;
	this.mmu.memory[0xFF25] = 0xF3;
	this.mmu.memory[0xFF26] = 0xF1;
	this.mmu.memory[0xFF40] = 0x91; // LCDC
	this.mmu.memory[0xFF42] = 0x00; // SCY
	this.mmu.memory[0xFF43] = 0x00; // SCX
	this.mmu.memory[0xFF45] = 0x00; // LYC
	this.mmu.memory[0xFF47] = 0xFC; // BGP (Background palette)
	this.mmu.memory[0xFF48] = 0xFF; // OBP0 (Obj palette 0)
	this.mmu.memory[0xFF49] = 0xFF; // OBP1 (Obj palette 1)
	this.mmu.memory[0xFF4A] = 0x00; // WY
	this.mmu.memory[0xFF4B] = 0x00; // WX
	this.mmu.memory[0xFFFF] = 0x00; // IE	

	this.mmu.memory[0xFF50] = 1; // Boot rom disable flag

	return this;
};

gbEmu.prototype.init = function () {
	// reset Program counter
	if (this.realBoot) {
		this.cpu.PC = 0x0000;
		this.loadBootstrap('DMG_ROM.bin').then(function () {
			this.run();
		}.bind(this));
	} else {
		this.setProgramStartState().run();
	}
};

gbEmu.prototype.run = function (timestamp) {
	var i = 0;
	var breakpoints = [];
	var breakpoints_ = [
		0x0000,
		0x0100,
		0xC00C,
	];
	window.requestAnimationFrame(this.run.bind(this));
	while (i < gbEmu.cyclesPerFrame) {
		if (!this.paused) {
			this.step();
		}
		i++;
		if (this.debug && (breakpoints.indexOf(this.cpu.PC) > -1)) {
			this.paused = true;
//			i = gbEmu.cyclesPerFrame;
		}
		if ((i % 4) === 0) {// TODO: get actual value from CPU instructions (count cpu cycles)
			var line = this.mmu.read8(0xff44) & 0xFF;
			this.mmu.write(0xff44, ++line);
		}
		// Check for interrupts:
		if (this.imu.IME) {
			this.imu.processInterrupts();
		}
	}

	this.lcd.updatePalette();
	this.debugger.updateTileMap();
	
	if (this.debug) {
		this.debugger.update(timestamp);
	}
	if (!this.paused) {
		this.imu.IF = 1;
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

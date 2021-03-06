'use strict';

/* global Utils */

var gbEmu = function () {
	this.name = 'AjsBoy';
	this.programLoaded = false;
	this.paused = false;
	this.realBoot = !true;
	this.debug = true;

	this.mmu = new MemController(this);
	this.imu = new InterruptsController(this);
	this.cpu = new Cpu(this);
	this.lcd = new Lcd(this);
	this.inputs = new InputController(this);
	this.debugger = new gbEmu.debugger(this);

	this.divCounter = 0;
	this.timerCounter = 0;
};

// Emulator const
gbEmu.DIV = 0xFF04;
gbEmu.TIMA = 0xFF05;
gbEmu.TMA = 0xFF06;
gbEmu.TAC = 0xFF07;

/**
 * Machine clocks per frame :
 * 
 *        ← 20 mc → ←     43+ mc     → ← 51 (max) mc →
 *  ↑    |          |                   |                |
 *  144  |   OAM    |      Pixel        |    H-Blank     |
 * lines |  Search  |     Transfer      |                |
 *  ↓    |          |                   |                |
 *       -------------------------------------------------
 *  ↑    |                                               |
 *  10   |                   V-Blank                     |
 * lines |                                               |
 *  ↓    -------------------------------------------------
 */
gbEmu.cyclesPerFrame = 17556; // (144 + 10) lines * (20 + 43 + 51) machines clocks


/**
 * Load program into rom
 * 
 * @param {string} name
 * @param {boolean} isCartridge
 * @returns {Promise}
 */
gbEmu.prototype.loadProgram = function (name, isCartridge = true) {
	return new Promise((resolve, reject) => {
		// Load program.
		var xhr = new XMLHttpRequest;

		xhr.open("GET", "./roms/" + name, true);
		xhr.responseType = "arraybuffer";

		xhr.onload = () => {
			var rom = new Uint8Array(xhr.response);
			if (isCartridge) {
				this.mmu.rom = rom;
			} else {
				rom.forEach((byte, addr) => {
					this.mmu.memory[addr] = byte;
				});
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
		};
		xhr.send();
	});
};

/**
 * 
 * @param {string} name
 * @returns {Promise}
 */
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

	this.mmu.memory[gbEmu.TIMA] = 0x00; // TIMA
	this.mmu.memory[gbEmu.TMA] = 0x00; // TMA
	this.mmu.memory[gbEmu.TAC] = 0x00; // TAC
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
		this.loadBootstrap('DMG_ROM.bin').then(() => {
			this.run();
		});
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
	while (i < gbEmu.cyclesPerFrame) {
		if (!this.paused) {
			this.step();
		}
		i++;
		if (this.debug && (breakpoints.indexOf(this.cpu.PC) > -1)) {
			this.paused = true;
//			i = gbEmu.cyclesPerFrame;
		}
		if ((i % 32) === 0) {// TODO: get actual value from CPU instructions (count cpu cycles)
			var line = this.mmu.read8(0xff44) & 0xFF;
			this.mmu.write(0xff44, ++line);
		}
		// Update Timers
		this.updateTimers();

		// Check for interrupts:
		if (this.imu.IME && (this.mmu.read8(this.cpu.PC - 1) !== 0xfb)) { // NOT sure it is correct (TODO)
			this.imu.processInterrupts();
		}
	}
	window.requestAnimationFrame(this.run.bind(this));

	this.lcd.updatePalette();
	this.debugger.updateTileMap();
	this.debugger.updateLcd();
	this.debugger.updateFPS(timestamp);

	if (this.debug) {
		this.debugger.update();
	}
	if (!this.paused) {
		this.imu.requestInterrupt(1);
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
		window.console.log('emulation unpaused');
		this.run();
	}
};
var div = 0;
gbEmu.prototype.updateTimers = function () {
	// Update DIV register @ 16384Hz
	this.divCounter++;
	if ((this.divCounter % 64) === 0) {
		this.divCounter = 0;
		div++;
	}
	div &= 0xFF;
	this.mmu.memory[gbEmu.DIV] = div;

	// Check if timer is enabled
	if (Utils.testBit(this.mmu.memory[gbEmu.TAC], 2)) {
		this.timerCounter++;
		if ((this.timerCounter % 8) === 0) {
			this.mmu.memory[gbEmu.TIMA]++;
			if (this.mmu.memory[gbEmu.TIMA] >= 0xFF) {
				this.mmu.memory[gbEmu.TIMA] = this.mmu.memory[gbEmu.TMA];
				this.imu.requestInterrupt(0x4);
			}
		}
	}
};

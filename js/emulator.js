'use strict';

/* global Utils */

class gbEmu {
	constructor() {
		this.name = 'AjsBoy';
		this.programLoaded = false;
		this.paused = false;
		this.realBoot = !true;
		this.debug = true;

		this.mmu = new MemController(this);
		this.imu = new InterruptsController(this);
		this.cpu = new Cpu(this);
		this.lcd = new Lcd(this.mmu);
		this.inputs = new InputController(this);
		this.debugger = new gbEmu.debugger(this);

		this.internalCounter = 0;
		this.pendingTIMAOverflow = false;
	}

	/**
	 * Load program into rom
	 *
	 * @param {string} name
	 * @param {boolean} isCartridge
	 * @returns {Promise}
	 */
	loadProgram(name, isCartridge = true) {
		return new Promise((resolve, reject) => {
			// Load program.
			const xhr = new XMLHttpRequest;

			xhr.open("GET", "./roms/" + name, true);
			xhr.responseType = "arraybuffer";

			xhr.onload = () => {
				const rom = new Uint8Array(xhr.response);
				if (isCartridge) {
					this.mmu.rom = rom;
				} else {
					rom.forEach((byte, addr) => {
						this.mmu.memory[addr] = byte;
					});
				}

				if (xhr.readyState === 4) {
					if (isCartridge) {
						const titleData = new Uint8Array(rom.buffer, 0x134, 0xF);
						const title = String.fromCharCode(...titleData);
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
	}

	/**
	 *
	 * @param {string} name
	 * @returns {Promise}
	 */
	loadBootstrap(name) {
		return this.loadProgram(name, false);
	}

	setProgramStartState() {
		// 'F' register is set to 0xB0 (10110000) at startup, with bits 7-4 = (Z, N, H, C flags)
		// 'A' register is not used until the boot rom is disabled, so we can set it to 0x00 for now
		// After boot rom is disabled, 'A' register will be set to 0x01 for DMG/SGB mode, 0x11 for CGB mode, or 0xFF for GBP mode
		this.cpu.AF = 0x00B0;

		this.cpu.BC = 0x0013; // CGB mode only
		this.cpu.DE = 0x00D8; // CGB mode only
		this.cpu.HL = 0x014D; // CGB mode only
		this.cpu.SP = 0xFFFE; // Stack pointer is set to 0xFFFE at startup
		this.cpu.PC = 0x0100; // Program counter is set to 0x0100 at startup (after the boot rom)


		// Initialize memory with default values at startup
		// (These are actual values normally defined from boot rom, but since we are skipping it, we need to set them here)
		this.mmu.memory[gbEmu.TIMA] = 0x00; // TIMA - Timer counter
		this.mmu.memory[gbEmu.TMA] = 0x00; // TMA - Timer modulo
		this.mmu.memory[gbEmu.TAC] = 0x00; // TAC - Timer control
		this.mmu.memory[0xFF10] = 0x80; // NR10 - Sound mode 1 sweep register
		this.mmu.memory[0xFF11] = 0xBF; // NR11 - Sound mode 1 length register
		this.mmu.memory[0xFF12] = 0xF3; // NR12 - Sound mode 1 volume register
		this.mmu.memory[0xFF14] = 0xBF; // NR14 - Sound mode 1 frequency register
		this.mmu.memory[0xFF16] = 0x3F; // NR21 - Sound mode 2 length register
		this.mmu.memory[0xFF17] = 0x00; // NR22 - Sound mode 2 volume register
		this.mmu.memory[0xFF19] = 0xBF; // NR24 - Sound mode 2 frequency register
		this.mmu.memory[0xFF1A] = 0x7F; // NR30 - Sound mode 3 on/off
		this.mmu.memory[0xFF1B] = 0xFF; // NR31 - Sound mode 3 length register
		this.mmu.memory[0xFF1C] = 0x9F; // NR32 - Sound mode 3 volume register
		this.mmu.memory[0xFF1D] = 0x00; // NR33 - Sound mode 3 frequency register (lower 8 bits)
		this.mmu.memory[0xFF1E] = 0xBF; // NR34 - Sound mode 3 frequency register (higher 3 bits) and control
		this.mmu.memory[0xFF20] = 0xFF; // NR41 - Sound mode 4 length register
		this.mmu.memory[0xFF21] = 0x00; // NR42 - Sound mode 4 volume register
		this.mmu.memory[0xFF22] = 0x00; // NR43 - Sound mode 4 polynomial counter register
		this.mmu.memory[0xFF23] = 0xBF; // NR44 - Sound mode 4 counter/consecutive
		this.mmu.memory[0xFF24] = 0x77; // NR50 - Volume control for left and right channels
		this.mmu.memory[0xFF25] = 0xF3; // NR51 - Selection of sound output terminal
		this.mmu.memory[0xFF26] = 0xF1; // NR52 - Sound on/off (0xF1 for CGB mode, 0xF0 for SGB mode)
		this.mmu.memory[0xFF40] = 0x91; // LCDC (Control) - 0x91 = 10010001b (BG and Window enabled, no sprites, 8x8 sprites, no window, LCD enabled)
		this.mmu.memory[0xFF42] = 0x00; // SCY (Scroll Y)
		this.mmu.memory[0xFF43] = 0x00; // SCX (Scroll X)
		this.mmu.memory[0xFF45] = 0x00; // LYC (Compare Y)
		this.mmu.memory[0xFF47] = 0xFC; // BGP (Background palette)
		this.mmu.memory[0xFF48] = 0xFF; // OBP0 (Obj palette 0)
		this.mmu.memory[0xFF49] = 0xFF; // OBP1 (Obj palette 1)
		this.mmu.memory[0xFF4A] = 0x00; // WY (Window Y position)
		this.mmu.memory[0xFF4B] = 0x00; // WX (Window X position)
		this.mmu.memory[0xFFFF] = 0x00; // IE (Interrupt Enable)

		this.mmu.memory[0xFF50] = 1; // Boot rom disable flag

		return this;
	}

	init() {
		// reset Program counter
		if (this.realBoot) {
			this.cpu.PC = 0x0000;
			this.loadBootstrap('DMG_ROM.bin').then(() => {
				this.run();
			});
		} else {
			this.setProgramStartState().run();
		}
	}

	run(timestamp) {
		let i = 0;
		// Debug only breakpoints (TODO: implement proper breakpoints in the debugger)
		const breakpoints = [
			// 0x0000,
			// 0x0100,
			// 0xC003,
		];

		// Enter active display period (144 lines * 20 + 43 + 51 machine cycles per line)
		while (i < (144 * (20 + 43 + 51))) {
			if (!this.paused) {
				this.step();
			}
			if (this.debug && (breakpoints.indexOf(this.cpu.PC) > -1)) {
				this.paused = true;
			}

			if ((i % 114) === 0) { // TODO: get actual value from CPU instructions (count cpu cycles)
				// Request LCD interrupt at the end of each line
				this.imu.requestInterrupt(0x2);

				let line = this.mmu.read8(0xff44) & 0xFF;
				this.mmu.memory[0xff44] = ++line;
			}
			i++;
		}

		// Request VBLANK interrupt
		this.imu.requestInterrupt(0x1);

		// Enter VBLANK period (10 lines * 20 + 43 + 51 machine cycles per line)
		while (i < gbEmu.machineCyclesPerFrame) {
			if (!this.paused) {
				this.step();
			}

			if ((i % 114) === 0) { // TODO: get actual value from CPU instructions (count cpu cycles)
				let line = this.mmu.read8(0xff44) & 0xFF;
				this.mmu.memory[0xff44] = ++line;
			}
			i++;
		}

		this.lcd.updatePalette();
		this.debugger.updateTileMap();
		this.debugger.updateLcd();
		this.debugger.updateFPS(timestamp);

		requestAnimationFrame((timestamp) => this.run(timestamp));

		if (this.debug) {
			this.debugger.update();
		}

	}

	step() {
		const addr = this.cpu.PC;
		const opcode = this.mmu.read8(addr);
		const cycles = this.cpu.execute(opcode);
		this.cpu.PC &= 0xFFFF;

		// Update Timers
		this.updateTimers(cycles);

		if (this.paused) {
			// We force update the debugger when paused to reflect the current state of the emulator, even if no instructions are executed
			this.debugger.update();
			this.lcd.updatePalette();
			this.debugger.updateTileMap();
		}

		// Process interrupts
		const interruptCycles = this.imu.processInterrupts();
		// Update Timers with the cycles taken to process the interrupt
		if (interruptCycles > 0) {
			this.updateTimers(interruptCycles);
		}
	}

	pause() {
		this.paused = !this.paused;
		if (this.paused) {
			window.console.log('emulation paused');
		} else {
			window.console.log('emulation unpaused');
			this.run();
		}
	}

	/**
	 * @param {number} cycles The number of machine cycles that have been executed since the last timer update
	 */
	updateTimers(cycles) {
		const TCycles = cycles * 4;
		const prevCounter = this.internalCounter;
		this.internalCounter = (this.internalCounter + TCycles) & 0xFFFF;


		// Update DIV register at 16384Hz (= every 256 T-cycles)
		let div = (this.internalCounter >> 8) & 0xFF; // DIV is the upper 8 bits of the internal counter, so it increments every 256 cycles 
		this.mmu.memory[gbEmu.DIV] = div;

		if (this.pendingTIMAOverflow) {
			const TMA = this.mmu.memory[gbEmu.TMA];
			this.mmu.memory[gbEmu.TIMA] = TMA; // On TIMA overflow, TIMA is reset to the value in TMA
			this.pendingTIMAOverflow = false;
			this.imu.requestInterrupt(0x4);
		}

		// Check if timer is enabled
		let TAC = this.mmu.memory[gbEmu.TAC];
		const timerEnabled = Utils.testBit(TAC, 2);

		if (timerEnabled) {
			// Count how many times the period boundary was crossed
			const bit = TAC_FREQUENCY_BITS[TAC & 0x03];
			
			const prevTicks = prevCounter >> bit;
			const currTicks = this.internalCounter >> bit;
			
			// (handles cases where cycles > period)
			const elapsed = currTicks - prevTicks;

			for (let i = 0; i < elapsed; i++) {
				// TIMA increments on falling edge of the selected bit
				this.incrementTIMA();
			}

		}
	}


	incrementTIMA() {
		let TIMA = this.mmu.memory[gbEmu.TIMA];
		TIMA++;

		if (TIMA > 0xFF) {
			this.mmu.memory[gbEmu.TIMA] = 0x00; // Reset TIMA to 0 on overflow
			this.pendingTIMAOverflow = true; // Set a flag to indicate that TIMA has overflowed, so that we can request the interrupt after writing TMA
		} else {
			this.mmu.memory[gbEmu.TIMA] = TIMA;
		}
	}
}

// Emulator const addresses
gbEmu.DIV = 0xFF04; // Divider register (incremented at 16384Hz)
gbEmu.TIMA = 0xFF05; // Timer counter
gbEmu.TMA = 0xFF06; // Timer modulo
gbEmu.TAC = 0xFF07; // Timer control

// Corresponding to the 4 possible frequencies (00, 01, 10, 11) in the TAC register
const TAC_FREQUENCY_BITS = [
	9, // 4096 Hz   → 1024 T-cycles per TIMA increment
	3, // 262144 Hz → 16 T-cycles per TIMA increment
	5, // 65536 Hz  → 64 T-cycles per TIMA increment
	7  // 16384 Hz  → 256 T-cycles per TIMA increment
];

/**
 * Machine clocks per frame :
 * 
 *        ← 20 mc →  ←     43+ mc     →  ← 51 (max) mc →
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
gbEmu.machineCyclesPerFrame = 17556; // (144 + 10) lines * (20 + 43 + 51) machines clocks

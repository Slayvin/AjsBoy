'use strict';

class InterruptsController {
	/**
	 * 
	 * @param {gbEmu} emulator 
	 * @returns {InterruptsController}
	 */
	constructor(emulator) {
		this.IME = 0; //Interrupt Master Enable flag
		this.IF = 0; //Interrupt Flag
		this.IE = 0; //Interrupt Enable
		this.emulator = emulator;

		Object.defineProperty(this, 'IF', {
			get: () => {
				return emulator.mmu.read8(0xFF0F);
			},
			set: (val) => {
				emulator.mmu.write(0xFF0F, val);
			}
		});

		Object.defineProperty(this, 'IE', {
			get: () => {
				return emulator.mmu.read8(0xFFFF);
			},
			set: (val) => {
				emulator.mmu.write(0xFFFF, val);
			}
		});
	}

	/**
	 * Set the corresponding bit in the IF register to request an interrupt
	 * @param {number} flag - The type of interrupt to request (1 for VBLANK, 2 for LCD, 4 for Timer, 8 for Serial, 16 for Joypad)
	 */
	requestInterrupt(flag) {
		this.IF |= flag;
	}

	/**
	 * @returns {number} The number of machine cycles taken to process the interrupt (0 if no interrupt was processed)
	 * @description Check for pending interrupts and dispatch the highest priority one if IME is enabled. Also exit HALT mode if there are pending interrupts, even if IME is disabled.
	 * Interrupts priority (from highest to lowest): VBLANK, LCD, Timer, Serial, Joypad
	 */
	processInterrupts() {
		const interruptsFlags = this.IF;
		const interruptsEnable = this.IE;
		const pending = interruptsFlags & interruptsEnable & 0x1F;
		
		// Exits HALT even if IME=0
		if (this.emulator.cpu.halted && pending) {
			this.emulator.cpu.halted = false;
		}
		
		// Dispatch only if IME=1
		if (!this.IME || !pending) return 0;
		
		// 1. VBLANK
		if (pending & 0x01) { this.dispatchInterrupt(0); return 5; }
		// 2. LCD
		if (pending & 0x02) { this.dispatchInterrupt(1); return 5; }
		// 3. Timer
		if (pending & 0x04) { this.dispatchInterrupt(2); return 5; }
		// 4. Serial
		if (pending & 0x08) { this.dispatchInterrupt(3); return 5; }
		// 5. Joypad
		if (pending & 0x10) { this.dispatchInterrupt(4); return 5; }

	}

	dispatchInterrupt(flag) {
		this.IME = 0; // Disable master interrupt to avoid nested interrupts
		this.IF = Utils.resetBit(this.IF, flag);
		this.emulator.cpu['PUSH nn'](this.emulator.cpu.PC);
		switch (flag) {
			case 0: // VBLANK
				this.emulator.cpu.PC = 0x0040;
				break;
			case 1: // LCD
				this.emulator.cpu.PC = 0x0048;
				break;
			case 2: // Timer
				this.emulator.cpu.PC = 0x0050;
				break;
			case 3: // Serial
				this.emulator.cpu.PC = 0x0058;
				break;
			case 4: // Joypad
				this.emulator.cpu.PC = 0x0060;
				break;

		}
	}


}

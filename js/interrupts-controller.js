'use strict';
/**
 * 
 * @param {gbEmu} emulator
 * @returns {InterruptsController}
 */
function InterruptsController(emulator) {
	this.IME = 0;//Interrupt Master Enable flag
	this.IF;
	this.IE;
	this.emulator = emulator;

	Object.defineProperty(this, 'IF', {
		get: function () {
			return emulator.mmu.read8(0xFF0F);
		}.bind(this),
		set: function (val) {
			emulator.mmu.write(0xFF0F, val);
		}.bind(this)
	});

	Object.defineProperty(this, 'IE', {
		get: function () {
			return emulator.mmu.read8(0xFFFF);
		}.bind(this),
		set: function (val) {
			emulator.mmu.write(0xFFFF, val);
		}.bind(this)
	});
}

InterruptsController.prototype.requestInterrupt = function (flag) {
	this.IF |= flag;
};

InterruptsController.prototype.processInterrupts = function () {
	var interruptsFlags = this.IF;
	var interruptsEnable = this.IE;

	if (interruptsFlags > 0) {

		// 1. VBLANK
		if (interruptsFlags & interruptsEnable & 0x1) {
//			window.console.log('vblank interrupt');
//			this.IME = 0;
			this.IF = Utils.resetBit(this.IF, 0);
			this.emulator.cpu['PUSH nn'](this.emulator.cpu.PC);
			this.emulator.cpu.PC = 0x0040;
		}
		// 2. LCD
		if (interruptsFlags & interruptsEnable & 0x2) {
//			window.console.log('lcd interrupt');
//			this.IME = 0;
			this.IF = Utils.resetBit(this.IF, 1);
			this.emulator.cpu['PUSH nn'](this.emulator.cpu.PC);
			this.emulator.cpu.PC = 0x0048;
		}
		// 3. Timer
		if (interruptsFlags & interruptsEnable & 0x4) {
//			window.console.log('timer interrupt');
//			this.IME = 0;
			this.IF = Utils.resetBit(this.IF, 2);
			this.emulator.cpu['PUSH nn'](this.emulator.cpu.PC);
			this.emulator.cpu.PC = 0x0050;
		}
		// 4. Serial
		if (interruptsFlags & interruptsEnable & 0x8) {
			window.console.log('serial interrupt');
			this.emulator.cpu.PC = 0x0058;
		}
		// 5. Joypad
		if (interruptsFlags & interruptsEnable & 0x10) {
//			this.IME = 0;
			this.IF = Utils.resetBit(this.IF, 4);
			this.emulator.cpu['PUSH nn'](this.emulator.cpu.PC);
			this.emulator.cpu.PC = 0x0060;
		}

	}

};


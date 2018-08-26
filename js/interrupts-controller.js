'use strict';
/**
 * 
 * @param {gbEmu} emulator
 * @returns {InterruptsController}
 */
function InterruptsController(emulator) {
	this.IME = 1;//Interrupt Master Enable flag
	this.IF;
	this.IE;

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

InterruptsController.prototype.processInterrupts = function () {
	var interruptsFlags = this.IF;
	var interruptsEnable = this.IE;

	if (interruptsFlags > 0) {
		this.IME = 0;
		// 1. VBLANK
		var bitMask = 1;
		if ((interruptsFlags & bitMask) && (interruptsEnable & bitMask)) {
			window.console.log('vblank interrupt');
		}
	}

};


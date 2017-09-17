'use strict';

/**
 * 
 * @param {Cpu} cpu
 * @param {MemController} memory
 * @param {Lcd} lcd
 * @returns {gbEmu.debugger}
 */
gbEmu.debugger = function (cpu, memory, lcd) {
	this.cpu = cpu;
	this.memory = memory;
	this.lcd = lcd;

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
	this.vram = document.querySelector('#vram canvas').getContext("2d");
	this.memoryMap = document.querySelector('#memory canvas').getContext("2d");
	this.lcdBuffer = document.querySelector('#lcd-buffer canvas').getContext("2d");
};

gbEmu.debugger.prototype.update = function () {
	this.pc.innerHTML = this.cpu.PC.toString(16);
	this.sp.innerHTML = this.cpu.SP.toString(16);
	this.stack[0].innerHTML = this.memory.read16(0xfffe).toString(16);
	this.stack[1].innerHTML = this.memory.read16(0xfffc).toString(16);
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

	var iData = new ImageData(new Uint8ClampedArray(this.memory.memory.buffer), 64, 256);
	this.memoryMap.putImageData(iData, 0, 0);

	var iData = new ImageData(this.lcd.buffer, 256, 256);
	this.lcdBuffer.putImageData(iData, 0, 0);
	
	var iData = new ImageData(new Uint8ClampedArray(this.memory.vram,0,0x2000), 64, 32);
	this.vram.putImageData(iData, 0, 0);
};

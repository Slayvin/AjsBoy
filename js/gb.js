'use strict';

function gbEmu() {
	this.name = 'JsBoy';
	this.programLoaded = false;
	this.paused = false;
	this.memory = new MemController();
	this.cpu = new Cpu(this.memory);
	this.lcd = new Lcd();
	this.debugger = new gbEmu.debugger(this.cpu, this.memory, this.lcd);
}

gbEmu.cyclesPerFrame = 64;

/**
 * Load program into rom
 * 
 * @param {string} name
 * @returns {Promise}
 */
gbEmu.prototype.loadProgram = function (name) {
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
				console.log("Program loaded");
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

gbEmu.prototype.init = function () {
	// reset Program counter
	this.cpu.PC = 0x0000;
	this.loadProgram('DMG_ROM.bin').then(function () {
		this.run();
	}.bind(this));
};

gbEmu.prototype.run = function () {
	let i = 0;

	while (i < gbEmu.cyclesPerFrame) {
		this.step();
		i++;
		if (this.cpu.PC === 0xffff) {
			this.pause();
			i = gbEmu.cyclesPerFrame;
		}
	}
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

	var iData = new ImageData(new Uint8ClampedArray(this.memory.rom.buffer), 128, 128);
	this.vram.putImageData(iData, 0, 0);

	var iData = new ImageData(this.lcd.buffer, 256, 256);
	this.lcdBuffer.putImageData(iData, 0, 0);
};

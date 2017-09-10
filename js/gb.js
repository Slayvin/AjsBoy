'use strict';

function gbEmu() {
	this.name = 'JsBoy';
	this.programLoaded = false;
	this.memory = new Uint8Array(0x10000);
	this.cpu = new Cpu(this.memory);
}

// Load rom
gbEmu.prototype.loadProgram = function (name) {
	return new Promise(function (resolve, reject) {
		// Load program.
		var xhr = new XMLHttpRequest;

		xhr.open("GET", "./roms/" + name, true);
		xhr.responseType = "arraybuffer";

		xhr.onload = function () {
			let rom = new Uint8Array(xhr.response);

			for (let i = 0; i < rom.length; i++) {
				this.memory[i] = rom[i];
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
	for (var i = 0; i < 16384; i++) {
		this.step();
	}
	window.requestAnimationFrame(this.run.bind(this));

};

gbEmu.prototype.step = function () {
	let opcode = this.memory[this.cpu.PC];
	this.cpu.execute(opcode);
//	this.debugger.update(this);
};

gbEmu.prototype.debugger = {
	pc: document.querySelector('#pc'),
	code: document.querySelector('#code'),
	sp: document.querySelector('#sp'),
	regA: document.querySelector('#reg-A'),
	regB: document.querySelector('#reg-B'),
	regC: document.querySelector('#reg-C'),
	regD: document.querySelector('#reg-D'),
	regE: document.querySelector('#reg-E'),
	regF: document.querySelector('#reg-F'),
	regH: document.querySelector('#reg-H'),
	regL: document.querySelector('#reg-L'),
	flagZ: document.querySelector('#flag-Z'),
	flagN: document.querySelector('#flag-N'),
	flagH: document.querySelector('#flag-H'),
	flagC: document.querySelector('#flag-C'),

	update: function (emu) {
		this.pc.innerHTML = emu.cpu.PC.toString(16);
		this.sp.innerHTML = emu.cpu.SP.toString(16);
		this.code.innerHTML = emu.cpu.code;
		this.regA.innerHTML = emu.cpu.A.toString(16);
		this.regB.innerHTML = emu.cpu.B.toString(16);
		this.regC.innerHTML = emu.cpu.C.toString(16);
		this.regD.innerHTML = emu.cpu.D.toString(16);
		this.regE.innerHTML = emu.cpu.E.toString(16);
		this.regF.innerHTML = emu.cpu.F.toString(16);
		this.regH.innerHTML = emu.cpu.H.toString(16);
		this.regL.innerHTML = emu.cpu.L.toString(16);
		this.flagZ.innerHTML = emu.cpu.flags.Z.toString(2);
		this.flagN.innerHTML = emu.cpu.flags.N.toString(2);
		this.flagH.innerHTML = emu.cpu.flags.H.toString(2);
		this.flagC.innerHTML = emu.cpu.flags.C.toString(2);
	}
};
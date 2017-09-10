/* global Cpu */
'use strict';
// All extended Operation codes
Cpu.prototype.instructions.extended = {

	// BIT 7,H
	0x7c: function () {
		this.code = 'BIT 7,H';
		let mask = 0x1 << 7;
		this.flags.Z = !(mask & this.H) | 0;
		this.flags.N = 0;
		this.flags.H = 1;
	}

};
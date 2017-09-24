var Utils = {
	'sign': function (byte) {
		var Uint = byte & 0xFF;
		return (Uint <= 0x7F) ? Uint : 0xFFFFFF00 | Uint;
	},
	'carryFromBit3': function (a, b) {
		return (((a & 0xF) + (b & 0xF)) & 0x10) === 0x10 ? 1 : 0;
	},
};
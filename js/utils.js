var Utils = {
	'sign': (byte) => {
		const Uint = byte & 0xFF;
		return (Uint <= 0x7F) ? Uint : 0xFFFFFF00 | Uint;
	},
	'carryFromBit3': (a, b) => {
		return (((a & 0xF) + (b & 0xF)) & 0x10) === 0x10 ? 1 : 0;
	},
	'carryFromBit7': (a, b) => {
		return (((a & 0xFF) + (b & 0xFF)) & 0x100) === 0x100 ? 1 : 0;
	},
	'carryFromBit11': (a, b) => {
		return (((a & 0xFFF) + (b & 0xFFF)) & 0x1000) === 0x1000 ? 1 : 0;
	},
	'carryFromBit15': (a, b) => {
		return (((a & 0xFFFF) + (b & 0xFFFF)) & 0x10000) === 0x10000 ? 1 : 0;
	},
	'testBit': (value, position) => {
		return (value & (1 << position)) > 0;
	},
	'setBit': (value, position) => {
		return value | (1 << position);
	},
	'resetBit': (value, position) => {
		return value & (0xFF - (1 << position));
	}
};
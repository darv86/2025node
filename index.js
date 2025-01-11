const bin1 = 1 * 2 ** 0;
const bin2 = 1 * 2 ** 1;
const bin3 = 1 * 2 ** 2;
const bin4 = 0 * 2 ** 3;
const binResult = bin1 + bin2 + bin3 + bin4;
// console.log(binResult, '\n', bin1, bin2, bin3, bin4);

const dec1 = 8 * 10 ** 0;
const dec2 = 5 * 10 ** 1;
const dec3 = 3 * 10 ** 2;
const decResult = dec1 + dec2 + dec3;
// console.log(decResult, '\n', dec1, dec2, dec3);

const HEX2BIN = {
	0: '0000',
	1: '0001',
	2: '0010',
	3: '0011',
	4: '0100',
	5: '0101',
	6: '0110',
	7: '0111',
	8: '1000',
	9: '1001',
	a: '1010',
	b: '1011',
	c: '1100',
	d: '1101',
	e: '1110',
	f: '1111',
};

const HEX2DEC = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
	a: 10,
	b: 11,
	c: 12,
	d: 13,
	e: 14,
	f: 15,
};

const hex1 = HEX2DEC['c'] * 16 ** 0;
const hex2 = HEX2DEC['d'] * 16 ** 1;
const hex3 = HEX2DEC[5] * 16 ** 2;
const hexResult = hex1 + hex2 + hex3;
// console.log({ hexResult }, '\n', hex1, hex2, hex3);

/**
 * @param {string} hexNum
 * @returns {number}
 */
function hexToDec(hexNum) {
	const data = hexNum.startsWith('0x') ? hexNum.slice(2) : hexNum;
	return data
		.toLowerCase()
		.split('')
		.reverse()
		.reduce((result, symbol, i) => result + HEX2DEC[symbol] * 16 ** i, 0);
}
const resHexToDec = hexToDec('0xfa3c');
// console.log(resHexToDec);

/**
 * @param {string} binary
 * @returns {number}
 */
function binaryToDec(binary) {
	return binary
		.split('')
		.reverse()
		.reduce((result, symbol, i) => result + Number(symbol) * 2 ** i, 0);
}
const resBinaryToDec = binaryToDec('0111');
// console.log(resBinaryToDec);

/**
 * @param {string} binary
 * @returns {string}
 */
function binaryToHex(binary) {
	let chunk = [];
	let CHUNK_SIZE = 4;
	const bytes = binary.split('').reduce((result, byte) => {
		chunk.push(byte);
		if (chunk.length === CHUNK_SIZE) {
			result.push(chunk.join(''));
			chunk = [];
			return result;
		}
		return result;
	}, /**@type {string[]}*/ ([]));
	const ints = bytes.map(byte => binaryToDec(byte));
	const hexes = ints.map(int => Object.keys(HEX2DEC).find(symbol => HEX2DEC[symbol] === int));
	return '0x' + hexes.join('');
	// alternative realization
	// return '0x' + binaryToDec(binary).toString(16);
}
const resBinaryToHex = binaryToHex('010111011100'); // 1500
// console.log({ resBinaryToHex });

const objKey = {
	/**
	 * @param {Object} obj
	 * @param {any} value
	 * @returns {unknown}
	 */
	where(obj, value) {
		return Object.keys(obj).find(key => obj[key] === value);
	},
};

const num = 1500;
/**
 * @param {number} num
 * @returns {string}
 */
function decToHex(num) {
	if (num === 0) {
		return '0x';
	}
	const nextNum = Math.floor(num / 16);
	const hexNum = objKey.where(HEX2DEC, num % 16);

	return decToHex(nextNum) + hexNum;
}
const resDecToHex = decToHex(num);
console.log({ resDecToHex }); // Expected output: '0x5dc'

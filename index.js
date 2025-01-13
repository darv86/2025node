import { Buffer, constants } from 'node:buffer';

// the buffer object has a lot of methods as an array has,
// coz the Buffer class is inherited from the Uint8Array class

// two constants that show how big memory can be allocated to this buffer
// (theoretical maximum amount of a memory for this OS)
// console.log(constants.MAX_LENGTH);

// the buffer is an array like data structure, but not an array
// the min portion of a buffer is one byte (in this case are 4 bytes)
// or 2 nibbles (4 bits + 4 bits)
const memory = Buffer.alloc(4, 5);
// shows the buffer (memory) content, using hex representation
// console.log(memory);

// can write to the specific byte (1)
memory[1] = 2;
// proper way to write and read numbers from buffer
// are two groups of a methods: write... read...
memory.writeInt8(-3, 1);
// console.log(memory.readInt8(1));
// if there is need to fill every byte of the whole buffer with the specific value,
// use this 'fill' method - fast approach
memory.fill(5);

// TASK 1
const data = '0100 1000 0110 1001 0010 0001'.replaceAll(' ', '');
const BUFFER_SIZE = data.length / 8;
const bytes = data
	.split('')
	.reduce(
		(result, _, i, arr) => (i % 8 === 0 && result.push(arr.slice(i, i + 8).join('')), result),
		/** @type {string[]}*/ ([])
	);
const binary = bytes.reduce(
	(result, _, i, arr) => (result.push(parseInt(arr[i], 2)), result),
	/** @type {number[]}*/ ([])
);
// creates buffer with the specific size
const buff = Buffer.alloc(BUFFER_SIZE);
// and then fulfill this buffer with a data
buff.forEach((_, i, arr) => arr.writeInt8(binary[i], i));
// here we can creates buffer and fulfill with binary (bytes with decimals or hex values) array
const buffEz = Buffer.from(binary);
// console.log(buffEz.toString('utf-8')); // Hi!
// can even pass string of hex ('486921'),
// but should specify second parameter 'hex' for the 'from' method
const binaryHex = binary.map(byte => byte.toString(16));
const buffHex = Buffer.from(binaryHex.join(''), 'hex');
// console.log(buffHex.toString('utf-8')); // Hi!
// or simply create a buffer from a string as a value
// console.log(Buffer.from('my string', 'utf-8').toString());

// content of the buffers can be compared
const isEqual = buffEz.equals(buffHex);
// console.log(isEqual);

// check if the buffer includes specific value among all bytes
const isThere = buffHex.includes(0x48);
console.log(isThere);

// concatenate all buffers in array and returns buffer
const concatBuf = Buffer.concat([buff, buffEz]);

// allocUnsafe method is the faster way to allocate a memory, but security unsafe
// concat and from methods use allocUnsafe under the hood,
// but instantly fulfills with data, so these two methods are safe
const unsafeBuf = Buffer.allocUnsafe(10_000);

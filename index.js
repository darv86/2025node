import { open } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { resolve } from 'node:path';

const srcPath = resolve('./book.txt');
const destPath = resolve('./book-m.txt');

const textFormatter = (chunk, leftover) => {
	const text = chunk.toString();
	let textToFormat = text;
	let leftoverUpd = leftover;
	if (leftoverUpd.includes('\r') && text.startsWith('\n')) {
		textToFormat = leftoverUpd + text.slice(1);
	}
	leftoverUpd = '';
	if (text.endsWith('\r')) {
		leftoverUpd = '\r';
		textToFormat = text.slice(0, -1);
	}
	const textNonEol = textToFormat.replace(/\r\n|\r|\n/g, ' ');
	return { textNonEol, leftoverUpd };
};

// there are three variants (api) to implement all functionality with the book:
// - readable/writable streams with manual drain handling
// - own streaming implementation with stream.read()
// - the best variant: transform stream and pipeline()

// Transform inherited from Duplex (implements two sides of Readable and Writable)
// 1. to create own transform stream, it should extend Transform stream class
class BookTransform extends Transform {
	constructor(options) {
		super(options);
		this.leftover = '';
	}
	// 2. implement _transform method with transformation logic;
	// pipeline automatically calls transform.write() on the side of writable stream
	// and chunk comes to _transform and after transformation logic on a chunk,
	// it should be passed to another stream
	_transform(chunk, _, cb) {
		const { textNonEol, leftoverUpd } = textFormatter(chunk, this.leftover);
		this.leftover = leftoverUpd;
		// two variants to pass data to the next stream (in this case: to writable):
		// first: if no error, then callback(null, data)
		// if an error, then callback(error)
		cb(null, textNonEol);
		// second: if no error, then this.push(data); callback()
		// if an error, then callback(error)
		// this.push(textNonEol);
		// cb();
	}
	// implement _flush to have some logic after transformation is done
	// and before 'end' emit for this stream;
	// this method can be used for the final write, like writable.end() method does
	_flush(cb) {
		if (this.leftover) return cb(null, this.leftover);
		cb();
	}
}

(async () => {
	const src = await open(srcPath, 'r');
	const dest = await open(destPath, 'w');
	const readStream = src.createReadStream();
	// 3. creating transform stream
	const transformStream = new BookTransform();
	const writeStream = dest.createWriteStream();
	// alternative approach to pipeline is a combination, but pipeline is better:
	// pipe() from 'node:stream' and finished() for manual error handling
	try {
		// 4. pipeline executes all streams in the order they were passed as arguments;
		// pipeline automatically manages drain and buffer sizes between streams
		// also auto error handling (has callback version)
		await pipeline(readStream, transformStream, writeStream);
	} catch (error) {
		console.error(error);
	}
	await src.close();
	await dest.close();

	const fd = await open(destPath);
	const stream = fd.createReadStream();
	for await (const chunk of stream) {
		const text = chunk.toString();
		if (text.includes('\r') || text.includes('\n')) {
			console.log('the symbol found');
		}
	}
	await fd.close();
	console.log('job done');
})();

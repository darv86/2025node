import { open } from 'node:fs/promises';
import { resolve } from 'node:path';

const srcPath = resolve('./book.txt');
const destPath = resolve('./book-m.txt');

// solves buffer splitting issue while streaming
const textFormatter = (chunk, leftover) => {
	const text = chunk.toString();
	let textFormatted = text;
	let leftoverUpd = leftover;
	if (leftoverUpd.includes('\r') && text.startsWith('\n')) {
		textFormatted = leftoverUpd + text.slice(1);
	}
	leftoverUpd = '';
	if (text.endsWith('\r')) {
		leftoverUpd = '\r';
		textFormatted = text.slice(0, -1);
	}
	const textNonEol = textFormatted.replace(/\r\n|\r|\n/g, ' ');
	return { textNonEol, leftoverUpd };
};

(async () => {
	const src = await open(srcPath, 'r');
	const rStream = src.createReadStream();
	const dest = await open(destPath, 'w');
	const wStream = dest.createWriteStream();

	let leftover = '';

	rStream.on('data', chunk => {
		const { textNonEol, leftoverUpd } = textFormatter(chunk, leftover);
		leftover = leftoverUpd;
		if (!wStream.write(textNonEol)) rStream.pause();
	});
	// when readable stream is done, emits 'end' event, but
	// when writable stream is done, emits 'finish' event
	rStream.on('end', async () => {
		await src.close();
		// writable stream needs to be ended explicitly;
		// readable stream ends automatically,
		// when reaches the end of file (EOF)
		wStream.end('--- MODIFIED BY NODE.JS ---');
		console.log('writes are done');
	});

	wStream.on('drain', () => rStream.resume());
	wStream.on('finish', async () => {
		await dest.close();
		// checking if destination file has eol symbols
		const fh = await open(destPath);
		const stream = fh.createReadStream();
		// readable stream is async iterable,
		// so for..await loop can be used instead of 'data' event listener
		for await (const chunk of stream) {
			const text = chunk.toString();
			if (text.includes('\r') || text.includes('\n')) {
				console.log('the symbol found');
			}
		}
	});
	wStream.on('close', () => {
		console.log('closed');
	});

	// ends the stream (last chunk can be written),
	// emits 'finish' and 'close events
	// wStream.end();
	// immediately close the stream and clears all pending writes,
	// emits 'error' and 'close' events
	// wStream.destroy();
	// closes underlying file descriptor (in this case: dest),
	// ends the stream and can clears all pending writes
	// emits 'close' event
	// wStream.close();

	rStream.on('error', err => console.error('Read Stream Error:', err));
	wStream.on('error', err => console.error('Write Stream Error:', err));
})();

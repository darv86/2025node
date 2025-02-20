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
	const dest = await open(destPath, 'w');

	let leftover = '';

	// do not use in production!!!
	// own way to implement stream without stream itself
	// seems like, there is a issue without proper write ending for big files,
	// but native stream does not have this issue, coz there is stream.end()
	while (true) {
		const { bytesRead, buffer } = await src.read();
		if (!bytesRead) break;
		const buff = buffer.subarray(0, bytesRead);
		const { textNonEol, leftoverUpd } = textFormatter(buff, leftover);
		leftover = leftoverUpd;
		await dest.write(textNonEol);
	}
	// ensure correct last write, if any data remains
	if (leftover) {
		await dest.write(leftover);
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
})();

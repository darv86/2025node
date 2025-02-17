import { open } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourcePath = resolve('./test.txt');

(async () => {
	const source = await open(sourcePath, 'w');
	const rStream = source.createReadStream();
	const wStream = source.createWriteStream();

	// represent the size of the internal buffer,
	// where data stores before write to output (fs, http resp...)
	const rBuffSize = rStream.readableHighWaterMark;
	const wBuffSize = wStream.writableHighWaterMark;
	// these values can be equal, depends on node version and os:
	// v22.13.1 65536 bytes for both;
	// v20.18.3 rBuffSize: 65536, wBuffSize: 16384.
	console.log({ rBuffSize, wBuffSize });

	// shows how many bytes is written to the internal buffer (wBuffSize)
	console.log('before write:', wStream.writableLength);
	const buffToWrite = Buffer.from('text to write in buffer');
	wStream.write(buffToWrite);
	console.log('after write:', wStream.writableLength);

	// wStream.write returns false, if
	// wStream.writableHighWaterMark === wStream.writableLength
	// so the stream needs some time to empty this internal buffer
	// by writing that data to output before write to the stream again
	// otherwise, returns true
	let canWriteMore = wStream.write(buffToWrite);
	console.log({ canWriteMore });
	// writes bigBuffer to the stream with exactly size as needed to have
	// wStream.writableHighWaterMark === wStream.writableLength
	const bigBuff = Buffer.alloc(wBuffSize - wStream.writableLength);
	canWriteMore = wStream.write(bigBuff);
	console.log({ canWriteMore });

	// never allow wStream.writableHighWaterMark < wStream.writableLength
	// before write to the stream

	// when the stream has emptied the internal buffer
	// and ready to write to that buffer again, it emits 'drain' event
	wStream.on('drain', async () => {
		console.log('ready to make safe write');
		// writes last buff (exact size as internal buffer) to the stream
		// and ends this stream (output will have size of two writableHighWaterMark)
		const size = wStream.writableHighWaterMark;
		const buff = Buffer.alloc(size);
		// when writings are done, the stream should be ended
		// also .end method emits 'finish' event
		wStream.end(buff);
	});

	wStream.on('finish', async () => {
		console.log('the stream is finished');
		source.close();
	});
})();

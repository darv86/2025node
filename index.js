import { stat, watch, writeFile, appendFile, readFile, unlink, open } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import { CommandHandler } from './commandHandler.js';

const filePath = resolve('task.txt');
console.log(filePath);

const controller = new AbortController();
const { signal } = controller;
const watcher = watch(filePath, { signal });

(async () => {
	console.log('app is running...');

	// every file or dir operation (readFile, writeFile...) uses 'open' method
	// and the corresponding method(read, write...) under the hood;
	// 'open' returns FileHandle object, that extends EventEmitter
	/** @typedef {import('node:fs/promises').FileHandle & import('node:events').EventEmitter} FileHandleEvent */
	const fileHandle = /** @type {FileHandleEvent} */ (await open(filePath, 'r'));
	fileHandle.on('change', async () => {
		const buffSize = (await stat(filePath)).size;
		const buff = Buffer.alloc(buffSize);
		const contentBuff = (await fileHandle.read({ buffer: buff, position: 0 })).buffer;
		const content = contentBuff.toString();
		try {
			const command = new CommandHandler(content);
			command.exec();
		} catch (error) {
			console.error('the error while init:', error);
		}
	});

	let lastChange = 0;
	for await (const event of watcher) {
		if (event.eventType !== 'change') continue;
		const currentChange = Math.floor((await stat(filePath)).mtimeMs / 100);
		if (lastChange === currentChange) continue;
		lastChange = currentChange;
		fileHandle.emit('change');
	}

	// after work on file is done, it should be closed
	fileHandle.close();
})();

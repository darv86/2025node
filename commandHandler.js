import { stat, writeFile, appendFile, unlink, rename } from 'node:fs/promises';
import { resolve } from 'node:path';

export class CommandHandler {
	#commands = ['create', 'rename', 'delete', 'append'];

	/** @param {string} content */
	constructor(content) {
		this.content = content;
		this.filename = this.#parseFilename();
		if (!this.filename) throw new Error('the file name did not provided');
		this.filePath = resolve(this.filename);
		this.command = this.#parseCommand();
		if (!this.command) throw new Error('there is not such a command');
	}

	/** @returns {string | undefined} */
	#parseCommand() {
		return this.#commands.find(command => this.content.startsWith(command));
	}

	/** @returns {string | undefined} */
	#parseMsg() {
		const keyword = 'message';
		if (!this.content.includes(keyword)) return undefined;
		const start = this.content.indexOf(keyword) + keyword.length + 1;
		const msg = this.content.substring(start);
		return msg;
	}

	/** @returns {string | undefined} */
	#parseFilename() {
		const keyword = 'file:';
		if (!this.content.includes(keyword)) return undefined;
		const start = this.content.indexOf(keyword) + keyword.length;
		const end = this.content.indexOf(' ', start);
		const filename = this.content.substring(start, ~end ? end : this.content.length);
		return filename;
	}

	async exists() {
		try {
			const stats = await stat(this.filePath);
			return true;
		} catch {
			return false;
		}
	}

	async create() {
		const fileExists = await this.exists();
		if (fileExists) return console.log('the file already exists');
		const msg = this.#parseMsg() || '';
		await writeFile(this.filePath, msg);
		console.log('file created');
	}

	async rename() {
		const fileExists = await this.exists();
		if (!fileExists) return console.log('the file does not exist');
		const keyword = 'file:' + this.filename + ' to ';
		const start = this.content.indexOf(keyword) + keyword.length;
		const end = this.content.indexOf(' ', start);
		const newFilename = this.content.substring(start, end);
		const newFilePath = resolve(newFilename);
		await rename(this.filePath, newFilePath);
		console.log('file renamed');
	}

	async delete(content) {
		const fileExists = await this.exists();
		if (!fileExists) return console.log('the file does not exist');
		await unlink(this.filePath);
		console.log('file deleted');
	}

	async append() {
		const fileExists = await this.exists();
		if (!fileExists) return console.log('the file does not exist');
		const msg = this.#parseMsg();
		if (!msg) return console.log('invalid message input');
		await appendFile(this.filePath, msg);
		console.log('the message added to the file');
	}

	async exec() {
		await this[this.command]();
	}
}

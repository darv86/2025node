import { createServer } from 'node:net';

const server = createServer(async socket => {
	for await (const chunk of socket) {
		console.log(chunk.toString());
	}
});

server.listen(4200, 'localhost', () => {
	console.log(`server runs:`, server.address());
});

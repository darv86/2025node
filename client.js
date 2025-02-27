import { createConnection } from 'node:net';

const connectionSocket = createConnection({ /*host: 'localhost'*/ port: 4200 }, () => {
	connectionSocket.write('some string as data');
	console.log(connectionSocket.address());
});

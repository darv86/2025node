import { createConnection } from 'node:net';
import { Duplex } from 'node:stream';

const PORT = 4200;

const connectionSocket = createConnection({ /*host: 'localhost' - default*/ port: PORT }, () => {
	console.log(connectionSocket instanceof Duplex);
	connectionSocket.write('some string as data');
	console.log(connectionSocket.address());
});

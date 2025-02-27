import { createServer } from 'node:net';

// System Ports (0-1023), User Ports (1024-49151),
// and the Dynamic and/or Private Ports (49152-65535)
const PORT = 4200;
// 127.0.0.1 ip address for loopback interface,
// this interface sends all responses back to this machine only;
// 'localhost' alias for this ip address
const IP_ADDRESS = '127.0.0.1';

// but we can specify an ip address,
// that was given to our machine by the router/switch/wifi-router,
// then any machine (that connected to this router)
// in this network can send request to our machine
// using that ip address and port number

const server = createServer(async socket => {
	for await (const chunk of socket) {
		console.log(chunk.toString());
	}
});

server.listen(PORT, IP_ADDRESS, () => {
	console.log(`server runs:`, server.address());
});

import { EventEmitter } from 'node:events';

class EE extends EventEmitter {}

const ee = new EE();

// "on" method returns ee object itself
const some = ee.on('foo', () => console.log('foo emitted'));
// console.log(some);
ee.on('foo', arg => console.log(arg));

// 2nd parameter and others are for an arguments of the callback funcs inside "on" method
ee.emit('foo', 'text for the argument X');

// can be emitted only one time despite of how many times "emit" was called
ee.once('foo', () => console.log('foo run once'));
ee.emit('foo', 1);
ee.emit('foo', 2);

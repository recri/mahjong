import { alea } from './alea.js';

export class Random {

    constructor(seed) {
	srandom(seed)
    }

    srandom(seed) {
	this.seed = seed || Date.now()
	this.random = alea(this.seed).double
    }

    shuffle(array) {
	array = array.slice(0)	// copy array
	const n = array.length
	for (let i = 0; i < n; i += 1) {
	    let j = i + Math.floor(this.random()*(n-i))
	    if (i != j) {
		let ai = array[i]
		let aj = array[j]
		array[i] = aj
		array[j] = ai
	    }
	}
	return array
    }
}

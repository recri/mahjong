export class Timer {

    constructor() {
        this.start_game = 0
	this.start_time = 0
	this.stop_time = 0
    }
    
    clock_millis() { return Date.now() }

    clock_seconds() { return Math.floor(clock_millis() / 1000) }

    reset() {
	this.start_game = this.clock_millis()
	this.start_time = 0
	this.stop_time = 0
    }

    start() { if (this.start_time == 0) { this.start_time = this.clock_millis() } }

    stop() { if (this.stop_time == 0) { this.stop_time = this.clock_millis() } }

    pause() { if (this.stop_time == 0) { this.stop_time = this.clock_millis() } }

    unpause() {
	if (this.stop_time != 0) { 
	    this.start_time = this.clock_millis()-(this.stop_time-this.start_time)
	    this.stop_time = 0
	}
    }

    elapsed() {
	if (this.start_time === 0) return 0
	if (this.stop_time !== 0) return this.stop_time-this.start_time
	return this.clock_millis()-this.start_time
    }

}

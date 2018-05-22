
Polymer({
      // is: 'mahjong-play',
    properties: {
	seed: {
	    type: String,
	    reflectToAttribute: true,
            // observer: 'seedChanged'
	},
	keyEventTarget: {
            type: Object,
            value: function() {
		return document.body;
            }
	}
    },


    ready: function() {
	// console.log("mahjong-play enters ready");
	
	// tile layout
	let layout = Layout(this);

	// tile images
	let tiles = Tiles(this, layout)

	// game
	this.game = Game(this, layout, tiles, "")

	// window resize handler
	let self = this
	window.onresize = function() { self.window_resize() }

	// console.log("finished in mahjong-play.ready");
    },

    // event handlers
});

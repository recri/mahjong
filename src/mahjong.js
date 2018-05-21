
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
    window_resize : function() { this.game.window_resize(window.innerWidth, window.innerHeight) },

    tile_tap: function(name) { this.game.tile_tap(name) },

    key_undo : function() { if ( ! this.game.menu_is_disabled("Undo")) this.action_undo() },
    key_redo : function() { if ( ! this.game.menu_is_disabled("Redo")) this.action_redo() },
    key_new : function() { if ( ! this.game.menu_is_disabled("New Game")) this.action_new() },
    key_restart : function() { if ( ! this.game.menu_is_disabled("Restart")) this.action_restart() },
    
    dialog_undo : function() {
	this.game.menu_enable_disable(["New Game", "Restart", "Pause", "Hint", "Redo", "Scores", "Preferences"], ["Continue", "Undo"])
	this.game.history_undo()
    },
    dialog_new : function() { this.game.new_game() },
    dialog_restart : function() { this.game.restart_game() },

    action_undo : function() { this.game.history_undo() },
    action_redo : function() { this.game.history_redo() },
    action_new : function() { this.game.new_game() },
    action_restart : function() { this.game.restart_game() },

    // seedChanged : function(seed) { console.log("seedChanged: "+seed) }
    
});

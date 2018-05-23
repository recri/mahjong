import { LitElement, html } from '@polymer/lit-element';

import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import { Icons } from './mahjong-icons.js';
import { Tiles } from './mahjong-tiles.js';
import { Layout } from './mahjong-layout.js';
import { Game } from './mahjong-game.js';

class MahjongApp extends (LitElement) {
    static get properties() {
	return {
	    seed: String,
	    /*
	    tiles: Object,
	    undo_move: Boolean,
	    redo_move: Boolean,
	    restart_game: Boolean,
	    new_game: Boolean
	    */
	}
    }

    _render({ seed } ) {
	console.log("mahjong-app _render called");
	return html`
<style>
  :host {
    --app-primary-color: #4285f4;
    --app-secondary-color: black;
    display: block;
    padding: 10px;
    html, body { margin:0; padding:0; overflow:hidden; }
  }
  #mahjong {
    position:relative; top:0px; left:0px; width:100%; height:100%;
  }

  div#toolbar-menu {
    position:absolute; top:8px; left:8px;
  }
  div#toolbar-menu button {
    background-color: transparent;
    margin: 0 0; padding: 0 0; border: 0;
  }
  div#toolbar-menu button svg {
    height: 24px; width 24px;
  }
  div#toolbar-menu button:disabled svg g {
    fill: grey;
  }
  div#toolbar-menu button svg g {
    fill: white;
  }
  .definitions {
    display:none; 
  }
  @media screen and (orientation: landscape) {
    div#toolbar-menu {
      width: 30px;
    }
  }

  @media screen and (orientation: portrait) {
    div#toolbar-menu {
      width: 100%;
    }
  }

  button.tile { display:inline; margin: 0 0; padding: 0 0; border: 0; background-color: transparent; }
  button.tile g.bg { display:inline; }
  button.tile g.mg { display:none; }
  button.tile g.fg { display:inline; }
</style>

<div id="mahjong">${this.tiles.html_template()}</div>

<div id="toolbar-menu">
  <button id="new_game" on-click="${(e) => this.action_new(e)}" title="New Game" disabled?=${this.new_game}>
    ${Icons.newGame}</button>
  <button id="restart_game" on-click="${(e) => this.action_restart(e)}" title="Restart Game" disabled?=${this.restart_game}>
    ${Icons.restartGame}</button>
  <button id="undo_move" on-click="${(e) => this.action_undo(e)}" title="Undo Move" disabled?=${this.undo_move}>
    ${Icons.undoMove}</button>
  <button id="redo_move" on-click="${(e) => this.action_redo(e)}" title="Redo Move" disabled?=${this.redo_move}>
    ${Icons.redoMove}</button>
</div>
    
<dialog id="youlose" modal>
  <h2>There are no more moves.</h2>
  <p>Each puzzle has at least one solution.
    You can undo your moves and try to find the solution,
    start the game over,
    or start a new game.</p>
  <div class="buttons">
    <button raised dialog-confirm on-click=${(e) => this.youlose_undo(e)}>Undo</button>
    <button raised dialog-confirm on-click=${(e) => this.youlose_restart(e)}>Restart</button>
    <button raised dialog-confirm on-click=${(e) => this.youlose_new(e)}>New Game</button>
  </div>
</dialog>
      
<dialog id="youwin" modal>
  <h2>You have won the game</h2>
  <div class="buttons">
    <button raised dialog-confirm on-click=${(e) => this.youwin_undo(e)}>Undo</button>
    <button raised dialog-confirm on-click=${(e) => this.youwin_restart(e)}>Restart</button>
    <button raised dialog-confirm on-click=${(e) => this.youwin_new(e)}>New Game</button>
  </div>
</dialog>
`;
    }

    constructor() {
	super();
	// To force all event listeners for gestures to be passive.
	// See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
	setPassiveTouchGestures(true);
	
	this.undo_move = false
	this.redo_move = false
	this.new_game = false
	this.restart_game = false
	
	// tile layout
	this.layout = Layout(this);
	
	// tile images
	this.tiles = Tiles(this, this.layout)

	// game
	this.game = Game(this, this.layout, this.tiles, "")

	this.update_game();
    }

    _firstRendered() {
	// window resize handler
	let self = this
	window.onresize = (e) => self.window_resize(e)
	// try a first resize for luck
	this.window_resize(null)
    }

    _didRender(properties, changeList) {
	// console.log(`_didRender changeList`); console.log(changeList)
	this.position_tiles()
	this.menu_assert_all()
    }

    _stateChanged(state) {
	console.log("mahjong-app enters _stateChanged");
    }
    
    update_game() {
	this.seed = this.game.get_seed();
	// this._requestRender();
    }
    
    window_resize(e) { 
	// I want to do this by css transform:scale(...)
	// or by drawing the entire thing in svg and using svg transform
	if (window.innerWidth === 0 || window.innerHeight === 0)
	    this.game.window_resize(200, 200);
	else
	    this.game.window_resize(window.innerWidth, window.innerHeight);
	// this._requestRender();
    }

    // toolbar menu management
    menu_item_id(label) {
	switch (label) {
	case "Undo": return 'undo_move'
	case "Redo": return 'redo_move'
	case "New Game": return 'new_game'
	case "Restart": return 'restart_game'
	case "Pause": return '' // 'pause_game'
	case "Continue": return '' // 'continue_game'
	case "Hint": return '' // 'hint_move'
	case "Scores": return '' // 'scores_page'
	case "Preferences": return '' // 'prefs_page'
	case "Help": return '' // 'help_page'
	case "About": return '' // 'about_page'
	default: 
	    console.log("unhandled disable "+label)
	    return ''
	}
    }
	
    menu_element(label) {
	const id = this.menu_item_id(label);
	if (id && id !== '' && this.shadowRoot && this.shadowRoot.getElementById) {
	    return this.shadowRoot.getElementById(id)
	}
    }
	
    menu_update(label, disabled) {
	const elt = this.menu_element(label)
	if (elt) {
	    if (disabled)
		elt.setAttribute("disabled", "");
	    else if (elt.hasAttribute("disabled"))
		elt.removeAttribute("disabled")
	}
	this[this.menu_item_id(label)] = disabled;
    }
	
    menu_is_disabled(label) {
	const elt = this.menu_element(label)
	if (elt) 
	    this[this.menu_item_id(label)] = elt.hasAttribute("disabled")
	return this[this.menu_item_id(label)]
    }
	
    menu_enable_disable(enable, disable) {
	enable.forEach((label) => this.menu_update(label, false))
	disable.forEach((label) => this.menu_update(label, true))
    }

    menu_assert(labels) {
	labels.forEach((label) => this.menu_update(label, this.menu_is_disabled(label)))
    }
    
    menu_assert_all() { this.menu_assert(["New Game", "Restart", "Pause", "Hint", "Redo", "Scores", "Preferences", "Continue", "Undo"]) }

    // tiles
    position_tiles() { this.game.position_tiles() }

    tile_tap(name) { this.game.tile_tap(name) }

    // defunct keyboard accelerators
    key_undo() { if ( ! this.menu_is_disabled("Undo")) this.action_undo() }
    key_redo() { if ( ! this.menu_is_disabled("Redo")) this.action_redo() }
    key_new() { if ( ! this.menu_is_disabled("New Game")) this.action_new() }
    key_restart() { if ( ! this.menu_is_disabled("Restart")) this.action_restart() }
    
    // dialogs
    get youlose() { return this.shadowRoot.getElementById('youlose') }
    get youwin() { return this.shadowRoot.getElementById('youwin') }

    youlose_undo() { this.youlose.close(); this.dialog_undo() }
    youlose_new() { this.youlose.close(); this.action_new() }
    youlose_restart() { this.youlose.close(); this.action_restart() }
    youwin_undo() { this.youwin.close(); this.dialog_undo() }
    youwin_new() { this.youwin.close(); this.action_new() }
    youwin_restart() { this.youwin.close(); this.action_restart() }

    dialog_undo() {
	this.menu_enable_disable(["New Game", "Restart", "Pause", "Hint", "Redo", "Scores", "Preferences"], ["Continue", "Undo"])
	this.action_undo()
    }

    // shared actions
    action_undo() { this.game.history_undo() }
    action_redo() { this.game.history_redo() }
    action_new() { this.game.new_game(); this.update_game(); }
    action_restart() { this.game.restart_game() }

    seedChanged(seed) { console.log("seedChanged: "+seed); }
}

window.customElements.define('mahjong-app', MahjongApp);

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
	    menu_undo_move: Boolean,
	    menu_redo_move: Boolean,
	    menu_new_game: Boolean,
	    menu_restart_game: Boolean,
	    tiles: Object
	}
    }

    _render({ seed, tiles, menu_undo_move, menu_redo_move, menu_new_game, menu_restart_game } ) {
	console.log("mahjong-app _render called");
	// Anything that's related to rendering should be done in here.
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
    position:absolute; top:8px; left:8px; width:30px;
  }
  div#toolbar-menu button {
    background-color: transparent;
    margin: 0 0; padding: 0 0; border: 0;
  }
  div#toolbar-menu button svg {
    stroke: white;
    fill: white;
    color: white;
    height: 24px; width 24px;
  }
  div#toolbar-menu button svg g {
    stroke: black; fill: black;
  }
  .definitions {
    display:none; 
  }
  /* this actually needs to switch when the aspect ratio goes from portrait to landscape
   * in portrait, display horizontally, in landscape, display vertically */
  /*
      @media (min-width: 460px) {
        div#toolbar-menu {
          display: block;
	  width: 100%;
        }
      }
  */
  button.tile { display:inline; margin: 0 0; padding: 0 0; border: 0; background-color: transparent; }
  button.tile g.bg { display:inline; }
  button.tile g.mg { display:none; }
  button.tile g.fg { display:inline; }
</style>

<div id="mahjong">${tiles.html_template()}</div>

<div id="toolbar-menu">
  <button id="new_game" on-click="${(e) => this.action_new(e)}" title="New Game" disabled?="{$menu_new_game}">
    ${Icons.newGame}</button>
  <button id="restart_game" on-click="${(e) => this.action_restart(e)}" title="Restart Game" disabled?="{$menu_restart_game}">
    ${Icons.restartGame}</button>
  <button id="undo_move" on-click="${(e) => this.action_undo(e)}" title="Undo Move" disabled?="{$menu_undo_move}">
    ${Icons.undoMove}</button>
  <button id="redo_move" on-click="${(e) => this.action_redo(e)}" title="Redo Move" disabled?="{$menu_redo_move}">
    ${Icons.redoMove}</button>
</div>
    
<dialog id="youlose" modal>
  <h2>There are no more moves.</h2>
  <p>Each puzzle has at least one solution.
    You can undo your moves and try to find the solution,
    start the game over,
    or start a new game.</p>
  <div class="buttons">
    <button raised dialog-confirm on-click="${(e) => this.dialog_undo(e)}">Undo</button>
    <button raised dialog-confirm on-click="${(e) => this.dialog_restart(e)}">Restart</button>
    <button raised dialog-confirm on-click="${(e) => this.dialog_new(e)}">New Game</button>
  </div>
</dialog>
      
<dialog id="youwin" modal>
  <h2>You have won the game</h2>
  <div class="buttons">
    <button raised dialog-confirm on-click="${(e) => this.dialog_undo(e)}">Undo</button>
    <button raised dialog-confirm on-click="${(e) => this.dialog_restart(e)}">Restart</button>
    <button raised dialog-confirm on-click="${(e) => this.dialog_new(e)}">New Game</button>
  </div>
</dialog>
`;
    }

    constructor() {
	super();
	// To force all event listeners for gestures to be passive.
	// See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
	setPassiveTouchGestures(true);
	
	this.menu_undo_move = false
	this.menu_redo_move = false
	this.menu_new_game = false
	this.menu_restart_game = false
	
	// tile layout
	this.layout = Layout(this);
	
	// tile images
	this.tiles = Tiles(this, this.layout)

	// game
	this.game = Game(this, this.layout, this.tiles, "")

	this.update_game();
    }

    ready() {
	super.ready()
	// window resize handler
	let self = this
	window.onresize = (e) => self.window_resize(e)

    }

    _firstRendered() {
	// this.window_resize(null)
    }

    _didRender(properties, changeList) {
	console.log(`_didRender changeList`); console.log(changeList)
    }

    _stateChanged(state) {
	console.log("mahjong-app enters _stateChanged");
    }
    
    update_game() {
	this.seed = this.game.get_seed();
	this._requestRender();
    }
    
    window_resize(e) { 
	// I want to do this by css transform:scale(...)
	// or by drawing the entire thing in svg and using svg transform
	this.game.window_resize(window.innerWidth, window.innerHeight);
	this._requestRender();
    }

    tile_tap(name) { this.game.tile_tap(name) }

    key_undo() { if ( ! this.game.menu_is_disabled("Undo")) this.action_undo() }
    key_redo() { if ( ! this.game.menu_is_disabled("Redo")) this.action_redo() }
    key_new() { if ( ! this.game.menu_is_disabled("New Game")) this.action_new() }
    key_restart() { if ( ! this.game.menu_is_disabled("Restart")) this.action_restart() }
    
    dialog_undo() {
	this.game.menu_enable_disable(["New Game", "Restart", "Pause", "Hint", "Redo", "Scores", "Preferences"], ["Continue", "Undo"])
	this.game.history_undo()
    }
    dialog_new() { this.game.new_game(); this.updateGame(); }
    dialog_restart() { this.game.restart_game() }

    action_undo() { this.game.history_undo() }
    action_redo() { this.game.history_redo() }
    action_new() { this.game.new_game(); this.update_game(); }
    action_restart() { this.game.restart_game() }

    seedChanged(seed) { console.log("seedChanged: "+seed); }
    
}

window.customElements.define('mahjong-app', MahjongApp);

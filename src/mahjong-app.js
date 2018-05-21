import { LitElement, html } from '@polymer/lit-element';

import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import { connect } from 'pwa-helpers/connect-mixin.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';

import { Icons } from './mahjong-icons.js';
import { Tiles } from './mahjong-tiles.js';
import { Layout } from './mahjong-layout.js';
import { Game } from './mahjong-game.js';

class MahjongApp extends (LitElement) {
    _render({root, layout, tiles}) {
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
        color: white;
      }
      div#toolbar-menu button svg {
	height: 24px; width 24px;
      }
      div#toolbar-menu button svg g {
	stroke: black; fill: black;
      }
      #mahjong button {
         margin: 0 0;
         padding: 0 0;
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
    </style>

    <div id="mahjong">
      ${Tiles.template}
    </div>

    <div id="toolbar-menu">
      <button id="new_game" on-tap="action_new" title="New Game" disabled>${Icons.newGame}</button>
      <button id="restart_game" on-tap="action_restart" title="Restart Game" disabled>${Icons.restartGame}</button>
      <button id="undo_move" on-tap="action_undo" title="Undo Move" disabled>${Icons.undoMove}</button>
      <button id="redo_move" on-tap="action_redo" title="Redo Move" disabled>${Icons.redoMove}</button>
    </div>
    
    <dialog id="youlose" modal>
      <h2>There are no more moves.</h2>
      <p>Each puzzle has at least one solution.
	You can undo your moves and try to find the solution,
	start the game over,
	or start a new game.</p>
      <div class="buttons">
	<button raised dialog-confirm on-tap="dialog_undo">Undo</button>
	<button raised dialog-confirm on-tap="dialog_restart">Restart</button>
	<button raised dialog-confirm on-tap="dialog_new">New Game</button>
      </div>
    </dialog>
      
    <dialog id="youwin" modal>
      <h2>You have won the game</h2>
      <div class="buttons">
	<button raised dialog-confirm on-tap="dialog_undo">Undo</button>
	<button raised dialog-confirm on-tap="dialog_restart">Restart</button>
	<button raised dialog-confirm on-tap="dialog_new">New Game</button>
      </div>
    </dialog>
    `;
  }

  static get properties() {
      return {
	  appTitle: String,
	  seed: {
	    type: String,
	    reflectToAttribute: true
	  },
	  keyEventTarget: {
              type: Object,
              value: () => document.body
	  }
      }
  }
    /*
    behaviors: [
	Polymer.IronA11yKeysBehavior
    ],
    */
    /*
    keyBindings: {
	'n': 'key_new',
	'o': 'key_restart',
	'r': 'key_redo',
	'u': 'key_undo',
	// 'p' : 'key_pause',
	// 'c' : 'key_continue',
	// 'h' : 'key_hint',
	// 'f' : 'key_prefs',
    },
    */
    constructor() {
	super();
	// To force all event listeners for gestures to be passive.
	// See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
	setPassiveTouchGestures(true);
	
	console.log("mahjong-app enters constructor");
	
	// tile layout
	this.layout = Layout(this);

	// tile images
	this.tiles = Tiles(this, this.layout)

	console.log("finished in mahjong-app constructor");
    }

    ready() {
	console.log("mahjong-app enters ready");

	// game
	this.game = Game(this, this.layout, this.tiles, "")

	// may need to create this.$.identifiers for hacking
	// may need to install on-tap handlers
	
	// window resize handler
	let self = this
	// window.onresize = function() { self.window_resize() }
	console.log("finished in mahjong-app ready");
    }

  _firstRendered() {
      // need to figure out how to dispatch to myself
      // installMediaQueryWatcher(`(min-width: 460px)`, (matches) => store.dispatch(updateLayout(matches)));
  }

  _didRender(properties, changeList) {
    if ('_page' in changeList) {
      const pageTitle = properties.appTitle + ' - ' + changeList._page;
      updateMetadata({
          title: pageTitle,
          description: pageTitle
          // This object also takes an image property, that points to an img src.
      });
    }
  }

  _stateChanged(state) {
  }
}

window.customElements.define('mahjong-app', MahjongApp);

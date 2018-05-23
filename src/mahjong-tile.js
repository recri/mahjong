/*
** to-ing and fro-ing about whether this is just an object
** or an actual custom-element.
**
** When you render a collection of elements with identifiers
** in a new order, do the nodes with the identifers remain 
** the same nodes?  Or do they get recreated from scratch
** so the getElementById has to be repeated.
**
** On the other hand, the element has its own style sheet
** which is easy to manipulate within the custom-element.
**
** Anyway, this source is wavering between opinions and
** not settled into either.
*/
import { html } from '@polymer/lit-element';

class MahjongTile {
    constructor(id, images, parent) {
	this.id = id;
	this.images = images;
	this.parent = parent;
	this.state = 'plain';	// hidden, plain, selected, or blank
	this.slot = [0,0,0];
	this.top = 0;
	this.left = 0;
	this.width = 64;
	this.height = 88;
    }

    _decode_state(state) {
	const button_display = state==='hidden' ? 'none' : 'inline';
	const bg_display = state!=='selected' ? 'inline' : 'none';
	const mg_display = state==='selected' ? 'inline' : 'none';
	const fg_display = state==='blank' ? 'none' : 'inline';
	return [button_display, bg_display, mg_display, fg_display];
    }

    _image_from_id(images, id) {
	return images[id.slice(0,-2)]
    }

    _render({ id, state, top, left, width, height, images } ) {
	const [ button_display, bg_display, mg_display, fg_display ] = this._decode_state(state)
	const tile_image = this._image_from_id(images, id);
	return html`
<style>
  button { display:${button_display}; margin: 0 0; padding: 0 0; border: 0; background-color: transparent; }
  svg { width:${width}; height:${height}
  .bg { display:${bg_display}; }
  .mg { display:${mg_display}; }
  .fg { display:${fg_display}; }
</style>

<button id="${id}" on-click=${(e) => this._tile_tap(e)}>
  <svg viewBox="0 0 64 88" width="${width}" height="${height}">
    <g class="bg">${images.plainTile}</g>
    <g class="mg">${images.selectedTile}</g>
    <g class="fg">${tile_image}</g>
  </svg>
</button>`;
    }

    constructor() {
	super();
	// To force all event listeners for gestures to be passive.
	// See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
	setPassiveTouchGestures(true);
	// initialize properties
	this.id = "blank-1";
	this.state = "plain";
	this.slot = [0,0,0];
	this.top = 0;
	this.left = 0;
	this.width = 64;
	this.height = 88;
    }

    ready() {
	super.ready()
    }

    _firstRendered() {
    }

    _didRender(properties, changeList) {
	this.position();
    }

    _tile_tap(e) { 
	this.parent.tile_tap(e.currentTarget.id)
    }
}

window.customElements.define('mahjong-tile', MahjongTile);

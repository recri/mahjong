import { html, svg } from 'lit-html/lib/lit-extended.js';
import { Images } from './mahjong-images.js'

export function Tiles(root, layout) {
    // tile sizes
    const tilew = 64				// tile image width
    const tileh = 88				// tile image height
    const offx = tilew / 10.0			// offset from left edge to tile face
    const offy = tileh / 11.0			// offset from bottom edge to tile face
    const facew = tilew - offx			// tile face width
    const faceh = tileh - offy			// tile face height

    // the list of tile identifiers, this gets reordered depending on how the game gets dealt
    let tiles = [].concat(
	Images.imageNames.map((id) => `${id}-1`),
	Images.imageNames.map((id) => `${id}-2`),
	Images.imageNames.map((id) => `${id}-3`),
	Images.imageNames.map((id) => `${id}-4`)
    )

    // the lit-html tile constructor
    // with styling incorporated inline
    // which must be redrawn for each render
    const tileMake = (id) =>  {
	return html`
<button class="tile" id="${id}" on-click=${(e) => root.tile_tap(e.currentTarget.id)}>
  <svg viewBox="0 0 64 88">
    <g class="bg">${Images.plainTile}</g>
    <g class="mg">${Images.selectedTile}</g>
    <g class="fg">${Images[id.slice(0,-2)]}</g>
  </svg>
</button>`;
    }
    // the following five functions depend on the tile html structure
    // <button id="name"><svg><g></g><g></g><g></g></svg></button>
    // the 3 <g>'s are plain background tile, selected background, foreground
    const extractTemplate = (name) => {
	if (root && root.shadowRoot && root.shadowRoot.getElementById) {
	    const elt = root.shadowRoot.getElementById(name)
	    if (elt && elt.children && elt.children.length === 1) {
		const svg = elt.children[0];
		if (svg && svg.children && svg.children.length === 3) {
		    const g = svg.children
		    return [elt, svg, g[0], g[1], g[2]]
		}
	    }
	}
	return [null,null,null,null,null]
    }
    const updatePosition = (name, left, top) => {
	const [elt, svg, g0, g1, g2] = extractTemplate(name);
	if (elt) {
	    elt.style.position = "absolute";
	    elt.style.left = left;
	    elt.style.top = top;
	}
    }
    const updateDisplay = (name, display) => {
	const [elt, svg, g0, g1, g2] = extractTemplate(name);
	if (elt) {
	    elt.style.display = display
	}
    }
    const updateSize = (name, width, height) => {
	const [elt, svg, g0, g1, g2] = extractTemplate(name);
	if (elt) {
	    svg.style.width = width
	    svg.style.height = height
	}
    }
    const updateSubdisplay = (name, subdisplay) => {
	const [elt, svg, g0, g1, g2] = extractTemplate(name);
	if (elt) {
	    switch (subdisplay) {
	    case 'plain':
		g0.style.display = 'inline';
		g1.style.display = 'none';
		g2.style.display = 'inline';
		break;
	    case 'selected':
		g0.style.display = 'none';
		g1.style.display = 'inline';
		g2.style.display = 'inline';
		break;
	    case 'blank':
		g0.style.display = 'inline';
		g1.style.display = 'none';
		g2.style.display = 'none';
		break;
	    }
	}
    }

    // these are the variables which get adjusted on window resize
    let scale = 1.0, offsetx = 0.0, offsety = 0.0;

    let self = {
	html_template : () => html`${tiles.map((id) => tileMake(id))}`,
	get_tiles : () => tiles,
	match : (name1, name2) => name1.substring(0,name1.length-2) === name2.substring(0,name2.length-2),

	position : function(slot, name) {
	    const [x,y,z] = slot
	    const sx = (x+0.1)*facew + z*offx
	    const sy = (y+0.3)*faceh - z*offy
	    const left = Math.floor(scale*sx+offsetx)+"px"
	    const top = Math.floor(scale*sy+offsety)+"px"
	    updatePosition(name, left, top)
	},
	draw : function(slot, name) {
	    this.position(slot, name)
	    updateDisplay(name, "inline")
	},
	show : function(slot, name, tag) {
	    updateSubdisplay(name, tag)
	},
	hide : function(slot, name) {
	    if (name != null) {
		updateDisplay(name, "none")
	    } else {
		// verify that this guard is necessary
	    }
	},
	reorder : function(neworder) {
	    tiles = neworder
	},
	
	sizes : () => [tilew, tileh, offx, offy, facew, faceh],

	resize : function(wiw, wih) {
	    // console.log("tiles.resize")
	    // need to resize and reposition all tiles to fit the new height and width
	    // 1. compute the scale, which is the same for x and y, 
	    let [layout_width, layout_height] = layout.sizes()
	    layout_width+=0.2
	    layout_height+=0.4
	    let scalex = wiw / (layout_width * facew + offx)
	    let scaley = wih / (layout_height * faceh + offy)
	    scale = Math.min(scalex, scaley)
	    // 2. compute the offset for x and y which center the smaller dimension of
	    // the layout in the window, the larger dimension has offset = 0
	    offsetx = (wiw - scale * (layout_width * facew + offx)) / 2
	    offsety = (wih - scale * (layout_height * faceh + offy)) / 2
	    // 3. apply the scale to the svg elements for each tile
	    // let transform = "scale("+scale+")"
	    let svg_width = (scale*tilew).toFixed(2)
	    let svg_height = (scale*tileh).toFixed(2)
	    // ? svg_width, svg_height coerce to limited precision
	    // ? svg_width, svg_height specify units
	    for (let t of tiles) { 
		updateSize(t, svg_width, svg_height)
	    }
	    // 4. apply the scale and offsets to the positioning of each element
	    // done outside where the slots for each tile are known
	}, 
    }
    
    /*** this resize maybe better done later? ***/
    self.resize(window.innerWidth, window.innerHeight)
    return self
}

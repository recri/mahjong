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

    // the list of tile identifiers
    //const tiles = Object.keys(Images.images).map((id) => [1,2,3,4].map((nth) => `${id}-${nth}`));
    const flatten = (x) => x[0].concat(x[1], x[2], x[3]);
    const tiles = flatten([1,2,3,4].map((nth) => Object.keys(Images.images).map((id) => `${id}-${nth}`)));
    // the lit-html tile constructor
    const makeTile = (id, nth) => html`
      <button id="${id}-${nth}">
	<svg id="${id}-${nth}-svg" viewBox="0 0 ${tilew} ${tileh}" width="${tilew}" height="${tileh}">
	  <g id="${id}-${nth}-bg">${Images.plainTile}</g>
	  <g id="${id}-${nth}-fg">${Images.images["$id"]}</g>
	</svg>
      </button>
    `;

    const makeFourTiles = (id) => html`${[1,2,3,4].map((nth) => makeTile(id, nth))}`;

    const allTiles = html`${Object.keys(Images.images).map((id) => makeFourTiles(id))}`;

    // these are the variables which get adjusted on window resize
    let scale = 1.0, offsetx = 0.0, offsety = 0.0


    let self = {
	template : () => allTiles,
	get_tiles : () => tiles,
	match : (name1, name2) => name1.substring(0,name1.length-2) === name2.substring(0,name2.length-2),
	position : function(slot, name) {
	    let [x,y,z] = slot
	    sx = (x+0.1)*facew + z*offx
	    sy = (y+0.3)*faceh - z*offy
	    root.$[name].style.position = "absolute"
	    root.$[name].style.left = Math.floor(scale*sx+offsetx)+"px"
	    root.$[name].style.top = Math.floor(scale*sy+offsety)+"px"
	},
	draw : function(slot, name) {
	    this.position(slot, name)
	    root.$[name].style.display = ""
	},
	show : function(slot, name, tag) {
	    if (tag == "blank") {
		root.$[name+"-fg"].style.display = ""
		root.$[name+"-bg"].setAttribute("href", "#plain-tile")
	    } else {
		root.$[name+"-fg"].style.display = ""
		root.$[name+"-bg"].setAttribute("href", "#"+tag+"-tile")
	    }
	},
	hide : function(slot, name) {
	    if (name != null) {
		root.$[name].style.display = "none"
	    }
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
	    let svg_width = scale*tilew
	    let svg_height = scale*tileh
	    for (let t of tiles) { 
		root.$[t+"-svg"].setAttribute("width", svg_width)
		root.$[t+"-svg"].setAttribute("height", svg_height)
		// root.$[t+"-bg"].setAttribute("transform", transform)
		// root.$[t+"-fg"].setAttribute("transform", transform)
	    }
	    // 4. apply the scale and offsets to the positioning of each element
	    // done outside where the slots for each tile are known
	}, 
    }
    
    // direct tile tap handler, extracts tile identifier from event target
    // well, currentTarget, because target is an svg element
    function tile_tap(event) { root.tile_tap(event.currentTarget.id) }
    
    // tile creator
    function tile_create(id, image) {
	// let tile = document.createElement("paper-button")
	// let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	// let bg = document.createElementNS("http://www.w3.org/2000/svg", "use")
	// let fg = document.createElementNS("http://www.w3.org/2000/svg", "use")

	// tile.id = id
	// svg.id = id+"-svg"
	// bg.id = id+"-bg"
	// fg.id = id+"-fg"

	// bg.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#"+"plain-tile")
	// fg.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#"+image)

	// tile.appendChild(svg)
	// svg.setAttribute("viewBox", "0 0 "+tilew+" "+tileh)
	// svg.setAttribute("width", tilew)
	// svg.setAttribute("height", tileh)
	// svg.appendChild(bg)
	// svg.appendChild(fg)
	// root.$.mahjong.appendChild(tile)
	
	/*** these identifiers cannot be set up, but maybe they come for free?
	root.$[bg.id] = bg
	root.$[fg.id] = fg
	root.$[svg.id] = svg
	root.$[id] = tile
	***/
	/*** this is a paper-button thing
	root.$[id].noink = true
	***/
	/*** not sure how this works now
	root.$[id].addEventListener("tap", tile_tap)
	***/
	return id
    }

    /*** already done
    // create the tiles
    for (let t of images) { 
	for (let i of [1,2,3,4]) {
	    tiles.push(tile_create(t+"-"+i, t))
	}
    }
    ***/
    /*** this resize maybe better done later
    ***/
    // self.resize(window.innerWidth, window.innerHeight)
    return self
}

export function Layout(root) {
    // the layout map
    const map = [
	// layer z == 0
	{type: "tile", z: 0, x: 10, y: 3 },
	
	{type: "block", z: 0, left: 8.5, right: 9.5, top: 0.5, bottom: 1.5},
	{type: "block", z: 0, left: 8.0, right: 9.0, top: 2.5, bottom: 3.5},
	{type: "block", z: 0, left: 8.5, right: 9.5, top: 4.5, bottom: 5.5},
	
	{type: "row", z: 0, y: 0, left: 3, right: 7},
	{type: "row", z: 0, y: 1, left: 2.5, right: 7.5},
	{type: "block", z: 0, left: 3.0, right: 7.0, top: 2.0, bottom: 4.0},
	{type: "row", z: 0, y: 5, left: 2.5, right: 7.5},
	{type: "row", z: 0, y: 6, left: 3, right: 7},
	
	{type: "block", z: 0, left: 0.5, right: 1.5, top: 0.5, bottom: 1.5},
	{type: "block", z: 0, left: 1.0, right: 2.0, top: 2.5, bottom: 3.5},
	{type: "block", z: 0, left: 0.5, right: 1.5, top: 4.5, bottom: 5.5},
	
	{type: "tile", z: 0, y: 3, x: 0},

	// layer z == 1
	{type: "tile", z: 1, x: 6.5, y: 0},
	
	{type: "row", z: 1, left: 7, right: 9, y: 1},
	{type: "block", z: 1, left: 7.5, top: 2, right: 8.5, bottom: 4},
	{type: "row", z: 1, left: 7, right: 9, y: 5},
	
	{type: "tile", z: 1, x: 6.5, y: 6},
	
	{type: "row", z: 1, y: 0.5, left: 4.5, right: 5.5},
	{type: "row", z: 1, y: 1.5, left: 4, right: 6},
	{type: "block", z: 1, top: 2.5, left: 3.5, bottom: 3.5, right: 6.5},
	{type: "row", z: 1, y: 4.5, left: 4, right: 6},
	{type: "row", z: 1, y: 5.5, left: 4.5, right: 5.5},
	
	{type: "tile", z: 1, x: 3.5, y: 0},
	
	{type: "row", z: 1, left: 1, right: 3, y: 1},
	{type: "block", z: 1, left: 1.5, top: 2, right: 2.5, bottom: 4},
	{type: "row", z: 1, left: 1, right: 3, y: 5},
	
	{type: "tile", z: 1, y: 6, x: 3.5},

	// layer z == 2
	{type: "row", z: 2, y: 2, left: 2.5, right: 7.5},
	{type: "row", z: 2, y: 3, left: 2, right: 8},
	{type: "row", z: 2, y: 4, left: 2.5, right: 7.5},

	// layer z == 3
	{type: "tile", z: 3, x: 7.5, y: 3},
	{type: "block", z: 3, left: 3.5, right: 6.5, top: 2.5, bottom: 3.5},
	{type: "tile", z: 3, x: 2.5, y: 3},

	// layers z == 4, 5, and 6
	{type: "row", z: 4, y: 3, left: 4, right: 6},
	{type: "row", z: 5, y: 3, left: 4.5, right: 5.5},
	{type: "tile", z: 6, y: 3, x: 5},
    ];
    
    // better to just use [x,y,z] = slot
    function slot_x(slot) { return slot[0] }
    function slot_y(slot) { return slot[1] }
    function slot_z(slot) { return slot[2] }
    function slot_string(slot) { return slot.join(",") }
    function xy_set_string(set) { return "["+set.map((s) => slot_string(s.slice(0,2))).join("; ")+"]" }
    function slot_set_string(set) { return "["+set.map((s) => slot_string(s)).join("; ")+"]" }

    let slots = []
    let layers = []
    let width = 11
    let height = 7

    let layout = {
	// as a associative array over list values, uses the list pointer as index, cough, cough
	layout: new Map(),
	set: function(xyz, tag, val) {
	    if ( ! this.layout.has(xyz)) this.layout.set(xyz, new Map([["slot", null]]));
	    this.layout.get(xyz).set(tag, val);
	},
	get: function(xyz, tag) {
	    return this.layout.get(xyz).get(tag)
	},
	exists: function(xyz, tag) {
	    return this.layout.has(xyz) && this.layout.get(xyz).has(tag)
	},
	contains: function(xyz, tag, val) {
	    if ( ! this.exists(xyz, tag)) this.set(xyz, tag, [])
	    return this.get(xyz,tag).indexOf(val) >= 0
	},
	lappend: function(xyz, tag, val) {
	    if ( ! this.exists(xyz, tag)) this.set(xyz, tag, [])
	    this.get(xyz,tag).push(val);
	},
	string : (xyz) => slot_string(xyz),
	// maintaining the primary slot in the layout
	// this is the only one that changes after the layout is setup
	// note that slot is always xyz
	set_slot : function(slot, val) { this.set(slot, "slot", val) },
	get_slot : function(slot) { return this.get(slot, "slot") },
	exists_slot : function(slot) { return this.exists(slot, "slot") },
	set_empty : function(slot) { this.set_slot(slot, null) },
	is_empty : function(slot) { return this.get_slot(slot) == null },
	is_filled : function(slot) { return this.get_slot(slot) != null },
	is_endcap : function(xyz) { return this.get(xyz, "endcap") },
	is_naked_endcap : function(xyz) { return this.get(xyz, "naked-endcap") },

	// get all of the slots in render order
	// ie, those which are obscured are drawn before those which obscure
	get_slots : function() { return slots },
	// find the slots in a z layer in render order
	layer_slots : function(z) { return layers[z] || [] },
	// expand the layout map description
	expand_layout : function(part) {
	    if (part.type === "tile") {
		let row = [this.add_tile(part.x, part.y, part.z)]
		this.add_row(row)
		this.add_block(row)
	    } else if (part.type === "row") {
		let row = []
		for (let x = part.right; x >= part.left; x -= 1) {
		    row.push(this.add_tile(x, part.y, part.z))
		}
		this.add_row(row)
		this.add_block(row)
	    } else if (part.type === "block") {
		let block = []
		for (let y = part.top; y <= part.bottom; y += 1) {
		    let row = []
		    for (let x = part.right; x >= part.left; x -= 1) {
			row.push(this.add_tile(x, y, part.z))
		    }
		    this.add_row(row)
		    for (let t of row) block.push(t)
		}
		this.add_block(block)
	    } else { 
		throw("what is "+ part.type +" doing in the map?")
	    }
	},

	// add the list of slots in a row
	add_row : function(row) { for (let slot of row) this.set(slot, "row", row) },
	// add the list of slots in a block
	add_block : function(block) { for (let slot of block) this.set(slot, "block", block) },
	// mark two cells as x-adjacent, need x-left-adjacent and x-right-adjacent, too
	add_x_adjacent : function (xyz, xnynzn) { this.add_symmetric("x-adjacent", xyz, xnynzn) },
	// record a symmetric relation
	add_symmetric : function(relation, slot1, slot2) {
	    if ( ! this.contains(slot1, relation, slot2)) { this.lappend(slot1, relation, slot2) }
	    if ( ! this.contains(slot2, relation, slot1)) { this.lappend(slot2, relation, slot1) }
	},
	// an antisymmetric relation
	add_left_adjacent : function(slot1, slot2) {
	    if ( ! this.contains(slot1, "left-adjacent", slot2)) { this.lappend(slot1, "left-adjacent", slot2) }
	    if ( ! this.contains(slot2, "right-adjacent", slot1)) { this.lappend(slot2, "right-adjacent", slot1) }
	},
	add_right_adjacent : function(slot1, slot2) { this.add_left_adjacent(slot2, slot1) },
	
	// add a new tile to the layout
	add_tile : function(x, y, z) {
	    // canonicalize the coordinates
	    // trouble with x, y in double vs integer as dictionary keys
	    // set x [expr {double($x)}]
	    // set y [expr {double($y)}]
	    // set z [expr {int($z)}]
	    // if {$options(-verbose) > 5} { puts "add-tile $x $y $z" }
	    let xyz = [x, y, z]
	    // initialize slot
	    this.set_slot(xyz, null)
	    for (let [tag, val] of [
		["z-shadow", []],
		["x-adjacent", []],
		["x-closure", []],
		["left-adjacent", []],
		["right-adjacent", []],
		["endcap", false],
		["naked-endcap", false],
		["triple-point", false],
		["row-closure", []],
		["left-closure", []],
		["right-closure", []]
	    ]) {
		this.set(xyz, tag, val)
	    }
	    slots.push(xyz)
	    if (z >= layers.length) layers.push([])
	    layers[z].push(xyz)
	    return xyz
	},

	slots_to_string : function(ss) {
	    return "["+ss.map(s => s.join(",")).join("][")+"]"
	},
	// find a slot with the given x, y, z
	// we use slots, the array of x, y, z coordinates, as a unique identifier
	// so a new array of the same x, y, z does not register as equal
	find_slot : function(x1,y1,z1) {
	    function slot_equal(s) {
		let [x2,y2,z2] = s
		let abs = (x) => Math.abs(x)
		return abs(x1-x2) < 0.25 && abs(y1-y2) < 0.25
	    }
	    for (let s of layers[z1]) if (slot_equal(s)) return s
	    return null
	},
	// compute the x-adjacent set of the tile
	compute_x_adjacent : function(xyz) {
	    let [x, y, z] = xyz
	    for (let dx of [-1, 1]) {
		let xn = x+dx
		for (let dy of [-0.5, 0, 0.5]) {
		    let yn = y+dy
		    let xnynzn = this.find_slot(xn, yn, z)
		    if (xnynzn == null) continue
		    if ( ! this.exists_slot(xnynzn)) continue
		    this.add_x_adjacent(xyz,xnynzn)
		    if (xn-x < 0) this.add_left_adjacent(xyz, xnynzn)
		    else this.add_right_adjacent(xyz, xnynzn)
		}
	    }
	    if (this.left_adjacent(xyz).length == 0 || this.right_adjacent(xyz).length == 0) {
		this.set(xyz, "endcap", true)
		if ( ! this.is_covered_in_z(xyz)) this.set(xyz, "naked-endcap", true)
	    }
	    if (this.left_adjacent(xyz).length == 2) {
		// make an llr triple point
		let llr = this.left_adjacent(xyz).concat([xyz])
		this.set(llr[0], "triple-point", true)
		this.set(llr[0], "triple-point-llr", ["l1"].concat(llr))
		this.set(llr[1], "triple-point", true)
		this.set(llr[1], "triple-point-llr", ["l2"].concat(llr))
		this.set(llr[2], "triple-point", true)
		this.set(llr[2], "triple-point-llr", ["r"].concat(llr))
	    }
	    if (this.right_adjacent(xyz).length == 2) {
		// make an lrr triple point
		let lrr = [xyz].concat(this.right_adjacent(xyz))
		this.set(lrr[0], "triple-point", true)
		this.set(lrr[0], "triple-point-lrr", ["l"].concat(lrr))
		this.set(lrr[1], "triple-point", true)
		this.set(lrr[1], "triple-point-lrr", ["r1"].concat(lrr))
		this.set(lrr[2], "triple-point", true)
		this.set(lrr[2], "triple-point-lrr", ["r2"].concat(lrr))
	    }
	},
	is_triple_point: function(xyz) { return this.get(xyz, "triple-point") },
	triple_point_eval : function(xyz) {
	    if (this.exists(xyz, "triple-point-llr")) {
		let [t, l1, l2, r] = this.get(xyz, "triple-point-llr")
		let cl1 = this.all_empty(this.left_closure(l1))
		let cl2 = this.all_empty(this.left_closure(l2))
		let cr = this.all_empty(this.right_closure(r))
		if (cr) {
		    if (cl1 && this.is_filled(l2)) {
			return t === "l1" || t === "r"
		    } else if (this.is_filled(l1) && cl2) {
			return t === "l2" || t === "r"
		    }
		}
	    }
	    if (this.exists(xyz, "triple-point-lrr")) {
		[t,l,r1,r2] = this.get(xyz, "triple-point-lrr")
		let cl = this.all_empty(this.left_closure(l))
		let cr1 = this.all_empty(this.right_closure(r1))
		let cr2 = this.all_empty(this.right_closure(r2))
		if (cl) {
		    if (cr1 && this.is_filled(r2)) {
			return t === "l" || t === "r1"
		    } else if (this.is_filled(r1) && cr2) {
			return t === "l" || t === "r2"
		    }
		}
	    }
	    return false
	},
	// a relation is a list of slots which are so related
	// sort into z layers, then by x, then by y
	sort_slots : function(rel) {
	    return rel.sort((a,b) => (a[2] != b[2] ? a[2]-b[2] : a[0] != b[0] ? a[0]-b[0] : a[1]-b[1]))
	},
	// join two relations, simply eliminate duplicates
	join_relation : function(r1, r2) {
	    return this.sort_slots(r1.concat(r2.filter(s => r1.indexOf(s) < 0)))
	},
	// find the z-shadow cast by this tile on the next layer
	compute_z_shadow : function(xyz) {
	    let [x,y,z] = xyz
	    let shadow = []
	    if (z > 0) {
		let x0 = x-0.5
		let x1 = x+0.5
		let y0 = y-0.5
		let y1 = y+0.5
		for (let slot of this.layer_slots(z-1)) {	
	    let [nx,ny,nz] = slot
		    if ((Math.min(x1,nx+0.5)-Math.max(x0,nx-0.5)) > 0 
			&& (Math.min(y1,ny+0.5)-Math.max(y0,ny-0.5)) > 0) {
			shadow.push(slot)
		    }
		}
	    }
	    this.set(xyz, "z-shadow", shadow)
	},
	compute_x_closure : function(xyz) {
	    if (this.get(xyz, "x-closure").length == 0) {
		let x_closure = this.compute_relation_closure(xyz, "x-adjacent")
		for (let slot of x_closure) {
		    this.set(slot, "x-closure", x_closure)
		}
	    }
	},
	compute_relation_closure : function(xyz, relation) {
	    let closure = new Map()
	    let level = 1
	    closure.set(xyz, level)
	    let found = 1
	    while (found != 0) {
		found = 0
		level += 1
		for (let slot of closure.keys()) {
		    if (closure.get(slot) != level-1) continue
		    for (let s of this.get(slot, relation)) {
			if ( ! closure.has(s)) {
			    found += 1
			    closure.set(s, level)
			}
		    }
		}
	    }
	    // unset closure($xyz)
	    return this.sort_slots(Array.from(closure.keys()))
	},
	// compute the row closure of a slot
	compute_row_closure : function(xyz) {
	    let left_closure = this.compute_relation_closure(xyz, "left-adjacent")
	    let right_closure = this.compute_relation_closure(xyz, "right-adjacent")
	    let row_closure = this.join_relation(left_closure, right_closure)
	    this.set(xyz, "row-closure", row_closure)
	    this.set(xyz, "left-closure", left_closure)
	    this.set(xyz, "right-closure", right_closure)
	},
	// accessors
	z_shadow : function(xyz) { return this.get(xyz, "z-shadow") },
	x_adjacent : function(xyz) { return this.get(xyz, "x-adjacent") },
	x_closure : function(xyz) { return this.get(xyz, "x-closure") },
	left_adjacent : function(xyz) { return this.get(xyz, "left-adjacent") },
	right_adjacent : function(xyz) { return this.get(xyz, "right-adjacent") },
	block : function(xyz) { return this.get(xyz, "block") },
	row : function(xyz) { return this.get(xyz, "row") },
	row_closure : function(xyz) { return this.get(xyz, "row-closure") },
	left_closure : function(xyz) { return this.get(xyz, "left-closure") },
	right_closure : function(xyz) { return this.get(xyz, "right-closure") },
	// number of empty slots, all filled, or all empty
	number_empty : function(slots) { return slots.map(s => (this.is_empty(s) ? 1 : 0)).reduce((a,b) => (a+b), 0) },
	all_filled : function(slots) { return this.number_empty(slots) === 0 },
	all_empty : function(slots) { return this.number_empty(slots) === slots.length },
	any_filled : function(slots) { return this.number_empty(slots) < slots.length },
	// well known slot sets all filled or all empty
	any_filled_x_adjacent : function(xyz) { return this.any_filled(this.x_adjacent(xyz)) },
	all_filled_left_adjacent : function(xyz) { return this.all_filled(this.left_adjacent(xyz)) },
	all_filled_right_adjacent : function(xyz)  { return this.all_filled(this.right_adjacent(xyz)) },
	all_empty_left_adjacent : function(xyz) { return this.all_empty(this.left_adjacent(xyz)) },
	all_empty_right_adjacent : function(xyz) { return this.all_empty(this.right_adjacent(xyz)) },
	// can a slot be played
	can_play : function(slot) {
	    // cannot play an empty slot
	    if (this.is_empty(slot)) { return false }
	    // cannot play if covered in z
	    if (this.is_covered_in_z(slot)) { return false }
	    // cannot play if covered in x
	    if (this.is_covered_in_x(slot)) { return false }
	    return true
	},
	is_covered_in_z : function(slot) {
	    let [x,y,z] = slot
	    for (let s of this.layer_slots(z+1)) {
		if (this.is_filled(s) && this.z_shadow(s).indexOf(slot) >= 0) {
		    return true
		}
	    }
	    return false
	},
	is_covered_in_x : function(slot) {
	    if (this.is_endcap(slot)) { return false }
	    if (this.all_empty_left_adjacent(slot)) { return false }
	    if (this.all_empty_right_adjacent(slot)) { return false }
	    return true
	},
	// can a slot be unplayed
	can_unplay : function(slot, donotblock=false) {
	    // cannot unplay a filled slot
	    if ( ! this.is_empty(slot)) { return false }
	    // cannot unplay a slot over an empty slot in z
	    if (this.covers_empty_in_z(slot)) { return false }
	    // cannot unplay a slot over an empty slot in x
	    if (this.covers_empty_in_x(slot)) { return false }
	    // if donotblock is present, do not play next to or over it
	    if (donotblock) {
		// this was once the last bug in the game generator, if you
		// choose the two slots to unplay independently, then
		// the second can block the first, to be a legal unplay
		// you have to be able to play the slots in either order
		if (this.blocks_in(slot, donotblock)) { return false }
	    }
	    // that was the last bug, but there is another. it is possible to
	    // unplay legal moves to a deadlock. so I need to look ahead to
	    // choose the best unplayable, or somehow finesse the problem
	    return true
	},
	//
	covers_empty_in_z : function(slot) {
	    return this.z_shadow(slot).some((s) => (this.is_empty(s)))
	},
	//
	covers_empty_in_x : function(slot) {
	    // Each x-adjacent-closure shall start in one compartment
	    // there are ways that multiple seeds could start in 
	    // different rows in the compartment and grow together
	    // but the growth cannot cross a boundary between different 
	    // numbers of rows except when the crossing into row(s) is(are)
	    // completely covered by the crossing out of row(s)
	    let x = this.x_closure(slot)
	    let n = x.length
	    let ne = x.map((s) => (this.is_empty(s)?1:0)).reduce((a,b)=>(a+b))
	    // entirely empty, any slot will do
	    if (ne === n) { return false }
	    // one slot left, it will do
	    if (ne == 1) { return false }
	    // if it is an endcap slot
	    if (this.is_endcap(slot)) {
		// all neighbors filled, it will do else wait until they're filled
		return ! (this.all_filled(this.x_adjacent(slot)))
	    }
	    // this block is empty, but the closure is not empty
	    if (this.all_empty(this.block(slot))) {
		// if all our neighbors to one side are filled, then okay, else not
		if (this.all_filled_left_adjacent(slot)) { return false }
		if (this.all_filled_right_adjacent(slot)) { return false }
		return true
	    }
	    // this block is not empty
	    // this row, and its extensions into adjoining blocks are all empty
	    // this is the key, isn't it?
	    if (this.all_empty(this.row_closure(slot))) {
		// if we are in a block that contains filled slots
		// but a row that is empty, then any slot in the row
		// is acceptable, but only if the rows connected to this
		// row in the closure are empty, too.
		return false
	    } else {
		// if we are in a row closure that contains filled slots
		// then if we are adjacent to a filled slot, okay,
		// else not okay
		if (this.all_filled_left_adjacent(slot)) {
		    return false
		} else if (this.all_filled_right_adjacent(slot)) {
		    return false
		} 
		// if there is a junction where two slots are x-adjacent to one slot,
		// and one of the two slots filled,
		// and the outward row closure empty for the other two slots
		// then the other two slots may be unplayed onto
		if (this.is_triple_point(slot) && this.triple_point_eval(slot)) {
		    return false
		}
		return true
	    }
	    alert("failed to classify case")
	},
	// does slot $sl1 block in slot $sl2
	blocks_in : function(sl1, sl2) {
	    // sl1 is on top of sl2 and blocks it in
	    if (this.z_shadow(sl1).indexOf(sl2) >= 0) {
		return true
	    }
	    // sl1 is not next to sl2
	    if (this.x_adjacent(sl1).indexOf(sl2) < 0) {
		return false
	    }
	    // sl2 is free on the other side
	    if (this.is_endcap(sl2)) {
		return false
	    }
	    // sl1 is to the left of sl2
	    if (this.left_adjacent(sl2).indexOf(sl1) >= 0) {
		// and there is nothing to the right
		return ! this.all_empty_right_adjacent(sl2)
	    }
	    // sl1 is to the right of sl2
	    // and there is nothing to the left
	    return ! this.all_empty_left_adjacent(sl2)
	},
	sizes : () => [width, height],
    }
    for (let part of map) {
	layout.expand_layout(part)
    }
    for (let slot of slots) {
	layout.compute_x_adjacent(slot)
	layout.compute_z_shadow(slot)
    }
    for (let slot of slots) {
	layout.compute_x_closure(slot)
	layout.compute_row_closure(slot)
    }
    return layout
}


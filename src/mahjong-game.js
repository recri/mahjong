import { alea } from './alea.js';
import { Timer } from './timer.js';

//
// actual external references into game
// get_seed()
// window_resize(w, h)
// tile_tap(name)
// history_undo()
// history_redo()
// new_game()
// restart_game()
//
export function Game(root, layout, tiles, seed) {
    // local variables
    let title = "mahjong"
    let shuffled_tiles = null
    let shuffled_slots = null
    let remaining_moves = 0
    let remaining_tiles = 0
    let paused = false
    let hint = -1
    let scores = []
    let history = {}
    let selected = null
    let status_started = false
    let name_to_slot = new Map()
    let timer = new Timer()
    // local functions
    let random = alea("this is the seed").double

    function srandom(seed) { random = alea(seed).double }

    function shuffle(list) {
	list = list.slice(0)
	let n = list.length
	for (let i = 0; i < n; i += 1) {
	    let j = i + Math.floor(random()*(n-i))
	    if (i != j) {
		let li = list[i]
		let lj = list[j]
		list[i] = lj
		list[j] = li
	    }
	}
	return list
    }
    
    function slot_string(slot) { return slot.join(",") }

    function format_game (game) {
	let format = []
	let a = 'a'.charCodeAt(0)
	while (game >= 1) {
	    format.push(String.fromCharCode(Math.floor(game % 26)+a))
	    game = game / 26
	}
	return format.reverse().join('')
    }

    function slot_distance(slot1, slot2) {
	let [x1,y1,z1] = slot1, [x2,y2,z2] = slot2
	let sqr = (x) => x*x
	return sqr(x1-x2)+sqr(y1-y2)+sqr(z1-z2)
    }
    function move_distance(slot1, slot2, slot3) {
	return slot_distance(slot1, slot2)+slot_distance(slot1, slot3)
    }
    
    let game = {
	// options 
	trace: false,
	infinite: false,
	watch: true,
	raw_deal: true,
	zoomed: true,
	fullscreen: true,

	// delegated to slots
	// set_slot : (slot, name) =>  layout.set_slot(slot, name),
	// set_empty : (slot) => layout.set_empty(slot),
	// layer_slots : (z) => layout.layer_slots(z),
	// is_endcap : (slot) => layout.is_endcap(slot),
	is_naked_endcap : (slot) => layout.is_naked_endcap(slot),
	// z_shadow : (slot) => layout.z_shadow(slot),
	// x_adjacent : (slot) => layout.x_adjacent(slot),
	can_unplay : (slot, donotblock) => layout.can_unplay(slot, donotblock),
	can_play : (slot) => layout.can_play(slot),

	// delegated to tiles
	get_tiles : () => tiles.get_tiles(),
	match : (a,b) => tiles.match(a,b),
	draw : (slot, name) => tiles.draw(slot, name),
	show : (slot, name, tag) => tiles.show(slot, name, tag),
	hide : (slot, name) => tiles.hide(slot, name),
	reorder : (neworder) => tiles.reorder(neworder),
	
	// recreate mahjong::canvas
	set_name_slot : (name, slot) => name_to_slot.set(name, slot),
	get_name_slot : (name) => name_to_slot.get(name),
	set_slot_name : (slot,name) => layout.set_slot(slot,name),
	get_slot_name : (slot) => layout.get_slot(slot),
	is_empty_slot : (slot) => layout.is_empty(slot),
	get_all_slots : () => layout.get_slots(),
	get_remaining_tiles : () => tiles.get_tiles().filter((name) => (name_to_slot.get(name) !== null)),
	tile_sizes : () => tiles.sizes(),
	layout_sizes : () => layout.sizes(),
	xy_for_slot : (slot) => tiles.xy_for_slot(slot),


	first_game : function() {
	    this.new_game()
	},
	new_game : function() {
	    this.setup()
	    for (let done = false; ! done; ) {
		done = true
		try {
		    this.restart()
		} catch(e) {
		    console.log("restart failed: "+e)
		    console.log(e.stack)
		    // return	// remove me when debugged
		    console.log("reshuffling and retrying")
		    shuffled_slots = shuffle(shuffled_slots)
		    done = false
		}
	    }
	},
	restart_game : function() { this.restart() },

	//
	// game play helpers
	//
	get_items : function() { return this.items },
    
	sort_matching : function(names) {
	    names = names.slice(0)	// avoid overwriting
 	    let sort = []
 	    while (names.length > 0) {
 		let name1 = names.shift()
		if (name1 == null) continue
		sort.push(name1)
		for (let n2 = 0; n2 < names.length; n2 += 1) {
		    let name2 = names[n2]
		    if (name2 == null) continue
		    if (this.match(name1, name2)) {
			sort.push(name2)
			names[n2] = null
 			break
 		    }
 		}
 	    }
	    // $self trace-puts [lmap i $sort {$self item-to-name $i}]
 	    return sort
	},
    
	sort_fertility : function(slots) {
	    let plain = []
	    let endcaps = []
	    for (let slot of slots) {
		if (this.is_naked_endcap(slot)) {
		    endcaps.push(slot)
		} else {
		    plain.push(slot)
		}
	    }
	    return plain.concat(endcaps)
	},

	// did this by rewriting the dom, now ask tiles to reorder its list
	raise_in_render_order : function() {
	    // presuming that get_all_slots() returns slots in render order
	    let neworder = this.get_all_slots().reduce((acc, slot) => {
		let tile = this.get_slot_name(slot)
		if (tile) acc.push(tile) // not sure why this guard is necessary
		return acc
	    }, []);
	    // tell tiles the new order
	    this.reorder(neworder)
	},
    
	//
	// window title bar status
	//
	start_status : function() {
	    if ( ! status_started) {
		// FIX.ME after 100 ms, call this.update_status
		status_started = true
	    }
	},
    
	update_status : function() {
	    let gname = format_game(this.game)
	    let elapsed = timer.elapsed()
	    // let elapsed =[format {%d:%02d} [expr {$elapsed/60}] [expr {$elapsed%60}]]
	    // wm title . "$options(-title) - $gname - $elapsed - $options(-remaining-moves) moves, $options(-remaining-tiles) tiles"
	    // FIX.ME after 100 ms call  this.update_status
	    status_started = true
	},
    
	score_game : function(time, elapsed, game, remaining_moves, remaining_tiles) {
	},
	score_game_save : function() {
	},
	update_score : function() {
	    remaining_moves = this.count_moves()
	    this.score_game(timer.start_game, timer.elapsed(), game, remaining_moves, remaining_tiles)
	    if (remaining_moves == 0) {
		timer.stop()
		if (remaining_tiles > 0) {
		    // game lost
		    // open {restart} {new game} {undo} {quit} dialog 
		    // console.log("you lose")
		    root.menu_enable_disable([], ["Undo", "Redo", "New Game", "Restart"])
		    root.youlose.showModal()
		} else {
		    // game won	
		    // open scores positioned at new score
		    // console.log("you win")
		    root.menu_enable_disable([], ["Undo", "Redo", "New Game", "Restart"])
		    root.youwin.showModal()
		}
	    }
	},
	count_moves : function() {
	    return this.find_moves().length
	},
    
	//
	// history maintenance
	//
	history_empty : function() {
	    history = {count: 0, future: 0, items: []}
	    root.menu_enable_disable([], ["Undo", "Redo"])
	},
	history_save_reversed : function() {
	    return { count:0, future: history.future, items: history.items.reverse() }
	},
	history_restore : function(h) {
	    this.clear_selected()
	    history = h
	    if (history.count < history.future) {
		root.menu_enable_disable(["Undo", "Redo"], [])
	    } else {
		root.menu_enable_disable(["Undo"],["Redo"])
	    }
	},
	history_add : function(name1, slot1, name2, slot2) {
	    this.clear_selected()
	    history.items[history.count++] = [name1, slot1, name2, slot2]
	    history.future = history.count
	    root.menu_enable_disable(["Undo"],["Redo"])
	},
	history_undo : function() {
	    // step back
	    this.clear_selected()
	    this.move_place.apply(this, history.items[--history.count])
	    if (history.count > 0) {
		root.menu_enable_disable(["Undo", "Redo"], [])
	    } else {
		root.menu_enable_disable(["Redo"],["Undo"])
	    }
	    this.update_score()
	},
	history_redo : function() {
	    // step forward
	    this.clear_selected()
	    this.move_unplace.apply(this, history.items[history.count++])
	    if (history.count < history.future) {
		root.menu_enable_disable(["Undo", "Redo"], [])
	    } else {
		root.menu_enable_disable(["Undo"],["Redo"])
	    }
	    this.update_score()
	},

	//
	// setup the next game
	// 
	setup : function() {
	    // set up for a new game which might be restarted
	    // so, game number seeds random number generator, 
	    // results in shuffle of -slots and -tiles
	    // the optional $game may be supplying a game by name
	    // or simply the time
	    if (location.hash === "") { 
		seed = "#"+Date.now()
	    } else {
		seed = location.hash
		location.hash = ""
	    }
	    srandom(seed)
	    shuffled_slots = shuffle(this.get_all_slots())
	    shuffled_tiles = shuffle(this.get_tiles())
	    this.start_status()
	},
    
	//
	// start or restart the currently setup game
	//
	restart : function() {
	    // save the result of the last game
	    this.score_game_save()
	    // reset timer
	    timer.reset()
	    // clear selection
	    this.clear_selected()
	    // reset slot to name map
	    for (let slot of this.get_all_slots()) { 
		let name = this.get_slot_name(slot)
		if (this.tile_is_placed(slot, name)) {
		    this.tile_unplace(slot, name)
		    // if (this.watch) this.update
		}
		this.set_slot_name(slot, null)
	    }
	    // reset name to slot map
	    for (let name of this.get_tiles()) { this.set_name_slot(name, null) }

	    // one update if we are not watch to clear the board
	    // if ( ! this.watch) this.update

	
	    // pick matching pairs from available
	    let names = shuffled_tiles.slice(0)
	    let slots = shuffled_slots.slice(0)
	    let moves = []
	    remaining_tiles = 0
	
	    if (false) {
		for (let i = 0; i < names.length; i += 1) this.tile_place(slots[i], names[i])
		this.history_empty()
		remaining_moves = this.count_moves()
		this.raise_in_render_order()
	    } else {
		// make an initial update
		// if (this.watch) this.update
		names = this.sort_matching(names)
		while (names.length > 0) {
		    if (remaining_tiles != 144-names.length) {
			throw("remaining-tiles "+remaining_tiles+" != 144-names.length 144-"+names.length)
		    }
		    if (remaining_tiles != this.get_remaining_tiles().length) {
			throw("remaining-tiles "+remaining_tiles+" !=  get-remaining-tiles().length "+this.get_remaining_tiles().length)
		    }

		    // choose the pair of matched tiles to play
		    // take first and second tiles in name list
		    let name1 = names.shift()
		    let name2 = names.shift()
		    // take first open slot in slot list
		    let slot1 = this.find_can_unplay(slots)
		    if (slot1 == null) {
			this.trace_puts("slot1 is null")
			break
		    }

		    let s1 = slots.indexOf(slot1)
		    slots.splice(s1,1)

		    // put the first tile in its slot
		    this.tile_place(slot1, name1)
		    moves.push(name1, slot1)
		    if (moves.length != 2 * (144-slots.length)) {
			throw("moves.length "+moves.length+" != 2*(144-slots.length) "+2*(144-slots.length))
		    }
		    // if (this.watch) this.update

		    // take next open slot in slot list
		    // but avoid slots that block $slot1
		    let slot2 = this.find_can_unplay(slots, slot1)
		    
		    while (slot2 == null) {
			// there is no unplayable slot2 that doesn't block slot1
			// undo the unplay farthest from slot1, return the unplayed
			// slots and names to the todo lists, and retry slot2 search
			let bestm = null
			let bestd = -1
			for (let m of this.find_moves()) {
			    // okay, so the pairs of matching tiles found by search
			    // may not have been unplayed as a pair, which will
			    // make it hard to remove them from the $moves list
			    // so reject pairs that aren't moves in $moves
			    if ( ! this.is_an_unplayed_move(m[0], m[1], moves)) {
				this.trace_puts("! is-an-unplayed-move "+m)
				continue
			    }
			    let d = move_distance(slot1,m[0],m[1])
			    if (d > bestd) {
				bestm = m
				bestd = d
			    }
			    this.trace_puts("move-distance "+m+" is "+d)
			}
			this.trace_puts("bestm is "+bestm+" at distance "+bestd)
			// since we are only attempting to undo previously completed moves
			// we won't try to undo slot1 because it's only half a move
			// but we might still be digging a hole and filling it back in
			// if we are too close
			if (bestm != null && bestd > 7.0) {
			    // undo $bestm
			    this.trace_puts("undoing {"+bestm+"} at "+bestd)
			    let result = this.undo_unplayed_move(bestm[0],bestm[1],moves,slots,names)
			    moves = result[0]
			    slots = result[1]
			    names = result[2]
			    // redo the search for slot2
			    slot2 =  this.find_can_unplay(slots,slot1)
			    continue
			}
			this.trace_puts("slot2 eq null backing out "+slot1)
			// undo move
			// $self trace-puts "undo move"
			moves = moves.slice(0, moves.length-2)
			// $self trace-puts "tile-unplace $slot1 $name1"
			this.tile_unplace(slot1, name1)
			// undo damage
			if (s1 < slots.length) {
			    slots.splice(s1,1)
			} else {
			    slots.push(slot1)
			}
			names = [name1,name2].concat(names) 
			// $self trace-puts "breaking loop"
			// this used to break out of the search loop
			// now it only breaks the slot2 re-search loop
			break
		    }

		    // break the search loop if slot2 failed
		    if (slot2 == null) break
		    
		    let s2 = slots.indexOf(slot2)
		    slots.splice(s2,1)
		    
		    // put the second tile in its slot
		    this.tile_place(slot2, name2)
		    
		    // make backwards history
		    moves.push(name2, slot2)
		    
		    if (moves.length != 2 * (144-slots.length)) {
			throw("moves.length "+moves.length+" != 2*(144-slots.length) "+2*(144-slots.length))
		    }

		    // if (this.watch) this.update
		    
		    // test for forward playability
		    if ( ! this.can_play(slot1)) {
			this.trace_puts("proposed move slot1 "+slot1.join(",")+" cannot play "+name1)
			break
		    } else if ( ! this.can_play(slot2)) {
			this.trace_puts("proposed move slot2 "+slot2.join(",")+" cannot play "+name2)
			break
		    } else if ( ! this.match(name1, name2)) {
			this.trace_puts("proposed move mismatches "+name1+" and "+name2)
			break
		    }
		}
		// this counts the undealt tiles in a deal that fails
		if (names.length > 0) {
		    this.trace_puts( "broke deal loop with "+names.length+" tiles remaining")
		    throw("failed to generate deal")
		    return
		}
		// make and save the history of the play
		// this allows the construction of the deal to be played in reverse
		// at the start of each game by redoing moves
		this.history_empty()
		while (moves.length >= 4) {
		    const [name1, slot1, name2, slot2] = moves.splice(0,4)
		    this.history_add(name1, slot1, name2, slot2)
		}
		this.history_restore(this.history_save_reversed())
		
		// raise slots in render order
		this.raise_in_render_order()
		
		// compute
		if (remaining_tiles != this.get_remaining_tiles().length) {
		    throw("remaining-tiles "+remaining_tiles+" !=  llength get-remaining-tiles "+this.get_remaining_tiles().length)
		}
		remaining_moves = this.count_moves()
	    }
	    root.menu_enable_disable(["New Game", "Restart", "Pause", "Hint", "Redo", "Scores", "Preferences"], ["Continue", "Undo"])
	},
    
	//
	// unplay to avoid deadlock
	//
	is_an_unplayed_move : function(slot1, slot2, moves) {
	    let i1 = moves.indexOf(slot1)
	    let i2 = moves.indexOf(slot2)
	    if (i1 < 0 || i2 < 0) { 
		return false
	    }
	    if (Math.abs(i1-i2) == 2) {
		if (i1 < i2 && (i1%4) == 1) { return true }
		if (i2 < i1 && (i2%4) == 1) { return true }
	    }
	    return false
	},
	undo_unplayed_move : function(slot1, slot2, moves, slots, names) {
	    // get the slot indexes
	    let i1 = moves.indexOf(slot1)
	    let i2 = moves.indexOf(slot2)
	    // swap the slots so $i1 < $i2
	    if (i2 < i1) {
		[slot1, slot2, i1, i2] = [slot2, slot1, i2, i1]
	    }
	    // get the tiles played in the slots
	    let name1 = this.get_slot_name(slot1)
	    let name2 = this.get_slot_name(slot2)
	    // get the indexes where the move is played
	    let j1 = moves.indexOf(name1)
	    let j2 = moves.indexOf(name2)
	    // test our understanding
	    if (i1 != j1+1 || j2 != i1+1 || i2 != j2+1 || (j1%4) != 0) {
		throw("misunderstood the structure of moves")
	    }
	    // remove the slots and names from play
	    this.tile_unplace(slot1,name1)
	    this.tile_unplace(slot2,name2)
	    //#$self set-slot-name $slot1 {}
	    //#$self set-slot-name $slot2 {}
	    //#$self set-name-slot $name1 {}
	    //#$self set-name-slot $name2 {}
	    // remove the move from $moves
	    moves.splice(j1,4)
	    // return the slots to $slots
	    slots.push(slot1, slot2)
	    // return the tiles to $names
	    names.push(name1, name2)
	    return [moves,slots,names]
	},

	//
	// game play/unplay mechanics
	//
	find_slots_in_play : function() {
	    return this.get_all_slots().filter((slot) => ! this.is_empty_slot(slot))
	    // let slots = []
	    // for (let s of this.get_all_slots()) if ( ! this.is_empty_slot(s)) slots.push(s)
	    // return slots
	},
	find_moves : function() {
	    let moves = []
	    let slots = this.find_all_can_play(this.find_slots_in_play())
	    for (let i = 0; i < slots.length; i += 1) {
		let si = slots[i]
		let ni = this.get_slot_name(si)
		for (let j = i+1; j < slots.length; j += 1) {
		    let sj = slots[j]
		    let nj = this.get_slot_name(sj)
		    if (this.match(ni, nj)) moves.push([si,sj])
		}
	    }
	    return moves
	},
	trace_puts : function(str) { if (this.trace) console.log(str) },
	find_can_unplay : function(slots, donotblock) {
	    for(let slot of slots) if (this.can_unplay(slot, donotblock)) return slot
	    return null
	},
	find_all_can_unplay : function(slots, donotblock) {
	    return slots.filter((slot) => this.can_unplay(slot, donotblock))
	    // let all = []
	    // for (let slot of slots) if (this.can_unplay(slot, donotblock)) all.push(slot)
	    // return all
	},
	find_can_play : function(slots) {
	    for (let slot of slots) if (this.can_play(slot)) return slot
	    throw("cannot play")
	},
	find_all_can_play : function(slots) {
	    return slots.filter((slot) => this.can_play(slot))
	    // let all = []
	    // for (let slot of slots) if (this.can_play(slot)) all.push(slot)
	    // return all
	},
	//
	//
	//
	move_place : function(name1, slot1, name2, slot2) {
	    this.tile_place(slot1, name1)
	    this.tile_place(slot2, name2)
	},
	move_unplace : function(name1, slot1, name2, slot2) {
	    this.tile_unplace(slot1, name1)
	    this.tile_unplace(slot2, name2)
	},
	tile_place : function(slot, name) {
	    this.set_slot_name(slot, name)
	    this.set_name_slot(name, slot)
	    this.draw(slot, name)
	    this.show(slot, name, "plain")
	    remaining_tiles += 1
	},
	tile_unplace : function(slot, name) {
	    this.set_slot_name(slot, null)
	    this.set_name_slot(name, null)
	    this.hide(slot, name)
	    remaining_tiles -= 1
	},
	tile_is_placed : function(slot, name) {
	    return name != null && this.get_slot_name(slot) == name
	},

	// play mechanics
	get_selected : function() { return selected },
	is_selected : function() { return this.get_selected() != null },
	clear_selected : function() {
	    if (this.is_selected()) { 
		let [slot, name] = this.get_selected()
		this.show(slot, name, "plain")
	    }
	    selected = null
	},
	set_selected : function(slot, name) {
	    this.clear_selected()
	    this.show(slot, name, "selected")
	    selected = [slot, name]
	},
	tile_tap : function(name1) {
	    // if paused return
	    if (paused) return
	    // if this slot is playable
	    let slot1 = this.get_name_slot(name1)
	    if (this.can_play(slot1)) {
		// if a slot is already selected
		if (this.is_selected()) {
		    // get the selected slot, clear the selection
		    let [slot2,name2] = this.get_selected()
		    this.clear_selected()
		    if (slot1 == slot2) {
			// if it is the same slot, just return
			// we've cancelled selection and cleared the image
		    } else if (this.match(name1, name2)) {
			// it is a match to the previously selected tile
			// start counting time if not already started
			timer.start()
			// remove the tiles from play
			this.move_unplace(name1, slot1, name2, slot2)
			// keep history
			this.history_add(name1, slot1, name2, slot2)
			// keep score
			this.update_score()
		    } else {
			// select the new tile
			this.set_selected(slot1,name1)
		    }
		} else {
		    this.set_selected(slot1,name1)
		}
	    }
	},
	//
	position_tiles : function() {
	    this.get_tiles().forEach((name) => {
		const slot = this.get_name_slot(name)
		if (slot) tiles.position(slot, name)
	    })
	},
	window_resize : function(wiw, wih) { 
	    tiles.resize(wiw, wih) 
	    this.position_tiles()
	},
	get_seed : function() { return seed; }
    }

    // console.log("Game() begins")
    game.first_game()
    // console.log("Game() finished")
    return game
}

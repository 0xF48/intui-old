
/* 
	tetris grid  

	parses through items and arranges them into a grid, resizing and positioning based on index and w/h amount.

	NOTE:
		FIXED GRIDS:
			do not cycle through many offsets at once, this will result in grid resets!
			gradually increase the offset, you may increase the max offset but beware that offsetting more than an optimal amount may result in visual glitching depending on grid size!
			
			It is recommended to NOT use hard_sync. Keep your data lists consistent, if you want to display unique data, its best not to replace existing list items but add new ones with custom settings!
		ALL GRIDS:
			hard_sync matches and diffs all cached list items and prop children to make sure that child indecies do not go out of sync with the index_array.
		SCROLLABLE GRIDS:

	NOTE:
		if you do not use hard_sync which defaults to easy sync by default, IF you switch or shuffle the prop children, the grid will BREAK!!

	NOTE:
		remember to change grid ID (props.list_id) if you are working with different sets of children.



*/
var S = require('./Slide');
var SlideMixin = require('./SlideMixin');

var React = require('react');


function clamp(n,min,max){
	if (n <= min) return min
	if(n >= max) return max
	return n
}




var Grid = React.createClass({
	// mixins: [SlideMixin],

	getDefaultProps: function(){
		return {
			update_offset_beta: 1,
			max_reached: false,
			native_scroll:false,
			max_grid_height_beta: 3,
			pause_scroll: false,
			fixed: false,
			vertical: true,
			ease: Power2.easeOut,
			offset: 0, //grid buffer offset.
			fill_up: true, //fill empty spots
			h: 2, //width of grid
			w: 2, //height of grid
			hard_sync: false // hard sync checks props children against buffered children on every update (not recommended with large amounts of children elements)
		}
	},

	childContextTypes:{
		fixed: React.PropTypes.bool,
		diam: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		scroll: React.PropTypes.object,
		outerWidth: React.PropTypes.number,
		outerHeight: React.PropTypes.number,
		w: React.PropTypes.number,
		h: React.PropTypes.number,
	},


	getChildContext: function(){
		// console.log(this.refs);
		return {
			fixed: this.props.fixed,
			vertical: this.props.vertical,
			scroll: this.stage,
			outerHeight: this.refs.outer ? this.refs.outer.clientHeight : 0,
			outerWidth: this.refs.outer ? this.refs.outer.clientWidth : 0,
			w: this.props.w,
			h: this.props.h,
			diam: this.getDiam()
		}
	},



	grid_shifts: 0,

	/* initialize the index array with a set width and height */
	initIndexArray: function(w,h){
		this.index_array = [] 
		for(var r = 0; r <h;r++){
			var row = []
			for(var c = 0; c <w;c++){
				row.push(-1)
			}
			this.index_array.push(row)
		}
		
		this.last_grid_index = 0;
		this.min_scroll_pos = 0;
		
		this.greatest_index = 0
		this.lowest_index = 0
	},


	//diameter for positioning.
	getDiam: function(){
		if (this.refs.inner == null) return 0

		if(this.props.fixed){
			return null
		}else{
			return this.refs.inner.clientWidth/this.props.w;
		}
	},

	/* remove grid items that from previous update at the start of each update*/


	/*
		starts at offset and fills grid until there is no room for next consecutive child.
		assumes grid is free to fill.
	*/
	// fillInitialGrid: function(offset){
	// //	console.log('fill initial',this.children.length)
	
	// 	for(var i = offset;i<this.children.length;i++){
	// 		var c = this.children[i]
			
	// 		var spot = this.findFreeSpot(c.props.w,c.props.h)
	// 		if(spot == null) return
	// 		this.fillSpot(i,spot[0],spot[1],c.props.w,c.props.h)
	// 		this.addToGrid(c,spot[0],spot[1],i)
	// 	}
	// //	console.log("done fill initial")
	// },

	findAdjacentSpot: function(){
		alert('not implemented')
	},

	fillUpGrid: function(offset){

	//	console.log("FILL UP GRID")

		for(var i = offset;i<this.children.length;i++){
			var c = this.children[i]
			if(this.gridIndex(c) != -1) continue
			if(c.props.adjacent_tag != null){
				var spot = this.findAdjacentSpot(c.props.w,c.props.h,c.props.adjacent_tag)
			}else{
				var spot = this.findFreeSpot(c.props.w,c.props.h)
			}
			
			if(spot == null) return
			this.fillSpot(i,spot[0],spot[1],c.props.w,c.props.h)
			this.addToGrid(c,spot[0],spot[1],i,spot[2],spot[3])
		}
	},


	findIndex: function(item_index){
		var spots = []
		for(var r = 0;r < col.length-1;r++){
			for(var c = 0;c < col[r].length-1;c++){
				if(col[r][c] == item_index){
					spots.push([r,c])
				}
			}
		}
	},


	/* sync props children with static child buffer array*/
	/* grid doesnt care what arrangement the prop children are in, 
	it will append to the buffer if new children are discovered and set null to buffer indecies that are not part of child props */
	hardSyncChildren: function(new_children){


		//remove any buffer children that arent part of new children
		for(var i = 0;i<this.children.length;i++){
			var c = this.children[i]
			if(c == null) continue
			var found = false
			for(var j = 0;j<new_children.length;j++){
				if(c.key == new_children[j].key){
					found = true
				}
			}
			if(!found) this.removeChild(c)
		}


		//add new children that are not part of the buffer
		for(var j = 0;j<new_children.length;j++){
			var n_c = new_children[j]
			if(n_c == null) continue
			var found = false
			for(var i = 0;i<this.children.length;i++){
				if(this.children[i].key == n_c.key){
					found = true
				}
			}
			if( found == false) this.addChild(n_c)
		}
	},

	//remove child from buffer
	removeChild: function(index){
		var child = this.children[index]
		if(child == null) throw 'cant remove child that doesnt exist.'
		this.children[index] = null


		//we also need to check if the desynced child is part of the grid, and remove it.
		var gi = this.gridIndex(child)
		if(gi != -1){
			var c = this.grid[gi]
			this.makeFreeSpot(c.props.r,c.props.c,c.props.w,c.props.h);
		}
	},

	//add child to buffer
	addChild: function(child){
		this.children.push(child);
	},




	/*
	do not check children against new_children 
	NOTE:
		keep in mind that if prop children are shuffled or rearranged, grid WILL break.

	*/
	easySyncChildren: function(new_children){
	//	console.log("EASEY SYNC",new_children)
		// console.log("EASY SYNC",this.last_grid_index,new_children.length);
		this.children = new_children.slice(this.last_grid_index,this.last_grid_index+new_children.length)
		
	},


	/* set the lowest and greatest indecies of the children */
	setMarkers: function(){
		var g = l = null
		for(var r = 0;r<this.index_array.length;r++){
			for(var c = 0;c<this.index_array[r].length;c++){
				l = l == null ? this.index_array[r][c] : ( this.index_array[r][c] < l ? this.index_array[r][c] : l )
				g = g == null ? this.index_array[r][c] : ( this.index_array[r][c] > g ? this.index_array[r][c] : g )
			}
		}
		this.lowest_index = l
		this.greatest_index = g
	},


	/* auto dim */
	autoDim: function(child){
		//
		var w = 1
		var h = 1
		return {w:w,h:h}
	},


	/* add to grid */
	addToGrid: function(child,r,c,index){
		// //console.log('add',child.props.index,',',r,c,'#',index)
		var w = child.props.w
		var h = child.props.h
		if( child.props.w < 0 || child.props.h < 0 ){
			var wh = this.autoDim(child)
			w = wh.w
			h = wh.h
		}
		

		var n_child = React.cloneElement(child,{
			// ref: 'item_'+index,
			ease_dur: 0.3 + Math.abs(0.2*Math.sin(index/5)),
			w:w,
			h:h,

			end:false,
			
			// grid_shifts:this.grid_shifts,
			r:r,
			c:c,
		})
		this.grid.push(n_child);
		this.grid_keys.push(n_child.key);
	},




	//the final remove element from the grid index
	removeFromGrid: function(child){
		var i = this.gridIndex(child);
		if(i == -1) throw 'cant remove grid child, it does not exist'
		this.grid[i] = React.cloneElement(this.grid[i],{end:true})
	},	








	/* get the grid index of a child, returning -1 if none is found */
	gridIndex: function(child){
		return this.grid_keys.indexOf(child.key);
	},


	/* remove any children within the passed spot boundries and set the now empty array spots to -1 */
	makeFreeSpot: function(r,c,w,h){

		for(var n_h_i = 0;n_h_i < h; n_h_i++){
			for(var n_w_i = 0;n_w_i < w; n_w_i++){
				this.makeFreeSpot(r+n_h_i,c+n_w_i,0,0)
			}
		}

		
		var o_c_i = this.index_array[r][c] //old child index
		if(o_c_i == -1) return true //already free spot.

		var o_c = this.children[o_c_i] //old child

		this.removeFromGrid(o_c) //remove old child from grid.

		var o_w = o_c.props.w //old child width
		var o_h = o_c.props.h //old child height

		var arr = this.index_array 

		var l = arr.length

		//remove the indecies of old child in r,c position from index array

		for(var r = 0;r < l; r++){
			var rl = arr[r].length
			for(var c = 0;c < rl; c++){
				if(arr[r][c] == o_c_i){
					// //console.log("index ",o_c_i,"emptied for",r,c)
					arr[r][c] = -1
				}
			}
		}
	},


	/* find the lowest or highest index spot on the grid */
	findMaxIndexSpot: function(w,h,reverse){
		
		var arr = this.index_array;
		var spot = [];
		var l = arr.length;
		var lai = null; //lowest average index

		
		for(var r = 0;r < l;r++){
			var rl =  arr[r].length
			for(var c = 0;c < rl ;c++){
				var index_total = -1
				for(var h_i = 0;h_i < h && r+h_i < l;h_i++){
					for(var w_i = 0; w_i < w && c+w_i < rl ; w_i ++ ){
						index_total += arr[r+h_i][c+w_i]
					}
				}
				
				if(c+w <= rl && r+h <= l && (lai == null || ( reverse ? (index_total > lai) : (index_total < lai ) ) )) {
					lai = index_total
					spot = [r,c]
				}
			}
		}

		if(spot.length == 0){
			throw ' could not find lowest index spot ? '
		}



		return spot
	},


	//find and index spot from BOTTOM to TOP
	findFreeSpot: function(w,h,reverse){
		var self = this;
		var max_r = null;
		var col = this.index_array
		var l = col.length

		function find(){
			for(var r = reverse ? l-1 : 0; ( reverse ? r >= 0 : r < l ) && (  max_r ? ( reverse ?  ( r < max_r ? false : true ) : ( r > max_r ? false : true ) ) : true /* WAT */ ); r++){
				// //console.log(l,r)
				var rl =  col[r].length;
				for(var c = 0;c < rl ;c++){
					if(r+h > l || c+w > rl) continue;

					var found = true
					for(var h_i = 0;h_i < h && found == true;h_i++){
						for(var w_i = 0; w_i < w && found == true; w_i ++ ){
							if(col[r+h_i][c+w_i] == -1){
								found = true
							}else{
								found = false
							}
						}
					}
					if(found == true) return [r,c]
				}
			}

			if(self.props.fixed) return null

			
			if(self.props.vertical){
				var row = [];
				for(var c = 0; c <self.props.w;c++){
					row.push(-1)
				}

				self.index_array.push(row)
			}else{
				for(var r = 0;r < self.props.h;r++){
					col[r].push(-1);
				}
			}

			l = self.index_array.length;
			
			

			return find();
		}



		


		return find();
	},

	//from ANY free SPOT
	findFreeSpots: function(){
		var arr = this.index_array
		var l = arr.length
		var spots = [];
		for(var r = 0;r < l;r++){
			var rl =  arr[r].length
			for(var c = 0;c < rl ;c++){
				if(arr[r][c] != -1) continue;
				var h_i = 0
				var w_i = 0

				while(c+w_i+1 < rl && arr[r+h_i][c+w_i+1] == -1){
					spots.push({
						r: r,
						c: c,
						h : h_i+1,
						w : w_i +1,
					})
					w_i += 1;
				}

				while(r+h_i+1 < l && arr[r+h_i+1][c+w_i] == -1){
					spots.push({
						r: r,
						c: c,
						h : h_i+1,
						w : w_i+1,
					})
					h_i += 1;
				}

				spots.push({
					r: r,
					c: c,
					h : h_i + 1,
					w : w_i + 1,
				})
			}
		}

		return spots
	},

	/* add a row to the grid */
	// insertIndexRow: function(r){
	// 	if(this.props.fixed) throw 'cant add index rows to fixed index array, disable fixed index array option.'
		
	// 	this.grid_shifts ++;
	// 	var row = []
	// 	for(var i = 0;i<this.props.w;i++){
	// 		row.push(-1)
	// 	}
	// 	this.index_array.splice(r,row)
		
	// },

	/* fill spot */
	fillSpot: function(child_i,r,c,w,h){
	//	console.log('fill spot',r,c,w,h,'#'+child_i)


		var col = this.index_array;

		for(var h_i = 0;h_i<h;h_i++){
			if(col[r+h_i] == null) throw 'fill spot error: row does not exist not empty '+r +','+c+''
			for(var w_i = 0; w_i < w; w_i ++ ){
				if(col[r+h_i][c+w_i] == null) throw 'fill spot error: column does not exist not empty '+r +','+c+''
				if(col[r+h_i][c+w_i] != -1) throw 'fill spot error: not empty '+r +','+c+''
				else col[r+h_i][c+w_i] = child_i
			//	console.log("filled spot",r+h_i,c+w_i,"with",child_i)
			}
		}
		this.setMarkers();
		return true
	},


	/* 123 */
	// forceFill: function(props){
	// //	console.log("FORCE FILL");
	// 	for(var i = 0;i<this.children.length;i++){
	// 		var c = this.children[i]
	// 		var spot = this.findFreeSpot(c.props.w,c.props.h)
	// 		if(spot == null) return
	// 		this.fillSpot(i,spot[0],spot[1],c.props.w,c.props.h)
	// 		this.addToGrid(c,spot[0],spot[1],i)
	// 	}

	// },



	/* reset the grid, removing all state children and setting outer prop children to end their life cycle on the next update */
	resetGrid: function(w,h){
		
		

		this.initIndexArray(w,h);

		for(var i = 0;i<this.grid.length;i++){
			this.grid[i] = React.cloneElement(this.grid[i],{end:true})
		}

		this.children = []
	},

	/*  find the lowset index spot on the grid and replace it with an incremented one from the state children (fixed grids only) */
	// goBack: function(){
	// 	var prev_index = this.lowest_index-1
	// 	var c = this.children[prev_index]
	// 	if(c == null) return //we cant go back because there are no children with the next lowest index
		
	// 	var spot = this.findMaxIndexSpot(c.props.w,c.props.h,true)

	// 	this.makeFreeSpot(spot[0],spot[1],c.props.w,c.props.h)
	// 	this.fillSpot(next_index,spot[0],spot[1],c.props.w,c.props.h)
	// 	this.addToGrid(c,spot[0],spot[1],prev_index)

	// 	/* done */
	// 	return
	// },




	/* find the highest index spot on the grid and replace it with an incremented one from the state children (fixed grids only) */
	// goForward: function(){

	// 	var next_index = this.greatest_index+1
	// 	var c = this.children[next_index]
	// 	if(c == null) return; //we cant go fw because there are no children with the next highest index
		
	// 	var spot = this.findMaxIndexSpot(c.props.w,c.props.h,false)

	// 	this.makeFreeSpot(spot[0],spot[1],c.props.w,c.props.h)
	// 	this.fillSpot(next_index,spot[0],spot[1],c.props.w,c.props.h)
	// 	this.addToGrid(c,spot[0],spot[1],next_index)
		
	// 	/*done*/
	// 	return
	// },

	/* check if a spot is empty */
	// isEmpty: function(r,c,w,h){
	// 	var col = this.index_array;
	// 	for(var h_i = 0;h_i<h;h_i++){
	// 		for(var w_i = 0; w_i < w; w_i ++ ){
	// 			if(col[r+h_i][c+w_i] != -1){
	// 				return false
	// 			}
	// 		}
	// 	}
	// 	return true
	// },

	/* child index */
	childIndex: function(key){
		for(var c = 0;c < this.children.length;c++){
			if(this.children[c].key == key) return c
		}
		return -1
	},

	// getNeighbors: function(child){
	// 	var found = [];
	// 	var min_r = clamp(child.r-1,0,this.index_array.length-1)
	// 	var max_r = clamp(child.r+child.h+1,0,this.index_array.length-1)
	// 	var min_c = child.c-1
	// 	var max_c = child.c + child.w + 1


	// 	for(var r = min_r;r<max_r;r++){
	// 		for(var c = min_c;c<max_c;c++){
	// 			if(this.index_array[r][c] != child.index)
	// 		}
	// 	}
	// },


	/* fill empty spots */
	fillEmptySpots: function(offset){
		if(offset == null) throw 'cant fill empty spots with no offset'

		var spots = this.findFreeSpots();

		if(spots.length == 0) return


		
		var spots = spots.sort(function(s1,s2){
			if(s1.w*s2.h < s2.w*s2.h) return -1
			else return 1
		})



		/* first go back from offset and try and fill. */
		for(var i = offset;i>= 0;i--){
			var c = this.children[i];
			if(this.gridIndex(c) != -1) continue;
			for(var j = 0;j<spots.length && found == false;j++){
				var s = spots[j]
				if(s == null) continue
				if(s.w == c.props.w && s.h == c.props.h){
					//yey we found a free spot!
					this.fillSpot(i,s.r,s.c,s.w,s.h)
					this.addToGrid(c,s.r,s.c,i)
					found = true
				}
			}
			if(found) spots = this.findFreeSpots();	
		}

		//filter out nulls.
		spots = this.findFreeSpots();
		if(spots.length == 0) return



		/*
		If we failed to fill the grid up by going back from offset, 
		go forwards from offset and if child is not in grid fill up all the way until no children remaining
		*/
	//	console.log("FIND FW",spots)
		for(var i = offset;i < this.children.length;i++){
			var c = this.children[i];
			if(this.gridIndex(c) != -1) continue;
			// //console.log('GRID INDEX OF',i,this.gridIndex(c))
			var found = false
			for(var j = 0;j<spots.length && found == false;j++){
				var s = spots[j]
				if(s == null) continue
				if(s.w == c.props.w && s.h == c.props.h){
					//yey we found a free spot!
					this.fillSpot(i,s.r,s.c,s.w,s.h)
					this.addToGrid(c,s.r,s.c,i)
					found = true
				}
			}
			if(found) spots = this.findFreeSpots();
		}

		/*done*/
		return
	},

	/* grid state sync has to happen before the render happens, the grid elements need to be rendered */
	componentWillUpdate: function(props,state){
		if(!props.children) return false //no need to update grid if no children.
		

		/*
			NOTE:
		 	do not replace prop children. if you do, update the list id.
		 	all children are meant to be static.
		 	you may remove/add children from the array which will trigger a resync.
		 */
	//	console.log('update grid',props.list_id,props.children.length)
		//reset grid and return
		if(this.props.list_id != props.list_id){
			if(!this.props.fixed){
				this.resetGridPos();
			}
			
		//	console.log("NEW GRID ID",props.list_id,props.children)


			if(! props.children || !props.children.length){
				// //console.log('reset to empty')
				// this.cleanGrid();
				this.resetGrid(props.w,props.h);
			}else{
				this.resetGrid(props.w,props.h);
				props.hard_sync ? this.hardSyncChildren(props.children) : this.easySyncChildren(props.children);
				if(props.fixed){
					this.fillUpGrid(props.offset);
					this.fillEmptySpots(props.offset);
				}else{
					this.fillUpGrid(props.offset);
				}
			}
			// this.cleanGrid();
			

			
		}

		//resync if children lengths dont match
		else if(this.children.length != props.children.length){


			props.hard_sync ? this.hardSyncChildren(props.children) : this.easySyncChildren(props.children)
			if(props.fixed == true){
				this.fillUpGrid(props.offset);
				this.fillEmptySpots(props.offset);
			}else{
				this.fillUpGrid(props.offset);
			}
		}

		// //force hard resync if enabled. 
		// else if(props.hard_sync){
		//	console.log("HARD SYNC")
		// 	this.hardSyncChildren(props.children);
		// }



		//if offset changed go back or forwards.
		if(this.props.offset != props.offset){
			// //console.log("NEW OFFSET")
			// this.cleanGrid();

			var d = props.offset - this.props.offset
		//	console.log(d)
			if(Math.abs(d) > props.max_offset){
				this.resetGrid(props.w,props.h);
				this.fillInitialGrid(props.offset);	
			}else if(d > 0){
				for(var i = 0;i<d;i++) this.goForward()
			}else if(d < 0){
				for(var i = 0;i<d;i++) this.goBack()
			}
			this.fillEmptySpots(props.offset);
		}

		this.visible_grid = this.getGrid();

	},

	
	// updateGrid: function(){

		
		
		
	// },

	resetGridPos: function(){
		this.scroll_pos = 0;
		this.refs.outer.scrollTop = 0;
		this.stage.y = 0
		this.stage.x = 0
		this.min_scroll_pos = 0
		this.max_scroll_pos = 0
	},


	componentDidMount: function(){

		//if grid is not fixed (scrollable) we set an interval to check if the container has stopped scrolling
		//this is needed for updating the grid buffer
		if(!this.props.fixed){
			this.check_end_interval = setInterval(this.checkEndScroll,(200+Math.random()*300));
		}

		//if native scroll is true, we need to freeze container scrolling if we reach a min and also update the scroll position variable
		//the scroll position variable is used in other methods and should be up to date.
		if(this.props.native_scroll == true){
			
			//mousewheel for scrolling.
			this.refs.outer.addEventListener('mousewheel',(e)=>{
				if(this.scroll_pos <= this.min_scroll_pos && e.deltaY < 0){
					if(this.scrolling == true){
		
						TweenLite.set(this.refs.outer,{
							scrollTop: this.min_scroll_pos
						})
						

						e.preventDefault();
						e.stopPropagation();
					}					
					
					return false;
				}
			})
			
			this.refs.outer.addEventListener('scroll',(e)=>{
				
				this.scroll_pos = e.target.scrollTop;
				

				if(this.scrolling == false){
					if(this.props.onScrollStart){
						this.props.onScrollStart(this.scroll_pos,r_max-this.scroll_pos)
					}
					this.scrolling = true;
				}
				this.stage.y = -e.target.scrollTop
				this.stage.x = -e.target.scrollLeft
			})
		}

		this.forceUpdate();
	},

	componentWillMount: function(){
		this.total_max_pos = 0;
		// this.current_max = 0;
		this.children = []
		this.grid = []
		this.visible_grid = []
		this.grid_keys = []

		this.max_scroll_pos = 0
		this.min_scroll_pos = 0

		this.initIndexArray(this.props.w,this.props.h)
		this.scroll_pos = 0;
		this.scroll_ppos = 0;
		this.scroll_check_pos = 0;
		this.scrolling = false;
		this.check_end_interval = null;
		this.last_grid_index = 0;
		
		this.stage = {
			y:0,
			x:0
		}

	},

	componentWillUnmount: function(){
		clearInterval(this.check_end_interval);
	},

	needsGridUpdate: function(){
		var scroll = this.scroll_pos
		var min = this.min_scroll_pos
		var max = this.max_scroll_pos

		// console.log(scroll- min,min);

		if( (max - scroll) <= this.refs.outer.clientHeight*this.props.update_offset_beta && !this.props.max_reached && this.max_scroll_pos == this.total_max_pos ){
			return 1
		}

		if( (min != -50 && scroll - min <= this.refs.outer.clientHeight*this.props.update_offset_beta) || ( max - scroll <= this.refs.outer.clientHeight*this.props.update_offset_beta && (this.max_scroll_pos != this.total_max_pos) )){
			return 0
		}

		return -1
	},


	getGrid: function(off){


		var scroll = this.scroll_pos
		var d = this.getDiam()
		var grid = []
		var min_c, max_c;

		// console.log("GET GRID",this.grid);
		var min = scroll - this.refs.outer.clientHeight * this.props.max_grid_height_beta
		var max = scroll + this.refs.outer.clientHeight * (this.props.max_grid_height_beta+1)
		// var current_max = false
		for(var i = 0;i<this.grid.length;i++){
			var c = this.grid[i]
			var pos = c.props.r * d
			
			// console.log(pos,min,max);
			if(pos <= max && pos >= min){
				grid.push(c)
				if(!min_c || c.props.r < min_c.props.r){
					min_c = c
				}
				if(!max_c || c.props.r > max_c.props.r){
					max_c = c
				}
				// if(i == this.grid.length){
				// 	current_max = true
				// }
			}else{
				if(c.props.end != false){
					this.removeFromGrid(c)
					grid.push(c)
				}
			}
		}

		// this.current_max = current_max;

		this.min_scroll_pos = min_c ? min_c.props.r*d-50 : this.min_scroll_pos;
		this.max_scroll_pos = max_c ? ( max_c.props.r*d + d*max_c.props.h ) - this.refs.outer.clientHeight : this.max_scroll_pos;

		this.total_max_pos = this.max_scroll_pos > this.total_max_pos ? this.max_scroll_pos : this.total_max_pos;

		return grid;
	},

	getGridOffset: function(){
		return Math.floor(this.scroll_pos/this.refs.outer.clientHeight)
	},


	checkEndScroll: function(){
		//console.log(this.scrolling);
		if(this.scroll_check_pos == this.scroll_pos && this.scrolling == true){
			this.scrolling = false;

			//if the grid needs more children and max has not been reached return 1 if grid just needs update return 0 else return 1
			var upd = this.needsGridUpdate()
			console.log(upd);
			if(upd == 1){
				if(this.props.onUpdate) this.props.onUpdate();			
			}else if(upd == 0){
				this.forceUpdate()
			}
		}
		this.scroll_check_pos = this.scroll_pos
	},




	scrollTo: function(pos){
		this.scroll_pos = pos;
		if(this.props.vertical){
			this.stage.y = -pos;
			TweenMax.set(this.refs.inner,{
				y: -pos
			})			
		}else{
			this.stage.x = -pos;
			TweenMax.set(this.refs.inner,{
				x: -pos
			})			
		}

		// this.refs.inner.style.transform = 'translateY('+(-pos)+'px)';
		this.scroll_ppos = pos
	},


	scroll_delta: function(delta){
		

		if(this.props.pause_scroll == true){
			return null
		}


		var r_min = this.min_scroll_pos;
		var r_max = this.props.vertical ? (this.refs.inner.clientHeight - this.refs.outer.clientHeight) : (this.refs.inner.clientWidth - this.refs.outer.clientWidth); 	     //relative max (600px innerHeight)
		if(r_max < 0) r_max = 0;


		

		this.scroll_pos = clamp(this.scroll_pos+delta,r_min,r_max);

		


		// this.emitEvent['scroll'](this.scroll_pos,r_max-this.scroll_pos)


		if(this.scroll_ppos != this.scroll_pos){
			if(this.props.onScroll){
				this.props.onScroll(this.scroll_pos,r_max-this.scroll_pos)
			}

			if(this.scrolling == false){
				if(this.props.onScrollStart){
					this.props.onScrollStart(this.scroll_pos,r_max-this.scroll_pos)
				}
				this.scrolling = true;
			}


			this.scrollTo(this.scroll_pos);
		}



		if(this.scroll_pos == r_max) return 1 //this.scroll_cb(1,delta);
		else if(this.scroll_pos == r_min) return -1 //this.scroll_cb(-1,delta);
		else return 0 //this.scroll_cb(0,delta);

	},


	/* render */
	render: function(){
		var inner_style,inner,outer_style,top_loader;

		if(this.min_scroll_pos != 0){
			top_loader = <div className = {'load-circle '} style={{position: 'absolute',left:'50%',top:(this.min_scroll_pos+25)+'px'}} />
		}
		// console.log('render grid',this.visible_grid.length,this.grid.length);

		//fixed grid render options
		if(this.props.fixed){
			if(this.props.width || this.props.height){
				outer_style = { width: this.props.width, height: this.props.height }
			}
			inner = this.visible_grid;
		

		//scrollable grid render options	
		}else{
			if(this.props.vertical){
				inner_style = {
					height: this.props.fixed ? '100%' : (this.max_scroll_pos+(this.refs.outer? this.refs.outer.clientHeight : 0)+50)+'px',
				}
			}
			var inner = (
				<div style = {inner_style}  ref = 'inner' className = {'_intui_grid_inner'}>
					{this.visible_grid}
					{top_loader}
					<div className = {'load-circle ' + (this.props.max_reached && this.total_max_pos == this.max_scroll_pos ? 'load-circle-stop' : '')} style={{position: 'absolute',left:'50%',bottom:(25)+'px'}} />
				</div>				
			)
		}

		return (
			<div key = {this.key} ref = 'outer' style = {outer_style} className= {'_intui_grid '+(this.props.native_scroll ? '_intui_grid_scroll':'')+' '+this.props.className}>
				{inner}
			</div>
		)
	}
})


module.exports = Grid

/* 
	tetris grid  

	parses through items and arranges them into a grid, resizing and positioning based on index and w/h amount.

	NOTE:
		do not cycle through many offsets at once, this will result in grid resets!
		gradually increase the offset, you may increase the max offset but beware that offsetting more than an optimal amount may result in visual glitching depending on grid size!
		
		It is recommended to NOT use hard_sync. Keep your data lists consistent, if you want to display unique data, its best not to replace existing list items but add new ones with custom settings!
		hard_sync matches and diffs all cached list items and prop children to make sure that child indecies do not go out of sync with the index_array.
	
	NOTE:
		if you do not use hard_sync which defaults to easy sync by default, IF you switch or shuffle the prop children, the grid will BREAK!!

	NOTE:
		remember to change grid ID (props.list_id) if you are working with different sets of children.



*/

var React = require('react');
var sort = require('lodash/collection/sortBy');
var indexOf = require('lodash/array/indexOf');





/* pass -1 for w/h to set size based on amount of children and grid dimentions */
var GridItem = React.createClass({

	getDefaultProps: function(){
		return {
			max_offset: 4,
			delay: 0,
			end: false,
			w: null,
			h: null,
			list_id: 'none',
			toggle: false,
			animated: false,
			aniamte: false,
			top: false, 
			r: 4,
			c: 4,
			size_index: 0,
			ease: Power2.easeOut,
			ease_dur: 0.6
		}
	},

	contextTypes: {
		fixed: React.PropTypes.bool,
		diam: React.PropTypes.number,
		w: React.PropTypes.number,
		h: React.PropTypes.number,
	},

	getInitialState: function(){
		return {
			animated: false
		}
	},

	componentDidUpdate: function(props,state){
	//	////console.log(this.props.end,this.key)
		if(!this.context.fixed) return
		if(props.end != this.props.end && this.props.end == true){
			TweenLite.fromTo(this.refs.item,this.props.ease_dur+(this.props.r*(1*this.props.delay )) ,{
				rotationY: 0,
				scale:1,
				// zIndex: 1,
			},{
				rotationY: 180,
				scale:0.6,
				// zIndex: 1,
				ease: this.props.ease,
			})		
		}else if(props.end != this.props.end && this.props.end == false){
			TweenLite.fromTo(this.refs.item,this.props.ease_dur+(this.props.r*(1*this.props.delay )),{
				rotationY: -180,
				scale:0.6,
			
			},{
				scale:1,
				rotationY: 0,
				ease: this.props.ease,
			})					
		}
	},

	componentDidMount:function(){

		if(this.props.end == true){
			////console.log("END")

			TweenLite.fromTo(this.refs.item,this.props.ease_dur+(this.props.r*(1*this.props.delay )),{
				rotationY: 0,
				scale:0.6,
			},{
				scale:1,
				rotationY: 180,
				ease: this.props.ease,
			})		

		}else if(this.context.fixed){
			// ////console.log("animate",this.props.r,this.props.c)
			TweenLite.set(this.refs.item,{
				rotationY: -180,
				
			})
			TweenLite.to(this.refs.item,this.props.ease_dur+(this.props.r*(1*this.props.delay )),{
				rotationY: 0,
				
				ease: this.props.ease,
			})
		}
	},


	render: function(){
		//////console.log("render",this.props.c,this.props.r)



		if(!this.context.fixed){
			var left = ( this.props.c * this.context.diam) + 'px';
			var top = ( (this.props.r - this.props.grid_shifts) * this.context.diam) + 'px';
			var h =  this.context.diam*this.props.h + 'px';
			var w =  this.context.diam*this.props.w + 'px';			
		}else{
			var left = ( 100/this.context.w * this.props.c) + '%';
			var top =  ( 100/this.context.h * this.props.r) + '%';
			var w = ( 100/this.context.w * this.props.w) + '%';
			var h = ( 100/this.context.h * this.props.h) + '%';
		}

		//////console.log(this.props.r,this.props.c,this.props.grid_shifts,this.context.diam)
	

		var style = Object.assign({
			position: 'absolute',
			left: left,
			top: top,
			perspective: '500',
			backfaceVisibility: 'hidden',
			height: h,
			width: w,
			boxSizing: 'border-box'
		})

		var style2 = Object.assign({
			backfaceVisibility: 'hidden',
			transformStyle: 'preserve-3d',
			width: '100%',
			height: '100%',
			position: 'relative'
		},this.props.style)


		return (
			<div ref='item_wrapper' style={style}>
				<div {...this.props} ref='item' style={style2}>
					{this.props.children}
				</div>
			</div>
		)
	}
})



var Grid = React.createClass({

	getDefaultProps: function(){
		return {
			ease: Power2.easeOut,
			offset: 0, //grid buffer offset.
			fill_up: true, //fill empty spots
			h: 2, //width of grid
			w: 2, //height of grid
			hard_sync: false // hard sync checks props children against buffered children on every update (not recommended with large amounts of children elements)
		}
	},

	getInitialState: function(){
	
		this.inner_style = {
			width: '100%',
			position:'relative',
		}

		this.grid = []
		this.children = []

		this.initIndexArray(this.props.w,this.props.h)


		return {}
	},

	initIndexArray: function(w,h){
		//create index array.
		this.index_array = []
		for(var r = 0; r <h;r++){
			var row = []
			for(var c = 0; c <w;c++){
				row.push(-1)
			}
			this.index_array.push(row)
		}
		this.greatest_index = 0
		this.lowest_index = 0
	},


	childContextTypes:{
		fixed: React.PropTypes.bool,
		diam: React.PropTypes.number,
		w: React.PropTypes.number,
		h: React.PropTypes.number,
	},


	getChildContext: function() {
		return {
			fixed: this.props.fixed,
			w: this.props.w,
			h: this.props.h,
			diam: this.getDiam()
		}
	},


	//diameter for positioning.
	getDiam: function(){
		if (this.refs.inner == null) return 0

		if(this.props.fixed){
			return 	
		}else{
			return this.refs.inner.clientWidth/this.props.w;
		}
	},









	/* remove grid items that have ended their lifcycle from previous update at the start of each update*/
	cleanGrid: function(){
		for(var c = 0;c<this.grid.length;c++){
			if(this.grid[c].props.end == true){
				this.grid[c] = null
			}
		}
	
		this.grid = this.grid.filter(function(g){
			return g != null
		})
		// console.log("CLEANED GRID",this.grid)
	},



	/*
		starts at offset and fills grid until there is no room for next consecutive child.
		assumes grid is free to fill.
	*/
	fillInitialGrid: function(offset){
		// //console.log('fill initial',this.children.length)
	
		for(var i = offset;i<this.children.length;i++){
			var c = this.children[i]
			
			var spot = this.findFreeSpot(c.props.w,c.props.h)
			if(spot == null) return
			this.fillSpot(i,spot[0],spot[1],c.props.w,c.props.h)
			this.addToGrid(c,spot[0],spot[1],i)
		}
		// //console.log("done fill initial")
	},

	fillUpGrid: function(offset){
		for(var i = offset;i<this.children.length;i++){
			var c = this.children[i]
			if(this.gridIndex(c) != -1) continue
			
			var spot = this.findFreeSpot(c.props.w,c.props.h)
			if(spot == null) return
			this.fillSpot(i,spot[0],spot[1],c.props.w,c.props.h)
			this.addToGrid(c,spot[0],spot[1],i)
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
		////console.log("EASEY SYNC",new_children)
		this.children = []
		for(var i = 0 ;i<new_children.length;i++){
			this.children.push(new_children[i])
		}
	},



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

	getH: function(child){
		return 1
	},
	getW: function(child){
		return 1
	},



	addToGrid: function(child,r,c,index){
		//console.log('add',child.props.index,',',r,c,'#',index)
		var child = React.cloneElement(child,{
			w:child.props.w == -1 ? this.getW(child) : child.props.w, 
			h:child.props.h == -1 ? this.getH(child) : child.props.h,
			end:false,
			fixed: this.props.fixed,
			grid_shifts:this.grid_shifts,
			r:r,
			c:c,
			top:top || child.props.top,
			animate:top ? true : false
		})
		this.grid.push(child)
	},

	removeFromGrid: function(child){
		var i = this.gridIndex(child);
		if(i == -1) throw 'cant remove grid child, it does not exist'
		this.grid[i] = React.cloneElement(this.grid[i],{end:true})
	},	









	gridIndex: function(child){
		for(var gi = 0;gi<this.grid.length;gi++){
			if(this.grid[gi].key == child.key){
				return gi
			}
		}
		return -1
	},


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
					// ////console.log("index ",o_c_i,"emptied for",r,c)
					arr[r][c] = -1
				}
			}
		}
	},



	findLowestIndexSpot: function(w,h,reverse){
		// ////console.log('find lowest index for index',index,'->',w,h)
		var arr = this.index_array;
		var spot = []
		var l = arr.length
		var lai = null //lowest average index

		
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

		// ////console.log("FOUND FIXED SPOT:",spot)

		return spot
	},


	//from BOTTOM to TOP
	findFreeSpot: function(w,h){
	
		var col = this.index_array
		var l = col.length
		for(var r = 0;r < l;r++){
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
		return null
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

	addIndexRow: function(r){
		if(this.props.fixed) throw 'cant add index rows to fixed index array, disable fixed index array option.'
		
		this.grid_shifts ++;
		var row = []
		for(var i = 0;i<this.props.w;i++){
			row.push(-1)
		}
		this.index_array.splice(r,row)	
		
	},

	fillSpot: function(child_i,r,c,w,h){
		////console.log('fill spot',r,c,w,h,'#'+child_i)


		var col = this.index_array;

		for(var h_i = 0;h_i<h;h_i++){
			if(col[r+h_i] == null) throw 'fill spot error: row does not exist not empty '+r +','+c+''
			for(var w_i = 0; w_i < w; w_i ++ ){
				if(col[r+h_i][c+w_i] == null) throw 'fill spot error: column does not exist not empty '+r +','+c+''
				if(col[r+h_i][c+w_i] != -1) throw 'fill spot error: not empty '+r +','+c+''
				else col[r+h_i][c+w_i] = child_i
				////console.log("filled spot",r+h_i,c+w_i,"with",child_i)
			}
		}
		this.setMarkers();
		return true
	},

	isEmpty: function(r,c,h,w){
		var col = this.index_array;
		for(var h_i = 0;h_i<h;h_i++){
			for(var w_i = 0; w_i < w; w_i ++ ){
				if(col[r+h_i][c+w_i] != -1) return false
			}
		}
		return true
	},

	resetGrid: function(w,h){
		//console.log("RESET GRID")
		

		this.initIndexArray(w,h);

		for(var i = 0;i<this.grid.length;i++){
			this.grid[i] = React.cloneElement(this.grid[i],{end:true})
		}

		this.children = []
	},




	shouldComponentUpdate: function(props,state){
		if(!props.children) return false //no need to update grid if no children.
		

		/*
			NOTE:
		 	I WILL NOT CHECK FOR REPLACED PROP CHILDREN!
		 	do not replace prop children. if you do, update the list id.
		 	all children are meant to be static.
		 	you may remove/add children from the array which will trigger a resync.
		 */
		//console.log('update grid',props.list_id)
		//reset grid and return
		if(this.props.list_id != props.list_id){
			//console.log("NEW GRID ID",props.list_id)


			if(! props.children || !props.children.length){
				//console.log('reset to empty')
				this.cleanGrid();
				this.resetGrid(props.w,props.h);
				return true
			}
			this.cleanGrid();
			this.resetGrid(props.w,props.h);
			props.hard_sync ? this.hardSyncChildren(props.children) : this.easySyncChildren(props.children);
			this.fillInitialGrid(props.offset);
			//console.log("FILLED INITIAL",this.grid)
			this.fillEmptySpots(props.offset);
			return true
		}

		//resync if children lengths dont match
		else if(this.children.length != props.children.length){
			this.cleanGrid();
			//console.log("NEW GRID SIZE")
			////console.log('update grid')
			props.hard_sync ? this.hardSyncChildren(props.children) : this.easySyncChildren(props.children)
			this.fillUpGrid(props.offset);
			this.fillEmptySpots(props.offset);
		}

		//force hard resync if enabled. 
		else if(props.hard_sync){
			//console.log("HARD SYNC")
			this.hardSyncChildren(props.children);
		}



		//if offset changed go back or forwards.
		if(this.props.offset != props.offset){
			//console.log("NEW OFFSET")
			this.cleanGrid();

			var d = props.offset - this.props.offset
			////console.log(d)
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


		// if(props.fixed == false){
		// 	TweenLite.set(this.refs.inner,{
		// 		y: this.getDiam()*this.grid_shifts,
		// 	})
		// }

		return true
	},


	goBack: function(){
		var prev_index = this.lowest_index-1
		var c = this.children[prev_index]
		if(c == null) return
		var spot = this.findLowestIndexSpot(c.props.w,c.props.h,true)
		this.makeFreeSpot(spot[0],spot[1],c.props.w,c.props.h)
		this.fillSpot(next_index,spot[0],spot[1],c.props.w,c.props.h)
		this.addToGrid(c,spot[0],spot[1],prev_index)

		/* done */
		return
	},


	goForward: function(){

		var next_index = this.greatest_index+1
		var c = this.children[next_index]
		if(c == null) return;
		
		var spot = this.findLowestIndexSpot(c.props.w,c.props.h,false)
		////console.log('found lowest index spot',spot)
		this.makeFreeSpot(spot[0],spot[1],c.props.w,c.props.h)
		this.fillSpot(next_index,spot[0],spot[1],c.props.w,c.props.h)
		this.addToGrid(c,spot[0],spot[1],next_index)
		
		/*done*/
		return
	},



	isEmpty: function(r,c,w,h){
		var col = this.index_array;
		for(var h_i = 0;h_i<h;h_i++){
			for(var w_i = 0; w_i < w; w_i ++ ){
				if(col[r+h_i][c+w_i] != -1){
					//////console.log(r,c,w,h,'not empty')
					return false
				}
			}
		}
		//////console.log(r,c,h,w,'is empty')
		return true
	},

	childIndex: function(key){
		for(var c = 0;c < this.children.length;c++){
			if(this.children[c].key == key) return c
		}
		return -1
	},



	fillEmptySpots: function(offset){
		if(offset == null) throw 'cant fill empty spots with no offset'

		var spots = this.findFreeSpots();

		if(spots.length == 0) return

		var spots = sort(spots,function(spot){
			return -spot.w * spot.h
		})



		/*
		first go back from offset and try and fill.
		*/


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
		////console.log("FIND FW",spots)
		for(var i = offset;i < this.children.length;i++){
			var c = this.children[i];
			if(this.gridIndex(c) != -1) continue;
			// ////console.log('GRID INDEX OF',i,this.gridIndex(c))
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





	componentDidMount: function(){
		// this.forceUpdate();
	},

	render: function(){
	
		if(this.props.fixed){
			h = '100%'
		}else{
			h = (this.getDiam()*(this.index_array.length-this.grid_shifts))+'px'
		}
		//////console.log("INNER WIDTH:",this.getDiam()*this.index_array.length)
		return (
			<div ref = 'inner' style = {Object.assign({height:h},this.inner_style,this.props.style)} className = {this.props.className}>
				{this.grid}
			</div>
		)
	}
})



var Mixin = {
	contextTypes: {
		
		fixed: React.PropTypes.bool,
		diam: React.PropTypes.number,
		w: React.PropTypes.number,
		h: React.PropTypes.number,
	}
}

module.exports.Mixin = Mixin;
module.exports.Grid = Grid;
module.exports.Item = GridItem;
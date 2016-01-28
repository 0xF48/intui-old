
/* 
	tetris grid  

	parses through items and arranges them into a grid, resizing when needed

*/

var React = require('react');

var GridItem = React.createClass({
	getDefaultProps: function(){
		return {
			aniamte: false,
			top: false, 
			r: 0,
			c: 0,
			size_index: 0,
			ease: Power4.easeOut,
			ease_dur: 0.5
		}
	},

	contextTypes: {
		diam: React.PropTypes.number
	},

	getInitialState: function(){
		return {
			animated: false
		}
	},

	componentDidMount:function(state,props){
		if(this.props.animate && !this.state.animated){
			TweenLite.to(this.refs.item,this.props.ease_dur,{
				y: 0,
				ease: this.props.ease,
				onComplete: function(){
					this.setState({
					 	animated: true
					})	
				}.bind(this)
			})
		}
	},



	render: function(){
	//	console.log('CONTEXT DIAM',this.context.diam)
		var transform = null;
		if(this.props.animate && !this.state.animated){
			transform = {transform:'translate(0%,-100%)'}
		}

		var style = Object.assign({
			position: 'absolute',
			left: this.props.c == 0 ? '0%' : '50%',
			top: (this.props.r * this.context.diam) + 'px',
			height: this.props.size_index > 1 ? this.context.diam*2 : this.context.diam,
			width: this.props.size_index == 1 || this.props.size_index == 3 ? '100%' : '50%',
			
			boxSizing: 'border-box'
		},this.props.style,transform)

		return (
			<div ref='item' style={style}>
				{this.props.children}
			</div>
		)
	}
})

var Grid = React.createClass({

	getDefaultProps: function(){
		return {
			
		}
	},

	/*
		size indecies

		0) *     default
		
		1) * *
		
		2) *
		   *

		3) * *
		   * *

	*/

	getInitialState: function(){
	
		this.inner_style = {
			width: '100%',
			position:'relative',
		}

		this._init();

		return {
			// diam: 0, //diameter
			length: 0,
		}
	},

	_init: function(){

		this.grid_shifts = 0
		this.grid = []
		this.key_list = []
		this.buffer_size = 2
		this.index_array = 
		[
			[-1,-1,-2],
			[-1,-1,-2],
			[-1,-1,-2],
		]
	},

	resetGrid: function(){
		this._init()

		return this.setState({
			length: 0,
		})
	},

	childContextTypes:{
		diam: React.PropTypes.number
	},

	getChildContext: function() {
		return {
			diam: this.getDiam()
		}
	},

	getDiam: function(){
		if (this.refs.inner != null){
			return this.refs.inner.clientWidth/2;
		}else{
			return 0
		}
	},

	insertChild: function(child,r,c,top){
		console.log('insert size ',child.props.size_index,'[',r,c,']',this.key_list.length)
		var i = child.size_index
		this.key_list.push(child.key);
		var child = React.cloneElement(child,{r:r-this.grid_shifts,c:c,top:top || child.props.top,animate:top ? true : false})
		this.grid.unshift(child)
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


	findSpot: function(size_index,top){
		var col = this.index_array
		for(var r = 0;r < col.length-1;r++){
			if(top && r >= col.length-3) return null;
			for(var c = 0;c < col[r].length-1;c++){
				//console.log(r,c,col[r][c])
				if(size_index == 0){
					if(col[r][c] == -1){
						return [r,c]
					}
				}else if(size_index == 1){
					if(col[r][c] == -1 && col[r][c+1] == -1){
						return [r,c]
					}
				}else if(size_index == 2){
					if(col[r][c] == -1 && col[r+1][c] == -1){
						return [r,c]
					}
				}else if(size_index == 3){
					if(col[r][c] == -1 && col[r+1][c] == -1 && col[r][c+1] == -1 && col[r+1][c+1] == -1){
						return [r,c]
					}
				}
			}
		}

		


		return null

		
		
		
	},

	addSpots: function(top){
		console.log('adding spots to ',top ? 'top' : 'bottom')
		if(top){
			this.grid_shifts ++;
			this.index_array.unshift([-1,-1,-2])	
		}else{
			for(var i = 0;i<this.buffer_size;i++){
				this.index_array.push([-1,-1,-2])
			}	
		}
	},

	fillSpot: function(child_i,size_i,r,c){

		var col = this.index_array
		if(size_i == 0 && col[r][c] == -1){
			col[r][c] = child_i;
			return true;
		}else if (size_i == 1 && col[r][c] == -1 && col[r][c+1] == -1){
			col[r][c] = col[r][c+1] = child_i
			return true
		}else if( size_i == 2 && col[r][c] == -1 && col[r+1][c] == -1){
			col[r][c] = col[r+1][c] = child_i
			return true
		}else if( size_i == 3 && col[r][c] == -1 && col[r+1][c] == -1 && col[r][c+1] == -1 && col[r+1][c+1] == -1){
			col[r][c] = col[r+1][c] = col[r][c+1] = col[r+1][c+1] = child_i
			return true
		}

		return false
	},

	addChild: function(index,child,top){
		

		if(top != null) var top = top;
		else var top = child.props.top;

		
		var spot = this.findSpot(child.props.size_index,top)
		while( !spot ){
			this.addSpots(top)
			spot = this.findSpot(child.props.size_index,top)
		}

		if(this.fillSpot(index,child.props.size_index,spot[0],spot[1])){
			this.insertChild(child,spot[0],spot[1],top);
		}else throw 'failed to add child to spot ['+spot[0] +','+spot[1]+']'
	},

	generateGrid: function(children){

		for(var i = 0; i < children.length; i++){
			this.addChild(i,children[i],false)
		}

		
	},

	updateGrid: function(children){
		var new_length = 0;

		if(children.length < this.state.length){
			console.error('grid does not support removing, resetting grid')
			return this.resetGrid(children);
		}
		//console.log(this.key_list);
		for(var i = 0; i < children.length; i++){
		
			var child = children[i]
			if(this.key_list.indexOf(child.key) == -1){
				this.addChild(i,child,true)
			}
		}

		TweenLite.to(this.refs.inner,child.props.ease_dur,{
			y: this.getDiam()*this.grid_shifts,
			ease: child.props.ease
		})


	},


	// shouldComponentUpdate: function(props,state){
	// 	console.log('SHOULD COMPONENT UPDATE?',this.state.length,props.children.length)


		

	// 	return true
	// },


	render: function(){

		if(this.key_list.length == 0 && this.props.children.length > 0){
			console.log('generate grid',this.state.length,this.props.children.length)

			this.generateGrid(this.props.children)
					
		}else if(this.props.children.length != this.key_list.length){
			console.log('update grid',this.state.length,this.props.children.length)

			this.updateGrid(this.props.children)
		}else{
			TweenLite.set(this.refs.inner,{
				y: this.getDiam()*this.grid_shifts,
			})
		}
		//console.log("INNER WIDTH:",this.getDiam()*this.index_array.length)
		return (
			<div ref = 'inner' style = {Object.assign({height:(this.getDiam()*(this.index_array.length-this.grid_shifts))+'px'},this.inner_style,this.props.style)}>
				{this.grid}
			</div>
		)
	}
})



module.exports.Grid = Grid;
module.exports.Item = GridItem;
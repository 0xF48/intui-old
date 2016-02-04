//var update = require('react-addons-update');
var React = require('react');


window._intui_render_calls = 0
//var connect = require('react-redux').connect;
//var render_counter = 0

var DimTransitionManager = function(){
	var transitions = []

	var needs_update_array = [];

	function resetchild(child){
		needs_update_array.push(child.parentElement)
		setTimeout(function(child) {
			resetXY(child)
		}.bind(null,child), 1);		
	}

	function setY(el,y){
		TweenLite.set(el,{
			y: y
		})
	}

	function setX(el,x){
		TweenLite.set(el,{
			x: x
		})
	}

	function resetXY(el){
		TweenLite.to(el,0.7,{
			ease: Power4.easeOut,
			x: 0,
			y: 0
		})		
	}

	return {

		needs_update: function(inner_el){
			
			var i = needs_update_array.indexOf(inner_el)
			if (i != -1) needs_update_array.splice(i,1)	
			return i == -1 ? false : true
		},



		add: function(el,offset){
			//console.log('ADD -> WIDTH',el.clientWidth)
			var Inner = el.parentElement;
			var Outer = el.parentElement.parentElement;
			var siblings = Array.prototype.slice.call(  Inner.childNodes );
			var index_count = 0;
			var child_index = siblings.indexOf(el);
			var offset_x = offset.offset_x;
			var offset_y = offset.offset_y;


			var x_inner_offset = 0
			var y_inner_offset = 0
			if(Inner._gsTransform != null){
				var x_inner_offset = Inner._gsTransform.x
			}
			if(Inner._gsTransform != null){
				var y_inner_offset = Inner._gsTransform.y
			}


			var min_x = -x_inner_offset;
			var min_y = -y_inner_offset;



			var max_x = Outer.clientWidth-x_inner_offset;
			var max_y = Outer.clientHeight-y_inner_offset;



			var boundry_x = null;
			var boundry_y = null;


			for(var i = 0 ; i< siblings.length ; i ++){
				var child = siblings[i];
				//console.log(child.style)
				if(child.style.position != 'relative') continue;
				
				if(offset_x != 0){
					if(child.offsetLeft + child.clientWidth > min_x){
						boundry_x = child.offsetLeft+child.clientWidth
						//console.log('BOUNDRY X = ',boundry_x,min_x)
						break;
					}
				}else if(offset_y != 0){
					if(child.offsetTop + child.clientHeight > min_y){
						boundry_y = child.offsetTop+child.clientHeight
						//console.log('BOUNDRY Y = ',boundry_y,min_y)
						break;
					}			
				}
				index_count++
			}

			for( var i = 0 ; i<siblings.length ; i++ ){
				var child = siblings[i];
				//console.log(child.style)
				if(child.style.position != 'relative') continue;
				if(offset_x != 0){
					if(el.offsetLeft < boundry_x && el.offsetLeft+el.clientWidth > min_x  && offset_x < 0){
						///console.log("V1")
						setX(child,-offset_x)
						resetchild(child)
					}else if(el.offsetLeft < boundry_x && el.offsetLeft+el.clientWidth > min_x*2 && offset_x > 0){
						//console.log("V2",min_x,el.offsetLeft,el.clientWidth)
						setX(child,-offset_x)
						resetchild(child)				
					}					
				}else if(offset_y != 0){
					if(el.offsetTop < boundry_y && el.offsetTop+el.clientHeight > min_y  && offset_y < 0){
						//console.log("V1")
						setY(child,-offset_y)
						resetchild(child)
					}else if(el.offsetTop < boundry_y && el.offsetTop+el.clientHeight > min_y*2 && offset_y > 0){
						//console.log("V2",min_y,el.offsetTop,el.clientHeight)
						setY(child,-offset_y)
						resetchild(child)	
					}										
				}
			}
			//console.log("ADD TRANSITION",offset);
		}
	}
}

var TransManager = new DimTransitionManager();




var Slide = React.createClass({
	s: {
		outer: {
			position : "relative",
			overflow : "hidden",
		},
		right: 	{
			"float":"left"
		},
		down: 	{
			"float":"top"
		},
		scroll: {
			h: {
				'-webkit-overflow-scrolling': "touch",
				"overflowScrolling" : "touch",
				"overflowX" :"scroll",
				"overflowY" : "hidden"
			},
			v: {
				'-webkit-overflow-scrolling': "touch",
				"overflowScrolling": "touch",
				"overflowY": "scroll",
				"overflowX" : "hidden"
			}
		}
	},

	/*
		@beta -> set slide beta variable
		@height -> set slide height
		@width -> set slide width
		@[right,left,up,down] -> slide direction
	*/

	getInitialState: function(){

		//internal globals.
		this.stage = {x:0,y:0};
		this.styl = {
			inner:{
				position: 'absolute',
				overflowX:this.props.scroll ? (this.props.vertical ? 'hidden' : 'scroll') : 'hidden',
				overflowY:this.props.scroll ? (this.props.vertical ? 'scroll' : 'hidden') : 'hidden',

			},
			outer:{},
		};
		this.prev_pos = -1;
		this.inner_ratio = 0;
		this.ease = {
			ease: Power4.easeOut,
			duration: 0.5,			
		}
		this.rect = {
			width:0,
			height:0
		}


		Object.assign(this.styl.outer,this.s.outer);

		return {
			x: 0,
			y: 0,
			dim: 0,
			dynamic : (this.props.slide || this.props.scroll) ? true : false, 
		}

	},

	getDefaultProps: function(){

		return {
			inverse: false,
			index_offset: -1,
			_intui_slide: true, //intui slide identifier.
			slide_duration: 0.5,
			slide_ease: Power4.easeOut,
			index_pos: -1, //current nested slide index.
			slide: null,
			offset: 0,
			beta: 100,
			scroll: null,
			height: null,
			width: null,
			// path: null,
		}
	},

	getXY: function(index){
		if(this.props.vertical){
			return {
				y: - this.rect.height * index,
			}
		}else{
			return {
				x: - this.rect.width * index,
			}
		}
	},

	getBeta: function(){
		var beta = null

		
		if(this.context.total_beta == null){
			beta = this.props.beta+'%';
		}else{
			beta =  100/this.context.total_beta*this.props.beta+'%'
		}
	//	console.log(this.props.beta,beta,this.context.total_beta,this.props.offset)
		if(this.props.offset != 0){

			return 'calc('+beta+' '+ (this.props.offset>0 ? '+ ' : '- ') + Math.abs(this.props.offset) + 'px)';
		}else{
			return beta
		}
	},

	getOuterHW: function(){
		if( ! this.context.total_beta ){
			return {
				height: this.props.height != null ? this.props.height+'px' : this.props.beta+'%',
				width: this.props.width != null ?  this.props.width+'px' : this.props.beta+'%'
			}
		}

		var h= null,w = null;

		if(this.context.vertical){
			h = this.props.height != null ? this.props.height+'px' : this.getBeta();
			w = '100%';
		}else{
			h = '100%';
			w = this.props.width != null ? this.props.width+'px' : this.getBeta();
		}

		return {
			height : h,
			width : w
		}
	},

	isValidChild: function(child){
		if(child == null) return false
		if(child.type.displayName == 'Slide') return true
		if(child.type.contextTypes !=  null && child.type.contextTypes._intui_slide != null) return true
		//redux connect
		if(child.type.WrappedComponent != null && child.type.WrappedComponent.contextTypes._intui_slide != null) return true
		return false
	},

	getInnerDim: function(){
		if(!this.props.children) return 0
		this.node_count = 0
		var d = 0
		for(var i = 0; i < this.props.children.length; i++){
			var child = this.props.children[i];
			if( !this.isValidChild(child)) continue
			this.node_count ++;
			
			if(this.props.vertical){
				d += child.props.height != null ? child.props.height : this.rect.height/100*child.props.beta;
			}else{
				d += child.props.width != null ? child.props.width : this.rect.width/100*child.props.beta;
			}

			if(child.props.offset != 0 && child.props.offset != null) d += child.props.offset 
		}
		return d	
	},

	getInnerHW: function(){
		if(!this.props.children){
			return {
				height: '100%',
				width: '100%'
			}
		} 
		
		var d = this.getInnerDim();
		
		return {
			width: (this.props.vertical || d == 0) ? '100%' : d+'px',
			height: (!this.props.vertical || d == 0) ? '100%' : d+'px',
		}
	},

	getTotalBeta: function() {
		if(!this.props.children) return 100		
		var b = this.getInnerDim()/(this.props.vertical ? this.rect.height : this.rect.width)*100
		if( b < 100 ) b = 100;
		if( b == Infinity) b = 100;
		return b
	},

	contextTypes: {
		_intui_slide: React.PropTypes.bool,
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool,
		path: React.PropTypes.string
	},

	childContextTypes: {
		path: React.PropTypes.string,
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

  	getChildContext: function() {
  		return {
  			path: this.context.path == null ? '/' : this.context.path  + '/' + (this.props.path != null ? this.props.path : ''),
  			total_beta: this.getTotalBeta(),
  			vertical: this.props.vertical,
  			auto_h: this.props.height === 'auto' ? true : false,
  			auto_w: this.props.width === 'auto' ? true : false,
  		}
  	},

  	/* if parent element width/height ratio changes, we re-render */
  	getHWRatio: function(){
  		if(this.rect.width != 0 && this.rect.height != 0){
  			return this.rect.width/this.rect.height
  		}else{
  			return 0
  		}
  	},
    getHWInnerRatio: function(){
  		if(this.refs.inner.clientWidth != 0 && this.refs.inner.clientHeight != 0){
  			return this.refs.inner.clientWidth/this.refs.inner.clientHeight
  		}else{
  			return 0
  		}
  	},

  	xRatio: function(x){
  		return (x == null ? this.state.x : x)/this.rect.width
  	},

  	yRatio: function(y){
  		return (y == null ? this.state.y : y)/this.rect.height
  	},

	ratio2X: function(x){
		return this.rect.width*(this.state.r_x == null ? 0 : this.state.r_x)
  	},

  	ratio2Y: function(y){
  		return this.rect.height*(this.state.r_y == null ? 0 : this.state.r_y)
  	},

	shouldComponentUpdate: function(props,state){
		
		//get dim change
		var set_offset = this.getDimChange(props);
		
		//if there is dim change pass offset along to transition manager
		if(set_offset != null) TransManager.add(this.refs.outer,set_offset);
		
		//get outer rectangle
		this.getRekt();

		//update self
		return this.updateState(props,state);
	},

	getRekt: function(){
		/* pixel perfect when not scaled */
		//this.refs.outer.getBoundingClientRect();

		/*use this for now */
		this.rect = {
			width: this.refs.outer.clientWidth,
			height: this.refs.outer.clientHeight
		}
	},

	betaToDim: function(beta){
		if(!this.refs.outer) return 0
		return (this.context.vertical ? this.refs.outer.parentElement.parentElement.clientHeight : this.refs.outer.parentElement.parentElement.clientWidth) / 100 * beta
	},

	/* new and old dimensions change difference calculator */
	getDimChange: function(props){
		if(props.height == this.props.height && props.width == this.props.width && props.beta == this.props.beta) return null
		//console.log("ANIMATE NEW DIM",this.)
	
		var diff_dim = null;
		var diff_beta = null;

		//console.log(this.props.vertical, props.height,this.props.height)
		//if(this.context.vertical && props.height != props.width props.width == null )
		if(this.context.vertical && props.height != this.props.height){
			if(props.height == null ){
				diff_dim =  this.betaToDim(props.beta) - this.props.height
			}else if(this.props.height == null){
				diff_dim =  props.height - this.betaToDim(this.props.beta)
			}else{
				diff_dim = props.height - this.props.height
			}
			
		}else if(!this.context.vertical && props.width != this.props.width){
			if(props.width == null ){
				diff_dim =  this.betaToDim(props.beta) - this.props.width
			}else if(this.props.width == null){
				diff_dim =  props.width - this.betaToDim(this.props.beta)
			}else{
				diff_dim = props.width - this.props.width
			}
		}else if(props.beta != this.props.beta){
			diff_beta =  props.beta - this.props.beta
		}else{
			throw 'something went wrong with dim transition.'
		}

		if(diff_beta) diff_dim = this.betaToDim(diff_beta)
		
		return {
			offset_x: this.context.vertical ? 0 : diff_dim,
			offset_y: !this.context.vertical ? 0 : diff_dim
		}
	},

	updateState: function(props,state){
		
		
		state = state || this.state;
		props = props || this.props;

//		console.log(props.index_offset,this.props.index_offset)

		var ratio = this.getHWRatio();

		var d_needs_update = state.dim != ratio || props.width != this.props.width || props.height != this.props.height || props.beta != this.props.beta ;
		var i_needs_update = TransManager.needs_update(d_needs_update,this.rect);

 
		//if(this.props.id == 'gui') console.log('UPDATE STATE',this.props.id,d_needs_update);

		if( ( props.index_offset != -1 || props.index_pos != -1 ) && state.dynamic){
			if(this.props.index_pos != props.index_pos || props.index_offset != this.props.index_offset){
				this.prev_pos = false

				// if(d_needs_update){
				// 	this.prev_pos = false		
				// }else{
				// 	this.prev_pos = false		
				// }

			}else if(this.props.index_pos == props.index_pos && d_needs_update){
	
				this.prev_pos = true

			}else if(this.props.index_pos == props.index_pos && i_needs_update && !d_needs_update){

				setTimeout(function() {
				 	var pos = this.getIndexXY(this.props.index_pos)
				 	this.toXY(pos.x,pos.y)					
				}.bind(this), 1);	
			}
		}

		if(d_needs_update){
			this.setState({
				offset_y: 0,
				offset_x: 0,
				dim: ratio,
			});
		}
		
		return true
	},

	componentDidUpdate: function(props,state){
		

		if( (this.props.index_pos != -1 || this.props.index_offset != -1) && this.state.dynamic){
			var pos = this.getIndexXY(this.props.index_pos)
			if(props.index_pos != this.props.index_pos || props.index_offset != this.props.index_offset){
				setTimeout(function() {
				 	var pos = this.getIndexXY(this.props.index_pos)
				 	this.toXY(pos.x,pos.y)					
				}.bind(this), 1);				
			}else if(this.prev_pos){
				this.setXY(pos.x,pos.y)	
			}
		}
	},

	bindPath: function(){

	},

	componentDidMount: function(){
		//TODO
		//console.log("SLIDE MOUNTED",this.props.router.path,this.context)
		this.getRekt();
		this.updateState();

		
		if(!this.props.onHover) return;
		this.refs.outer.addEventListener('mouseenter',this.props.onHover)
		this.refs.outer.addEventListener('mouseleave',this.props.onHover)
	},



	render: function(){

		window._intui_render_calls ++ 

		var outer = this.getOuterHW()


		outer = Object.assign(outer,this.styl.outer,this.context.vertical ? this.s.down : this.s.right,{
			'flexGrow' : (this.props.width != null || this.props.height != null) ? 1 : 0,
			'flexShrink' : (this.props.width != null || this.props.height != null) ? 0 : 1,
		},this.props.style);


		if(this.props.scroll){
			var inner = {
				height:'100%',
				width:'100%'
			}
		}else var inner = this.getInnerHW()

		
		inner = Object.assign(inner,this.styl.inner)
		
		if(this.node_count != null && this.node_count > 0){
			Object.assign(inner,{
				'flexDirection': this.props.vertical ? 'column' : 'row',
				'display': 'flex'
			})
		}
		


		return (
			<div onClick={this.props.onClick} id = {this.props.id} className={this.props.outerClassName || this.props.className} style = {outer} ref='outer' >
				<div className={this.props.innerClassName} style = {inner} ref='inner' >
					{this.props.children}
				</div>
			</div>
		)

	},


	toXY: function(x,y){
		if(this.props.index_offset != -1){
			if(this.props.vertical) y += this.props.index_offset
			else x += this.props.index_offset
		}
		//console.log("TO XY",x,y,this.props.id)
		TweenLite.to(this.scroller || this.refs.inner, this.props.slide_duration,{
			ease: this.props.slide_ease,
			x:-1*x,
			y:-1*y,
		})
	},

	setXY: function(x,y){
		if(this.props.index_offset != -1){
			if(this.props.vertical) y += this.props.index_offset
			else x += this.props.index_offset
		}
		
		//console.log("SET XY",x,y,this.props.id)
		TweenLite.set(this.scroller || this.refs.inner,{
			x:-1*x,
			y:-1*y
		})
	},


	//get x and y coordinates of child index.
	getIndexXY: function(index){
		//console.log("GET INDEX",index)
		if(this.state.dynamic == false) throw 'cant get index on static slides'
		var child_el = this.refs.inner.childNodes[index];
		if(child_el == null) throw 'cant get index of child that doesnt exist'
		var x,y = 0;
		var max_y = this.refs.inner.clientHeight-this.refs.outer.clientHeight
		var max_x = this.refs.inner.clientWidth-this.refs.outer.clientWidth
		if(!this.props.vertical){
			if(this.refs.inner._gsTransform != null){
				var self_w = this.refs.outer.clientWidth;
				var self_x = -this.refs.inner._gsTransform.x
				if(child_el.clientWidth < self_w){
					//if slide top is over halfway down the screen, slide to its bottom
					if(child_el.offsetLeft >= self_x+self_w/2){
						x = child_el.offsetLeft-(self_w-child_el.clientWidth)
					}else{
						x = child_el.offsetLeft
					}
				}else{
					x = child_el.offsetLeft
				}
			}else{
				x = child_el.offsetLeft
			}
			y = 0			
		}else{
			if(this.refs.inner._gsTransform != null){

				var self_h = this.refs.outer.clientHeight;
				var self_y = -this.refs.inner._gsTransform.y
				//console.log(self_h,self_y,child_el.offsetTop,child_el.clientHeight)
				if(child_el.clientHeight < self_h){
					if(child_el.offsetTop >= self_y+self_h/2){
						y = child_el.offsetTop-(self_h-child_el.clientHeight)
					}else{
						y = child_el.offsetTop
					}
				}else{
					y = child_el.offsetTop
				}
			}
			x = 0
		}

		return {
			x: x > max_x ? max_x : x,
			y: y > max_y ? max_y : y
		}
	},

});




var select = function(state){
	return {
		router:state.router
	}
}

module.exports = Slide;


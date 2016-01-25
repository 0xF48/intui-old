//var update = require('react-addons-update');
var React = require('react');



//var connect = require('react-redux').connect;
//var render_counter = 0




var Slide = React.createClass({
	s: {
		outer: {
			position : "relative",
			overflow : "hidden",
		},
		right: 	{"float":"left"},
		down: 	{"float":"top" },
		
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
		
		this.stage = {x:0,y:0};
		this.styl = {inner:{},outer:{},static:{
			
		}};

		this.prev_pos = -1;

		this.ease = {
			ease: Power4.easeOut,
			duration: 0.5,			
		}


		this.rect = {
			width:0,
			height:0
		}

		var state = {
			x: 0,
			y: 0,
			index: this.props.index,
			dim: 0,
			beta_offset: 0,
			dynamic : (this.props.slide || this.props.scroll) ? true : false, 
			inner:{
				width: '100%',
				height: '100%'
			},
			outer:{
				width: '100%',
				height: '100%'
			}
		}

		Object.assign(this.styl.inner,{overflow:'hidden'})

		Object.assign(this.styl.outer,
			this.s.outer,
			this.props.scroll ? (this.props.vertical ? this.s.scroll.v : this.s.scroll.h) : null
		);

		return state;
	},

	getDefaultProps: function(){

		return {
			ease: {
				duration: 1,
				ease: Power4.easeOut,
			},
			index_pos: -1,
			update: false, //performance
			relative: false,
			//split direction.
			v: false,
			slide: null,
			index: 0,
			duration: 0.5,
			auto_h: false,
			auto_w: false,
			snapvar: 0.8,
			offset: 0,
			beta: 100,
			start: false,
			current: null,
			scroll: null,
			height: null,
			width: null,
			path: null,
		}
	},

	//check start position
	getStart: function(){
		for(var i in this.props.children){
			var start_slide = this.props.children[i];
			if(start_slide.props.start){
				this.current = s;
				return(s.off());
			}
		}
		return 0
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
		if(!this.context.total_beta){
			return this.props.beta+'%';
		}
		return 100/this.context.total_beta*this.props.beta+'%'
	},

	getOuterHW: function(){
		//console.log("GET OUTER HW",this.props.id,this.state.dim)
		if( this.context.total_beta == null ){
			return {
				height: this.props.height || this.props.beta+'%',
				width: this.props.width || this.props.beta+'%'
			}
		}

		var h= null,w = null;

		if(this.context.vertical){
			h = this.props.height || this.getBeta();
			w = '100%';
		}else{
			h = '100%';
			w = this.props.width || this.getBeta();
		}

		return {
			height : h,
			width : w
		}
	},

	getInnerDim: function(){
		if(!this.props.children) return 0
		this.node_count = 0
		var d = 0
		for(var i = 0; i < this.props.children.length; i++){
			var child = this.props.children[i];
			if(child == null || !child.type || child.type.displayName !== 'Slide') continue;
			this.node_count ++;
			if(this.props.relative){
				d += (child.props.beta || 100);
			}else if(!this.props.vertical){
				d += child.props.width != null ? parseInt(child.props.width) : this.rect.width/100*child.props.beta;
			}else{
				d += child.props.height != null ? parseInt(child.props.height) : this.rect.height/100*child.props.beta;
			}
		}	
		//console.log("INNER DIM:",this.props.id,d);
		return d	
	},

	getInnerHW: function(){
		if( !this.state.dynamic || this.state.dim < 0 || !this.props.children) return {
			height: '100%',
			width: '100%'
		}
		
		//INNER NODE CALCULATIONS
		var w,h;

		//calulate the dimentions of inner div by adding all the dimentions of its nested elements (this is for scrollable containers)
		var d = this.getInnerDim();
		
		if(!this.props.vertical){
			if(this.props.relative){
				w = d+'%';
			}else if(d < this.rect.width){
				w = '100%';
			}else{
				w = d+'px';
			}

			h = '100%';
			
		}else{
			if(this.props.relative){
				h = d+'%';
			}else if(d < this.rect.height){
				h = '100%';
			}else{
				h = d+'px';
			}
			
			w = '100%';
		};

		return {
			width: w,
			height: h
		}
	},
	getTotalBeta: function() {
		if(!this.props.children) return 100
		if(this.props.relative){
			var b = this.getInnerDim()
		}else{
			var b = this.getInnerDim()/(this.props.vertical ? this.rect.height : this.rect.width)*100
		}
		if( b < 100 ) b = 100;
		return b
	},

	contextTypes: {
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

  	/*
  		if parent element width/height ratio changes, we re-render
  	*/
  	getHWRatio: function(){
  		if(this.rect.width != 0 && this.rect.height != 0){
  			return this.rect.width/this.rect.height
  		}else{
  			return 0
  		}
  	},

  	/*
		make sure that our x/y position is in relative porportion to width and height.
  	*/
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
		this.getRekt();
		return this.updateState(props,state);
	},

	// componentDidUpdate: function(props,state){
	// 	if(this.)
	// },

	getRekt: function(){
		//console.log("GET RECT",this.refs.outer.getBoundingClientRect());


		/* pixel perfect when not scaled */
		//this.refs.outer.getBoundingClientRect();


		/*use this for now */
		this.rect = {
			width: this.refs.outer.clientWidth,
			height: this.refs.outer.clientHeight
		}
	},

	updateState: function(props,state){

		state = state || this.state;
		props = props || this.props;

		var ratio = this.getHWRatio()

		var d_needs_update = state.dim != ratio;
		//var dim = null;

		//console.log(state.dynamic)

		

		
		if(props.index_pos != -1 && state.dynamic){
			console.log("UPDATE",this.props.id)
			//console.log("SET PREV",this.prev_pos,this.props.index_pos,"NEXT->",props.index_pos)
			if(this.props.index_pos != props.index_pos ){
				if(d_needs_update){
					console.log("NEEDS UPDATE",this.props.id,state.dim,ratio)
				//	var pos = this.getIndexXY(this.props.index_pos)
				//	this.setXY(pos.x,pos.y)
					// setTimeout(function() {
					// 	var pos = this.getIndexXY(props.index_pos)
					// 	this.toXY(pos.x,pos.y)					
					// }.bind(this), 1);
					//this.prev_pos = false		
					this.prev_pos = true		
				}else{
					this.prev_pos = false		
					//var pos = this.getIndexXY(props.index_pos)
				//	this.toXY(pos.x,pos.y)
					
				}
				//console.log("ANIMATE")
					
			}else if(this.props.index_pos == props.index_pos && d_needs_update){
				//console.log("DONT ANIMATE")
				this.prev_pos = true
				// var pos = this.getIndexXY(props.index_pos)
				// this.setXY(pos.x,pos.y)
				// setTimeout(function() {
				// 	var pos = this.getIndexXY(props.index_pos)
				// 	this.setXY(pos.x,pos.y)					
				// }.bind(this), 1);
			}
		}


		if(d_needs_update){
			this.setState({
				dim: ratio,
			});
		}
		return true
	},

	componentDidUpdate: function(props,state){
		

		if(this.props.index_pos != -1 && this.state.dynamic){
			//console.log('POST:',props.index_pos,'->',this.props.index_pos)
			var pos = this.getIndexXY(this.props.index_pos)
			if(props.index_pos != this.props.index_pos){
				//console.log("SWITCH",props.index_pos,'->',this.props.index_pos)
				setTimeout(function() {
				 	var pos = this.getIndexXY(this.props.index_pos)
				 	this.toXY(pos.x,pos.y)					
				}.bind(this), 1);				
				//this.setXY(pos.x,pos.y)	
			}else if(this.prev_pos){
				//console.log('SET')
				this.setXY(pos.x,pos.y)	
			}
		}
	},

	componentWillUnmount: function(props,state){

	},

	bindPath: function(){
		//cant bind to non dynamic.
		// if(!this.state.dynamic) return;
		// for(var child in this.props.children){
		// 	if(!child.type || child.type.displayName !== 'Slide') continue;
		// 	if(!child.props || child.props.path == null) continue;
		// 	var self_path = this.props.path != null ? '/' + this.props.path : ''
		// 	pathState.bind(child,this.context.path + self_path + '/' + child.props.path,function(child){

		// 	}.bind(this))
		// }

		// if(!this.props.path || !this.state.dynamic) return;
		// pathState.bind(this,this.)
	},

	componentDidMount: function(){
		//TODO
		//console.log("SLIDE MOUNTED",this.props.router.path,this.context)
		this.getRekt();
		this.updateState();

		
		this.bindPath();
		
		

		if(!this.props.onHover) return;

		
		this.refs.outer.addEventListener('mouseenter',function(){
			this.props.onHover(this,true)
		}.bind(this))

		this.refs.outer.addEventListener('mouseleave',function(){
			this.props.onHover(this,false)
		}.bind(this))
	},



	render: function(){
		//render_counter ++;

		//console.log(render_counter);
		//console.log("RENDER SLIDE",this.props.className,this.props.children);
		var outer = this.getOuterHW();
	
		

		Object.assign(outer,this.styl.outer,this.context.vertical ? this.s.down : this.s.right,{
			'flexGrow' : this.props.width != null || this.props.height != null ? 1 : 0,
			'flexShrink' : this.props.width != null || this.props.height != null ? 0 : 1,
		});
		
		
		if(this.state.dynamic){
			var inner = this.getInnerHW();
			Object.assign(inner,this.styl.inner,this.props.style)
			return (
				<div onClick={this.props.onClick} className={this.props.className || ''} style = {outer} ref='outer' >
					<div classNameInner={this.props.classNameInner || ''} style = {inner} ref='inner' >
						{this.props.children}
					</div>
				</div>
			)
		}else{
			Object.assign(outer,this.styl.static,this.props.style)
			
			if(this.node_count != null && this.node_count > 0){
				Object.assign(outer,{
					'flexDirection': this.props.vertical ? 'column' : 'row',
					'display': 'flex'
				})
			}
			//console.log("RENDER",outer);
			return (
				<div onClick={this.props.onClick} className={this.props.className || ''} style = {outer} ref='outer' >
					{this.props.children}
				</div>
			)	
		}
	},


	toXY: function(x,y){
		//console.log("TO XY",x,y,this.props.ease.duration)
		TweenLite.to(this.scroller || this.refs.inner, this.props.ease.duration,{
			ease: this.props.ease.ease,
			x:-1*x,
			y:-1*y,
		})
	},

	setXY: function(x,y){
		//console.log(this.state.dim)
		//console.log("SET XY",x,y)
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
		return {
			x: this.props.vertical ? 0 : child_el.offsetLeft,
			y: this.props.vertical ? child_el.offsetTop : 0,
		}
	},


	// to: function(opt){
	// 	this.getRekt();


	// 	opt.ease = opt.ease || Power2.easeOut;
	// 	opt.dur = opt.dur == null ? 0 : opt.dur;

	// 	var tobeta = false;
	// 	var x,y;
	// 	if(opt.beta != null){
	// 		if(this.props.vertical){
	// 			x = 0
	// 			y = this.rect.height/100*opt.beta				
	// 		}else{
	// 			x = this.rect.width/100*opt.beta
	// 			y = 0
	// 		}
	// 	}else if(opt.x || opt.y != null){
	// 		x = opt.x || 0;
	// 		y = opt.y || 0;
	// 	}

	// 	////console.log("this.to",x,y)
	// 	this.setState({

	// 		x: x,
	// 		y: y,
	// 	})
	// }
});




var select = function(state){
	return {
		router:state.router
	}
}

module.exports = Slide;





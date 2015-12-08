var React = require('react');
// var resizeListener = require('')
var _ = require('lodash');
require('gsap');
var update = require('react-addons-update');
//require('react/addons')
var rendercalls = 0;
window.rendercalls = rendercalls;
var HACK;

var Slide = React.createClass({
	s: {
		inner: {
			position : "relative",
			display : "flex",
			flexWrap : "nowrap",
		},
		outer: {
			position : "relative",
			overflowX : "hidden",
			overflowY : "hidden",
		},
		dir: {
			right: 	{ "flexDirection":"row" },
			left: 	{ "flexDirection":"row-reverse" },
			up: 	{ "flexDirection":"column-reverse" },
			down: 	{ "flexDirection":"column" }
		},
		scroll: {
			h: {
				"overflowScrolling" : "touch",
				"display" :"initial",
				"overflowX" :"scroll",
			},
			v: {
				"overflowScrolling": "touch",
				"display" :"initial",
				"overflowY": "scroll",
			}
		}
	},

	/*
		@beta -> set slide beta variable
		@height -> set slide height
		@width -> set slide width
		@[right,left,up,down] -> slide direction
	*/
	getInitialState: function(props){
		this.stage = {x:0,y:0};
		this.styl = {inner:{},outer:{},static:{}};

		this.rect = {
			width:0,
			height:0
		}

		var state = {
			x: 0,
			y: 0,
			index: this.props.index,
			dim: -1,
			beta: this.props.beta,
			dynamic : (this.props.scroll || this.props.slide) ? true : false, 
			split: (function(){

				if(this.props.split) return this.props.split;
				if(this.props.right) return 'right';
				if(this.props.left) return 'left';
				if(this.props.down) return 'down';
				if(this.props.up) return 'up';
				return 'down'
			}.bind(this))(),
			inner:{
				width: '100%',
				height: '100%'
			},
			outer:{
				width: '100%',
				height: '100%'
			}
		}

		state.vertical = (state.split == 'down' || state.split == 'up') ? true : false;

		
		Object.assign(this.styl.inner,
			this.s.inner,
			state.split == 'right' ? this.s.dir.right : null,
			state.split == 'left' ? this.s.dir.left : null,
			state.split == 'up' ? this.s.dir.up : null,
			state.split == 'down' ? this.s.dir.down : null);

		Object.assign(this.styl.outer,
			this.s.outer,
			this.props.scroll ? (state.vertical ? this.s.scroll.v : this.s.scroll.h) : null,
			this.props.style || null);

		

		Object.assign(this.styl.static,
			this.s.inner,
			state.split == 'right' ? this.s.dir.right : null,
			state.split == 'left' ? this.s.dir.left : null,
			state.split == 'up' ? this.s.dir.up : null,
			state.split == 'down' ? this.s.dir.down : null,
			this.props.style || null);
		return state;
	},

	getDefaultProps: function(){

		return {
			slide: null,
			index: 0,
			duration: 0.5,
			debug: {
				level:0,
				index:0
			},
			auto_h: false,
			auto_w: false,
			snapvar: 0.8,
			offset: 0,
			beta: 100,
			split: null,
			start: false,
			current: null,
			scroll: null,
			height: null,
			width: null
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
		if(this.state.vertical){
			return {
				y: - this.rect.height * index,
			}
		}else{
			return {
				x: - this.rect.width * index,
			}
		}
	},

	wBeta: function(){
		return this.state.beta+'%'
	},

	hBeta: function(){
		return this.state.beta+'%'
	},

	getOuterHW: function(){
		
		if(this.state.dim < 0){
			return {}
		}

		//console.log('GET OUTER HW',this.context.dir)

		var h= null,w = null;

		if( this.context.dir ){ //parent is a node!
			if( !this.props.width ){
				if(this.context.dir == 'down' || this.context.dir == 'up') w = this.context.auto_w ? 'auto' : '100%';
				else w = this.wBeta();
			}else{ w = this.props.width }
			
			if( !this.props.height ){
				if(this.context.dir == 'down' || this.context.dir == 'up') h = this.hBeta();
				else h = this.context.auto_h ? 'auto' : '100%';
			}else { h = this.props.height }
		}else{
			h = this.props.height || this.props.beta+'%';
			w = this.props.width || this.props.beta+'%';
		}


		return {
			height : h,
			width : w
		}
	},

	getInnerHW: function(){
		if( !this.state.dynamic || this.state.dim < 0 ) return {
			height: '100%',
			width: '100%'
		}
		
		//INNER NODE CALCULATIONS
		var w,h;

		//calulate the dimentions of inner div by adding all the dimentions of its nested elements (this is for scrollable containers)
		var d = 0;
		for(var i = 0; i < this.props.children.length; i++){
			var child = this.props.children[i];
			if(child.type.displayName !== 'Slide') continue;
			if(!this.state.vertical){
				d += child.props.width != null ? parseInt(child.props.width) : this.rect.width/100*child.props.beta;
			}else{
				d += child.props.height != null ? parseInt(child.props.height) : this.rect.height/100*child.props.beta;
			}
		}

		if(!this.state.vertical){
			if(d < this.rect.width){
				w = '100%';
			}else{
				w = d+'px';
			}

			h = '100%';
			
		}else {
			if(d < this.rect.height){
				h = '100%';
			}else{
				h = d+'px';
			}
			
			w = '100%';
		};



		// if(this.props.id == "test"){
		// 	console.log(h,w)
		// }


		return {
			width: w,
			height: h
		}
	},

	contextTypes: {
		dir: React.PropTypes.string,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

	childContextTypes: {
		dir: React.PropTypes.string,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

  	getChildContext: function() {
  		//console.log('GET CONTEXT',this.props.id,this.refs.outer ? (this.state.vertical ? this.rect.height : this.rect.width) : 0)
  		//HACK = this.refs.outer ? (this.state.vertical ? this.rect.height : this.rect.width) : 0;
  		return {
  			dir: this.state.split,
  			auto_h: this.props.height === 'auto' ? true : false,
  			auto_w: this.props.width === 'auto' ? true : false,
  		}
  	},

  	/*
  		if parent element width/height ratio changes, we re-render
  	*/
  	getHWRatio: function(){
  		return this.rect.width/this.rect.height
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
		this.updateRect();

		if(this.state.dim == this.getHWRatio()){

			if(this.props.slide && (this.state.x != state.x || this.state.y != state.y)){
				this.setState({
					r_x: this.xRatio(state.x), 	//x ratio
					r_y: this.yRatio(state.y) 	//y ratio
				})
				this.toXY(state.x,state.y,state.duration) //dynamic x,y (to a new animation state)
				return true
			}else{
				return false
			}
		}
		return this.updateState(state);
	},

	updateRect: function(){
		this.rect = this.refs.outer.getBoundingClientRect();
	},


	updateState: function(state){
		state = state || this.state;
		
		if(this.props.slide) this.setXY(this.ratio2X(state.x),this.ratio2Y(state.y)); 	//static x,y (no animation)
	
		this.setState({
			dim: this.getHWRatio(),
		});
		return true
	},

	componentDidMount: function(){
		//TODO
		this.updateRect();
		this.updateState();
	},

	render: function(){
		rendercalls ++;
		var outer = this.getOuterHW();

		Object.assign(outer,this.styl.outer)
		if(this.state.dynamic){
			var inner = this.getInnerHW();
			Object.assign(inner,this.styl.inner)
			return (
				<div style = {outer} ref='outer' >
					<div style = {inner} ref='inner' >
						{this.props.children}
					</div>
				</div>
			)
		}else{
			Object.assign(outer,this.styl.static)
			return (
				<div style = {outer} ref='outer' >
					{this.props.children}
				</div>
			)			
		}
	},

	toXY: function(x,y,dur){
		TweenLite.to(this.scroller || this.refs.inner, dur || this.state.duration,{
			ease: this.state.ease,
			x:-1*x,
			y:-1*y
		})
	},

	setXY: function(x,y){
		TweenLite.set(this.scroller || this.refs.inner,{
			x:-1*x,
			y:-1*y
		})
	},

	to: function(opt){
		this.updateRect();


		opt.ease = opt.ease || Power2.easeOut;
		opt.dur = opt.dur || 0.5;

		var tobeta = false;
		var x,y;
		if(opt.beta != null){
			if(this.state.vertical){
				x = 0
				y = this.rect.height/100*opt.beta				
			}else{
				x = this.rect.width/100*opt.beta
				y = 0
			}
		}else if(opt.x || opt.y != null){
			x = opt.x || 0;
			y = opt.y || 0;
		}

		//console.log("this.to",x,y)
		this.setState({
			ease: opt.ease,
			duration: opt.dur,
			x: x,
			y: y,
		})
	},

});

module.exports = Slide;





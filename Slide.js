var update = require('react-addons-update');
var React = require('react');





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
	getInitialState: function(props){
		
		this.stage = {x:0,y:0};
		this.styl = {inner:{},outer:{},static:{}};
		this.rect = {
			total_beta: 100,
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
			vertical: this.props.down || this.props.v ? true : false,
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
			this.props.scroll ? (state.vertical ? this.s.scroll.v : this.s.scroll.h) : null
		);

		return state;
	},

	getDefaultProps: function(){

		return {
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

	getBeta: function(){
		// if(this.refs.outer == null) return 100
		// var p = this.refs.outer.parentElement;

		// var total_beta = p && (!this.state.vertical ? p.clientWidth/this.rect.width*100 : p.clientHeight/this.rect.height*100) || 100;
  // 		if(total_beta < 100) total_beta = 100;
  // 		//console.log("GET TOTAL BETA FOR",this.props.id,total_beta);
		// //console.log('GET BETA',this.props.id,total_beta,this.state.beta);
		return 100/this.context.total_beta*this.state.beta+'%'
	},

	getOuterHW: function(){
		//console.log("GET OUTER HW",this.props.id,this.state.dim)
		if( this.context.total_beta == null ){
			return {
				height: this.props.height || this.state.beta+'%',
				width: this.props.width || this.state.beta+'%'
			}
		}

		var h= null,w = null;

		if(this.context.vertical){
			h = this.getBeta();
			w = '100%';
		}else{
			h = '100%';
			w = this.getBeta();
		}

		return {
			height : h,
			width : w
		}
	},

	getInnerDim: function(){
		if(!this.props.children) return 0
		var d = 0
		for(var i = 0; i < this.props.children.length; i++){
			var child = this.props.children[i];
			if(child.type.displayName !== 'Slide') continue;
			if(this.props.relative){
				d += (child.props.beta || 100);
			}else if(!this.state.vertical){
				d += child.props.width != null ? parseInt(child.props.width) : this.rect.width/100*child.props.beta;
			}else{
				d += child.props.height != null ? parseInt(child.props.height) : this.rect.height/100*child.props.beta;
			}
		}	
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
		
		if(!this.state.vertical){
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
				w = d+'%';
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

	contextTypes: {
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

	childContextTypes: {
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},



	getTotalBeta: function() {
		if(!this.props.children) return 100
		if(this.props.relative){
			var b = this.getInnerDim()
		}else{
			var b = this.getInnerDim()/(this.state.vertical ? this.rect.height : this.rect.width)*100
		}
		if( b < 100 ) b = 100;
		return b
	},

  	getChildContext: function() {
  		return {
  			total_beta: this.getTotalBeta(),
  			vertical: this.state.vertical,
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
		//this.getRekt();

		//console.log('SHUD UPD',this.state.dim,'( == )',this.getHWRatio())

		if(!this.getHWRatio()){
			console.error('cant update slide, bad HW RATIO: ',this.getHWRatio());
			return false
		} 

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

	getRekt: function(){
		//console.log("GET RECT",this.refs.outer.getBoundingClientRect());
		this.rect = this.refs.outer.getBoundingClientRect();
	},

	updateState: function(state){
		state = state || this.state;

		this.getRekt();

		//set inner style.
		

		if(this.props.slide) this.setXY(this.ratio2X(state.x),this.ratio2Y(state.y)); 	//static x,y (no animation)
		//console.log("UPDATE STATE TO ->",this.getHWRatio())
		this.setState({
			dim: this.getHWRatio(),
		});
		return true
	},

	componentDidMount: function(){
		//TODO
		//console.log("MOUNTED",this.props.id)
		this.getRekt();
		this.updateState();
	},

	render: function(){
		//console.log("RENDER",this.props.id)
		var outer = this.getOuterHW();
	
		

		Object.assign(outer,this.styl.outer,this.context.vertical ? this.s.down : this.s.right);
		
		if(this.state.dynamic){
			var inner = this.getInnerHW();
			Object.assign(inner,this.styl.inner,this.props.style)
			return (
				<div className={this.props.className || ''} style = {outer} ref='outer' >
					<div className={this.props.className || ''} style = {inner} ref='inner' >
						{this.props.children}
					</div>
				</div>
			)
		}else{
			Object.assign(outer,this.styl.static,this.props.style)
			return (
				<div className={this.props.className || ''} style = {outer} ref='outer' >
					{this.props.children}
				</div>
			)			
		}
	},

	toXY: function(x,y,dur){
		TweenLite.to(this.scroller || this.refs.inner, dur || this.state.duration,{
			ease: this.state.ease,
			x:-1*x,
			y:-1*y,
		})
	},

	setXY: function(x,y){
		TweenLite.set(this.scroller || this.refs.inner,{
			x:-1*x,
			y:-1*y
		})
	},

	to: function(opt){
		this.getRekt();


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

		////console.log("this.to",x,y)
		this.setState({
			ease: opt.ease,
			duration: opt.dur,
			x: x,
			y: y,
		})
	}
});


module.exports = Slide





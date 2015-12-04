var React = require('react');
// var resizeListener = require('')
var _ = require('lodash');
var update = require('react-addons-update');
//require('react/addons')
var rendercalls = 0;

var HACK;

var Slide = React.createClass({
	s: {
		inner: {
			"position" : "relative",
			"display" : "flex",
			"flexWrap" : "nowrap",
		},
		outer: {
			"position" : "relative",
			"overflowX" : "hidden",
			"overflowY" :"hidden",
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
				"overflowY": "hidden",
				"overflowX" :"scroll",
			},
			v: {
				"overflowScrolling": "touch",
				"display" :"initial",
				"overflowY": "scroll",
				"overflowX": "hidden",
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




		var state = {
			dim: -1,
			beta: this.props.beta,
			scroll: {
				x: 0,
				y: 0,
			},
			dynamic : true,//this.props.scroll ? true : false, 
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

		this.stylee = {inner:{},outer:{},static:{}};
		Object.assign(this.stylee.inner,
			this.s.inner,
			state.split == 'right' ? this.s.dir.right : null,
			state.split == 'left' ? this.s.dir.left : null,
			state.split == 'up' ? this.s.dir.up : null,
			state.split == 'down' ? this.s.dir.down : null);

		Object.assign(this.stylee.outer,
			this.s.outer,
			this.props.scroll ? (state.vertical ? this.s.scroll.v : this.s.scroll.h) : null,
			this.props.style || null);

		Object.assign(this.stylee.static,
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
		return {}
	},

	wBeta: function(){
		return this.state.beta+'%'
	},
	hBeta: function(){
		return this.state.beta+'%'
	},

	getOuterHW: function(){

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
		if( !this.state.dynamic ) return {
			height: '100%',
			width: '100%'
		}
		
		//INNER NODE COLACULATIONS
		var w,h;

		//calulate the dimentions of _el by adding all the dimentions of its nested elements (this is for scrollable containers)
		var d = 0;
		for(var i = 0; i < this.props.children.length; i++){
			var child = this.props.children[i];
			if(child.type.displayName !== 'Slide') continue;
			if(!this.state.vertical){
				d += child.props.width != null ? parseInt(child.props.width) : this.refs.outer.clientWidth/100*child.props.beta;
			}else{
				d += child.props.height != null ? parseInt(child.props.height) : this.refs.outer.clientHeight/100*child.props.beta;
			}
		}

		if(!this.state.vertical){
			if(d < this.refs.outer.clientWidth){
				w = '100%';
			}else{
				w = d+'px';
			}

			h = '100%';
			
		}else {
			if(d < this.refs.outer.clientHeight){
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
		dim: React.PropTypes.number,
		dir: React.PropTypes.string,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

	childContextTypes: {
		dim: React.PropTypes.number,
		dir: React.PropTypes.string,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

  	getChildContext: function() {
  		//console.log('GET CONTEXT',this.props.id,this.refs.outer ? (this.state.vertical ? this.refs.outer.clientHeight : this.refs.outer.clientWidth) : 0)
  		//HACK = this.refs.outer ? (this.state.vertical ? this.refs.outer.clientHeight : this.refs.outer.clientWidth) : 0;
  		return {
  			dir: this.state.split,
  			auto_h: this.props.height === 'auto' ? true : false,
  			auto_w: this.props.width === 'auto' ? true : false,
  		}
  	},

  	getDim: function(){
  		if(this.state.vertical){
  			return this.refs.outer.clientHeight/this.refs.outer.clientWidth
  		}else return this.refs.outer.clientHeight/this.refs.outer.clientWidth
  	},

	shouldComponentUpdate: function(){
	//	console.log('SHOULD UPDATE ? ',this.props.id,this.state.dim,'->',this.getDim());
		if(this.state.dim == this.getDim()) return false
		this.updateState();
		return true
	},


	updateState: function(inner,outer){
		// var s = {
		// 	dim: this.getDim(),
		// //	inner: inner || this.getInnerHW(),
		// //	outer: outer || this.getOuterHW()
		// }
		//console.log('UPDATE',this.props.id,'to',s.inner,s.outer)
		//console.log(s,this.refs.outer);
		this.setState({
			dim: this.getDim()
		});
	},

	componentDidMount: function(){
		////console.log("MOUNTED",this.refs.inner,this.refs.outer);
		window.onresize = this.updateState; //TODO
		this.updateState();
	},

	render: function(){
		rendercalls ++;
		//console.log('#',rendercalls);

		//console.log(this.state.inner,this.state.outer);
		if(this.refs.inner != null){
			var inner = this.getInnerHW();
			var outer = this.getOuterHW();
		}else{
			var inner = {}
			var outer = {}
		}
		


	
		if(this.state.dynamic){
		//	var outer = update(this.style.outer,{$merge : this.state.outer});
		//	var inner = update(this.style.inner,{$merge : this.state.inner});
			//console.log(inner,this.state.inner,this.style.inner);
			return (
				<div style = {_.merge({
					width : outer.width,
					height : outer.height
				},this.stylee.outer)} ref='outer' >
					<div style = {_.merge({
						width: inner.width,
						height: inner.height
					},this.stylee.inner)} ref='inner' >
						{this.props.children}
					</div>
				</div>
			)
		}else{
			return (
				<div style = {{
					width: outer.width,
					height: outer.height
				}} ref='outer' >
					{this.props.children}
				</div>
			)			
		}
	},

});

module.exports = Slide;





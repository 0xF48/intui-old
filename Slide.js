var React = require('react');
// var resizeListener = require('')
var _ = require('lodash');
var update = require('react-addons-update');
//require('react/addons')
var rendercalls = 0;

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
			beta: this.props.beta,
			scroll: {
				x: 0,
				y: 0,
			},
			dynamic: true,
			dynamic : this.props.scroll ? false : true, 
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

		this.style = {inner:{},outer:{}};
		Object.assign(this.style.inner,
			this.s.inner,
			state.split == 'right' ? this.s.dir.right : null,
			state.split == 'left' ? this.s.dir.left : null,
			state.split == 'up' ? this.s.dir.up : null,
			state.split == 'down' ? this.s.dir.down : null);

		Object.assign(this.style.outer,
			this.s.outer,
			this.props.scroll ? (state.vertical ? this.s.scroll.v : this.s.scroll.h) : null,
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
		return (this.state.dynamic) ? (this.refs.outer.parentElement.clientWidth/100*this.state.beta+this.props.offset)+'px' : this.state.beta+'%'
	},
	hBeta: function(){
		return (this.state.dynamic) ? (this.refs.outer.parentElement.clientHeight/100*this.state.beta+this.props.offset)+'px' : this.state.beta+'%'
	},

	getOuterHW: function(){
		//console.log('GET OUTER HW',this.context.dir)

		var h,w;

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
		
		if(d < this.refs.outer.clientWidth && !this.state.vertical){
			w = '100%'
		}

		else if(d < this.refs.outer.clientHeight && this.state.veritcal){
			h = '100%'
		}

		if(!this.state.vertical){
			w = d+'px';
			h = '100%'
		}

		else h = d+'px';

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
  		//console.log('GET CONTEXT',this.state.split)
  		return {
  			dir: this.state.split,
  			auto_h: this.props.height === 'auto' ? true : false,
  			auto_w: this.props.width === 'auto' ? true : false,
  		}
  	},

	shouldComponentUpdate:function(props,state){
		var inner = this.getInnerHW();
		var outer = this.getOuterHW();

		// //console.log('SHOULD UPDATE ?',inner.w,outer.w,this.state.inner,this.state.outer,this.refs.inner);
	
		

		var same_outer = (outer.width == this.state.outer.width && outer.height == this.state.outer.height)
		var same_inner = (inner.width == this.state.inner.width && inner.height == this.state.inner.height);

		if(same_outer && same_inner) return false;

		//console.log(same_outer,same_inner);

		
		this.updateState(inner,outer);

		return true;
	},

	updateState: function(inner,outer){
		var s = {
			inner: inner || this.getInnerHW(),
			outer: outer || this.getOuterHW()
		}
		//console.log(s,this.refs.outer);
		this.setState(s);
	},

	componentDidMount: function(){
		////console.log("MOUNTED",this.refs.inner,this.refs.outer);
		window.onresize = this.updateState; //TODO
		this.updateState();
	},

	render: function(){
		rendercalls ++;
		console.log('#',rendercalls);
		////console.log(this.state.inner)
		var inner_style = update(this.style.inner,{$merge : this.state.inner});
		var outer_style = update(this.style.outer,{$merge : this.state.outer});
		
		return (
			<div style = {outer_style} ref='outer' >
				<div style = {inner_style} ref='inner' >
					{this.props.children}
				</div>
			</div>
		);
	},

});

module.exports = Slide;





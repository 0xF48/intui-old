var React = require('react');
var DimController = require('./DimController')();


// window._intui_render_calls = 0


function clamp(n,min,max){
	if (n <= min) return min
	if(n >= max) return max
	return n
}


//Slide Classes.

module.exports = React.createClass({

	/* default props */
	getDefaultProps: function(){

		return {
			ease_params: [.5, 3], //easing params
			index_offset: -1, 
			_intui_slide: true, //intui slide identifier.
			ease_dur: 0.5, //slide ease_dur
			ease: Power4.easeOut,
			index_pos: -1, //current nested slide index.
			offset: 0, //slide offset in pixels
			beta: 100, //beta relative to parent
			c: null, //inner and static classname shortcut
			oc: null, //outer classname shortcut

			height: null, //height override
			width: null, //width override
			center: false,
			auto: false,

		}
	},

	/* default state and instance variables */
	getInitialState: function(){
		this.stage = {
			x:0,
			y:0,
			o_time:0,
			velocity: 0
		};

		this.scroll_ppos = null;
		this.scroll_pos = 0;
		this.prev_pos = -1; //im not sure what this does anymore
		
		
		this.rect = {
			width:0,
			height:0
		}

		return {
			dim: 0,
			dynamic : (this.props.slide), 
		}
	},

	/* context for talking up and down the tree */
	contextTypes: {
		_intui_slide: React.PropTypes.bool, //this is a uique prop to identify a react component as an intui slide.
		total_beta: React.PropTypes.number, //total beta is the total beta of all children for this slide passed in the declarative props
		vertical: React.PropTypes.bool, //check to see if parent is vertical or horizontal 
	},

	childContextTypes: {
		_intui_slide: React.PropTypes.bool,
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
	},

	getChildContext: function() {		
		return {
			_intui_slide: true,
			total_beta: this.getTotalBeta(),
			vertical: this.props.vertical,
		}
	},

	//return the width/height of the slide in percentages based on parent context total beta.
	getBeta: function(){
		var beta = null

		if(this.context.total_beta == null) beta = this.props.beta+'%';
		else beta =  100/this.context.total_beta*this.props.beta+'%'
		//offset is extra and is barely used, may need to be removed in future
		if(this.props.offset != 0) return 'calc('+beta+' '+ (this.props.offset>0 ? '+ ' : '- ') + Math.abs(this.props.offset) + 'px)';
		else return beta
	},
	
	//get the calculated outer height and width of the slide.
	getOuterHW: function(){

		if( !this.context.total_beta ) return {
			height: this.props.height != null ? this.props.height+'px' : this.props.beta+'%',
			width: this.props.width != null ?  this.props.width+'px' : this.props.beta+'%'
		}

		var h= null,w = null;

		//chicken knocks on eggs door and leaves.
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

	//get the calculated inner height and width of the slide.
	getInnerHW: function(){
		if( !this.props.children || (this.getTotalBeta() >= 100 && (!this.props.slide)) ){
			return {
				height: '100%',
				width: '100%'
			}
		} 
		
		var d = this.getInnerDim();
		
		return {
			width: (this.props.vertical || d == 0) ? (this.props.auto ? (this.props.vertical ? '100%' : 'auto') : '100%') : d+'px',
			height: (!this.props.vertical || d == 0) ? (this.props.auto ? (!this.props.vertical ? '100%' : 'auto') : '100%') : d+'px',
		}
	},

	//get innder dimentions in pixels
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

	//check to see if child is a valid intui slide.
	isValidChild: function(child){
		if(child == null) return false
		if(child.type == null) throw 'could not check the slide child, are you nesting values in the slide?'
		if(child.type.displayName == 'Slide') return true
		if(child.type.contextTypes !=  null && child.type.contextTypes._intui_slide != null) return true
		if(child.type.WrappedComponent != null && child.type.WrappedComponent.contextTypes._intui_slide != null) return true
		return false
	},

	//scroll to a position, the default transition time is 0.07 but may need to be adjusted based on performance.
	scrollTo: function(pos,dur){
		if(this.scroll_ppos == pos) return null
		this.scroll_ppos = pos
		if(this.props.vertical){
			TweenLite.to([this.refs.inner,this.stage],dur || 0.07,{
				y: -pos,
			})
		}else{
			TweenLite.to([this.refs.inner,this.stage],dur || 0.07,{
				x: -pos,
			})
		}
	},

	
	scroll_delta: function(delta){
		var r_min = 0
		var r_max = this.props.vertical ? (this.refs.inner.clientHeight - this.refs.outer.clientHeight) : (this.refs.inner.clientWidth - this.refs.outer.clientWidth); 	     //relative max (600px innerHeight)
		this.scroll_pos = clamp(this.scroll_pos+delta,r_min,r_max);

		this.scrollTo(this.scroll_pos)



		if(this.scroll_pos == r_max) return 1//this.scroll_cb(1,delta);
		else if(this.scroll_pos == r_min) return -1 //this.scroll_cb(-1,delta);
		else return 0//this.scroll_cb(0,delta);

	},

	getTotalBeta: function() {
		if(!this.props.children) return 100		
		var b = this.getInnerDim()/(this.props.vertical ? this.rect.height : this.rect.width)*100
		if( b < 100 ) b = 100;
		if( b == Infinity) b = 100;
		return b
	},

  	/* if parent element width/height ratio changes, we re-render */
  	getHWRatio: function(){
  		if(this.rect.width != 0 && this.rect.height != 0){
  			return this.rect.width/this.rect.height
  		}else{
  			return 0
  		}
  	},

  	/* if i was a bird i would just fly all the time */
    getHWInnerRatio: function(){
  		if(this.refs.inner.clientWidth != 0 && this.refs.inner.clientHeight != 0){
  			return this.refs.inner.clientWidth/this.refs.inner.clientHeight
  		}else{
  			return 0
  		}
  	},

	toXY: function(x,y){
		if(this.props.index_offset != -1){
			if(this.props.vertical) y += this.props.index_offset
			else x += this.props.index_offset
		}
		
		TweenLite.to(this.refs.inner, this.props.ease_dur,{
			ease: this.props.ease,
			params: this.props.ease_params,
			x: -x,
			y: -y,
		})
	},

	setXY: function(x,y){
		if(this.props.index_offset != -1){
			if(this.props.vertical) y += this.props.index_offset
			else x += this.props.index_offset
		}
		
		TweenLite.set(this.refs.inner,{
			x:-x,
			y:-y
		})
	},

	//get x and y coordinates of child index.
	getIndexXY: function(index){
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








	width: function(){
		if(!this.refs.outer) return -1
		else return this.refs.outer.clientWidth
	},

	height: function(){
		if(!this.refs.outer) return -1
		else return this.refs.outer.clientHeight
	},

	getRekt: function(){
		this.rect = {
			width: this.props.width || this.refs.outer.clientWidth,
			height: this.props.height || this.refs.outer.clientHeight
		}
	},

	betaToDim: function(beta){
		if(!this.refs.outer) return 0
		return (this.context.vertical ? this.refs.outer.parentElement.parentElement.clientHeight : this.refs.outer.parentElement.parentElement.clientWidth) / 100 * beta
	},

	getDimChange: function(props){
		if(props.height == this.props.height && props.width == this.props.width && props.beta == this.props.beta) return null
	
	
		var diff_dim = null;
		var diff_beta = null;

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
			}else if(this.props.width == null){
				diff_dim =  this.betaToDim(props.beta) - this.props.width
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
		

		if(this.refs.outer != null){
			//get dim change
			var set_offset = this.getDimChange(props);
			
			//if there is dim change pass offset along to transition manager
			if(set_offset != null) DimController.add(this.refs.outer,set_offset);
			
			//get outer rectangle
			this.getRekt();

			if(this.props.scroll) this.updateScrollBounds();
			//update self			
		}
		
		var ratio = this.getHWRatio();

		var d_needs_update = state.dim != ratio || props.width != this.props.width || props.height != this.props.height || props.beta != this.props.beta ;
		var i_needs_update = DimController.needs_update(d_needs_update,this.rect);


		if( ( props.index_offset != -1 || props.index_pos != -1 ) && state.dynamic){
			if(this.props.index_pos != props.index_pos || props.index_offset != this.props.index_offset){
				this.prev_pos = false;
			}else if(this.props.index_pos == props.index_pos && d_needs_update){
				this.prev_pos = true;
			}else if(this.props.index_pos == props.index_pos && i_needs_update && !d_needs_update){
				setTimeout(function() {
				 	var pos = this.getIndexXY(this.props.index_pos)
				 	this.toXY(pos.x,pos.y)
				}.bind(this), 0)
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

	componentWillUpdate: function(props,state){
		this.updateState(props,state);
	},

	resize: function(){
		this.forceUpdate()
	},

	componentWillUnmount: function(){
		window.removeEventListener('resize',this.resize)
	},

	hovering: false,
	componentDidMount: function(){

		this.getRekt();
		this.updateState();


		if(this.props.index_pos != -1){
			var pos = this.getIndexXY(this.props.index_pos)
			this.setXY(pos.x,pos.y)
		}

		if(this.context._intui_slide == null){
			this.resize = window.addEventListener('resize',this.resize)
		}
		
		if(!this.props.onHover) return;
		this.refs.outer.addEventListener('mouseenter',function(e){
			if(!this.hovering){
				this.hovering = true
				this.props.onHover(true)
			}
		}.bind(this))
		this.refs.outer.addEventListener('mouseleave',function(e){
			if(this.hovering){
				this.hovering = false
				this.props.onHover(false)
			}
		}.bind(this))
	},








	render: function(){
	
		// window._intui_render_calls ++ 
		var dynamic = this.props.slide || this.props.scroll;
		var outer_hw_style,inner_hw_style,innerClass,inner,outerClass,staticClass,scroll_proxy;

		if(dynamic){
			outer_hw_style = this.getOuterHW()
			inner_hw_style = this.getInnerHW()
			innerClass = ' _intui_slide_inner ' + (this.props.vertical ? ' _intui_slide_vertical ' : ' ') + (this.props.c || this.props.innerClassName || '') + (this.props.center ? ' _intui_slide_center' : '');
			inner = (
				<div className={innerClass} style = {inner_hw_style} ref='inner' >
					{this.props.children}
				</div>
			)
			outerClass = ' _intui_slide_outer ' + (this.props.scroll ? ' _intui_slide_scroll ' : '') + (this.props.oc || this.props.outerClassName || '') + ( (this.props.height != null || this.props.width != null) ? ' _intui_slide_fixed':'' );
		}else{
			outer_hw_style = this.getOuterHW()
			inner = this.props.children
			staticClass = ' _intui_slide_static' + (this.props.center ? ' _intui_slide_center' : '') + (this.props.vertical ? ' _intui_slide_vertical ' : ' ') + ( (this.props.height != null || this.props.width != null) ? ' _intui_slide_fixed ':' ' ) + (this.props.c || this.props.innerClassName || '')
		}
		

		return (
			<div onClick={this.props.onClick} id = {this.props.id} className={dynamic ? outerClass : staticClass} style = {outer_hw_style} ref='outer' >
				{scroll_proxy}
				{inner}
			</div>
		)
	}
});





















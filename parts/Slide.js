var React = require('react');
var ReactDOM = require('react-dom')
const SCROLL_PROXY_TARGET = 'app';

window._intui_render_calls = 0

function clamp(n,min,max){
	if (n <= min) return min
	if(n >= max) return max
	return n
}



module.exports = React.createClass({
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


			/* scroll props */
			overflow_dur: 0.3,
			overflow: true,
			//scroll_snap: false, //if scroll is enabled, you can force scroll snapping.
			//scroll_snap_force : 1, //more force means its harder to snap.
			//scroll_directional: true, //when scroll inertia is passed down the pipeline, it will ignore nodes that go in a different direction by default, unless this is set to false.
		}
	},


	getInitialState: function(){
		this.stage = {
			x:0,
			y:0,
			o_time:0,
			velocity: 0
		};
		
		this.prev_pos = -1; //im not sure what this does anymore
		this.scroll_cb = [];
		
		this.rect = {
			width:0,
			height:0
		}

		

		return {
			dim: 0,
			dynamic : (this.props.slide), 
		}

	},


	contextTypes: {
		scroller: React.PropTypes.element, 
		_intui_slide: React.PropTypes.bool,
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool,
		path: React.PropTypes.string, //todo
		children_indecies: React.PropTypes.array,
		// scroll_index: React.PropTypes.number,
		passPipe: React.PropTypes.func,
	},

	childContextTypes: {
		_intui_slide: React.PropTypes.bool,
		
		// scroll_index: React.PropTypes.number,
		children_indecies: React.PropTypes.array,
		scroller: React.PropTypes.element, 
		path: React.PropTypes.string, //todo
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

	getChildContext: function() {
		// var ca = [];
		// for(var i in this.props.children){
		// 	var c = this.props.children[i]
		// 	if( c != null && c.props != null && c.props.scroll == true ){
		// 		ca.push(c.props.scroll_index || 0)
		// 	}
		// }
		
		return {
			_intui_slide: true,
			// children_indecies: ca,
			//scroll_index: this.props.scroll_index,
			path: this.context.path == null ? '/' : this.context.path  + '/' + (this.props.path != null ? this.props.path : ''), //todo
			total_beta: this.getTotalBeta(),
			vertical: this.props.vertical,
			auto_h: this.props.height === 'auto' ? true : false,
			auto_w: this.props.width === 'auto' ? true : false,
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

		
		if(this.context.total_beta == null) beta = this.props.beta+'%';
		else beta =  100/this.context.total_beta*this.props.beta+'%'
		

		if(this.props.offset != 0) return 'calc('+beta+' '+ (this.props.offset>0 ? '+ ' : '- ') + Math.abs(this.props.offset) + 'px)';
		else return beta
		
	},

	getOuterHW: function(){
		if( ! this.context.total_beta ){
			return {
				height: this.props.height != null ? this.props.height+'px' : this.props.beta+'%',
				width: this.props.width != null ?  this.props.width+'px' : this.props.beta+'%'
			}
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

	isValidChild: function(child){
		if(child == null) return false
		if(child.type == null) throw 'could not check the slide child, are you nesting values in the slide?'
		if(child.type.displayName == 'Slide') return true
		if(child.type.contextTypes !=  null && child.type.contextTypes._intui_slide != null) return true
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



















	updateScrollBounds: function(){
		// if(this.props.auto){
		// 	var inner = ( this.props.vertical ? this.refs.inner.clientHeight : this.refs.inner.clientWidth );
		// }else{
		// 	var inner = this.getInnerDim();
		// }
		// var outer = ( this.props.vertical ? this.refs.outer.clientHeight : this.refs.outer.clientWidth );

		// if(inner < outer){
		// 	inner = outer;
		// }
	
		// this.min_scroll_pos = 0;
		// this.max_scroll_pos = inner - outer

		console.log('update scroll bounds',this.max_scroll_pos,this.refs.inner.clientHeight);
	},




	p_pos :null,
	scrollTo: function(pos,dur){
		if(this.p_pos == pos) return null
		this.p_pos = pos
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

	pipeScroll: function(overflow){
		// console.log(this.props,"PIPE SCROLL TO",slide.props);
		this.scroll_cb = overflow;
		return this.scroll_delta;
	},

	scroll_pos: 0,

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
		
		//console.log("SET XY",x,y,this.props.id)
		TweenLite.set(this.refs.inner,{
			x:-x,
			y:-y
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








	width: function(){
		if(!this.refs.outer) return -1
		else return this.refs.outer.clientWidth
	},

	height: function(){
		if(!this.refs.outer) return -1
		else return this.refs.outer.clientHeight
	},

	getRekt: function(){
		/* pixel perfect when not scaled */
		//this.refs.outer.getBoundingClientRect();

		/*use this for now */
		this.rect = {
			width: this.props.width || this.refs.outer.clientWidth,
			height: this.props.height || this.refs.outer.clientHeight
		}
		// console.log('get rekt')
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











	// shouldComponentUpdate: function(props,state){
	// 	return this.updateState(props,state);
	// },


	updateState: function(props,state){

		state = state || this.state;
		props = props || this.props;
		

		if(this.refs.outer != null){
			//get dim change
			var set_offset = this.getDimChange(props);
			
			//if there is dim change pass offset along to transition manager
			if(set_offset != null) TransManager.add(this.refs.outer,set_offset);
			
			//get outer rectangle
			this.getRekt();

			if(this.props.scroll) this.updateScrollBounds();
			//update self			
		}
		

		


		var ratio = this.getHWRatio();

		var d_needs_update = state.dim != ratio || props.width != this.props.width || props.height != this.props.height || props.beta != this.props.beta ;
		var i_needs_update = TransManager.needs_update(d_needs_update,this.rect);


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





		//TODO
		//console.log("SLIDE MOUNTED",this.props.router.path,this.context)
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
			// if(e.target == this.refs.outer);
			if(!this.hovering){
				this.hovering = true
				this.props.onHover(true)
			}
			// console.log("SLIDE MOUSE ENTER",e.target)
			
		}.bind(this))
		this.refs.outer.addEventListener('mouseleave',function(e){
			// if(e.target == this.refs.outer);
			if(this.hovering){
				this.hovering = false
				this.props.onHover(false)
			}
			// console.log("SLIDE MOUSE LEAVE",e.target)
			
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
				<div className={innerClass} style = {Object.assign(inner_hw_style,this.props.style)} ref='inner' >
					{this.props.children}
				</div>
			)
			outerClass = ' _intui_slide_outer ' + (this.props.scroll ? ' _intui_slide_scroll ' : '') + (this.props.oc || this.props.outerClassName || '') + ( (this.props.height != null || this.props.width != null) ? ' _intui_slide_fixed':'' );
		}else{
			outer_hw_style = this.props.style != null ? Object.assign(this.getOuterHW(),this.props.style) : this.getOuterHW()
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



// var scrollProxy = new scrollProxyManager()
var TransManager = new DimTransitionManager();


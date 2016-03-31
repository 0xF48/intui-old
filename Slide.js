var React = require('react');
var ReactDOM = require('react-dom')
const SCROLL_PROXY_TARGET = 'app';

window._intui_render_calls = 0

function getAllEvents(element) {
    var result = [];
    for (var key in element) {
        if (key.indexOf('on') === 0) {
            result.push(key)
        }
    }
    return result
}

var Slide = React.createClass({
	getDefaultProps: function(){

		return {
			ease_params: [.5, 3], //easing params
			index_offset: -1, 
			_intui_slide: true, //intui slide identifier.
			duration: 0.5, //slide duration
			ease: Power4.easeOut,
			index_pos: -1, //current nested slide index.
			offset: 0, //slide offset in pixels
			beta: 100, //beta relative to parent
			scroll: null, //enable all types of scrolling
			height: null, //height override
			width: null, //width override


			// path: null, //todo
		}
	},


	getInitialState: function(){
		this.stage = {
			x:0,
			y:0
		};
		
		this.prev_pos = -1; //im not sure what this does anymore
		

		this.max_scroll_pos = 0 // max x or y movement of inner element
		this.min_scroll_pos = 0 // min x or y movement of inner element
		this.last_scroll_pos = 0 //

		this.rect = {
			width:0,
			height:0
		}

		return {
			x: 0,
			y: 0,
			dim: 0,
			dynamic : (this.props.slide || this.props.scroll) ? true : false, 
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


	
	getInnerDim: function(){ //trust me, this works
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

	// don't uncomment this
	getInnerHW: function(){
		if( !this.props.children || (this.getTotalBeta() >= 100 && (!this.props.slide && !this.props.scroll)) ){
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



	scrollInner: function(pos){
		this.min_scrollTop = 0
		this.max_scrollTop = (this.refs.c2_inner.clientHeight - this.refs.c2.clientHeight)
		
		


		if( (this.scrollTop <= this.min_scrollTop && this.reverse) || (this.scrollTop >= this.max_scrollTop && !this.reverse) ) {
			if(this.last_position_2 < this.last_position && this.reverse) this.last_position_2 = pos + (this.refs.c2.scrollHeight - this.refs.c2.clientHeight)
			var off = (this.last_position - this.last_position_2)/2
			var pull = 1
			if(off < 1) off = 1
			var offset = off*1/(1+off/pull)
			// if(offset > 300){
			// 	pull = 500-offset
			// 	var offset = off*1/(1+off/pull)
			// }
				
			


			if(this.reverse){
				this.last_position = pos + (this.refs.c2.scrollHeight - this.refs.c2.clientHeight)
			}else{
				this.last_position = pos
			}
			

			if(!this.end2){
				TweenLite.to(this.refs.c2_inner,0.07,{
					y:  -this.c2_scroll_pos-offset,
				})
			}

			if(this.end == false){
				
				setTimeout(function() {
					this.end2 = true
					TweenLite.to(this.refs.c2_inner,0.75,{
						y: this.reverse ? 0 : -this.max_scrollTop,
						ease: Power2.easeOut,
					})
					if(this.reverse){
					this.last_position = pos + (this.refs.c2.scrollHeight - this.refs.c2.clientHeight)
					}else{
					this.last_position = pos
					}
				}.bind(this),50);
				this.end = true
			}

		}else{
			this.end2 = false;
			this.end = false;


			if(this.last_position != 0){
				this.c2_scroll_pos = this.refs.c2.scrollHeight - this.refs.c2.clientHeight - this.last_position + pos
			}else{
				this.c2_scroll_pos =  pos
			}
				
			
			TweenLite.to(this.refs.c2_inner,0.07,{
				y: -this.c2_scroll_pos,
			})
			this.scrollTop = this.c2_scroll_pos

			this.last_position_2 = this.last_position
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
		path: React.PropTypes.string //todo
	},

	childContextTypes: {
		path: React.PropTypes.string, //todo
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

  	getChildContext: function() {
  		return {
  			path: this.context.path == null ? '/' : this.context.path  + '/' + (this.props.path != null ? this.props.path : ''), //todo
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

  	/* if i was a bird i would just fly all the time */
    getHWInnerRatio: function(){
  		if(this.refs.inner.clientWidth != 0 && this.refs.inner.clientHeight != 0){
  			return this.refs.inner.clientWidth/this.refs.inner.clientHeight
  		}else{
  			return 0
  		}
  	},

  	/* not sure? */
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

	componentDidMount: function(){
		//TODO
		//console.log("SLIDE MOUNTED",this.props.router.path,this.context)
		this.getRekt();
		this.updateState();

		
		if(!this.props.onHover) return;
		this.refs.outer.addEventListener('mouseenter',function(){
			this.props.onHover(true)
		}.bind(this))
		this.refs.outer.addEventListener('mouseleave',function(){
			this.props.onHover(false)
		}.bind(this))


		//bind scroll wrapper.
		if(this.props.scroll){
			this.scrollProxy.hookScroll(this.scroll)
		}
	},

	render: function(){

		// window._intui_render_calls ++ 


		var inner_hw_style = this.getInnerHW()
		var outer_hw_style = this.getOuterHW()

		var outerClass = ' _intui_slide_outer ' + (this.props.scroll ? ' _intui_slide_scroll ' : '') + (this.props.outerClassName || '');
		var innerClass = ' _intui_slide_inner ' + (this.props.vertical ? ' _intui_slide_vertical ' : ' intui_slide_horizontal ') + (this.props.innerClassName || '');


	
		return (
			<div onClick={this.props.onClick} id = {this.props.id} className={outerClass} style = {outer_hw_style} ref='outer' >
				<div className={innerClass} style = {Object.assign(inner_hw_style,this.props.style)} ref='inner' >
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
		TweenLite.to(this.scroller || this.refs.inner, this.props.duration,{
			ease: this.props.ease,
			easeParams:this.props.ease_params,
			x: -1*x,
			y: -1*y,
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
	}
});













var scrollProxyManager = function(){

	this.proxy_outer = document.createElement('div')
	this.proxy_outer.setAttribute('class', '_intui_scrollwrapper_outer')

	this.proxy_inner = document.createElement('div')
	this.proxy_inner.setAttribute('class', '_intui_scrollwrapper_inner')

	this.proxy_outer.appendChild(this.proxy_inner)
	document.body.appendChild(this.proxy_outer)
	

	/* proxy all events to webpiece */
	var events = getAllEvents(this.proxy_outer)
	
	// if(proxy_target == null) throw new Error("Intui bad input proxy target, please set the proper target proxy element id")
	
	for(e in events){
		this.document.body[events[e]] = function(e){
			setTimeout(function(){
				e.bubbles = true
				window.app_node.dispatchEvent(e)
			}, 0)
		}
	}

	return {
		hookScroll: function(listener){
			this.proxy_outer.addEventListener('scroll',listener)
		},
	}
}














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
module.exports = Slide;

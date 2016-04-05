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
		
			height: null, //height override
			width: null, //width override


			/* scroll props */

			scroll: false,
			overflow_dur: 0.3,
			overflow: true,
			scroll_snap: false, //if scroll is enabled, you can force scroll snapping.
			scroll_snap_force : 1, //more force means its harder to snap.
			scroll_directional: true, //when scroll inertia is passed down the pipeline, it will ignore nodes that go in a different direction by default, unless this is set to false.
		}
	},


	getInitialState: function(){
		this.stage = {
			x:0,
			y:0
		};
		
		this.prev_pos = -1; //im not sure what this does anymore
		
		this.rect = {
			width:0,
			height:0
		}

		this.initScroll();

		return {
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


	updateScrollBounds: function(){
		this.min_scroll_pos = 0;
		this.max_scroll_pos = (this.refs.inner.clientHeight - this.refs.outer.clientHeight);
	},


	initScroll: function(){
		/*scroll params */
		this.max_scroll_pos = Infinity // max x or y movement of inner element
		this.min_scroll_pos = 0 // min x or y movement of inner element
		this.last_pos = 0
		this.speed = 0


		this.scroll_overflow = false
		this.scroll_marker = 0 //we need to set a marker when the scroller pos goes past the inner slide limit
		//scroll marker is the top edge
	},



	scrollTo: function(pos,dur){
		if(this.props.vertical){
			TweenLite.to(this.stage,0.07 || dur,{
				y: -pos,
			})
		}else{
			TweenLite.to(this.stage,0.07 || dur,{
				x: -pos,
			})
		}
	},


	scrollInner: function(pos,reverse){ //absolute position.


		var max = this.max_scroll_pos
		var min = this.min_scroll_pos
		var npos = pos - this.scroll_marker //normalized position.



		// scroll marker is normalized relative to the absolute position.
		// in this case when we reach the max the marker is set to difference of inner and outer heights because that is the max.
		
		//overflow min start ONCE 
		if( npos <= min && reverse && this.scroll_marker > min ){
			console.log("OVERFLOW MIN")
			this.scroll_marker = npos
			if(this.props.overflow){
				setTimeout(function() {
					this.scrollTo(min,0.75);
				},this.props.overflow_dur*1000)
			}
		}

		//overflow max start ONCE
		else if( npos >= max && !reverse && this.scroll_marker < max ){
			console.log("OVERFLOW MAX")
			this.scroll_marker = npos
			if(this.props.overflow){
				setTimeout(function() {
					this.scrollTo(max,0.75);
				},this.props.overflow_dur*1000)
			}
		}


		//overflow max while pos is still overflowed
		if( this.props.overflow && ( (npos <= min && reverse) || (npos >= max && !reverse) )){
			var off = (this.scroll_marker - npos )/2;
			var pull = 1;
			var offset = off*1/(1+off/pull);
			this.scrollTo(offset);
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
		scroller: React.PropTypes.element, 
		_intui_slide: React.PropTypes.bool,
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool,
		path: React.PropTypes.string //todo
	},

	childContextTypes: {
		scroller: React.PropTypes.element, 
		path: React.PropTypes.string, //todo
		total_beta: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		auto_h: React.PropTypes.bool,
		auto_w: React.PropTypes.bool
	},

  	getChildContext: function() {
  		return {
  			scroller: this.refs.scroll_outer,
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

	componentWillReceiveProps: function(props){
		
		//get dim change
		var set_offset = this.getDimChange(props);
		
		//if there is dim change pass offset along to transition manager
		if(set_offset != null) TransManager.add(this.refs.outer,set_offset);
		
		//get outer rectangle
		this.getRekt();


		this.updateScrollBounds();
		//update self
			
		state = state || this.state;
		props = props || this.props;


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
				}.bind(this), 1)
			}
		}


		if(d_needs_update){
			this.setState({
				offset_y: 0,
				offset_x: 0,
				dim: ratio,
			});
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
			// if(this.context.scroller != null){
			// 	this.scroller = this.context.scroller
			// }
			// this.scroller = this.refs.scroll_outer
			this.refs.scroll_outer.addEventListener('scroll',this.scrollInner);
			this.stage.x = this.refs.scroller.getPos();
		}
	},

	render: function(){

		// window._intui_render_calls ++ 


		var inner_hw_style = this.getInnerHW()
		var outer_hw_style = this.getOuterHW()

		var outerClass = ' _intui_slide_outer ' + (this.props.scroll ? ' _intui_slide_scroll ' : '') + (this.props.outerClassName || '');
		var innerClass = ' _intui_slide_inner ' + (this.props.vertical ? ' _intui_slide_vertical ' : ' intui_slide_horizontal ') + (this.props.innerClassName || '');

		var scroll_proxy = null
		if(this.props.scroll) scroll_proxy = <ScrollProxy vertical = {this.props.vertical} ref = 'scroll_proxy' onScroll = {this.scrollInner} />
		return (
			<div onClick={this.props.onClick} id = {this.props.id} className={outerClass} style = {outer_hw_style} ref='outer' >
				{scroll_proxy}
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




























quickDelegate = function(event, target){
	var eventCopy = document.createEvent("MouseEvents");
	eventCopy.initMouseEvent(event.type, event.bubbles, event.cancelable, event.view, event.detail,
		event.pageX || event.layerX, event.pageY || event.layerY, event.clientX, event.clientY, event.ctrlKey, event.altKey,
		event.shiftKey, event.metaKey, event.button, event.relatedTarget);
	target.dispatchEvent(eventCopy);
// ... and in webkit I could just dispath the same event without copying it. eh.
};




/* scroll proxy is a private class used only by slide */
var ScrollProxy = React.createClass({

	getDefaultProps: function(){
		return {
			scroll_pos: 0,
			vertical: false, //vertical or horizontal scrolling ?
		}
	},

	getInitialState: function(){
		/* prev pos is pos from the last iteration */
		this.prev_pos = [0,0];
		
		/* the most recently updated x y position */
		this.pos = [0,0];
		
		/* every time an overflow happends total pos is incremented or decremented by height or width based on position */ 
		this.total_pos = [0,0];

		/* scroll direction comes from the difference of pos and prev_pos */
		this.reverse = false; //direction of scroll
		
		return {}
	},



	/* this scroll method is part of the proxy and handles calling scroll hooks and making sure the scroll proxy  never has a top or bottom,
	therfore capturing the inertia algorithm used by native ios */
	/*
		if there are hooks, they are passed the non normalized scroll variable that increments based on how many cycles the scroller has gone through.
	*/

	//scroll handler increments/decrements absolute scroll position and refreshes the scroll position. 
	scroll: function(){
		//input scroll left / top
		var scroll_pos = this.vertical ? this.refs.outer.scrollTop : this.refs.outer.scrollLeft;
		var max_pos = this.vertical ? (this.refs.inner.clientHeight - this.refs.outer.clientHeight) : (this.refs.inner.clientWidth - this.refs.outer.clientWidth);


		//bw overflow
		if(scroll_pos  == 0 && this.reverse){
			// if(this.props.onOverflow != null) this.props.onScrollMax(this.pos);
			this.total_pos[(this.props.vertical ? 1 : 0)] -= (this.props.vertical ? this.refs.outer.clientHeight : this.refs.outer.clientWidth)
		}
		

		//fw overflow
		else if(scroll_pos == max_pos && !this.reverse){
			// if(this.props.onScrollMin != null) this.props.onScrollMin(this.pos);
			this.total_pos[(this.props.vertical ? 1 : 0)] += (this.props.vertical ? this.refs.outer.clientHeight : this.refs.outer.clientWidth)
		}

			
		//add the normalized scrollTop to the absolute scroller position 
		this.pos[(this.props.vertical ? 1 : 0)] = this.total_pos[(this.props.vertical ? 1 : 0)] + scroll_pos


		//set direction
		this.reverse = this.prev_pos[(this.props.vertical ? 1 : 0)] > this.pos[(this.props.vertical ? 1 : 0)] ? true : false


		//one hook per scroll
		if(this.props.onScroll != null) this.props.onScroll(this.pos[(this.props.vertical ? 1 : 0)]);


		this.prev_pos = this.pos
	},


	delegateEvents: function(){
		var events = getAllEvents(this.refs.outer);
		this.refs.outer.style.zIndex = 99999;
		for(var e in events){
			// console.log(events[e])
			this.refs.outer[events[e]] = function(e){
				this.refs.outer.style.zIndex = -99999
				var el = document.elementFromPoint(e.clientX,e.clientY);
				if(el != null && e.type != 'scroll'){
					e.bubbles = true
					quickDelegate(e,el)
				}
				this.refs.outer.style.zIndex = 99999
			}.bind(this)
		}
	},


	componentDidMount: function(){
		this.delegateEvents();
		this.refs.outer.addEventListener('scroll',this.scroll);
		// console.log("scroller mounted h/w:",this.refs.outer.clientHeight,this.refs.outer.clientWidth);
	},


	render: function(){
		return (
			<div ref = 'outer' className = {'_intui_scrollwrapper_outer ' + (this.props.vertical ? '_intui_scrollwrapper_vertical' : '_intui_scrollwrapper_horizontal')}>
				<div ref = 'inner' className='_intui_scrollwrapper_inner'></div>
			</div>
		)
	}
})































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

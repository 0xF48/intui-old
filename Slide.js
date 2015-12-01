var react = require('react');



var Slide = React.createClass({
	state: {
		beta: 0,
		x:
		y:
	},
	s: {
		element: {
			"position" : "relative",
			"display" : "flex",
			"flex-wrap" : "nowrap",
			"height" : "100%",
			"width" : "100%",
		},
		wrapper: {
			"position" : "relative",
			"overflow-x" : "hidden",
			"overflow-y" :"hidden",
			"height" :"100%",
			"width" :"100%"
		},
		dir: {
			right: 	{ "flex-direction":"row" },
			left: 	{ "flex-direction":"row-reverse" },
			up: 	{ "flex-direction":"column-reverse" },
			down: 	{ "flex-direction":"column" }
		},
		scroll: {
			h: {
				"overflow-scrolling" : "touch",
				"display" :"initial",
				"overflow-y": "hidden",
				"overflow-x" :"scroll",
			},
			v: {
				"overflow-scrolling": "touch",
				"display" :"initial",
				"overflow-y": "scroll",
				"overflow-x": "hidden",
			}
		}
	},
	style: {},

/*
	@min ->
	@max ->
	@snapvar ->
	@snap ->
	@scroll ->
	@start -> 
	@beta -> set slide beta variable
	@offset -> set slide offset
	@height -> set slide height
	@width -> set slide width
	@[right,left,up,down] -> slide direction
*/
	constructor: function(){


		this.props.snapvar = this.props.snapvar || 0.8;
		this.props.offset = this.props.offset || 0;
		this.props.beta = this.props.beta || 100;
		if ( !this.props.right && !this.props.up && !this.props.down && !this.props.left ) this.props.right = true;
		this.props.snap = this.props.snap || false;
		this.props.start = this.props.start || false;

		this.state.x = 0;
		this.state.y = 0;
	
		this.current = null;
		this.isNested = false;
		this.isActive = true;
		this.slides = [];
		this.events = {};


		if(this.v.scroll == 2) this.initHoverScroll();
		

	},

	isVertical : function(){
		if(this.props.up || this.props.down) return true
		return false
	},

	




















	addMedia: function(media,cb){
		var mq = window.matchMedia(media);
		mq.addListener(cb.bind(this));
		mq.addListener(function(){

		
			//this.renderup();
			//this.setCurrent();
			// setTimeout(function() {
			// 	this.props.parent._checkActive();
			// }.bind(this), 0);
			
		}.bind(this))

		var call = cb.bind(this);
		call(mq);
		this.renderup();
		return this;
	},


	/*bind an event*/
	on: function(event,cb){
		if(event.match('(px)|(%)|width|height') != null){
			this.addMedia(event,cb)
		}
		this.events[event] = cb;
	},

	/*unbind an event/all events*/
	unbind: function(event){
		if(event == null) this.events = {};
		else this.events[event] = null;
	},

	/*calling happens no matter what, on every trigger.
	if there is a hook, it will be called.*/
	call: function(event){
		if(this.events[event] != null) this.events[event]();
	},

	//check start position
	getStart: function(){
		for(var i in this.slides){
			var s = this.slides[i];
			if(s.v.start){
				this.current = s;
				return(s.off());
			} 
		}
		return 0
	},

	//set current
	setCurrent: function(){
		if(this.current == null) return false

		//this.
		this.slide(this.current,0);
	},

	
	//get width from beta
	wBeta: function(beta,off){
		if(!this.isNested) return false;
		return this.props.parent.v.scroll%2 == 0 ? (this.props.parent.clientWidth/100*beta+off)+'px' : beta+'%'
	},

	//get height from beta
	hBeta: function(beta,off){
		if(!this.isNested) return false;
		return this.props.parent.v.scroll%2 == 0 ? (this.props.parent.clientHeight/100*beta+off)+'px' : beta+'%'
	},

	setBeta: function(){
		if(!this.props.parent) return;
		if(this.isNested){
			switch(this.props.parent.v.split){
				case 'down':
				case 'up':
					if(this.props.width == null) this.style.width = this.props.parent.style.width == 'auto' ? 'auto' : '100%';
					if(this.props.height == null) this.style.height = this.hBeta(this.props.beta,this.props.offset);
					break;
				case 'left':
				case 'right':
				default:
					if(this.props.width == null) this.style.width = this.wBeta(this.props.beta,this.props.offset);
					if(this.props.height == null) this.style.height = this.props.parent.style.height == 'auto' ? 'auto' : '100%';
					break;
			}
		//otherwise check for width and height settings and default to auto
		}else{
			if(this.props.width == null) this.style.width = this.props.parent.style.height == 'auto' ?  'auto' : '100%';
			if(this.props.height == null) this.style.height = this.props.parent.style.height == 'auto' ?  'auto' : '100%';
		}
	},
	/*
	flex is part of the core functionality which resizes the container div 
	so that all the nested slides are porportional to their set beta which
	is relative to the wrapper div and not the container div.
	*/

	flex: function(){
		//wrapper dims based parent wrapper dims.

		//if this slide has a parent, set the wrapper styles accordingly.

		this.setBeta();

		//DONT GO PAST THIS IF SCROLLING IS DISABLED.
		if(this.props.scroll %2 != 0) return
		
		this.setBeta();


		//INNER NODE COLACULATIONS

			//calulate the dimentions of _el by adding all the dimentions of its nested elements (this is for scrollable containers)
			var d = 0;
			for(var i = 0; i < this.slides.length; i++){
				if(!this.slides[i].isNested) continue;
				if(!this.isVertical()){
					d += this.slides[i].v.width != null ? parseInt(this.slides[i].v.width) : this.clientWidth/100*this.slides[i].v.beta;
				}else{
					d += this.slides[i].v.height != null ? parseInt(this.slides[i].v.height) : this.clientHeight/100*this.slides[i].v.beta;
				}
			}

			//if slide has no linked slides, just set it to auto
			
			if(d < this.clientWidth && !this.isVertical()){
				this.innerNode.style.width = '100%'
				return
			}

			if(d < this.clientHeight && this.isVertical()){
				this.innerNode.style.height = '100%'
				return
			}

			if(!this.isVertical()) this.innerNode.style.width = d+'px';

			else this.innerNode.style.height = d+'px';

		return;
	},

	renderall: function(){
		this.render();
		for(var i = 0;i<this.slides.length;i++){
			if(!this.slides[i].isNested) continue;
			this.slides[i].renderall();
		}
		this.render();
		this.setCurrent();
		//if(this.props.parent == null) this.render();
	},

	//UPDATE
	render: function(){
		this.flex();
		for(var i = 0;i<this.slides.length;i++){
			if(!this.slides[i].isNested) continue;
			this.slides[i].flex();
		}
		this.setCurrent();
		if(this.dragger != null) this.dragger.applyBounds(this.getSnapBounds());
		
	},
	renderup: function(){
		if(this.props.parent != null){
			this.props.parent.renderup();
		}else{
			this.renderall();
		}
	},









	//check to see if this slide is inside el, returns null if no collision, otherwise returns interection points.
	getBounds: function(el,wrapper,ratio,offset){
		var e;
		if(el.v != null){
			if(el.v.scroll%2 != 0 ){
				e = {x:el.scrollLeft,y:el.scrollTop}
				//console.log('test contains scroll',e);
			}else{
				e = {x:-el.stage.x,y:-el.stage.y}
				//console.log('test contains stage:',e);
			}
		}else{
			e = {x:el.scrollLeft,y:el.scrollTop}
			//console.log('test contains scroll no parent .v',e);
		}

		//BOX COLLISION DETECTION:
		
		//client
		var c_right = e.x+(wrapper != null ? wrapper.clientWidth : el.clientWidth);
		var c_left = e.x;
		var c_top = e.y;
		var c_bot = e.y+(wrapper != null ? wrapper.clientHeight : el.clientHeight);

		//object
		var o_left = this.offsetLeft;
		var o_right = this.offsetLeft+this.clientWidth;
		var o_top = this.offsetTop+(offset || 0);
		var o_bot = this.offsetTop+this.clientHeight+(offset || 0);

		//distance
		var d_bot =  c_bot- o_bot;
		var d_top =  o_top -c_top;
		var d_left =  c_left- o_left;
		var d_right =  o_right -c_right;

		//logic
		if(d_bot >= 0 && d_top >= 0 || d_bot <= 0 && d_top <= 0){
			if(d_right >= 0 && d_left >= 0 || d_right <= 0 && d_left <= 0){
				return [d_left,d_right,d_top,d_bot]
			}
		}else if(Math.abs(d_bot)<this.clientHeight/(ratio || 3) || Math.abs(d_top)<this.clientHeight/(ratio || 3)){
			if(Math.abs(d_right)<this.clientWidth/(ratio || 3) || Math.abs(d_left)<this.clientWidth/(ratio || 3)){
				return [d_left,d_right,d_top,d_bot]
			}
		}
		return false
	},


	getSnapBounds: function(){
		return {
			minX: (this.isVertical() ? 0 : (this.props.split == 'left' ? -this.innerNode.clientWidth-this.clientWidth : 0) ),
	   		maxX: (this.isVertical() ? 0 : (this.props.split == 'right' ? -this.innerNode.clientWidth+this.clientWidth : 0) ),	   		

	   		minY: (!this.isVertical() ? 0 : (this.props.split == 'up' ? -this.innerNode.clientHeight -this.clientHeight: 0) ),
	   		maxY: (!this.isVertical() ? 0 : (this.props.split == 'down' ? -this.innerNode.clientHeight+this.clientHeight : 0) ),
		}
	},


	initSnap: function(){

		if(this.props.snap != true){
			return;
		}
		console.log('init snap',this.innerNode.clientWidth)
		this.dragger = Draggable.create(this.innerNode,{
		    type: (this.isVertical()) ? 'y' : 'x',
		    edgeResistance: this.props.snapvar,
		    throwResistance: 5000,
		    maxDuration: 0.5,
		   	bounds: this.getSnapBounds(),
		    throwProps:true,
		    snap:{
		        x: function(endValue){
		            return Math.round(endValue / this.clientWidth) * this.clientWidth
		        }.bind(this),
		        y: function(endValue){
		           return Math.round(endValue / this.clientHeight) * this.clientHeight
		        }.bind(this)
		    }
		})[0];
	},
	//check if slide is vertical or not
	isVertical : function(){
		if(this.props.split == 'up' || this.props.split == 'down') return 1
		return 0
	},
	//get slide position
	getSlidePos: function(slide){
		var x,y;
		var s_end,s_start,c_end;

		if(this.isVertical()){
			try{
				s_start = -slide.offsetTop;
			}catch(e){
				console.log(this)
			}
			
			s_end = -(slide.offsetTop+slide.clientHeight);
			c_end = this.stage.y+this.clientHeight;

			if(s_end < -(this.clientHeight)){
				y = s_start+(this.clientHeight-slide.clientHeight);
			}else{
				y = s_start;
			}
			x = 0;
		}
		else{
			s_start = -slide.offsetLeft;
			s_end = -(slide.offsetLeft+slide.clientWidth);
			c_end = this.stage.x+this.clientWidth;

			if(s_end < -(this.clientWidth)){
				x = s_start+(this.clientWidth-slide.clientWidth);
			}else{
				x = s_start;
			}

			y = 0;
		}
		return[x,y]
	},
	//go to a specific slide.
	slide: function(slide,duration,ease,delay){
		if(_.isNumber(slide)) var pos = [!this.isVertical() ? slide : 0,this.isVertical() ? slide : 0]
		else var pos = this.getSlidePos(slide);
		
			
		if(duration == 0){
			TweenLite.set(this.innerNode,{
				x:pos[0],
				y:pos[1]
			});
			this.stage.x = pos[0];
			this.stage.y = pos[1];
			return 0
		}

		TweenLite.to(this.innerNode,(duration || 500)/1000,{
			x: pos[0],
			y: pos[1],
			ease:ease || Power4.easeOut,
		});

		this.stage.x = pos[0];
		this.stage.y = pos[1];

		if(_.isObject(slide)) {

			this.current = slide;
		};
	},
	//check if this slide is active and if not, scroll to it recursevly all the way up until an active parent has been found
	showSelf: function(duration,recursive,ease,scroller){

		if(this.props.parent == null){
			TweenLite.to(scroller || this.parentElement,duration/1000 || 1,{
				scrollTo:{
					y:this.offsetTop,
					x:this.offsetLeft,
					ease: Power4.easeOut
				}
			})
			return
		}
		if(recursive) this.props.parent.showSelf(duration,1,ease);
		if(this.props.parent.v.scroll%2 == 0){
			
			this.props.parent.slide(this,duration,ease);
		}
	},
	//get the offset Pixels
	off: function(){
		if(!this.isNested) return;
		return parseInt(-1* (this.props.parent.isVertical() ? this.offsetTop : this.offsetLeft))
	},
	//get slide neighbors
	neighbor: function(d){
		var p = this.props.parent;
		if(!p) return false;
		var index = p.slides.indexOf(this);
		if(d == null){
			if(p.slides[1-index] != null) return p.slides[1-index];
		}
		if(p.slides[index+d] != null) return p.slides[index+d];
		else return false
	},
	//3D EFFECTS
	rotate: function(opt){
		function dir(){
		//	switch((this.props.parent != null ? this.props.parent.v.split : null) || this.props.split)
		}
		TweenLite.to(this,2,{
			rotationX: opt.rot,
			ease: opt.rot || Circ.easeOut,
			transformOrigin: "left top",
			transformPerspective: 500
		})
	},

	initHoverScroll: function(){
		var offset = 80;
		var sync = function(e){
			var c,d,m;
			var pos = this.getBoundingClientRect();
			if(!this.isVertical()){
				d = this.clientWidth; //wrapper width
				c = e.clientX-pos.left; //mouse position 
				m = this.innerNode.clientWidth-d; //total width
			}else{
				d = this.clientHeight;
				c = e.clientY-pos.top.clamp(offset,d-offset); 
				m = this.innerNode.clientHeight-d;
			}

			var ratio = -(c*m/d).clamp(0,99999);
			this.slide(ratio);

		}


		$(this).on('mousemove',sync.bind(this));
	},






	//Initialize the slide
	start: function(){
		this.u_Base = true;
		this.initVars();
		this.initHTML();
		this.initCSS();
		

		if(this.parentElement != null && this.parentElement.u_Base){
			this.props.parent = this.parentElement;
			this.props.parent.slides.push(this);
			this.isNested = true;

			//set current
			if(this.props.start == true) this.props.parent.current = this;
			this.props.parent.setCurrent();

			//this.renderup();
		}else if(this.parentElement != null && this.parentElement.parentElement != null && this.parentElement.parentElement.u_Base && this.parentElement.parentElement.innerNode == this.parentElement){

			var p = this.parentElement.parentElement;
			this.props.parent = p;
			p.slides.push(this);
			this.isNested = true;
			//this.renderup();

			//set current
			if(this.props.start == true) p.current = this;
			p.setCurrent();
			
		}else if(this.offsetParent != null && this.parentElement.u_Base){
			//console.log(this.offsetParent.v)
			this.props.parent = this.offsetParent;
			this.props.parent.slides.push(this);
			this.isNested = true;

			//set current
			if(this.props.start == true) this.props.parent.current = this;
			this.props.parent.setCurrent();
		}






		if(this.props.scroll%2 == 0){
			//console.log(this.attributes['class']);
			//console.log('add event listener')
			addResizeListener(this,this.render);
		}

		this.setBeta();



		this.initSnap();
		
	},

	end:function(){

		this.isNested = false;
		if(this.props == null) return;
		if(this.props.parent == null) return;
		this.props.parent.slides.splice(this.props.parent.slides.indexOf(this),1);
		this.props.parent = null;
		removeResizeListener(this,this.render);
	}

























	isContainer: function(){
		return true;
	},

	componentDidMount: function(){
		Object.assign(this.style,
			isContainer ? this.s.container : this.s.wrapper,
			this.props.right ? this.s.dir.right : null,
			this.props.left ? this.s.dir.left : null,
			this.props.up ? this.s.dir.up : null,
			this.props.down ? this.s.dir.down : null,
		)

		this.s
	}

	render: function() {
		var slideStyle = {};
		var isContainer = this.isContainer();

		var beta = this.getBeta();

		
	
		return (
			<div style=slideStyle />
				{this.props.children}	
			</div>
		);
	}
});

module.exports = Slide;
/**
* Detect Element Resize
*
* https://github.com/sdecima/javascript-detect-element-resize
* Sebastian Decima
*
* version: 0.5.3
**/

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

(function () {
	var attachEvent = document.attachEvent,
		stylesCreated = false;
	
	if (!attachEvent) {
		var requestFrame = (function(){
			var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
								function(fn){ return window.setTimeout(fn, 20); };
			return function(fn){ return raf(fn); };
		})();
		
		var cancelFrame = (function(){
			var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
								   window.clearTimeout;
		  return function(id){ return cancel(id); };
		})();

		function resetTriggers(element){
			var triggers = element.__resizeTriggers__,
				expand = triggers.firstElementChild,
				contract = triggers.lastElementChild,
				expandChild = expand.firstElementChild;
			contract.scrollLeft = contract.scrollWidth;
			contract.scrollTop = contract.scrollHeight;
			expandChild.style.width = expand.offsetWidth + 1 + 'px';
			expandChild.style.height = expand.offsetHeight + 1 + 'px';
			expand.scrollLeft = expand.scrollWidth;
			expand.scrollTop = expand.scrollHeight;
		};

		function checkTriggers(element){
			return element.offsetWidth != element.__resizeLast__.width ||
						 element.offsetHeight != element.__resizeLast__.height;
		}
		
		function scrollListener(e){
			var element = this;
			resetTriggers(this);
			if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
			this.__resizeRAF__ = requestFrame(function(){
				if (checkTriggers(element)) {
					element.__resizeLast__.width = element.offsetWidth;
					element.__resizeLast__.height = element.offsetHeight;
					element.__resizeListeners__.forEach(function(fn){
						fn.call(element, e);
					});
				}
			});
		};
		
		/* Detect CSS Animations support to detect element display/re-attach */
		var animation = false,
			animationstring = 'animation',
			keyframeprefix = '',
			animationstartevent = 'animationstart',
			domPrefixes = 'Webkit Moz O ms'.split(' '),
			startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
			pfx  = '';
		{
			var elm = document.createElement('fakeelement');
			if( elm.style.animationName !== undefined ) { animation = true; }    
			
			if( animation === false ) {
				for( var i = 0; i < domPrefixes.length; i++ ) {
					if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
						pfx = domPrefixes[ i ];
						animationstring = pfx + 'Animation';
						keyframeprefix = '-' + pfx.toLowerCase() + '-';
						animationstartevent = startEvents[ i ];
						animation = true;
						break;
					}
				}
			}
		}
		
		var animationName = 'resizeanim';
		var animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
		var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
	}
	
	function createStyles() {
		if (!stylesCreated) {
			//opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
			var css = (animationKeyframes ? animationKeyframes : '') +
					'.resize-triggers { ' + (animationStyle ? animationStyle : '') + 'visibility: hidden; opacity: 0; } ' +
					'.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
				head = document.head || document.getElementsByTagName('head')[0],
				style = document.createElement('style');
			
			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}

			head.appendChild(style);
			stylesCreated = true;
		}
	}
	
	window.addResizeListener = function(element, fn){
		if (attachEvent) element.attachEvent('onresize', fn);
		else {
			if (!element.__resizeTriggers__) {
				if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
				createStyles();
				element.__resizeLast__ = {};
				element.__resizeListeners__ = [];
				(element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
				element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
																						'<div class="contract-trigger"></div>';
				element.appendChild(element.__resizeTriggers__);
				resetTriggers(element);
				element.addEventListener('scroll', scrollListener, true);
				
				/* Listen for a css animation to detect element display/re-attach */
				animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function(e) {
					if(e.animationName == animationName)
						resetTriggers(element);
				});
			}
			element.__resizeListeners__.push(fn);
		}
	};
	
	window.removeResizeListener = function(element, fn){
		if (attachEvent) element.detachEvent('onresize', fn);
		else {
			element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
			if (!element.__resizeListeners__.length) {
					element.removeEventListener('scroll', scrollListener);
					element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
			}
		}
	}
})();








/*	
	This work is licensed under Creative Commons GNU LGPL License.
	License: http://creativecommons.org/licenses/LGPL/2.1/
	Version: 0.3 (UNSTABLE)
	Author:  Yury Sidorov 



	v0.3 (dependencies : GSAP.TweenLite, GSAP.Draggable)
		- moved everything to custom html element for less repetition and more flexible performance.
		- removed iscroll dependency and used GSAP libraries instead.
		- removed jquery dependency
*/


/*

u-slide

*/

/* -- */
var u = u || {};


u.Loader = (function(){
  var templ = '<div class="_intui_loader"><div class="_intui_loader_wrap"><div class="_intui_loader_nub _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick2 _intui_loader_c"/><div class="_intui_loader_tick _intui_loader_c"/><div class="_intui_loader_tick _intui_loader_c"/><div class="_intui_loader_tick _intui_loader_c"/><div class="_intui_loader_tick _intui_loader_c"/></div></div>';
  var d = 40;
  var loading = false;
  var trans = 1;
  var easein = 'cubic-bezier(0.310,2.5, 0.170, 1.010)'
  var easeout = 'cubic-bezier(.75,.19,.13,.84)'
  
  var trans2 = 1;
  
  var go = function(el){
     if(!el._intui_loader) return;
     $(el._intui_loader.querySelectorAll('._intui_loader_tick')).each(function(i){
      if(this == el) return;
       //just fuck around with this for hours....
       if(i%2){
           var x = Math.sin(i*1.5)*d;
           var y = Math.cos(-el._intui_loader_start + Date.now()/700+i/2.5)*d*1.5;
           this.style.transform ='translate('+x+'px,'+y+'px) scale('+(2-Math.abs(Math.sin(Date.now()/2800+i)))+')';
       }else{
           var x = Math.sin(el._intui_loader_start + Date.now()/700+i/1.3)*d;
           var y = -Math.cos(el._intui_loader_start + Date.now()/700+i/1.5)*d/1.2;
           this.style.transform ='translate('+x+'px,'+y+'px) scale('+(1.7-Math.abs(Math.sin(Date.now()/2800+i)))+')';
       }
       //-----------------------
    });
    window.requestAnimationFrame(el._intui_lo);
  }
  var slide = function(el,nub,ldr,split){

    //console.log(split)
    switch(split){
      default:
        var t = 'translate(0px,0px)';
        break;
      case 'left':
        var t = 'translate('+(-el.clientWidth)+'px,'+0+'px)';
        break;
      case 'right':
        var t = 'translate('+(el.clientWidth)+'px,'+0+'px)';
        break;
      case 'down':
        var t = 'translate(0px,'+(el.clientHeight)+'px)';
        break;
      case 'up':
        var t = 'translate(0px,'+(-el.clientHeight)+'px)';  
    }
    nub.style.webkitTransform = ldr.style.webkitTransform = t
  }


  var neighbors = function(el,split,time){

    for(var i =0;i< el.childNodes.length;i++){
      var neigh = el.childNodes[i];
      if(neigh.nodeType != 1) continue;
      //console.log(neigh)
      
      if(neigh != el._intui_loader){
        if(split == null && time == 0){
         
          $(neigh).css('-webkit-transition',null)
          return;
        }else if(split != null){
          neigh._transv = neigh.style.webkitTransition
          neigh._transf = neigh.style.webkitTransform 
        }
        neigh.style.webkitTransition = 'transform '+time+'s '+easeout+' 0s';
        slide(el,neigh,neigh,split);
      }
    }
  }

  //spread the other ticks around
  var spreadaround = function(el){
    var ticks = el.querySelectorAll('._intui_loader_tick2');
   $(ticks).each(function(i){
      var a_off = 0
      var angle = -0.2+Math.PI/2.5*i+a_off;
      var dd = d;
      var s = 1.5
      if(i>4){
        dd = d*2
        angle = 2+Math.PI/2.5*i+a_off;
        s = 2;
      }
      this.style.webkitTransform = 'translate('+(Math.cos(angle)*dd*3)+'px,'+(Math.sin(angle)*dd*3)+'px) scale('+(s+Math.random()*0.5)+')';
   })
  }

  return{
    delaystart: function(el,split,d){
      setTimeout(function() {this.start(el,split)}.bind(this),d);
    },
    start: function(el,split){
      var q = $(el);
      var el = q[0];
      console.log(q)


      




      if(el._intui_loader != null) return false
      q.prepend(templ);

      spreadaround(el);
      var nub = el.querySelector('._intui_loader_nub')
      el._intui_loader = el.querySelector('._intui_loader');
      el._intui_loader_start = Date.now();
      nub.style.webkitTransform = 'scale(0)';
      nub.style.webkitTransition = 'transform '+trans+'s '+easein+' 0s';
      el._intui_loader.style.opacity = 1;
     
      
      nub.style.webkitTransform = 'scale(1)';
     

      switch(split){
        case 'left':
          el._intui_end = 'right'
          break;
        case 'right':
          el._intui_end = 'left'
          break;
        case 'up':
          el._intui_end = 'down'
          break;
        case 'down':
          el._intui_end = 'up'
          break;          
      }

      el._intui_lo = function(){
        go(this);
      }.bind(el);
      

      //set position for neighbors
      neighbors(el,split,0);

      el._intui_lo();
    },
    
    end: function(el,split){
      var q = $(el);
      var el = q[0],
      nub = el.querySelector('._intui_loader_nub')
      if(el._intui_loader == null) return;
      nub.style.webkitTransition = 'transform '+trans2+'s '+easeout+' 0s';
      el._intui_loader.style.webkitTransition = 'all '+trans2+'s '+easeout+' 0s';



      neighbors(el,null,trans2);
      setTimeout(function(){
        neighbors(el,null,0);

      }, trans2*1000);
     
      console.log(el._intui_end);
      slide(el,nub,el.querySelector('._intui_loader'),el._intui_end || split);
     
      el._intui_loader = null;
      el._intui_lo = null;
      el._intui_end = null;
      setTimeout(function(){
         this.removeChild( el.querySelector('._intui_loader'));

      }.bind(el),trans2*1000+100);
    }
  }
})();






























u.Base = {
	u_Base: false,
	initVars: function(){
		this.v = {
			//u-list
		 	min: this.attributes['min'] != null ?  this.attributes['min'].value : null,
			max: this.attributes['max'] != null ?  this.attributes['max'].value : null,
			snapvar: this.attributes['snapvar'] != null ? parseInt(this.attributes['snapvar'].value) : 0.8,
			snap: this.attributes['snap'] != null ? ((this.attributes['snap'].value == 'true' || this.attributes['snap'].value == '1') ? true : false) : false,
			//u-slide
			scroll: this.attributes['scroll'] != null ? parseInt(this.attributes['scroll'].value) : -1, // -1 : static auto.  //0: slide flex. //1: scroll auto //2: scroll hover
			start: this.attributes['start'] != null ? ((this.attributes['start'].value == 'true' || this.attributes['start'].value == '1') ? true : false) : false,
			beta: this.attributes['beta'] != null ? parseInt(this.attributes['beta'].value) : 100,
			split: this.attributes['split'] != null ? this.attributes['split'].value : 'right',
			offset: this.attributes['offset'] != null ? this.attributes['offset'].value : 0,
			height: this.attributes['height'] != null ?  this.attributes['height'].value : null,
			width: this.attributes['width'] != null ?  this.attributes['width'].value : null,
		}

		this.stage = {
			x: 0,
			y: 0
		}
//		console.log(this.v.scroll);
		this.current = null;
		this.isNested = false;
		this.isActive = true;
		this.slides = [];
		this.events = {};


		//init hoverscroll
		if(this.v.scroll == 2){
			this.initHoverScroll();
		}


	},

	initHTML: function(){
		this.classList = [];
		if(this.v.scroll%2 == 0){
			this.innerNode = document.createElement('div');
			this.innerNode.classList.add('_intui_el');
			this.classList.add('_intui_wp');


			this.innerNode.innerHTML = this.innerHTML;
			this.innerHTML = '';
			this.textContent = '';
			this.children = [];
			this.childNodes = [];
			this.appendChild(this.innerNode);
			
		}else{
			this.classList.add('_intui_el');
			this.innerNode = this;
		}
	},

	initCSS: function(){
		this.innerNode.classList = [];
		switch(this.v.split){
			case 'down':
				this.innerNode.classList.add('_intui_down');
			break;
			case 'up':
				this.innerNode.classList.add('_intui_up');
			break;
			case 'left':
				this.innerNode.classList.add('_intui_left');
			break;
			case 'right':
				this.innerNode.classList.add('_intui_right');
		}
		
		if(this.v.scroll == 1){
			if(this.isVertical()){
				this.classList.add('_intui_scroll_v')
			}else{
				this.classList.add('_intui_scroll_h')
			}
		}

		this.style.width = this.v.width || null;
		this.style.height = this.v.height || null;


	},


	//add a media query to a slide.
	addMedia: function(media,cb){
		var mq = window.matchMedia(media);
		mq.addListener(cb.bind(this));
		mq.addListener(function(){

		
			//this.renderup();
			//this.setCurrent();
			// setTimeout(function() {
			// 	this.v.parent._checkActive();
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
		return this.v.parent.v.scroll%2 == 0 ? (this.v.parent.clientWidth/100*beta+off)+'px' : beta+'%'
	},

	//get height from beta
	hBeta: function(beta,off){
		if(!this.isNested) return false;
		return this.v.parent.v.scroll%2 == 0 ? (this.v.parent.clientHeight/100*beta+off)+'px' : beta+'%'
	},

	setBeta: function(){
		if(!this.v.parent) return;
		if(this.isNested){
			switch(this.v.parent.v.split){
				case 'down':
				case 'up':
					if(this.v.width == null) this.style.width = this.v.parent.style.width == 'auto' ? 'auto' : '100%';
					if(this.v.height == null) this.style.height = this.hBeta(this.v.beta,this.v.offset);
					break;
				case 'left':
				case 'right':
				default:
					if(this.v.width == null) this.style.width = this.wBeta(this.v.beta,this.v.offset);
					if(this.v.height == null) this.style.height = this.v.parent.style.height == 'auto' ? 'auto' : '100%';
					break;
			}
		//otherwise check for width and height settings and default to auto
		}else{
			if(this.v.width == null) this.style.width = this.v.parent.style.height == 'auto' ?  'auto' : '100%';
			if(this.v.height == null) this.style.height = this.v.parent.style.height == 'auto' ?  'auto' : '100%';
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
		if(this.v.scroll %2 != 0) return
		
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
		//if(this.v.parent == null) this.render();
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
		if(this.v.parent != null){
			this.v.parent.renderup();
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
			minX: (this.isVertical() ? 0 : (this.v.split == 'left' ? -this.innerNode.clientWidth-this.clientWidth : 0) ),
	   		maxX: (this.isVertical() ? 0 : (this.v.split == 'right' ? -this.innerNode.clientWidth+this.clientWidth : 0) ),	   		

	   		minY: (!this.isVertical() ? 0 : (this.v.split == 'up' ? -this.innerNode.clientHeight -this.clientHeight: 0) ),
	   		maxY: (!this.isVertical() ? 0 : (this.v.split == 'down' ? -this.innerNode.clientHeight+this.clientHeight : 0) ),
		}
	},


	initSnap: function(){

		if(this.v.snap != true){
			return;
		}
		console.log('init snap',this.innerNode.clientWidth)
		this.dragger = Draggable.create(this.innerNode,{
		    type: (this.isVertical()) ? 'y' : 'x',
		    edgeResistance: this.v.snapvar,
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
		if(this.v.split == 'up' || this.v.split == 'down') return 1
		return 0
	},



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

		if(this.v.parent == null){
			TweenLite.to(scroller || this.parentElement,duration/1000 || 1,{
				scrollTo:{
					y:this.offsetTop,
					x:this.offsetLeft,
					ease: Power4.easeOut
				}
			})
			return
		}
		if(recursive) this.v.parent.showSelf(duration,1,ease);
		if(this.v.parent.v.scroll%2 == 0){
			
			this.v.parent.slide(this,duration,ease);
		}
	},




	//get the offset Pixels
	off: function(){
		if(!this.isNested) return;
		return parseInt(-1* (this.v.parent.isVertical() ? this.offsetTop : this.offsetLeft))
	},


	//get slide neighbors
	neighbor: function(d){
		var p = this.v.parent;
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
		//	switch((this.v.parent != null ? this.v.parent.v.split : null) || this.v.split)
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
			this.v.parent = this.parentElement;
			this.v.parent.slides.push(this);
			this.isNested = true;

			//set current
			if(this.v.start == true) this.v.parent.current = this;
			this.v.parent.setCurrent();

			//this.renderup();
		}else if(this.parentElement != null && this.parentElement.parentElement != null && this.parentElement.parentElement.u_Base && this.parentElement.parentElement.innerNode == this.parentElement){

			var p = this.parentElement.parentElement;
			this.v.parent = p;
			p.slides.push(this);
			this.isNested = true;
			//this.renderup();

			//set current
			if(this.v.start == true) p.current = this;
			p.setCurrent();
			
		}else if(this.offsetParent != null && this.parentElement.u_Base){
			//console.log(this.offsetParent.v)
			this.v.parent = this.offsetParent;
			this.v.parent.slides.push(this);
			this.isNested = true;

			//set current
			if(this.v.start == true) this.v.parent.current = this;
			this.v.parent.setCurrent();
		}






		if(this.v.scroll%2 == 0){
			//console.log(this.attributes['class']);
			//console.log('add event listener')
			addResizeListener(this,this.render);
		}

		this.setBeta();



		this.initSnap();
		
	},

	end:function(){

		this.isNested = false;
		if(this.v == null) return;
		if(this.v.parent == null) return;
		this.v.parent.slides.splice(this.v.parent.slides.indexOf(this),1);
		this.v.parent = null;
		removeResizeListener(this,this.render);
	}
}


























u.Button = (function(){
	var proto = Object.create(HTMLDivElement.prototype);
	_.merge(proto,u.Base);

	proto.createdCallback = function(){
	
		

	};

	proto.attachedCallback = function(){
		var $this = $(this);


		$this.attr('scroll',0)
		









		if(this.attributes['width'] != null){
			var w = this.attributes['width'].value.match(/\d+/)[0] || 9999999;
		}
		if(this.attributes['height'] != null){
			var h = this.attributes['height'].value.match(/\d+/)[0] || 9999999;
		}

		var d = h < w ? h : w;



		var dd =  d/4;
		var bg = $this.css('background').match(/^(rgb|rgba)\((.+)\)/) != null ? $this.css('background').match(/^(rgb|rgba)\((.+)\)/)[0] : '';
		var style1 = 'color:'+$this.css('color')+'; background:'+$this.css('background')+';';
		var style2 = 'color:'+bg+'; background:'+$this.css('color')+';';

		var icon_name = this.children[0] ? '<i class = '+this.children[0].localName+'></i>' : '';



		this.revese = (this.attributes['split'] && (this.attributes['split'].value == 'left'|| this.attributes['split'].value == 'up'));
		var slide1 = '<div style = "'+style1+'" beta = "100" is="u-slide" class = "flex-center" start = '+(this.reverse ? 0 : 1)+'>'+icon_name+'</div>'
		var slide2 = '<div style = "'+style2+'" beta = "100" is="u-slide" class = "flex-center" start = '+(this.reverse ? 1 : 0)+'>'+icon_name+'</div>'




		
	

		
		

		this.style.fontSize = dd+'px';
		this.innerHTML = slide1 + slide2;





		if(this.attributes['href'] != null){
			this.onclick = function(){
				window.open(this.attributes['href'].value)
			}.bind(this)
		}

		this.onmouseenter = function(){
			this.slide(this.slides[this.reverse ? 0: 1]);
		}.bind(this);

		this.onmouseleave = function(){
			this.slide(this.slides[this.reverse ? 1: 0]);
		}.bind(this);

		
		this.start();
		
	};

	proto.detachedCallback = function(){
		this.end();
	};

	return document.registerElement('u-button', {
		prototype: proto,
		extends: 'div'
	});
})();

























u.Slide = (function(){
	var proto = Object.create(HTMLDivElement.prototype)


	_.merge(proto,u.Base)




	proto.createdCallback = function(){

		return this;
	};

	proto.attachedCallback = function(){
		this.start();
	};

	proto.detachedCallback = function(){
		this.end();

	};

//	console.log(proto);

	return document.registerElement('u-slide', {
		extends:'div',
		prototype: proto
	});
})();















/*

u-list (infinitly scrollable container for u-slide templates)

*/
// u.List = (function(){


// 	proto = _.merge(Object.create(HTMLElement.prototype),u.Base,{
		
// 		add: function(html){
// 			this.views.push(html);
// 		},
		
// 		clear: function(){
// 			this.views = [];
// 			this.innerHTML = '';
// 		},

// 		render: function(){

// 		},

// 		initHTML: function(){
// 			this.style.width = this.v.width;
// 			this.style.height = this.v.height;
// 			switch(this.v.type){
// 				case 'scroll':
					
// 					break;
// 				case 'slide':

// 					break;
// 			}
// 		},

// 		flex: function(){
// 			var d = 
// 		}
// 	});

// 	proto.createdCallback = function(){
// 		//console.log(this)
// 		this.initVars();
// 		this.root = this.createShadowRoot();

// 		this.root.appendChild(this.slide);
// 	}

// 	proto.attachedCallback = function(){

// 	}

// 	proto.detachedCallback = function(){

// 	}



// 	//register element
	
// 	console.log('asd')
// 	//return prototype for raw use
// 	return document.registerElement('u-list',{
// 		prototype: proto
// 	});
// })();
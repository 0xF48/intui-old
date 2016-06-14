var React = require('react');

var Mixin = require('./GridMixin');


/* pass -1 for w/h to set size based on amount of children and grid dimentions */
var GridItem = React.createClass({
	mixins: [Mixin],
	hidden: null,
	getDefaultProps: function(){
		return {
			end: false,
			
			w: null,
			h: null,
			grid_shifts: 0,
			r: null,
			c: null,

			ease: Power2.easeOut,
			ease_dur: 0.6
		}
	},

	// getInitialState: function(){
	
	// },

	checkHidden: function(){
		// console.log(this.props.end);
		if(this.props.end == true) return true
		if(this.context.fixed == true) return false;
		// if(!this.context.scroll && !this.context.fixed) return false
		// if(this.context.vertical && this.context.scroll.y == this.last_scroll) return true;
		// if(!this.context.vertical && this.context.scroll.x == this.last_scroll) return true;

		if(this.context.vertical){
			var top =  (this.props.r - this.props.grid_shifts) * this.context.diam
			var h = this.context.diam*this.props.h
			var scroll = -this.context.scroll.y;
			if(scroll > top + h + this.context.outerHeight/3 ) return true
			if(scroll < top - this.context.outerHeight - this.context.outerHeight/3 ) return true
		}else{
			var left = (this.props.c - this.props.grid_shifts) * this.context.diam
			var w = this.context.diam*this.props.w
			var scroll = -this.context.scroll.x;
			if(scroll > left + w + this.context.outerHeight/3 ) return true
			if(scroll < left - this.context.outerHeight - this.context.outerHeight/3 ) return true
		}

		return false
	},

	


	componentDidUpdate: function(props,state){

		

		// //console.log(this.props.end,this.key)
		if(this.checkHidden()){
		
			// //console.log("HIDE GITEM")
			this.hide();		
		}else{
			
			// //console.log("SHOW GITEM")
			this.show()
		}
	},

	hide: function(set){
		if(this.hidden == true) return false
		this.hidden = true;

		if(set == true){
			// TweenLite.set(this.refs.item,{
			// 	scale:0.6,
			// 	rotationY: 180,
			// })
			TweenLite.set(this.refs.wrapper,{
				display: 'none'
			})	
			return
		}

		TweenLite.fromTo(this.refs.item,this.props.ease_dur,{
			rotationY: 0,
			rotationX: 0,
			scale:1,
		},{
			scale:0.6,
			rotationX: this.props.w > this.props.h ? 180 : 0,
			rotationY: this.props.w > this.props.h ? 0 : 180,
			ease: this.props.ease,
		})
		TweenLite.to(this.refs.wrapper,this.props.ease_dur,{
			display: 'none'
		})
		
	},

	show: function(set,delay){
		if(this.hidden == false) return false
		this.hidden = false;

		if(set == true){
			TweenLite.set(this.refs.item,{
				rotationY: 0,
				rotationX: 0,
				scale:1,
			})
			TweenLite.set(this.refs.wrapper,{
				display: 'block'
			})
			return
		}	

		TweenLite.fromTo(this.refs.item,this.props.ease_dur,{
			rotationX: this.props.w > this.props.h ? -180 : 0,
			rotationY: this.props.w > this.props.h ? 0 : -180,
			scale:0.6,
			opacity:0,
		},{
			opacity:1,
			delay: delay,
			rotationY: 0,
			rotationX: 0,
			scale:1,
			ease: this.props.ease,
		})

		TweenLite.set(this.refs.wrapper,{
			display: 'block'
		})

		if(this.props.onShow != null){
			this.props.onShow();
		}
		
	},


	


	componentDidMount:function(){

		if(this.checkHidden()){
			this.hide(true)

		}else{
			if(this.context.fixed){
				
				this.show(true)
			}else{
				this.show(false,0.4)
				
			}
		}

		if(!this.context.fixed) this.update_scroll_interval = setInterval(this.scrollUpdate,100);		
	},

	componentWillUnmount: function(){
		// console.log("UNMOUNT ITEM")
		if(!this.context.fixed) clearInterval(this.update_scroll_interval);
	},

	last_scroll: 0,
	scrollUpdate: function(){
		var hide = this.checkHidden()
		if(this.hidden != hide){
			if(hide) this.hide(true)
			else this.show()
		}

		if(this.context.scroll){
			this.last_scroll = this.context.vertical ? -this.context.scroll.y : -this.context.scroll.x;
		}
	},

	render: function(){
		

		if(!this.context.fixed){
			var left = ( this.props.c * this.context.diam) + 'px';
			var top = ( (this.props.r - this.props.grid_shifts) * this.context.diam) + 'px';
			var h =  this.context.diam*this.props.h + 'px';
			var w =  this.context.diam*this.props.w + 'px';			
		}else{
			var left = ( 100/this.context.w * this.props.c) + '%';
			var top =  ( 100/this.context.h * this.props.r) + '%';
			var w = ( 100/this.context.w * this.props.w) + '%';
			var h = ( 100/this.context.h * this.props.h) + '%';
		}


		var style = {
			left: left,
			top: top,
			height: h,
			width: w,
		}


		

		


		return (
			<div className = {'_intui_grid_item_outer'} onMouseEnter = {this.props.onMouseEnter} onMouseLeave = {this.props.onMouseLeave} ref='wrapper' style={style}>
				<div className = {'_intui_grid_item_inner '+this.props.className} ref='item'>
					{this.props.children}
				</div>
			</div>
		)
	}
})


module.exports = GridItem;
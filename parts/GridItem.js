

var Mixin = require('./GridMixin');


/* pass -1 for w/h to set size based on amount of children and grid dimentions */
var GridItem = React.createClass({
	mixins: [Mixin],
	hidden: null,
	getDefaultProps: function(){
		this.hide_t = null;
		return {
			animate: true,
			show_beta: 0.5,
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
		var ch = this.context.outerHeight;

		if(this.props.end == true) return true
		if(this.context.fixed == true) return false;
		// if(!this.context.scroll && !this.context.fixed) return false
		// if(this.context.vertical && this.context.scroll.y == this.last_scroll) return true;
		// if(!this.context.vertical && this.context.scroll.x == this.last_scroll) return true;

		if(this.context.vertical){
			var top =  (this.props.r - this.props.grid_shifts) * this.context.diam
			var h = this.context.diam*this.props.h
			var scroll = -this.context.scroll.y;
			if(scroll > top + h + ch*this.props.show_beta ) return true
			if(scroll < top - ch - ch*this.props.show_beta ) return true
		}else{
			var left = (this.props.c - this.props.grid_shifts) * this.context.diam
			var w = this.context.diam*this.props.w
			var scroll = -this.context.scroll.x;
			if(scroll > left + w + ch*this.props.show_beta ) return true
			if(scroll < left - ch - ch*this.props.show_beta ) return true
		}

		return false
	},

	


	componentDidUpdate: function(props,state){
		if(this.checkHidden()){
			this.hide(true);		
		}else{
			this.show(true)
		}
	},

	hide: function(set){
		if(this.hidden == true) return false
		this.hidden = true;

		this.refs.item.style.display = 'none'

		// if(set == true){

		// 	this.refs.item.style.display = 'none'	
		// 	return
		// }

		// this.refs.item.style.transition = ''
		// this.refs.item.style.transform = 'perspective(400px)'
		// this.refs.item.style.transition = 'transform 0.3s cubic-bezier(.29,.3,.08,1)'


		// TweenLite.fromTo(this.refs.item,this.props.ease_dur,{
		// 	rotationY: 0,
		// 	rotationX: 0,
		// 	scale:1,
		// 	perspective: 400,
		// },{
		// 	perspective: 400,
		// 	scale:0.6,
		// 	rotationX: this.props.w > this.props.h ? 90 : 0,
		// 	rotationY: this.props.w > this.props.h ? 0 : 90,
		// 	ease: this.props.ease,
		// 	display: 'none'
		// })
		
		
	},

	show: function(set,delay){
		if(this.hidden == false) return false
		this.hidden = false;

		if(set == true){
			this.refs.item.style.transform = ''
			this.refs.item.style.display = 'block'
			return
		}


		var x = this.props.w > this.props.h;

		var t_x = 'matrix3d(0.7,0,0.00,0,0.00,0,1.00,0,0,-1,0,0,0,0,0,1)'
		var t_y = 'matrix3d(0,0,1.00,0,0.00,0.7,0.00,0,-1,0,0,0,0,0,0,1)'

		clearTimeout(this.hide_t)

		this.refs.item.style.transition = ''
		this.refs.item.style.transform = 'scale(0.6) perspective(500px) '+(x ? t_x : t_y);
		this.refs.item.style.display = 'block'
		
		
		this.hide_t = setTimeout(function(){
			this.refs.item.style.transition = 'transform '+(this.props.ease_dur)+'s cubic-bezier(.29,.3,.08,1)'
			this.refs.item.style.transform = ' scale(1) perspective(500px) matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,0,0,1)';
		}.bind(this), Math.floor(Math.random()*100));

		



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

		if(!this.context.fixed) this.update_scroll_interval = setInterval(this.scrollUpdate,150+Math.random()*50);		
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
			else this.show(this.props.animate ? false : true)
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
			<div className = {'_intui_grid_item_outer '+this.props.outerClassName} onMouseEnter = {this.props.onMouseEnter} onMouseLeave = {this.props.onMouseLeave} ref='item' style={style} >
				{this.props.children}
			</div>
		)
	}
})


module.exports = GridItem;

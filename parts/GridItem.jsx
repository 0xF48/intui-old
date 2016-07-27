

var Mixin = require('./GridMixin');


/* pass -1 for w/h to set size based on amount of children and grid dimentions */
var GridItem = React.createClass({
	mixins: [Mixin],
	hidden: null,
	getDefaultProps: function(){
		this.hide_t = null;
		return {
			show_beta: 0.5,
			render_beta: 1,
			animate: true,
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
		if(this.context.vertical){
			var top =  (this.props.r - this.props.grid_shifts) * this.context.diam
			var h = this.context.diam*this.props.h
			var scroll = -this.context.scroll.y;

			if(scroll < top + h + ch*this.props.show_beta && scroll > top - ch - ch*this.props.show_beta) return 1
			if(scroll < top + h + ch*this.props.render_beta && scroll > top - ch - ch*this.props.render_beta) return 0
		}else{
			var left = (this.props.c - this.props.grid_shifts) * this.context.diam
			var w = this.context.diam*this.props.w
			var scroll = -this.context.scroll.x;
			if(scroll < left + w + ch*this.props.show_beta && scroll > left - ch - ch*this.props.show_beta ) return 1
			if(scroll < left + w + ch*this.props.render_beta && scroll > left - ch - ch*this.props.render_beta ) return 0
		}

		return -1
	},

	


	// componentDidUpdate: function(props,state){
	// 	var check = this.checkHidden();
	// 	var hidden = check < 0;
	// 	if(this.hidden == hidden) return
	// 	if(check == -1){
	// 		this.hide(true);		
	// 	}else{
	// 		this.show(check == 0)
	// 	}
	// },

	hide: function(set){
		
		this.hidden = true;
		this.refs.item.style.display = 'none'		
	},

	show: function(set,delay){
		
		this.hidden = false;

		clearTimeout(this.hide_t)

		if(set == true){
			this.refs.item.style.display = 'block'
			this.refs.item.style.transition = ''
			this.refs.item.style.transform = ''
			this.hide_t = setTimeout(function() {
				this.refs.item.style.transition = 'transform '+(this.props.ease_dur)+'s cubic-bezier(.29,.3,.08,1)'
			}.bind(this),1);
			return
		}else{
			var x = this.props.w > this.props.h;

			var t_x = 'matrix3d(0.7,0,0.00,0,0.00,0,1.00,0,0,-1,0,0,0,0,0,1)'
			var t_y = 'matrix3d(0,0,1.00,0,0.00,0.7,0.00,0,-1,0,0,0,0,0,0,1)'

			

			this.refs.item.style.transition = ''
			this.refs.item.style.transform = 'scale(0.6) perspective(500px) '+(x ? t_x : t_y);
			this.refs.item.style.display = 'block'
			
			
			this.hide_t = setTimeout(function(){
				this.refs.item.style.transition = 'transform '+(this.props.ease_dur)+'s cubic-bezier(.29,.3,.08,1)'
				this.refs.item.style.transform = ' scale(1) perspective(500px) matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,0,0,1)';
			}.bind(this), Math.floor(Math.random()*100));			
		}


		

		



		if(this.props.onShow != null){
			this.props.onShow();
		}
		
	},


	


	componentDidMount:function(){
		if(this.context.animate == false){
			return this.show(true)
		}
		var check = this.checkHidden()
		this.hidden = true;

		if(this.context.fixed){
			return this.show(false)
		}

		if(check < 0){
			this.hide()
		}else{
			this.show(check == 0)
		}
		

		this.update_scroll_interval = setInterval(this.scrollUpdate,200+Math.random()*50);		
	},

	componentWillUnmount: function(){
		if(this.context.animate == false){
			return
		}
		// console.log("UNMOUNT ITEM")
		this.hidden = true
		clearInterval(this.update_scroll_interval);
	},

	
	scrollUpdate: function(){
		var check = this.checkHidden()
		var hidden = check < 0
		if(this.hidden == hidden) return;
		if(check < 0) this.hide(true)
		else this.show(check == 0)
	
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

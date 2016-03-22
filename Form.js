
var React = require('react');
var I = require('./Slide');
var Mixin = require('./Mixin');
var $ = require('jquery');

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : null;
}
function pointOnLine(x2,y2,x1,y1,n){
	
	var d = Math.sqrt((x2-x1)*(x2-x1) + (y2 - y1)*(y2 - y1)) 
	var r = n / d 

	var x3 = r * x2 + (1 - r) * x1 
	var y3 = r * y2 + (1 - r) * y1 

	return [x3,y3]
}

var NumberFieldClass = {

	contextTypes: {
		_intui_field: React.PropTypes.bool,
	},

	mixins: [Mixin],

	getDefaultProps: function(){
		return {
			bounce: false, //bounce on ease out
			inverse: false, //the input will be above the cover.
			hint: null,
			maxChar: Infinity,
			focus: false,
			c1: '#F6F6F6',
			c2: '#3B3B3B'
		}
	},

	getInitialState: function(){
		return {
			edit_mode: false,
			value: this.props.hint || this.props.value
		}
		this.timeout,this.timeout2 = null
	},

	componentDidMount: function(){
	
		this.refs.wrapper.refs.outer.addEventListener('focus',function(e){
			e.preventDefault();
			return false
		})
		this.refs.wrapper.refs.outer.addEventListener('focusin',function(e){
			e.preventDefault();
			return false
		})

		window.field = this
	},

	componentWillUpdate: function(props,state){
		if(this.props.focus != props.focus){
			// console.log("TOGGLE FOCUS",this.props.focus,props.focus)
			this.toggleEdit(props.focus)
		}
	},

	toggleEdit: function(enter){
		
		if(enter == this.state.edit_mode) return false
		this.setState({
			edit_mode : !this.state.edit_mode
		})
	
		clearTimeout(this.timeout2)
		clearTimeout(this.timeout)

		if(enter == true){
			this.timeout = setTimeout(function() {
				this.refs.input.focus()
				this.refs.wrapper.refs.outer.scrollTop = 0;
				this.refs.wrapper.refs.inner.scrollTop = 0;
			}.bind(this), 300);			
		}else{
			// console.log("BLUR OUT",this.refs.input.value)
			this.refs.input.blur()

			if(this.props.onLeave != null) this.props.onLeave(this.refs.input.value)
			if(this.props.onChange != null) this.props.onChange(this.refs.input.value)
			
		}
	},

	change: function(e){
		if(e.target.value.length >= this.props.maxChar){

			console.log("TRIGGER OVERFLOW",this.props.maxChar,e.target.value.length)
			e.target.value =  e.target.value.slice(0,this.props.maxChar)
			if(this.props.onOverflow != null) this.props.onOverflow()
			this.refs.input.blur()
			this.refs.wrapper.refs.outer.scrollTop = 0;
			this.refs.wrapper.refs.inner.scrollTop = 0;
		}

		if(e.target.value == '' || e.target.value == null ) return null
		// this.setState({
		// 	value: this.props.hint,
		// })
		

		if(this.props.onChange == null) return
		return this.props.onChange(this.refs.input.value)
	},



	render: function(){
		
		var c1 = hexToRgb(this.props.c1)

		var edit_style = {
			color: this.props.c2,
			background: this.props.c1
		}

		var input_style = {
			borderBottom: 'rgba('+c1[0]+','+c1[1]+','+c1[2]+',0.5) 1px solid',
			color: this.props.c1
		}

		var a = (
			<I innerClassName = {'_intui_input_cover'} style = {edit_style} >
				{this.props.children}
			</I>
		)

		var b = (
			<I innerClassName = {'_intui_input_wrapper'}  style = {{color: this.props.c1, background: this.props.c2}} >
				<input autofocus="false" placeholder = {this.state.value} className = {'_intui_input'} style = {input_style} ref = "input" type="number" onChange ={this.change} onBlur = {this.toggleEdit.bind(this,false)} ></input>
			</I>
		)


		var first = this.props.inverse ? b : a
		var second = this.props.inverse ? a : b

		return (
			<I {...this.props} ref = 'wrapper' ease = { ( !this.state.edit_mode && this.props.bounce ) ? Bounce.easeOut : Power4.easeOut  } index_pos ={this.state.edit_mode ? 1 - (this.props.inverse ? 1 : 0) : 0 + (this.props.inverse ? 1 : 0)} slide vertical onHover={this.toggleEdit} >
				{first}
				{second}
			</I>
		)
	},
}











var ManyNumberFieldClass = {
	mixins: [Mixin],

	getDefaultProps: function(){
		return {
			ease: Power4.easeOut,
			overflow_focus: true,
			empyHolder: '-',
			fontSize: 10,
			error: null
		}
	},

	componentDidMount: function(){
		window.mnf = this
	},

	getInitialState: function(){
		this.fields = []
		this.cover = []
		return {
			next: 0,
			parts: Array(this.props.count),
			edit_mode: false
		}
	},

	toggleEdit: function(){

		if(this.state.edit_mode == true && this.props.onLeave != null){
			
			this.props.onLeave(this.state.parts)
		}

		this.setState({
			edit_mode : !this.state.edit_mode
		})
	},

	toggleNext: function(index){
		if(!this.props.overflow_focus) return
		console.log("TTOGLE NEXT")
		this.setState({
			next : index + 1
		})
	},

	makeFields: function(props,state){
		console.log("MAKE FIELDS")
		this.fields = [];
		this.cover = [];
		for( var i = 0 ; i < props.children.length;i++){
			var child = props.children[i]
			if((child.type.contextTypes != null && child.type.contextTypes._intui_field != null) || (child.contextTypes != null && child.contextTypes._intui_field != null)){
				var n_child = React.cloneElement(child,{key:i,focus: i == state.next ? true : false, onOverflow: this.toggleNext.bind(this,i)})
				this.fields.push(n_child)
			}else{
				this.cover.push(React.cloneElement(child,{key:i}))
			}
		}

		console.log("MADE FIELDS",this.cover,this.fields)
	},

	componentWillUpdate: function(props,state){
		if( (this.fields.length+this.cover.length) != props.children.length ||  this.state.next != state.next || this.props.value != props.value){
			this.makeFields(props,state)
		}
		// if(this.props.error != props.error){
			
		// 		this.setState({
		// 			error: this.props.error
		// 		})
			
		// }
		// return true
	},

	render: function(){
		return (
			<I {...this.props} vertical slide ease = {this.state.edit_mode && ! this.props.error ? Power4.easeOut : this.props.ease} index_pos = {this.props.error ? 0 : (this.state.edit_mode ? 2 : 1)} onHover={this.toggleEdit} >
				<I innerClassName = '_intui_input_error' >
					<span> {this.props.error} </span>
				</I>
				<I innerClassName = '_intui_input_cover' style = {{color: this.props.c2, background: this.props.c1}} >
					{this.cover}
				</I>
				<I innerClassName = '_intui_input_wrapper'>
					{this.fields}
				</I>
			</I>
		)
	},
}












var ToggleFieldClass = {
	getInitialState: function(){
		var state = {
			// toggle: false
		}
		this.stage = {
			inner_r: 0,
			outer_r: 10,
			outer_ri: 10,
			outer_c: [255,255,255],
			inner_c: [0,0,0]
		}
		
		this.inner_stage = []
		for(var i = 0;i<this.props.inner_sections;i++){
			this.inner_stage.push( {r:0})
		}
		return state
	},

	getDefaultProps: function(){
		return {
			color: '#00E2FF',
			inner_sections: 40,
			outer_sections: 1,
			inner_stagger: 0.2,
			outer_stagger: 0.3,
			size: 10,
			toggle: false,
			x: 0,
			y: 0
		}
	},

	off: function(){
		this.stage.a = 1
		TweenLite.to(this.stage,1,{
			a: 0,
			ease: Power4.easeOut,
			easeParams:[0.4, 0.2],
			outer_r: this.stage.max_outer_r,
			outer_ri: this.stage.max_outer_r*0.9,
			// inner_r: this.stage.min_inner_r,
			onUpdate: this._render.bind(this),
		})

		for(var i = 0,l=this.props.inner_sections;i<l;i++){
			var delay = (i+1)/l
			TweenLite.to(this.inner_stage[i],0.3,{
				r: this.stage.min_inner_r,
				ease: Power4.easeOut,
				delay: (Math.sin(i/2)*0.01)
			})			
		}
	},

	on: function(){
		this.stage.a = 0

		TweenLite.to(this.stage,1,{
			a: 1,
			ease: Elastic.easeOut,
			easeParams:[0.4, 0.2],
			// inner_r: this.stage.max_inner_r,
			outer_r: this.stage.min_outer_r,
			outer_ri: this.stage.max_outer_r*0.9,
			onUpdate: this._render.bind(this)
		})

		for(var i = 0,l=this.props.inner_sections;i<l;i++){
			var delay = (i+1)/l
			TweenLite.to(this.inner_stage[i],0.5,{
				r: this.stage.max_inner_r,
				ease: Power4.easeOut,
				delay: (Math.sin(i/2)*0.01)
			})			
		}
	},

	_render: function(){

		// console.log('_render')

		// this.ctx.save();
		this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
		var a = this.stage.a



		//inner
		this.ctx.fillStyle = this.props.color;
		this.ctx.beginPath();



		for(var i = 0,l=this.props.inner_sections;i<l;i++){
			var x = this.clientX+Math.cos(Math.PI*2/l*i) * this.inner_stage[i].r
			var y = this.clientY+Math.sin(Math.PI*2/l*i) * this.inner_stage[i].r
			if(i == 0){
				this.ctx.moveTo(x,y);
			}else{
				this.ctx.lineTo(x,y);
			}
		}
		this.ctx.fill()



		this.ctx.globalCompositeOperation = 'destination-atop'



		//outer
		this.ctx.fillStyle = '#646464'
		for(var i = 0,l=this.props.outer_sections,r = this.stage.outer_ri  ;i<l;i++){
			this.ctx.beginPath();
			this.ctx.arc(this.centerX,this.centerY,r,Math.PI*2/l*i*0.9,Math.PI*2/l*(i+1)*1.1);
			this.ctx.lineTo(this.centerX,this.centerY)
	      	this.ctx.fill();
		}


		this.ctx.fillStyle = this.props.color
		for(var i = 0,l=this.props.outer_sections,r = this.stage.outer_r ;i<l;i++){
			this.ctx.beginPath();
			this.ctx.arc(this.centerX,this.centerY,r,Math.PI*2/l*i*0.9,Math.PI*2/l*(i+1)*1.1);
			this.ctx.lineTo(this.centerX,this.centerY)
	      	this.ctx.fill();
		}

		// this.ctx.restore();
	},

	setClientXY: function(e){
		e = e.nativeEvent
		var xy = pointOnLine(e.layerX,e.layerY,this.centerX,this.centerY,this.stage.max_outer_r*1.2)
		if(!xy[0] || !xy[1] ) xy = [this.centerX,this.centerY]
		this.clientX = xy[0]
		this.clientY = xy[1]	
	},

	componentDidUpdate: function(props,state){
		
		this.centerX = this.props.size/2;
		this.centerY = this.props.size/2;
		
		this.stage.max_outer_r = this.props.size/2/1.1
		this.stage.min_outer_r = this.props.size/2/1.2
		this.stage.max_inner_r = this.props.size
		this.stage.min_inner_r = 0


		if(this.props.toggle != props.toggle){
			this.props.toggle ? this.on() : this.off();
		}
	},

	componentDidMount: function(){
		this.ctx = this.refs.canvas.getContext('2d');
		this.ctx.globalCompositeOperation = 'destination-atop'

		this.centerX = this.props.size/2;
		this.centerY = this.props.size/2;
		
		this.stage.max_outer_r = this.props.size/2/1.1
		this.stage.min_outer_r = this.props.size/2/1.2
		this.stage.max_inner_r = this.props.size*3
		this.stage.min_inner_r = 0
		this.clientX = 	this.centerX
		this.clientY = this.centerY

		this.props.toggle ? this.on() : this.off()
	},

	render: function(){
		return (
			<I {...this.props} innerClassName = '_intui_form_toggle_slide' >
				<canvas onClick = {this.setClientXY} width = {this.props.size} height = {this.props.size} ref = 'canvas' />
			</I>	
		)
	}
}






var Toggle = React.createClass(ToggleFieldClass)
module.exports.Toggle = Toggle

var NumberField = React.createClass(NumberFieldClass)
module.exports.NumberField = NumberField

var ManyNumberField = React.createClass(ManyNumberFieldClass)
module.exports.ManyNumberField = ManyNumberField




var React = require('react');
var I = require('./Slide');
var Mixin = require('./Mixin');
var $ = require('jquery');

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : null;
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
	
		// this.refs.input.scrollIntoView = null
		// this.refs.input.scrollIntoViewIfNeeded = null		
		// this.refs.input.onfocus = function () {
		// 	this.refs.wrapper.refs.inner.scrollTop = 0;
  //      		window.scrollTo(0, 0);
  //       	document.body.scrollTop = 0;
  //  	 	}.bind(this)

		// $(this.refs.input).bind('focus focusin',function(e){
		// 	e.preventDefault()
		// 	return false
		// })
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
			count: 4,
			overflow_focus: true,
			empyHolder: '-',
			fontSize: 10
		}
	},

	componentDidMount: function(){
		window.mnf = this
	},

	getInitialState: function(){
		this.fields = []
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
		if(this.fields.length != props.count || this.state.next != state.next || this.props.value != props.value){
			this.makeFields(props,state)
		}
		// return true
	},

	render: function(){
		
		return (
			<I {...this.props} vertical slide ease = {this.state.edit_mode ? Power4.easeOut : this.props.ease} index_pos = {this.state.edit_mode ? 1 : 0} onHover={this.toggleEdit} >
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





var TogglerFieldClass = {
	getInitialState: function(){
		return {
			toggle: false
		}
	},

	init: function(){

	},

	off: function(){
		TweenLite.to(this.stage,{

		})
		this.setState({
			toggle: false
		})
	},
	on: function(){
		TweenLite.to(this.stage,{

		})
		this.setState({
			toggle: true
		})
	},

	render: function(){
		return (
			<canvas ref = 'canavas' />
		)
	}
}








var NumberField = React.createClass(NumberFieldClass)
module.exports.NumberField = NumberField

var ManyNumberField = React.createClass(ManyNumberFieldClass)
module.exports.ManyNumberField = ManyNumberField



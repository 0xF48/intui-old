var I = require('./Slide')
var SlideMixin = require('./Mixin')
var React = require('react')

var Button = React.createClass({
	mixins: [SlideMixin],
	getDefaultProps: function(){
		return {
			inverse: false,
			down: false,
			right: true,
			top: false,
			left: false,
			active: false,
			index_offset: 3,
			index_offset_full: false,
			c1: '#fff',
			c2: '#000',
		}
	},
	getInitialState: function(){
		return {
			hover: false
		}
	},
	toggleHover: function(){
		this.setState({
			hover: !this.state.hover
		})
	},
	render: function(){

		if(this.props.icon_alt != null){
			var icon_alt = <span className={this.props.icon_alt}></span>
		}else{
			var icon_alt = null
		}
		if(this.props.icon != null){
			var icon = <span className={this.props.icon}></span>
		}else{
			var icon = this.props.children
		}

		var index_pos = this.props.active ? (this.props.left || this.props.up) ? 0 : 1 : (this.props.left || this.props.up) ? 1 : 0
		var index_offset = this.props.active ? 0 : (this.state.hover ? this.props.index_offset : 0)

		if(this.props.left || this.props.up) index_offset *= -1

		var vertical = false
		if(this.props.up || this.props.down) vertical = true



		var c1 = this.props.up || this.props.left ? this.props.c2 : this.props.c1
		var c2 = this.props.up || this.props.left ? this.props.c1 : this.props.c2


		if(!this.props.inverse){
			var top_style = {fill:c2,color:c2,background:c1}
			var bot_style = {fill:c1,color:c1,background:c2}
		}else{
			var top_style = {fill:c1,color:c1,background:c2}
			var bot_style = {fill:c2,color:c2,background:c1}			
		}

		if(this.props.index_offset_full && this.state.hover){
			index_offset = 0
			index_pos = index_pos == 1 ? 0 : 1
		}

		return (
			<I {...this.props} slide vertical={vertical} slide_duration={this.active ? 1 : 0.5} index_pos={index_pos} index_offset={index_offset} onHover={this.toggleHover}>
				<I beta={100} innerClassName={this.props.bClassName + ' ' + ((this.props.left || this.props.up) ? this.props.botClassName : this.props.topClassName)} style={top_style}>
					{this.props.children || icon_alt || icon}
				</I>
				<I beta={100} innerClassName={this.props.bClassName + ' ' + ((this.props.left || this.props.up) ? this.props.topClassName : this.props.botClassName)} style={bot_style}>
					{this.props.children || icon || icon_alt}
				</I>
			</I>
		)
	}
})


module.exports = Button






var I = require('./Slide')
var SlideMixin = require('./SlideMixin')


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
			// c1: '#fff',
			// c2: '#000',
		}
	},
	getInitialState: function(){
		return {
			hover: false
		}
	},
	toggleHover: function(){
		// console.log('toggle hover',!this.state.hover);
		this.setState({
			hover: !this.state.hover
		})
	},
	render: function(){

		

		var index_pos = this.props.active ? (this.props.dir == 'left' || this.props.dir == 'up') ? 0 : 1 : (this.props.dir == 'left' || this.props.dir == 'up') ? 1 : 0



		var index_offset = this.props.active ? 0 : (this.state.hover ? this.props.index_offset : 0)

		if(this.props.dir == 'left' || this.props.dir == 'up') index_offset *= -1

		var vertical = false
		if(this.props.dir == 'up' || this.props.dir == 'down') vertical = true




		if(this.props.index_offset_full && this.state.hover){
			index_offset = 0
			index_pos = index_pos == 1 ? 0 : 1
		}

		return (
			<I width = {this.props.width} height = {this.props.height} beta = {this.props.beta} center onClick = {this.props.onClick} slide vertical={vertical} slide_duration={this.active ? 1 : 0.5} index_pos={index_pos} index_offset={index_offset} onHover={this.toggleHover}>
				<I beta={100} c = {this.props.c} center>
					{ this.props.dir == 'left' || this.props.dir == 'up' ? this.props.children[1] : this.props.children[0]}
				</I>
				<I beta={100} c = {this.props.c} center>
					{ this.props.dir == 'left' || this.props.dir == 'up' ? this.props.children[0] : this.props.children[1]}
				</I>
			</I>
		)
	}
})


module.exports = Button






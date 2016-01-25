var React = require('react');
var I = require('./Slide');
//var IMix = require('./Mixin');


var Right = React.createClass({
	//mixins: [IMix],

	componentDidMount: function(){
		window.right = this.refs.right;
	},
	//m
	render: function(){
		return (
			<I vertical route = {'right'} style ={{background:'#05FF93'}}>
				<I id = 'right' ref = 'right' slide height = {"100px"} style ={{background:'#8F308D'}} index_pos={this.props.toggle_index}>
					<I width = {'100px'} style ={{background:'#2B1100'}}/>
					<I beta = {100} style ={{background:'#943A00'}}/>
					<I beta = {100} style ={{background:'#FF6402'}}/>
				</I>
				<I beta = {100} style ={{background:'#8F2E3B'}} />
			</I>
		)
	}
})

var Left = React.createClass({

	componentDidMount: function(){
		window.sidebar = this.refs.sidebar;
	},
	//mixins: [IMix],
	render: function(){
		return (
			<I id = 'HELLO' ref = 'sidebar' index_pos = {this.props.toggle ? 1 : 0} slide style = {{background:'#FF0036'}}>
				<I beta ={100} style ={{background:'#8F308D'}} />
				<I beta = {100} style ={{background:'#420232'}} />
			</I>
		)
	}
})



var example = React.createClass({

	getInitialState: function(){
		return {
			show_sidebar: true,
			left_width: 50,
			left_toggle: true,
			top_beta: 30,
			top_height: null,
			right_index: 2
		}
	},

	componentDidMount: function(){
		window.ex = this;

		window.addEventListener('resize',this.forceUpdate.bind(this,null))
	},

	toggleTopBar: function(){
		this.setState({
			right_index : this.state.right_index == 0 ? 2 : 0,
			top_height : this.state.top_height == null ? '50px' : null,
			//top_beta: this.state.top_beta == 20 ? null : 20
		})
	},

	toggleRightIndex: function(){
		this.setState({
			right_index : this.state.right_index == 0 ? 2 : 0,
			//top_beta: this.state.top_beta == 20 ? null : 20
		})	
	},

	toggleSidebar: function(){
		this.setState({
			
			left_toggle : !this.state.left_toggle
		})
	},
	toggleSidebarDisplay: function(){
		this.setState({
			show_sidebar : !this.state.show_sidebar
		})
	},

	render: function(){
		var sidebar = null
		if(this.state.show_sidebar){
			sidebar = <I beta = {this.state.left_width} style ={{background:'#12FF00'}}><Left toggle={this.state.left_toggle} /></I>
		}

		return (
			<I vertical style = {{background:'#FF0800'}}>
				<I height={this.state.top_height} beta={100} style = {{background:'##BCBEBA'}}>
					<button onClick={this.toggleSidebar}>toggle sidebar</button>
					<button onClick={this.toggleSidebarDisplay}>toggle sidebar display</button>
					<button onClick={this.toggleTopBar}>toggle top dim and right index</button>
					<button onClick={this.toggleRightIndex}>toggle right index</button>
				</I>
				<I beta = {100} >
					{sidebar}
					<I beta = {100} style ={{background:'#EAFF00'}}>
						<Right toggle_index={this.state.right_index} />
					</I>				
				</I>

			</I>
		)
	}
})


module.exports = example

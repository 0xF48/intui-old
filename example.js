var React = require('react');
var I = require('./Slide');
var IMix = require('./Mixin');


var Right = React.createClass({
	//mixins: [IMix],
	render: function(){
		return (
			<I vertical route = {'right'} style ={{background:'#05FF93'}}>
				<I scroll height = {"100px"} style ={{background:'#8F308D'}}>
					<I width = {'100px'} style ={{background:'#8F3900'}}/>
					<I beta = {100} style ={{background:'#7E8F30'}}/>
					<I beta = {100} style ={{background:'#2E8F1F'}}/>
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
			<I ref = 'sidebar' index_pos = {this.props.toggle ? 1 : 0} slide style = {{background:'#FF0036'}}>
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
			left_width: '200px',
			left_toggle: true
		}
	},

	componentDidMount: function(){
		window.ex = this;

		window.addEventListener('resize',this.forceUpdate.bind(this,null))
	},

	toggleSidebar: function(){
		this.setState({
			left_width : this.state.left_width == '200px' ? '50px' : '200px',
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
			sidebar = <I width = {this.state.left_width} style ={{background:'#12FF00'}}><Left toggle={this.state.left_toggle} /></I>
		}

		return (
			<I vertical style = {{background:'#FF0800'}}>
				<I height ={'200px'} style = {{background:'##BCBEBA'}}>
					<button onClick={this.toggleSidebar}>toggle sidebar</button>
					<button onClick={this.toggleSidebarDisplay}>toggle sidebar display</button>
				</I>
				<I beta = {100} >
					{sidebar}
					<I beta = {100} style ={{background:'#EAFF00'}}>
						<Right />
					</I>				
				</I>

			</I>
		)
	}
})


module.exports = example

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


var Toggler = React.createClass({
	getInitialState:function(){
		return {
			color: '#001B2F',
			inverted: this.props.invert || (Math.random()>0.5 ? true : false)
		}
	},
	render: function(){
		return (
			<I index_pos = {this.props.on ? (this.state.inverted ? 0 : 1) : (this.state.inverted ? 1 : 0)} vertical = {this.props.vertical} slide >
				<I beta ={100} style = {!this.state.inverted ? null : {background:this.state.color} }/>
				<I beta = {100} style = {!this.state.inverted ? {background:this.state.color} : null} />
			</I>
		)
	}
})


var example = React.createClass({

	getInitialState: function(){
		return {
			show_sidebar: true,
			left_width: '100px',
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
	toggleSidebarDim: function(){
		this.setState({
			left_width : this.state.left_width == '200px' ? '100px' : '200px',
			left_toggle : !this.state.left_toggle
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


	// getInitialState: function(){
	// 	//this.golden_ratio = this.generateGrid()
	// },

	bg: function(a){
		return {
			background: 'rgba('+(255-(a*10))+','+55+(a*3)+','+185+(a*10)+','+0.2+')',
			boxShadow: 'inset 0px 0px 1px rgba(0,0,0,0.2)'
		}
	},

	toggleToggler: function(){
		this.setState({
			toggle_1: !this.state.toggle_1
		})
	},

	getInitialState: function(){
		return {
			toggle_1: 0,
		}
	},

	render: function(){
		var sidebar = null
		if(this.state.show_sidebar){
			sidebar = <I width = {this.state.left_width} style ={{background:'#12FF00'}}><Left toggle={this.state.left_toggle} /></I>
		}

		return (
			<I ref = 'root'  style = {{background:'linear-gradient(45deg,#002743,#003943)'}}>
				<I ref = 'b' beta = {61.8} style = {this.bg(1)}/>
				<I ref = 'a'  vertical beta = {38.2}  style = {this.bg(1)}>
					<I ref = 'a.b' beta = {61.8} style = {this.bg(2)}>
						<Toggler on={this.state.toggle_1} vertical = {true} />
					</I>
					<I ref = 'a.a' beta = {38.2}  style = {this.bg(2)}>
						<I ref = 'a.a.a' vertical beta = {38.2} style = {this.bg(3)}>
							<I beta = {38.2} ref = 'a.a.a.b' style = {this.bg(4)}>
								
								<I beta={38.2}  vertical ref = 'a.a.a.b.a' style = {this.bg(5)}>
									<I beta={38.2} ref = 'a.a.a.b.a.a' style = {this.bg(6)}>
										<I beta={38.2} ref = 'a.a.a.b.a.a.a' style = {this.bg(7)}>

											<I beta={38.2} ref = 'a.a.a.b.a.a.a.b' style = {this.bg(9)}/>
											<I beta={61.8} ref = 'a.a.a.b.a.a.a.a' style = {this.bg(9)}>
												<Toggler on={this.state.toggle_1} vertical={true} />
											</I>
										</I>
										<I beta={61.8} ref = 'a.a.a.b.a.a.b' style = {this.bg(8)}>
											<Toggler on={this.state.toggle_1} vertical={false} />
										</I>
									</I>
									<I beta={61.8} ref = 'a.a.a.b.a.b' style = {this.bg(6)}>
										<Toggler on={this.state.toggle_1} vertical={true} />
									</I>
								</I>
								<I  beta={61.8}  ref = 'a.a.a.b.a' style = {this.bg(5)}>
									<Toggler on={this.state.toggle_1} vertical={false} />
								</I>
							</I>
							<I beta = {61.8} ref = 'a.a.a.a' style = {this.bg(4)}>
								<Toggler on={this.state.toggle_1} vertical={true} />
							</I>
						</I>
						<I ref = 'a.a.b' beta = {61.8} style = {this.bg(3)}>
							<Toggler on={this.state.toggle_1}/>
						</I>
					</I>
					
					
				</I>
				
				
				<div style={{'padding':'5px',position:'absolute','top':0,'left':0,'width':'100%','height':'auto'}}>
					<button onClick={this.toggleToggler}>toggle toggler</button>
					
				</div>
			</I>
		)
	}
})


module.exports = example

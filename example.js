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
			color2: null,
			inverted: (Math.random()>0.5 ? true : false)
		}
	},
	render: function(){
		return (
			<I index_pos = {this.props.on ? (this.state.inverted ? 0 : 1) : (this.state.inverted ? 1 : 0)} vertical = {this.props.vertical} slide >
				<I beta ={100} style = {{background: !this.state.inverted ? this.state.color2 : this.state.color}}/>
				<I beta = {100} style = {{background: this.state.inverted ? this.state.color2 : this.state.color}} />
			</I>
		)
	}
})

var Bar = React.createClass({
	render: function(){
		return (
			<I>
				<I beta = {80} />
				<I vertical index_pos = {this.props.index} slide beta = {20} style = {{background: '#00D059'}}>
					<I height = {this.props.size*2} style ={{background:'#57000D'}}/>
					<I height = {this.props.size} style ={{background:'#00D0A4'}}/>
				</I>
			</I>
		)
	}	
})


var G = require('./Grid').Grid
var GridExample = React.createClass({

	bg: function(){
		return {
			background: 'rgba('+(Math.floor(255*Math.random()))+','+(Math.floor(255*Math.random()))+','+(Math.floor(255*Math.random()))+','+1+')',
		}
	},
	render: function(){
		return null
		return (
			<G mid_size={300} min_size = {200} max_beta = {50} >
				<I size_index = {2} style = {this.bg()} />
				<I size_index = {1} style = {this.bg()} ratio_index = {2} />
				<I size_index = {2} style = {this.bg()} />
				<I size_index = {3} style = {this.bg()} />

			</G>
		)
	}
})


var example = React.createClass({



	componentDidMount: function(){
		window.example = this
		window.test_node = this.refs['a.b'];
		window.root_node = this.refs['root'];
		window.nigga = this.refs['nigga']

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
			toggle_1: !this.state.toggle_1,
			toggle_2: !this.state.toggle_2,
		})
	},

	getInitialState: function(){
		return {
			toggle_1: 0,
			toggle_2: 0,
			middle_beta: 38.2,
			left_beta:61.8,
			top_right_beta:61.8,
			left_bar_size: 50,
			left_bar_inner_size: 50,
			left_bar_index: 1,
			display_left: true,
			root_index: 0,
			right_beta: 50
		}
	},

	toggleTopRight:function(){
		this.setState({
			toggle_1: !this.state.toggle_1,
			top_right_beta : this.state.top_right_beta == 61.8 ? 38.2 : 61.8,
		})	
	},
	toggleLeft:function(){
		this.setState({
			toggle_1: !this.state.toggle_1,
			left_beta: this.state.left_beta == 61.8 ? 38.2 : 61.8,
			middle_beta: this.state.left_beta == 61.8 ? 61.8 : 38.2,
		//	top_right_beta : this.state.top_right_beta == 61.8 ? 61.8/2 : 61.8,
		})	
	},

	toggleLeftBar: function(){
		this.setState({
			left_bar_index: this.state.left_bar_index == 1 ? 0 : 1,
			left_bar_size: this.state.left_bar_size == 50 ? 100 : 50,
		})
	},

	toggleLeftDisplay: function(){
		this.setState({
			display_left: !this.state.display_left
		})
	},

	toggleRootIndexResize: function(){
		this.setState({
			root_index: this.state.root_index == 1 ? 0 : 1,
			left_beta: this.state.left_beta == 61.8 ? 38.2 : 61.8,
			middle_beta: this.state.middle_beta == 61.8 ? 38.2 : 61.8,
		})
	},

	render: function(){
		var sidebar = null
		if(this.state.show_sidebar){
			sidebar = <I width = {this.state.left_width} style ={{background:'#12FF00'}}><Left toggle={this.state.left_toggle} /></I>
		}

		var left_side = null
		if(this.state.display_left){
			var left_side = (
				<I ref = 'b' ref='nigga' id='left' slide vertical beta = {this.state.left_beta} style = {{background:'#000'}}>
					<I id = 'bar' height = {this.state.left_bar_size} style={{background:'#000'}}>
						<Bar index={this.state.left_bar_index} size={this.state.left_bar_inner_size} />
					</I>
					<I beta = {100} style={{background:'#002743'}}>
						<GridExample />
					</I>
				</I>
			)
		}

		return (
			<div style={{width:'100%',height:'100%'}}>
				
				<I ref = 'root' id='root' slide index_pos = {this.state.root_index} beta={100} style = {{background:'#002743'}}>
					{left_side}
					<I ref = 'a' id='right' slide vertical beta = {this.state.middle_beta}  style = {this.bg(1)}>
						<I ref = 'a.b' id ='top_right' beta = {this.state.top_right_beta} style = {this.bg(2)}>
							<Toggler on={this.state.toggle_2} vertical = {true} />
						</I>
						<I ref = 'a.a' beta = {100-this.state.top_right_beta}  style = {this.bg(2)}>
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
							<I ref = 'a.a.b' beta={61.8} style = {this.bg(3)}>
								<Toggler on={this.state.toggle_1}/>
							</I>
						</I>
					</I>
					<I beta= {this.state.right_beta} style = {{background:'#FF8200'}} />
				</I>
				<div style={{'padding':'5px', 'position':'absolute','top':0,'left':0,'width':'100%','height':'auto'}}>
					<button onClick={this.toggleToggler}>toggle toggler</button>
					<button onClick={this.toggleTopRight}>resize top right and toggle</button>
					<button onClick={this.toggleLeft}>resize left and toggle</button>
					<button onClick={this.toggleLeftDisplay}>toggle left display</button>
					<button onClick={this.toggleLeftBar}>toggle bar/resize</button>
					<button onClick={this.toggleRootIndexResize}>toggle root index/resize left</button>
				</div>
			</div>
			
		)
	}
})


module.exports = example

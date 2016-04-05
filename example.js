var React = require('react');
var I = require('./Slide');
var Grid = require('./Grid')
var G  = Grid.Grid;
var GItem = Grid.Item;
var SlideMixin = require('./Mixin');
var FormToggle = require('./Form').Toggle;

var Toggler = React.createClass({
	mixins: [SlideMixin],
	getInitialState:function(){
		return {
			color: '#001B2F',
			color2: null,
			inverted: (Math.random()>0.5 ? true : false)
		}
	},
	render: function(){
		return (
			<I {...this.props} index_pos = {this.props.on ? (this.state.inverted ? 0 : 1) : (this.state.inverted ? 1 : 0)} vertical = {this.props.vertical} slide >
				<I beta ={100} style = {{background: !this.state.inverted ? this.state.color2 : this.state.color}}/>
				<I beta = {100} style = {{background: this.state.inverted ? this.state.color2 : this.state.color}} />
			</I>
		)
	}
})

var Bar = React.createClass({
	componentDidMount: function(){
		// window.test = this.refs['test']
	},
	render: function(){
		return (
			<I beta={100}>
				<I beta = {80} />
				<I vertical index_pos = {this.props.index} slide beta = {20} style = {{background: '#00D059'}}>
					<I height = {this.props.size*2} style ={{background:'#57000D'}}/>
					<I height = {this.props.size} style ={{background:'#00D0A4'}}/>
				</I>
			</I>
		)
	}	
})

var GridExample = React.createClass({
	getDefaultProps: function(){
		return {
			fixed: false
		}
	},
	
	bg: function(){
		var c = Math.floor(200+55*Math.random())
		return {

			display:'flex',
			alignContent: 'center',
			alignItems: 'center',
			justifyContent: 'center',
			position:'relative',
			color: '#242426',
			fontFamily: 'sans-serif',
			width:'calc(100%)',
			height: 'calc(100%)',
			fontSize: '20px',
			color: '#000',
			padding: '20px',
			boxSizing : 'border-box',
			background: 'rgba('+(c)+','+(c)+','+(c)+','+1+')',
		}
	},

	getInitialState: function(){
		this.items = [];
		for(var i = 0 ; i < 10 ; i ++ ){
			var size_index = Math.floor(Math.random()*4)
			this.items.push(<GItem key={'additem_'+this.items.length} w = {Math.floor(1+Math.random()*2)}  h = {Math.floor(1+Math.random()*2)} size_index = {size_index} ><div style = {this.bg()}><b>{i}</b></div></GItem>)
		}
		return {
			id: Math.random()*500
		}
	},

	addChild: function(){
		this.items.push(<GItem w = {1}  h = {Math.floor(1+Math.random()*3)} key = {'additem_'+this.items.length} ><div style = {this.bg()}><b>{this.items.length}</b></div></GItem>)
	},

	addManyChilds: function(){
		for(var i = 0;i< 7;i++){
			this.items.push(<GItem w = {Math.floor(1+Math.random()*2)}  h = {Math.floor(1+Math.random()*2)} key = {'additem_'+this.items.length} ><div style = {this.bg()}><b>{this.items.length}</b></div></GItem>)
		}
	},

	reset: function(){
		this.setState({
			id: Math.random()*500
		})
	},

	render: function(){
		return (
			<G list_id = {'grid'+this.state.id} w={2}  h={7} ease_dur = {2.5} fixed = {this.props.fixed} style={{boxSizing:'border-box',padding:'0px'}} >
				{this.items}
			</G>
		)
	}
})












var NestedScrollExample = React.createClass({
	mixins: [SlideMixin],
	render: function(){
		var children = [];
		var children2 = [];
		for(var i = 0 ; i < 6; i++){
			children.push(<img key = {"img_"+i} onClick = {function(){console.log("CLICKED")}} src="https://qzprod.files.wordpress.com/2016/03/rtsapb4-e1459302248942.jpg?quality=80&strip=all&w=270&h=152&crop=1" style={{background: (i%2 ? '#BAC4CB' : '#747A7F'),width: '100%',height:'200px'}}>scrollable {i}<br/></img>)
		}
		for(var i = 0 ; i < 6; i++){
			children2.push(<img key = {"img_"+i} onClick = {function(){console.log("CLICKED")}} src="https://qzprod.files.wordpress.com/2016/03/rtsapb4-e1459302248942.jpg?quality=80&strip=all&w=270&h=152&crop=1" style={{background: (i%2 ? '#BAC4CB' : '#747A7F'),width: '100%',height:'200px'}}>scrollable {i}<br/></img>)
		}
		return (
			<I ref = 'root' beta={100} vertical style = {{background:'#3F403F'}}>
				<I scroll beta={100} vertical style = {{background:'#C59D71'}}>
					{children}
				</I>
				<I beta={50} vertical style = {{background:'#6CC591'}}>
					<p>slide 2</p>
				</I>
				<I scroll vertical beta={100} style = {{background:'#3F403F'}}>
					{children2}
				</I>
			</I>
		)
	}
})


























var example = React.createClass({


	componentDidMount: function(){
		window.example = this
		window.test_node = this.refs['a.b'];
		window.root_node = this.refs['root'];
		window.app_node = this.refs['app_node'];
		window.addEventListener('resize',this.forceUpdate.bind(this,null))
	},

	// getInitialState: function(){
	// 	//this.golden_ratio = this.generateGrid()
	// },

	bg: function(a){
		return {
			background: 'rgba('+(255-(a*10))+','+55+(a*3)+','+185+(a*10)+','+0.2+')',
			//boxShadow: 'inset 0px 0px 1px rgba(0,0,0,0.2)'
		}
	},

	addGridChild: function(){
		this.refs.fixed_grid.addChild();
		this.forceUpdate()
	},

	gridReset: function(){
		this.refs.fixed_grid.reset();
		
	},

	addGridManyChilds: function(){
		this.refs.fixed_grid.addManyChilds();
		this.forceUpdate()
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
			display_left: false,
			root_index: 0,
			right_beta: 50,
			right_index: 1,
			toggle_radio1: false,
			toggle_radio2: false,
			toggle_radio3: true,
			toggle_radio4: false,
			toggle_radio5: true,
			toggle_radio6: true,
			toggle_radio7: false,
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
			root_index: this.state.root_index == 2 ? 0 : 2,
			left_beta: this.state.left_beta == 61.8 ? 38.2 : 61.8,
			middle_beta: this.state.middle_beta == 61.8 ? 38.2 : 61.8,
		})
	},

	setRightIndex: function(i){
		this.setState({
			right_index: i
		})
	},

	setToggle: function(i){
		var state = {}
		state['toggle_radio'+i] = !this.state['toggle_radio'+i]
		this.setState(state)
	},

	render: function(){
		var sidebar = null

		if(this.state.show_sidebar){
			sidebar = <I width = {this.state.left_width} style = {{background:'#12FF00'}}><Left active={this.state.left_toggle} /></I>
		}

		var left_side = null

		if(this.state.display_left){
			var left_side = (
				<I ref = 'b' slide id='left' vertical beta = {this.state.left_beta} style = {{background:'#000'}}>
					<I id = 'bar' height = {this.state.left_bar_size} style={{background:'#000'}}>
						<Bar index={this.state.left_bar_index} size={this.state.left_bar_inner_size} />
					</I>
					<I beta = {100} offset={-this.state.left_bar_size} style={{background:'#223947'}}>
						<GridExample fixed ref = 'fixed_grid' />
					</I>
				</I>
			)
		}

		var button_style = {
			background: '#CBCECE',
			color: '#000',
			borderRadius: '3px',
			border: 'none',
			margin: '3px',
			padding: '5px',
			outline: 'none'
		}

		return (
			<div ref = 'app_node' style={{width:'100%',height:'calc(100% - 100px)',marginTop:'100px'}}>
				<I ref = 'root' id='root' slide index_pos = {this.state.root_index} beta={100} style = {{background:'#002743'}}>
					
					{left_side}
					
					<I ref = 'a' id='right' slide vertical beta = {this.state.middle_beta}  style = {this.bg(1)}>
						<I vertical beta = {this.state.top_right_beta} >
							<FormToggle beta = {13} onClick = {this.setToggle.bind(this,1)} active={this.state.toggle_radio1} size = {30} color='#00E2FF' />
							<FormToggle beta = {13} onClick = {this.setToggle.bind(this,2)} active={this.state.toggle_radio2} size = {30} color='#00FF21' />
							<FormToggle beta = {13} onClick = {this.setToggle.bind(this,3)} active={this.state.toggle_radio3} size = {30} color='#FF7C00' />
							<FormToggle beta = {13} onClick = {this.setToggle.bind(this,4)} active={this.state.toggle_radio4} size = {30} color='#FF0033' />
							<FormToggle beta = {13} onClick = {this.setToggle.bind(this,5)} active={this.state.toggle_radio5} size = {30} color='#5EB195' />
							<FormToggle beta = {13} onClick = {this.setToggle.bind(this,6)} active={this.state.toggle_radio6} size = {30} color='#FF0015' />
							<FormToggle beta = {13} onClick = {this.setToggle.bind(this,7)} active={this.state.toggle_radio7} size = {30} color='#FFF9F9' />
						</I>
						<I ref = 'a.a' beta = {100-this.state.top_right_beta}  style = {this.bg(2)}>
							<I ref = 'a.a.a' vertical beta = {38.2} style = {this.bg(3)}>
								<I beta = {38.2} ref = 'a.a.a.b' style = {this.bg(4)}>
									<I beta={38.2}  vertical ref = 'a.a.a.b.a' style = {this.bg(5)}>
										<I beta={38.2} ref = 'a.a.a.b.a.a' style = {this.bg(6)}>
										</I>
										<Toggler beta={61.8} style = {this.bg(6)} on={this.state.toggle_1} vertical={true} />
									</I>
									<Toggler beta={61.8} style = {this.bg(5)} on={this.state.toggle_1} vertical={false} />
								</I>
								<Toggler beta = {61.8} style = {this.bg(4)} on={this.state.toggle_1} vertical={true} />
							</I>
							<Toggler beta={61.8} style = {this.bg(3)} on={this.state.toggle_1}/>
						</I>
					</I>

					<I beta= {this.state.right_beta} slide vertical index_pos={this.state.right_index} style = {{background:'#FFC9AF'}}>
						<I beta={10} style = {{background:'#FF0500'}}>
						</I>
						<NestedScrollExample beta = {100} />
						<I beta={10} style = {{background:'#00FF1D'}}>
						</I>
						<I beta={50} style = {{background:'#FF4563'}}>
						</I>
						<I beta={30} style = {{background:'#1A77FF'}}>
						</I>
						<I beta={10} style = {{background:'#FFF153'}}>
						</I>
					</I>

				</I>
				<div style={{marginTop:'-100px','padding':'5px', 'position':'absolute','top':0,'left':0,'width':'100%','height':'auto'}}>
					<button style={button_style} onClick={this.toggleToggler}>toggle toggler</button>
					<button style={button_style} onClick={this.toggleTopRight}>resize top right and toggle</button>
					<button style={button_style} onClick={this.toggleLeft}>resize left and toggle</button>
					<button style={button_style} onClick={this.toggleLeftDisplay}>toggle left display</button>
					<button style={button_style} onClick={this.toggleLeftBar}>toggle bar/resize</button>
					<button style={button_style} onClick={this.toggleRootIndexResize}>Toggle scroll example and resize left</button>
					<button style={button_style} onClick={this.addGridChild}>add child to grid</button>
					<button style={button_style} onClick={this.addGridManyChilds}>add children to grid</button>
					<button style={button_style} onClick={this.gridReset}>reset grid</button>
					<button style={button_style} onClick={this.setRightIndex.bind(this,0)}>right index 0</button>
					<button style={button_style} onClick={this.setRightIndex.bind(this,1)}>right index 1</button>
					<button style={button_style} onClick={this.setRightIndex.bind(this,2)}>right index 2</button>
					<button style={button_style} onClick={this.setRightIndex.bind(this,3)}>right index 3</button>
					<button style={button_style} onClick={this.setRightIndex.bind(this,4)}>right index 4</button>
					<button style={button_style} onClick={this.setRightIndex.bind(this,5)}>right index 5</button>
				</div>
			</div>
			
		)
	}
})


module.exports = example

var React = require('react');



var ToolTip = React.createClass({
	getDefaultProps: function(){
		return {
			duration: -1,
			tip: 'empty tip',
			display: false,
			origin_in: 'center',
			origin_out: 'center'
		}
	},

	getInitialState: function(){
		return {
			display: false
		}
	},

	componentDidMount: function(){
		window.tip = this
		TweenLite.set(this.refs.container,{
			opacity : this.props.display ? 1 : 0,
			rotationX: this.props.display ? 0 : 90
		})
		
	},

	componentWillUpdate: function(props,state){
		// console.log("WILL UPDATE",props,this.props)
		if(this.props.display != props.display){
			
			// console.log("SET STATE",props.display)
			this.setState({
				display: props.display
			})
		
		
			if(props.display == true){
				clearTimeout(this.timer)
				if(props.duration != -1){
					this.timer = setTimeout(function() {
						this.setState({
							display : false
						})
					}.bind(this),props.duration*1000);					
				}

			}
		}
		return true
	},

	componentDidUpdate: function(props,state){

		if(this.state.display != state.display){
			console.log("SHOW TIP")
			if(this.state.display == true) this.refs.container.style.opacity = 1

			var rot_x = 0
			var rot_y = 0
			if(!this.state.display){
				if(this.props.origin_out == 'top' || this.props.origin_out == 'bottom'){
					rot_x = 100
				}else{
					console.log("ROTATE X AXIS")
					rot_y = 100
				}
			}else{
				if(this.props.origin_in == 'top' || this.props.origin_in == 'bottom'){
					rot_x = 100
				}else{
					console.log("ROTATE X AXIS")
					rot_y = 100
				}
			}

			TweenLite.fromTo(this.refs.container,this.state.display ? 0.7 : 0.5,{
				rotationX: this.state.display?rot_x:0,
				rotationY: this.state.display?rot_y:0,				
			},{
				ease: this.state.display ? Power4.easeInOut : Power4.easeOut,
				easeParams: [.5, 3],
				rotationX: !this.state.display ? rot_x : 0,
				rotationY: !this.state.display ?rot_y:0,
				onComplete: function(){
					this.refs.container.style.opacity = this.state.display ? 1 : 0
				}.bind(this)
			})
		}
	},

	render: function(){
		// console.log("RENDER TIP",this.props.display)
		// Object.assign(style,this.props.style)
		var content = this.props.children != null ? this.props.children : <span>{this.props.tip}</span>
		return (
			<div onClick = {this.props.onClick} className = {'_intui_tooltip_wrapper '+this.props.outerClassName}>
				<div ref = 'container' className = {'_intui_tooltip_container '+this.props.innerClassName}  style={{transformOrigin:this.state.display ? this.props.origin_in : this.props.origin_out}}>
					{content}
				</div>
			</div>
		)
	}
})



module.exports = ToolTip
/* simple one directional pager.. pages through slides in 4 directions and removes previous elements so that the dom renderer does not lag or render extra dom elements that are not being viewed */
/* can also flip */

var react = require('react');

var Pager = react.createClass({
	getDefaultProps: function(){
		return {
			toggle: false,
			prev_content: null,
			content: null,
			vertical: true,
			inverse: false,
			rootClass: '',
			childClass: '',
			duration: 0.5,
			ease: Power3.easeOut
		}
	},

	getInitialState: function(){
		return {
			prev_children: null,
			index_pos: 0,
		}
	},

	componentDidMount: function(props,state){
		window.pager = this
		// if(this.props.children != null){
		// 	this.setState({
		// 		index_pos: 0,
		// 		prev_children : this.props.children
		// 	})
		// }
	},

	shouldComponentUpdate: function(props,state){
		
		if(props.toggle != this.props.toggle){
			console.log('pager children are different')
			if(props.flip){
				TweenLite.fromTo(this.refs.c1,props.duration,{
					rotationY: 0,
					rotationX: 0,
					opacity: 1,
				},{
					ease: props.ease,
					rotationX: props.vertical ? 180 * (props.inverse ? -1 : 1) : 0,
					rotationY: props.vertical ? 0 : 180 * (props.inverse ? -1 : 1),
					opacity: 0,
				})
				TweenLite.fromTo(this.refs.c2,props.duration,{
					rotationY: props.vertical ? 0 :  -180 * (props.inverse ? -1 : 1),
					rotationX: props.vertical ? -180 * (props.inverse ? -1 : 1) : 0,
					opacity: 0,
				},{
					ease: props.ease,
					rotationY: 0,
					rotationX: 0,
					opacity: 1,
				})
			}else{
				if(props.vertical){
					console.log(-1 * ( this.state.index_pos*this.refs.root.clientHeight + this.refs.root.clientHeight ) * (props.inverse ? -1 : 1))
					console.log(-1 * ( this.state.index_pos*this.refs.root.clientHeight - this.refs.root.clientHeight ) * (props.inverse ? -1 : 1))
					console.log(-1 * ( this.state.index_pos*this.refs.root.clientHeight ) * ( props.inverse ? -1 : 1 ))
					
					TweenLite.fromTo(this.refs.c1,props.duration,{
						y: 0,
					},{
						y: -1 * (this.refs.root.clientHeight ) * (props.inverse ? -1 : 1),
						ease: props.ease
					})
					
					TweenLite.fromTo(this.refs.c2,props.duration,{
						y: ( this.refs.root.clientHeight ) * (props.inverse ? -1 : 1)
					},{
						y:  0,
						ease: props.ease
					})

				}else{
					TweenLite.fromTo(this.refs.c1,props.duration,{
						x: 0,
					},{
						x: -1 * (this.refs.root.clientWidth ) * (props.inverse ? -1 : 1),
						ease: props.ease
					})
					
					TweenLite.fromTo(this.refs.c2,props.duration,{
						x: ( this.refs.root.clientWidth ) * (props.inverse ? -1 : 1)
						
					},{
						x:  0,
						ease: props.ease
					})
				}
			}
			this.setState({
				prev_children : this.props.children
			})
		}else{
			if(!props.flip){
				TweenLite.set(this.refs.c1,{
					x: props.vertical ? 0 : -1 * (this.refs.root.clientWidth ) * (props.inverse ? -1 : 1),
					y: props.vertical ? ( this.refs.root.clientHeight ) * (props.inverse ? -1 : 1) : 0
				})				
			}

		}
		return true
	},

	render: function(){
		var c1_content = this.state.prev_children
		var c2_content = this.props.children

		return (
			<div ref = 'root' className = {this.props.rootClass + ' _intui_pager_root'} >
				<div ref = 'c1'  className = {this.props.childClass + ' _intui_pager_child'} >
					{c1_content}
				</div>
				<div ref = 'c2' className =  {this.props.childClass+' _intui_pager_child'}  >
					{c2_content}
				</div>
			</div>
		)
	}
})

module.exports = Pager 




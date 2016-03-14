
var React = require('react');


var Modal = React.createClass({
	getDefaultProps: function(){
		return {
			toggle: false
			,pos: 'bottom'
			,easeIn: Power2.easeOut
			,easeOut: Power2.easeOut
			,durIn: 0.5
			,durOut: 0.5
		}
	}
	,componentDidMount: function(){
		//this.styl.display = 'initial'
		var p = this.props.pos
		var d = this.getDim();
		//window.addEventListener('resize',this.forceUpdate);
		TweenLite.set(this.refs.modal,{
			x: (p == 'left' ? -d[0] : p == 'right' ? d[0] : 0)
			,y:  (p == 'top' ? -d[1] : p == 'bottom' ? d[1] : 0)

		})
	}
	,getDim: function(){
		return [this.refs.modal.clientWidth,this.refs.modal.clientHeight]
	}
	,componentWillUpdate: function(props){
		if(props.toggle == this.props.toggle){
			var p = this.props.pos
			var d = this.getDim();
			if(!props.toggle){
				TweenLite.set(this.refs.modal,{
				 	x: (p == 'left' ? -d[0] : p == 'right' ? d[0] : 0)
				 	,y: (p == 'top' ? -d[1] : p == 'bottom' ? d[1] : 0)
				})				
			}else{
				TweenLite.set(this.refs.modal,{
				 	x:0
				 	,y: 0
				})					
			}

		}

		// TweenLite.set(this.refs.modal,{
		// 	x: (p == 'top' ? -d[1] : p == 'bottom' ? d[1] : 0)
		// 	,y: (p == 'left' ? -d[0] : p == 'right' ? d[0] : 0)
		// })
	}
	,componentDidUpdate: function(props){
		//console.log('UPDATED',this.props.toggle)
		var p = this.props.pos
		var d = this.getDim();
		if(this.props.toggle != props.toggle){
			if(this.props.toggle){
				TweenLite.to(this.refs.modal,this.props.durIn,{
					x: 0
					,y: 0
					,ease: this.props.easeIn
				})
			}else{
				TweenLite.to(this.refs.modal,this.props.durOut,{
					y: (p == 'top' ? -d[1] : p == 'bottom' ? d[1] : 0)
					,x: (p == 'left' ? -d[0] : p == 'right' ? d[0] : 0)
					,ease: this.props.easeOut
				})				
			}
		}
	}

	,styl: {
		height: '100%'
		,width: '100%'
		,top:'0'
		,left: '0'
		,position: 'absolute'
		,zIndex: 10
	}

	,render: function(){
		return (
			<div ref = 'modal' className={this.props.className} style={this.styl}>
				{this.props.children}
			</div>
		)
	}
})

module.exports = Modal
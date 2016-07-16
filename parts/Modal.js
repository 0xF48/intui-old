
var Modal = React.createClass({
	getDefaultProps: function(){
		return {
			display: false
		}
	},

	getInitialState: function(){
		return {
			show_modal: false
		}
	},

	componentWillUnmount: function(){
		window.removeEventListener('keydown',this.keyPress)
	},

	componentDidMount: function(){
		if(!this.props.display){
			this.refs.overlay.style.display = 'none'
		}else{
			this.show()
		}

		window.addEventListener('keydown',this.keyPress)
	},


	componentWillUpdate: function(props){
		if(this.props.display != props.display){
			if(!props.display){
				this.hide()
			}else{
				this.show()
			}		
		}
	},

	//set overlay opacity to 0 and then display to none after 500ms
	hide: function(){
		clearTimeout(this.hide_timer)
		this.refs.overlay.style.opacity = 0
		this.setState({
			show_modal: false,
			hide_modal: true
		})

		this.hide_timer = setTimeout(()=>{
			this.setState({
				hide_modal: false,
			})
			if(this.refs.overlay == null) return
			this.refs.overlay.style.opacity = 0
			this.refs.overlay.style.display = 'none'
		}, 500);
	},

	//set overlay opacity and display to 0 then estimate the time it would take to paint and change the opacity to 1
	show: function(){

		clearTimeout(this.hide_timer)
		this.refs.overlay.style.opacity = 0
		this.refs.overlay.style.display = 'flex'
		this.hide_timer = setTimeout(()=>{
			this.setState({
				hide_modal: false,
				show_modal: true
			})
			if(this.refs.overlay == null) return
			this.refs.overlay.style.opacity = 1
		},60);
	},

	preventHide: function(e){
		console.log("prevent HIDE")
		e.stopPropagation();
		e.preventDefault();
		return false
	},

	onHide: function(e){
		console.log("ON HIDE")
		e.stopPropagation();
		e.preventDefault();
		if(this.props.onHide) this.props.onHide()
		return false
	},

	keyPress: function(e){
		if(this.props.display){
			if(e.keyCode == 27){
				return this.onHide(e);
			}
		}
	},

	render: function(){
		return (
			<div onClick = {this.onHide} ref = 'overlay' className = {'_intui_modal_container '+ (!this.state.show_modal ? '_intui_modal_container-hidden':'')}>
				<div className = {'_intui_modal_overlay '+(this.props.overlayClassName||'') }  >
				</div>
				<div className = '_intui_modal_wrapper'>
					<div onClick = {this.preventHide} ref = 'modal' className = { (this.props.className||'') + ' _intui_modal '+(this.state.hide_modal ? ' _intui_modal-hidden2' : (!this.state.show_modal ? ' _intui_modal-hidden':''))} >
						{this.props.children}
					</div>
				</div>
			</div>
		)
	}
})

var ModalTitle = React.createClass({
	render: function(){
		return <span className = '_intui_modal_title'>{this.props.children}</span>
	}
})

var ModalHint = React.createClass({
	render: function(){
		return <p className = '_intui_modal_hint'>{this.props.children}</p>
	}
})

var ModalSection = React.createClass({
	render: function(){
		return <div className = '_intui_modal_section'>{this.props.children}</div>
	}
})






module.exports.Modal = Modal
module.exports.ModalHint = ModalHint
module.exports.ModalSection = ModalSection
module.exports.ModalTitle = ModalTitle









module.exports = React.createClass({
	componentDidMount: function(){
		if(this.refs.angle != null){
			this.ctx = this.refs.angle.getContext('2d')
			this.refs.angle.height = 50
			this.refs.angle.width = 50
			this.stage = {
				alpha: 1,
				alpha2: 1,
			}
			this.refs.overlay.addEventListener('mouseenter',()=>{
				this.hover(true)
			})
			this.refs.overlay.addEventListener('mouseleave',()=>{
				this.hover(false)
			})
			
			
			


	
			this.ctx.translate(this.refs.angle.width/2+0.5, this.refs.angle.height/2+0.5);
			if(this.props.dir == 'right'){
				this.ctx.rotate(Math.PI/2);
			}else if(this.props.dir == 'left'){
				this.ctx.rotate(-Math.PI/2);
			}else if(this.props.dir == 'top'){
				this.ctx.rotate(-Math.PI);
			}else if(this.props.dir == 'bottom'){

			}
			this.ctx.translate(-this.refs.angle.width/2, -this.refs.angle.height/2);

			
			

			this.renderAngle(this.stage.alpha,this.stage.alpha2);
		}
	},
	hover: function(enter){
		if(this.ctx == null) return;
		TweenLite.to(this.stage,0.65,{
			ease: Power4.easeOut,
			alpha: enter ? 0.8 : 1,
			alpha2: enter ? 0.8 : 1,
			onUpdate: ()=>{
				this.renderAngle(this.stage.alpha,this.stage.alpha2)
			}
		})
		// TweenLite.to(this.stage,enter ? 1 : 0.65,{
		// 	ease: Power4.easeOut,
		// 	alpha2: enter ? 1.4 : 0.8,
		// 	delay: 0.05
		// })
	},
	renderAngle: function(a,a2){
		this.ctx.clearRect(0,0,50,50);
		this.ctx.lineWidth = 1.5
		this.ctx.lineCap = 'square';
		this.ctx.lineJoin = 'square';
		this.ctx.strokeStyle = 'rgba(255,255,255,0.7)'
		this.ctx.beginPath();
	
		var angle = Math.PI/2*a;
		var off = -Math.PI/2

		
		
		
		var d = 6;
		
		this.ctx.moveTo(25+Math.cos(off+angle)*10,25+Math.sin(off+angle)*10);
		this.ctx.lineTo(25,25);
		this.ctx.lineTo(25+Math.cos(off+-angle)*10,25+Math.sin(off+-angle)*10);
		
		this.ctx.moveTo(25+Math.cos(off+angle)*10,25+d+Math.sin(off+angle)*10);
		this.ctx.lineTo(25,25+d);
		this.ctx.lineTo(25+Math.cos(off+-angle)*10,25+d+Math.sin(off+-angle)*10);
		// this.ctx.closePath()
		this.ctx.stroke();

	},
	render: function(){
		var angle;
		if(this.props.dir != null){
		

			angle = <canvas ref = 'angle' className= {'_intui_angle _intui_angle_'+this.props.dir} ></canvas>
		}
		var style = Object.assign({pointerEvents: this.props.show ? 'all' : 'none', 'opacity':this.props.show ? 1 : 0},this.props.style)
		return (
			<div ref = 'overlay' className='_intui_overlay'  onClick={this.props.onClick} style={style} >
				{angle}
				{this.props.children}
			</div>
		)
	}
})


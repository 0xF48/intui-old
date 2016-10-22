
// var DimController = require('./DimController')();


// window._intui_render_calls = 0


function clamp(n,min,max){
	if (n <= min) return min
	if(n >= max) return max
	return n
}


var Slide = React.createClass({
	displayName: 'exports',


	/* default props */
	getDefaultProps: function getDefaultProps() {

		return {
			pause_scroll: false,
			ease: 'cubic-bezier(.29,.3,.08,1)',
			index_offset: null,
			_intui_slide: true, //intui slide identifier.
			ease_dur: 0.4, //slide ease_dur
			index_pos: null, //current nested slide index.
			offset: 0, //slide offset in pixels
			beta: 100, //beta relative to parent
			c: null, //inner and static classname shortcut
			oc: null, //outer classname shortcut
			slide: false,
			height: null, //height override
			width: null, //width override
			center: false,
			auto: false
		};
	},

	/* default state and instance variables */
	getInitialState: function getInitialState() {
		this.stage = {
			x: 0,
			y: 0,
			o_time: 0,
			velocity: 0
		};

		this.i_w = null;
		this.i_h = null;

		this.set_timer = null;
		this.scroll_ppos = null;
		this.scroll_pos = 0;
		this.prev_pos = false; //im not sure what this does anymore
		this.scroll_events = [];

		this.rect = {
			width: 0,
			height: 0
		};

		return {
			dim: 0
		};
	},

	/* context for talking up and down the tree */
	contextTypes: {
		_intui_slide: React.PropTypes.bool, //this is a uique prop to identify a react component as an intui slide.
		total_beta: React.PropTypes.number, //total beta is the total beta of all children for this slide passed in the declarative props
		width: React.PropTypes.number,
		height: React.PropTypes.number,
		vertical: React.PropTypes.bool },

	childContextTypes: {
		_intui_slide: React.PropTypes.bool,
		total_beta: React.PropTypes.number,
		width: React.PropTypes.number,
		height: React.PropTypes.number,
		vertical: React.PropTypes.bool
	},

	getChildContext: function getChildContext() {
		return {
			_intui_slide: true,
			height: this.refs.outer ? this.refs.outer.clientHeight : null,
			width: this.refs.outer ? this.refs.outer.clientWidth : null,
			// total_beta: this.getTotalBeta(),
			vertical: this.props.vertical
		};
	},

	//return the width/height of the slide in percentages based on parent context total beta.
	getBeta: function getBeta() {
		var beta = null;
		if (this.props.root || this.context.total_beta == null) beta = this.props.beta;else beta = 100 / this.context.total_beta * this.props.beta;

		beta = Math.round(beta) + '%';
		//offset is extra and is barely used, may need to be removed in future
		if (this.props.offset) return 'calc(' + beta + ' ' + (this.props.offset > 0 ? '+ ' : '- ') + Math.abs(this.props.offset) + 'px)';else return beta;
	},

	//get the calculated outer height and width of the slide.
	getOuterHW: function getOuterHW() {

		var ph = this.props.vertical && this.props.auto ? 'auto' : typeof this.props.height == 'number' ? this.props.height + 'px' : this.props.height;
		var pw = !this.props.vertical && this.props.auto ? 'auto' : typeof this.props.width == 'number' ? this.props.width + 'px' : this.props.width;

		var p_w, p_h;

		if (this.refs.outer && this.refs.outer.parentElement) {
			var p_a = this.refs.outer.parentElement.getAttribute('class');
			if (p_a && p_a.match(/_intui_slide_static/)) {

				p_w = this.refs.outer.parentElement.clientWidth;
				p_h = this.refs.outer.parentElement.clientHeight;
				// console.log(p_w, p_h)
			} else if (p_a && p_a.match(/_intui_slide_inner/)) {
				p_w = this.refs.outer.parentElement.parentElement.clientWidth;
				p_h = this.refs.outer.parentElement.parentElement.clientHeight;
				// console.log(p_w, p_h)
			} else {
				return {
					height: ph || '100%',
					width: pw || '100%'
				};
			}
		} else {
			return {
				height: ph || '100%',
				width: pw || '100%'
			};
		}

		if (this.context.vertical) {
			pw = pw || '100%';
			ph = ph || Math.round(p_h / 100 * this.props.beta) + 'px';
		} else {
			pw = pw || Math.round(p_w / 100 * this.props.beta) + 'px';
			ph = ph || '100%';
		}

		return {
			height: ph,
			width: pw
		};
	},

	//get the calculated inner height and width of the slide.
	getInnerHW: function getInnerHW() {

		var dims = {
			width: this.props.vertical ? '100%' : 'auto',
			height: this.props.vertical ? 'auto' : '100%'
		};

		return dims;
	},

	//get innder dimentions in pixels
	getInnerDim: function getInnerDim() {
		if (!this.props.children) return 0;
		this.node_count = 0;
		var d = 0;
		for (var i = 0; i < this.props.children.length; i++) {
			var child = this.props.children[i];
			if (!this.isValidChild(child)) continue;
			this.node_count++;
			// console.log(this.rect.height)
			if (this.props.vertical) {
				d += child.props.height != null ? child.props.height : this.rect.height / 100 * child.props.beta;
			} else {
				d += child.props.width != null ? child.props.width : this.rect.width / 100 * child.props.beta;
			}
			if (child.props.offset) d += child.props.offset;
		}
		return d;
	},

	//check to see if child is a valid intui slide.
	isValidChild: function isValidChild(child) {
		if (child == null) return false;
		if (child.type == null) return false;
		if (child.type.contextTypes == null) return false;
		if (child.type.contextTypes._intui_slide != null) return true;
		if (child.type.WrappedComponent != null && child.type.WrappedComponent.contextTypes._intui_slide != null) return true;
		return false;
	},

	//scroll to a position, the default transition time is 0.07 but may need to be adjusted based on performance.
	scrollTo: function scrollTo(pos, dur) {
		if (this.scroll_ppos == pos) return null;
		this.scroll_ppos = pos;
		if (this.props.vertical) {
			this.refs.inner.style.transform = 'matrix(1, 0, 0, 1, 0, -' + pos + ')';
			this.stage.y = -pos;
		} else {
			this.refs.inner.style.transform = 'matrix(1, 0, 0, 1, -' + pos + ', 0)';
			this.stage.x = -pos;
		}
	},

	scroll_delta: function scroll_delta(delta) {
		if (this.props.pause_scroll == true) {
			// this.scrollTo(this.scroll_pos,true)
			return null;
		}

		var r_min = 0;
		var r_max = this.props.vertical ? this.refs.inner.clientHeight - this.refs.outer.clientHeight : this.refs.inner.clientWidth - this.refs.outer.clientWidth; //relative max (600px innerHeight)
		if (r_max < 0) r_max = 0;

		this.scroll_pos = clamp(this.scroll_pos + delta, r_min, r_max);

		for (var i = 0; i < this.scroll_events.length; i++) {
			// if (this.scroll_pos == r_min) this.scroll_events[i](0,r_max);
			// else if(this.scroll_pos == r_max) this.scroll_events[i](r_max,0);
			this.scroll_events[i](this.scroll_pos, r_max - this.scroll_pos);
		}

		this.scrollTo(this.scroll_pos);

		if (this.scroll_pos == r_max) return 1; //this.scroll_cb(1,delta);
		else if (this.scroll_pos == r_min) return -1; //this.scroll_cb(-1,delta);
			else return 0; //this.scroll_cb(0,delta);
	},

	// getTotalBeta: function() {
	// 	if(!this.props.children) return 100		
	// 	var b = this.getInnerDim()/(this.props.vertical ? this.rect.height : this.rect.width)*100
	// 	if( b < 100 ) b = 100;
	// 	if( b == Infinity) b = 100;
	// 	return b
	// },

	/* if parent element width/height ratio changes, we re-render */
	getHWRatio: function getHWRatio() {
		if (this.rect.width != 0 && this.rect.height != 0) {
			return this.rect.width / this.rect.height;
		} else {
			return 0;
		}
	},

	/* if i was a bird i would just fly all the time */
	getHWInnerRatio: function getHWInnerRatio() {
		if (this.refs.inner.clientWidth != 0 && this.refs.inner.clientHeight != 0) {
			return this.refs.inner.clientWidth / this.refs.inner.clientHeight;
		} else {
			return 0;
		}
	},

	toXY: function toXY(x, y) {
		// console.log(x,y)

		if (this.props.vertical) y += this.props.index_offset;else x += this.props.index_offset;

		this.refs.inner.style.transform = 'matrix(1, 0, 0, 1, ' + String(-x) + ', ' + String(-y) + ')';
		this.stage.y = -y;
		this.stage.x = -x;
		this.showNonVisible(x, y);
		clearTimeout(this.slide_timer);
		this.slide_timer = setTimeout(function () {
			this.hideNonVisible(-this.stage.x, -this.stage.y);
			if (this.props.onSlideEnd != null) this.props.onSlideEnd(this.props.index_pos);
		}.bind(this), this.props.ease_dur * 1000);
	},

	setXY: function setXY(x, y) {
		if (this.props.vertical) y += this.props.index_offset;else x += this.props.index_offset;

		// console.log('set XY',x,y,this.props.id)
		clearTimeout(this.slide_timer);
		clearTimeout(this.set_timer);
		this.showNonVisible(x, y);
		this.hideNonVisible(x, y);

		this.refs.inner.style.transition = '';
		this.refs.inner.style.transform = 'matrix(1, 0, 0, 1, -' + x + ', -' + y + ')';
		this.stage.y = -y;
		this.stage.x = -x;

		this.set_timer = setTimeout(function () {

			if (this.refs.inner) {
				if (this.props.scroll) {
					this.refs.inner.style.transition = '';
				} else {
					this.refs.inner.style.transition = 'transform ' + this.props.ease_dur + 's ' + this.props.ease;
				}
			}
		}.bind(this), this.props.ease_dur * 1000);
	},

	//get x and y coordinates of child index.

	getIndexXY: function getIndexXY(index) {
		if (this.props.slide == false) return { x: 0, y: 0 };

		var x,
		    y = 0;
		var max_y = Math.abs(this.refs.inner.clientHeight - this.refs.outer.clientHeight);
		var max_x = Math.abs(this.refs.inner.clientWidth - this.refs.outer.clientWidth);
		var self_x = -this.stage.x;
		var self_y = -this.stage.y;
		var cc = null;

		for (var i = 0, j = 0; i < this.props.children.length; i++) {
			if (!this.isValidElement(this.refs.inner.children[i])) continue;
			cc = this.refs.inner.children[i];
			if (j == index) break;
			j++;
		}

		if (!this.props.vertical) {
			if (cc.offsetLeft > self_x + this.refs.outer.clientWidth / 2) {
				x = cc.offsetLeft + (this.refs.outer.clientWidth - cc.clientWidth);
			} else {
				x = cc.offsetLeft;
			}

			y = 0;
		} else {

			if (cc.offsetTop > self_y + this.refs.outer.clientHeight / 2) {
				y = cc.offsetTop + (this.refs.outer.clientHeight - cc.clientHeight);
			} else {
				y = cc.offsetTop;
			}

			x = 0;
		}

		// y += 10;

		// console.log(y,max_y)

		// console.log(x,y)

		return {
			x: this.props.vertical ? 0 : x > max_x ? max_x : x,
			y: this.props.vertical ? y > max_y ? max_y : y : 0
		};
	},

	on: function on(event, listener) {
		if (event == 'scroll') {
			this.scroll_events.push(listener);
		}
	},

	width: function width() {
		if (!this.refs.outer) return -1;else return this.refs.outer.clientWidth;
	},

	height: function height() {
		if (!this.refs.outer) return -1;else return this.refs.outer.clientHeight;
	},

	getRekt: function getRekt() {
		this.rect = {
			width: this.props.width || this.refs.outer.clientWidth,
			height: this.props.height || this.refs.outer.clientHeight
		};
	},

	betaToDim: function betaToDim(beta) {
		if (!this.refs.outer) return 0;
		return (this.context.vertical ? this.refs.outer.parentElement.parentElement.clientHeight : this.refs.outer.parentElement.parentElement.clientWidth) / 100 * beta;
	},

	getDimChange: function getDimChange(props) {
		if (props.height == this.props.height && props.width == this.props.width && props.beta == this.props.beta) return null;

		var diff_dim = null;
		var diff_beta = null;

		if (this.context.vertical && props.height != this.props.height) {
			if (props.height == null) {
				diff_dim = this.betaToDim(props.beta) - this.props.height;
			} else if (this.props.height == null) {
				diff_dim = props.height - this.betaToDim(this.props.beta);
			} else {
				diff_dim = props.height - this.props.height;
			}
		} else if (!this.context.vertical && props.width != this.props.width) {
			if (props.width == null) {} else if (this.props.width == null) {
				diff_dim = this.betaToDim(props.beta) - this.props.width;
				diff_dim = props.width - this.betaToDim(this.props.beta);
			} else {
				diff_dim = props.width - this.props.width;
			}
		} else if (props.beta != this.props.beta) {
			diff_beta = props.beta - this.props.beta;
		} else {
			throw 'something went wrong with dim transition.';
		}

		if (diff_beta) diff_dim = this.betaToDim(diff_beta);

		return {
			offset_x: this.context.vertical ? 0 : diff_dim,
			offset_y: !this.context.vertical ? 0 : diff_dim
		};
	},

	updateState: function updateState(props, state, set) {

		state = state || this.state;
		props = props || this.props;

		if (this.refs.outer != null) {
			// //get dim change
			// var set_offset = this.getDimChange(props);

			// //if there is dim change pass offset along to transition manager
			// if(set_offset != null) DimController.add(this.refs.outer,set_offset);

			//get outer rectangle
			this.getRekt();

			//update self			
		}

		var ratio = this.getHWRatio();

		var d_needs_update = state.dim != ratio || props.width != this.props.width || props.height != this.props.height || props.beta != this.props.beta;
		// var i_needs_update = DimController.needs_update(d_needs_update,this.rect);


		// if( ( props.index_offset != null || props.index_pos != null ) && props.slide){
		// 	if(this.props.index_pos != props.index_pos || props.index_offset != this.props.index_offset){

		// 		this.prev_pos = false;
		// 	}else if(this.props.index_pos == props.index_pos && d_needs_update){

		// 		this.prev_pos = true;
		// 	}else if(this.props.index_pos == props.index_pos && i_needs_update && !d_needs_update){

		// 		setTimeout(this.toIndex,0)
		// 	}
		// }


		if (d_needs_update) {
			var state = {
				offset_y: 0,
				offset_x: 0,
				dim: ratio
			};
			if (set) this.setState(state);else Object.assign(this.state, state);
		}

		return true;
	},

	toggleChildOpacity: function toggleChildOpacity(cc, toggle) {
		var cc_trans = cc.style.transition;
		cc.style.transition = 'none';
		cc.style.visibility = toggle ? 'initial' : 'hidden';
		cc.style.transition = cc_trans;
	},

	// check to see if element has intui class
	isValidElement: function isValidElement(cc) {
		if (!cc) return false;
		if (cc.getAttribute('class').match(/_intui_slide_outer|_intui_slide_static/) != null) {
			return true;
		} else {
			return false;
		}
	},

	hideNonVisible: function hideNonVisible(x, y) {

		if (!this.props.slide) return false;
		// console.log('hide')
		for (var i = 0; i < this.props.children.length; i++) {
			var c = this.props.children[i];
			var cc = this.refs.inner.children[i];

			if (!this.isValidElement(cc)) continue;

			if (this.props.vertical) {
				// console.log('hide',y,cc.offsetTop+cc.clientHeight)
				if (cc.offsetTop + cc.clientHeight <= y || cc.offsetTop >= y + this.refs.outer.clientHeight) {
					this.toggleChildOpacity(cc, 0);
					// console.log('TOGGLE -',cc.offsetTop,cc.clientHeight)
				}
			} else {
				if (cc.offsetLeft + cc.clientWidth <= x || cc.offsetLeft >= x + this.refs.outer.clientWidth) {
					this.toggleChildOpacity(cc, 0);
					// console.log('TOGGLE -')
				}
			}
		}
	},

	showNonVisible: function showNonVisible(x, y) {

		if (!this.props.slide) return;
		// console.log('show',this.props.children.length)
		for (var i = 0; i < this.props.children.length; i++) {
			var c = this.props.children[i];
			if (!this.isValidChild(c)) continue;

			var cc = this.refs.inner.children[i];
			if (this.props.vertical) {

				if (cc.offsetTop > y && cc.offsetTop < y + this.refs.outer.clientHeight || cc.offsetTop + cc.clientHeight < y + this.refs.outer.clientHeight && cc.offsetTop + cc.clientHeight > y) {
					this.toggleChildOpacity(cc, 1);
				}
			} else {
				if (cc.offsetLeft + cc.clientWidth > x && cc.offsetLeft < x + this.refs.outer.clientWidth) {
					this.toggleChildOpacity(cc, 1);
					// console.log('TOGGLE +')
				}
			}
		}
	},

	toIndex: function toIndex() {
		if (this.props.index_offset == null && this.props.index_pos == null) return;
		var pos = this.getIndexXY(this.props.index_pos);
		this.toXY(pos.x, pos.y);
	},

	setIndex: function setIndex() {
		if (this.props.index_offset == null && this.props.index_pos == null) return;
		var pos = this.getIndexXY(this.props.index_pos);

		this.setXY(pos.x, pos.y);
	},

	componentDidUpdate: function componentDidUpdate(props, state) {

		if (this.refs.inner) {
			if (this.props.scroll) {
				this.refs.inner.style.transition = '';
			} else {
				this.refs.inner.style.transition = 'transform ' + this.props.ease_dur + 's ' + this.props.ease;
			}
		}

		if ((this.props.index_pos != null || this.props.index_offset != null) && this.props.slide) {
			// if(this.props.c && this.props.c.match(/test/)){
			// 	// console.log(this.refs.inner.clientHeight)
			// }
			var pos = this.getIndexXY(this.props.index_pos);
			if (props.index_pos != this.props.index_pos || props.index_offset != this.props.index_offset) {

				setTimeout(this.toIndex, 0);
				this.i_h = this.refs.inner.clientHeight;
				this.i_w = this.refs.inner.clientWidth;
			} else if (this.prev_pos == true || this.i_h != this.refs.inner.clientHeight || this.i_w != this.refs.inner.clientWidth) {

				this.i_h = this.refs.inner.clientHeight;
				this.i_w = this.refs.inner.clientWidth;

				if (props.index_pos != this.props.index_pos) {
					this.toXY(pos.x, pos.y);
				} else {
					this.setXY(pos.x, pos.y);
				}

				this.prev_pos = false;
			}
		}
	},

	componentWillUpdate: function componentWillUpdate(props, state) {
		this.updateState(props, state, false);
	},

	resize: function resize() {
		this.forceUpdate();
	},

	// componentWillUnmount: function(){
	// 	// window.removeEventListener('resize',this.resize)
	// },


	componentDidMount: function componentDidMount() {

		this.getRekt();
		this.updateState(null, null, true);

		if (this.props.index_pos != null) {
			setTimeout(this.setIndex, 0);
		}
	},

	componentWillMount: function componentWillMount() {
		this.pass_props = {};
		this.events.forEach(function (e) {
			if (this.props[e]) {
				this.pass_props[e] = this.props[e];
			}
		}.bind(this));
	},
	events: ['onClick', 'onMouseEnter', 'onMouseLeave'],

	render: function render() {
		// if(this.props.c && this.props.c.match(/test/)) window.tslide = this

		// window._intui_render_calls = window._intui_render_calls || 0
		// window._intui_render_calls ++ 
		var dynamic = this.props.slide;
		var outer_hw_style, inner_hw_style, innerClass, inner, outerClass, staticClass;

		if (dynamic) {
			outer_hw_style = Object.assign(this.getOuterHW(), this.props.style);
			inner_hw_style = this.getInnerHW();
			innerClass = ' _intui_slide_inner ' + (this.props.vertical ? ' _intui_slide_vertical ' : ' ') + (this.props.c || this.props.innerClassName || this.props.className || '') + (this.props.center ? ' _intui_slide_center' : '');
			inner = React.createElement(
				'div',
				{ className: innerClass, style: inner_hw_style, ref: 'inner' },
				this.props.children
			);
			outerClass = ' _intui_slide_outer ' + (this.props.oc || this.props.outerClassName || '') + (this.props.height != null || this.props.width != null ? ' _intui_slide_fixed' : '');
		} else {
			outer_hw_style = Object.assign(this.getOuterHW(), this.props.style);

			inner = this.props.children;
			staticClass = ' _intui_slide_static' + (this.props.center ? ' _intui_slide_center' : '') + (this.props.vertical ? ' _intui_slide_vertical ' : ' ') + (this.props.height != null || this.props.width != null ? ' _intui_slide_fixed ' : ' ') + (this.props.c || this.props.innerClassName || '');
		}

		return React.createElement(
			'div',
			_extends({}, this.pass_props, { id: this.props.id, className: dynamic ? outerClass : staticClass, style: outer_hw_style, ref: 'outer' }),
			inner
		);
	}
});

module.exports =  Slide
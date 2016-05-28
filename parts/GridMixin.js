var React = require('react');

module.exports = {
	contextTypes: {
		scroll: React.PropTypes.object,
		vertical: React.PropTypes.bool,
		outerHeight: React.PropTypes.number,
		innerHeight: React.PropTypes.number,
		fixed: React.PropTypes.bool,
		diam: React.PropTypes.number,
		w: React.PropTypes.number,
		h: React.PropTypes.number,
	}
}

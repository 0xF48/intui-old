var React = require('react');

module.exports = {
	contextTypes: {
		scroll: React.PropTypes.object,
		fixed: React.PropTypes.bool,
		diam: React.PropTypes.number,
		vertical: React.PropTypes.bool,
		outerWidth: React.PropTypes.number,
		outerHeight: React.PropTypes.number,
		w: React.PropTypes.number,
		h: React.PropTypes.number,
	}
}


/* tetris grid  */

var React = require('react');


var Grid = React.createClass({

})

var Item = React.createClass({
	render: function(){



		return (
			<div>
				{this.props.children}
			</div>
		)
	}
})




module.exports.Grid = Grid;
module.exports.Item = Item;
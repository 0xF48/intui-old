


module.exports = {
	//main slide component
	Slide: require('./source/Slide'),


	Grid: require('./source/Grid').Grid,
	
	Pager: require('./source/Pager'),
	GridItem: require('./source/Grid').Item,
	GridMixin: require('./source/Grid').Mixin,
	Mixin: require('./source/Mixin'),
	Loader: require('./source/Loader'),
	Example: require('./source/example'),
	Button: require('./source/Button'),
	Modal: require('./source/Modal'),
	ToolTip: require('./source/ToolTip'),

	//input
	NumberField: require('./source/Form').NumberField,
	ManyNumberField: require('./source/Form').ManyNumberField,
	ToggleField: require('./source/Form').Toggle
}

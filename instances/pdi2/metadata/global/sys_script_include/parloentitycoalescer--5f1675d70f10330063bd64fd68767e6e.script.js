var ParloEntityCoalescer = Class.create();
ParloEntityCoalescer.prototype = Object.extendsObject(OpenNLUCoalescer, {
	initialize: function() {
		OpenNLUCoalescer.prototype.initialize.call(this);
	},

	type: 'ParloEntityCoalescer'
});

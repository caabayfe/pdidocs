var AbstractMobileCallableInclude = Class.create();
AbstractMobileCallableInclude.prototype = {
    initialize: function(functionName, params) {
		this.functionName = functionName;
		this.params = params;
    },

	process : function() {
		var functionName = this.functionName;
		if (!functionName)
			return;
		
		if (functionName.indexOf('_') == 0)
			return;

		var f = this[functionName];
		if (typeof f != 'function')
			return;
		
		return f.call(this);
	},

	getParameter: function(name) {
		return this.params[name];
	},

    type: 'AbstractMobileCallableInclude'
};

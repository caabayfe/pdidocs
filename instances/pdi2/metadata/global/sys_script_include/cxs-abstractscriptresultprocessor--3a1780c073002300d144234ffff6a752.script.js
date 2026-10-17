var cxs_AbstractScriptResultProcessor = Class.create();
cxs_AbstractScriptResultProcessor.prototype = {
    initialize: function(request, response) {
		this._json = new JSON();
		this.request = request;
		this.response = response;
    },

	processSearch: function () {
	},
    type: 'cxs_AbstractScriptResultProcessor'
};

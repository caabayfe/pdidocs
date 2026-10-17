var SPWidgetAccessControl = Class.create();
SPWidgetAccessControl.prototype = {
    initialize: function() {
    },

	hasPublicAccess: function(tableName, spScriptable, options, input) {
		try {
			return spScriptable.hasPublicAccessToTable(tableName, options, input);
		}
		catch (err) {
			var inputParams = {};
            inputParams.widgetSysid = spScriptable.getWidgetSysId();
            inputParams.requestedUrlPath = GlideTransaction.get().getURL();
            inputParams.options = options;
            inputParams.input = input;
            if (inputParams.options && inputParams.options.widget_parameters)
            	delete inputParams.options.widget_parameters;
            if (inputParams.input && inputParams.input.widget_parameters)
            	delete inputParams.input.widget_parameters;
			gs.error('Exception: while spScriptable.hasPublicAccessToTable method execution with : ' + JSON.stringify(inputParams) + ' Error: ' + err);
			return false;
        }
		
	},

    type: 'SPWidgetAccessControl'
};

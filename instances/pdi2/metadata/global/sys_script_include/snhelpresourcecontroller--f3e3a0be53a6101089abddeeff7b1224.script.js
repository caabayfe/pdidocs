var SNHelpResourceController = Class.create();
SNHelpResourceController.prototype = {
    initialize: function() {
		this.constants = new SNHelpConstantProvider();
		this.dbController = new SNHelpDBController(this.constants.tables.content);
		this._helpUtil = new SNHelpUtil();
    },
	
	getById: function(sys_id) {
		var result = this.dbController.getById(sys_id);
		
		if(!result) 
			return null;
		
		var resourceKeys = this.constants.restAPIKeys.resource;
		result = this._helpUtil.constructPayLoad(resourceKeys, [result]);
		
		if(Array.isArray(result) && result.length > 0)
			return result[0];
		else
			return null;
	},

	getByResourceId : function(res_id) {
		if(!res_id)
			return null;

		res_id = this.sanitizeResourceId(res_id);

		var resourceKeys = this.constants.restAPIKeys.resource;
		var query = "resource_id=" + res_id;
		var result = this.dbController.getByEncodedQuery(query);

		if(!result)
			return null;

		result = this._helpUtil.constructPayLoad(resourceKeys, result);

		if(Array.isArray(result) && result.length > 0)
			return result[0];
		else
			return null;
	},

	// resource_id is attacker-controlled and gets concatenated into an encoded query;
	// escape '^' so it can only match as a literal, and reject javascript: values.
	sanitizeResourceId: function(value) {
		if (!value)
			return value;

		var str = value.toString();
		if (str.toLowerCase().indexOf("javascript:") === 0)
			return "sn_help_rejected_resource_id";

		return GlideStringUtil.escapeQueryTermSeparator(str);
	},

    type: 'SNHelpResourceController'
};

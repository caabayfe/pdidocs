var CICDFlowUtil = Class.create();
CICDFlowUtil.prototype = {
    initialize: function() {
		this.API_BASE_URL = '/api/sn_cicd/';
    },
	
	getAPIVersionPath: function(apiVersionParameter) {		
		if (global.JSUtil.nil(apiVersionParameter))
			return this.API_BASE_URL;
		
		return this.API_BASE_URL + apiVersionParameter + '/';
	},

    type: 'CICDFlowUtil'
};

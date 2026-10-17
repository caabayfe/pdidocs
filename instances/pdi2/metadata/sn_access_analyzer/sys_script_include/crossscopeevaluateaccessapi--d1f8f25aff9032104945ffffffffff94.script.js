var CrossScopeEvaluateAccessAPI = Class.create();
CrossScopeEvaluateAccessAPI.prototype = {
    initialize: function() {
		this.identityAPI = new sn_identity.IdentitySecurityApi();
    },

	/**
     * Cross-scope wrapper for evaluate access functionality
     * @param {String} requestPayload - JSON string or object with access evaluation request
     * @returns {Object} Access evaluation result from sn_identity.IdentitySecurityApi
     */
    evaluateAccess: function(requestPayload) {
         try {
            // Convert string to object if needed
            var payload;
            if (typeof requestPayload === 'string') {
                payload = JSON.parse(requestPayload);
            } else {
                payload = requestPayload;
            }
            
            var api = new sn_identity.IdentitySecurityApi();
            return api.evaluateAccess(payload);  
            
        } catch (e) {
            gs.error('CrossScopeEvaluateAccessAPI.evaluateAccess error: ' + e.message);
            return JSON.stringify({
                error: true,
                errorMessage: 'Error evaluating access: ' + e.message,
                detail: {}
            });
        }
    },

    type: 'CrossScopeEvaluateAccessAPI'
};

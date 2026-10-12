var RequestAuthInternal = Class.create();
RequestAuthInternal.prototype = {
    initialize: function() {
    },

    type: 'RequestAuthInternal',
    
	generateAuth: function(requestAuthenticator) {
		//requestAuthenticator object is java class signer
		this.custom(requestAuthenticator);
		return this.callAuthDataGeneration(requestAuthenticator, true);
	},
	
	custom: function (requestAuthenticator) {
	},
	
	callAuthDataGeneration: function(requestAuthenticator, locally) {
		if (locally) 
			return requestAuthenticator.generateAuth();
	
		return requestAuthenticator.generateAuthRemotely();
	},
	
};

	

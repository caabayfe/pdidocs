var RequestAuthTwitterSigner = Class.create();
RequestAuthTwitterSigner.prototype = {
    initialize: function() {
    },
	type: 'RequestAuthTwitterSigner',
	
	generateAuth: function(requestAuthenticator) {
		//requestAuthenticator object is java class signer
		return requestAuthenticator.generateAuthRemotely();
	}
};

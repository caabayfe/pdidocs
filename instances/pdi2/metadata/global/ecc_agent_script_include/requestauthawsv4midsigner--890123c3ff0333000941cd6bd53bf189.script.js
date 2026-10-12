var RequestAuthAWSV4MIDSigner = Class.create();

RequestAuthAWSV4MIDSigner.prototype = Object.extend(new RequestAuthInternal(), {
	initialize:function() {
		RequestAuthInternal.prototype.initialize.call(this);
	},
	type: 'RequestAuthAWSV4MIDSigner',
	
	custom: function(requestAuthenticator) {
		//custom signing here
		var credential = requestAuthenticator.getAuthCredential();
		var qMap = requestAuthenticator.getQueryParamMap();
		var reqData = requestAuthenticator.getHttpRequestData();
	}
});

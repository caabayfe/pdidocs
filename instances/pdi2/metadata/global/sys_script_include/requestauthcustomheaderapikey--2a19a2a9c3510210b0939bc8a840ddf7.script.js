var RequestAuthCustomHeaderAPIKey = Class.create();
RequestAuthCustomHeaderAPIKey.prototype = {
    initialize: function() {
    },

    generateAuth: function(authAPI) {
        var requestData = new sn_auth.HttpRequestAuthedData();
        var credential = authAPI.getAuthCredential();
		
        var headerName = credential.getAttribute("header");
        var token = credential.getAttribute("api_key");
		
		if(!gs.nil(token)) {
			requestData.addHeader(headerName, token);
		}
		
		requestData.setDirective("HEADER");
		requestData.setStatus("SUCCESS");
        return requestData;
    },

    type: 'RequestAuthCustomHeaderAPIKey'
};

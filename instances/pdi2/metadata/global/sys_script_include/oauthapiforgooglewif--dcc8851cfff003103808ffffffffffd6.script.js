var OAuthAPIForGoogleWIF = Class.create();
OAuthAPIForGoogleWIF.prototype = Object.extendsObject(OAuthUtil, {

	preprocessAccessToken: function(requestParamMap) {
		requestParamMap.remove("client_id");
		requestParamMap.remove("client_secret");
	},

	type: "OAuthAPIForGoogleWIF"
});

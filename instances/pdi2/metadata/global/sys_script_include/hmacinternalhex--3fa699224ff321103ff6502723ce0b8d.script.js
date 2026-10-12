var HMACInternalHex = Class.create();
HMACInternalHex.prototype = {
    initialize: function(request, response, hmacAuthUtil, credential) {
      this.request = request;
      this.response = response;
      this.hmacAuthUtil = hmacAuthUtil;
      this.credential = credential;
    },

	buildHMACInfo: function() {
		var payload = this.hmacAuthUtil.getBodyAsString();

	    var dict = this.parseCredential();
		var keyId = dict["KEYID"];
		var signature = dict["SIGNATURE"];
		if (keyId)
			this.hmacAuthUtil.setKeyId(keyId);
		if (signature)
			this.hmacAuthUtil.setSignature(signature);
		if (payload)
			this.hmacAuthUtil.setContentToSign(payload);
	},

	/**
	 * Credential in format: keyId=myKeyId,signature=mySignature. This method parse
	 * credential and return a JavaScript dictionary.
	**/
	parseCredential: function() {
		var dict = {};
		const splitCredentialArray = this.credential.split(",");
		if (!splitCredentialArray || splitCredentialArray.length < 1)
			return dict;

		for (var i = 0; i < splitCredentialArray.length; i++) {
			var keyVal = splitCredentialArray[i].split("=");
			if (keyVal && keyVal.length > 1) {
				var val = keyVal[1];
				if (val)
					val = val.trim();
				var key = keyVal[0];
				if (key) {
					key = key.trim();
					key = key.toUpperCase();
				}
				dict[key] = val;
			}
		}

	    return dict;
	},

    type: 'HMACInternalHex'
};

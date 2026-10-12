var HMACInternalBase64 = Class.create();
HMACInternalBase64.prototype = {
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
		this.hmacAuthUtil.setEncoding('Base64');
	},

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
	
    type: 'HMACInternalBase64'
};

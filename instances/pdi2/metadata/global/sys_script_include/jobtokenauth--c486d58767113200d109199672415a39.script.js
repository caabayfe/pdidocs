var JobTokenAuth = Class.create();
JobTokenAuth.prototype = {
    initialize: function(request, response, auth_type, auth_value) {
		this.request = request;
		this.response = response;
		this.auth_type = auth_type;
		this.auth_value = auth_value;
	},

	getAuthorized: function() {
		if (this._validToken()) {
			// Validate kaa only when kaa is enabled and mtls is supported by ADC
			if(this._kaa_enabled() && this._adc_supports_mtls() && !this._validateKaa())
				return null;

			return 'sharedservice.worker';
		}

		return null;
	},

	_kaa_enabled: function() {
		return GlideProperties.getBoolean('glide.platform_ml.kaa_auth_enabled', true);
	},

	_adc_supports_mtls: function() {
		var cache_name = 'platform_ml.JobTokenAuth';
		var adc_supports_mtls = GlideCacheManager.get(cache_name, 'adc_supports_mtls');
		if(adc_supports_mtls != null) return adc_supports_mtls;

		var endpoint = gs.getProperty('glide.servlet.uri') + 'adcv2/supports_tls';
		adc_supports_mtls = false;
		try {
			var client = new GlideHTTPClient();
			client.setFollowRedirect(false);
			var request = new Packages.org.apache.commons.httpclient.methods.GetMethod(endpoint);

			var result = client.executeMethod(request);
			if (result === 200) {
				adc_supports_mtls = request.getResponseBodyAsString().equals("true");
			}
		} catch (error) {
		    gs.log("Failed to get adc supports mtls status.");
			return false;
		}
		gs.log("Updating cache for cache_name: " + cache_name + ", key: adc_supports_mtls, value: " + adc_supports_mtls);
		GlideCacheManager.put(cache_name, 'adc_supports_mtls', adc_supports_mtls);
		return adc_supports_mtls;
	},

	_validateKaa: function() {
		if (this.request.getHeader('X-Client-Cert') == null) {
			return false;
		}

		var result = GlideUser.authenticateMutualAuthToken();
		// user is created and a kaa policy with be mapped to this user
		// ML trainer will send this user in X-KaaUserClaim request header
		if (GlideStringUtil.notNil(result) && result.equals('mltrainer-glide'))
			return true;

		return false;
	},

	_validToken: function() {
		var token = this._getToken();
		if (gs.nil(token)) {
			return false;
		}

		var solution = new GlideRecord("ml_solution");
		solution.get("token_hash", new GlideDigest().md5_digest(token));
		if (solution.isValidRecord()) {
			return true;
		}
		return false;
	},

	_getToken: function() {
		var up = GlideStringUtil.base64Decode(this.auth_value);
		var split = up.indexOf(":");

		if (split == -1) {
			gs.log("JobToken authentication not well formed");
			return null;
		}

		var userName = up.substring(0, split);
		var token = up.substring(split + 1);
		return token;
	},

    type: 'JobTokenAuth'
};

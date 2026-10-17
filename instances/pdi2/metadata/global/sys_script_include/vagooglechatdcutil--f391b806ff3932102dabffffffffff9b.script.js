var VAGoogleChatDCUtil = Class.create();
VAGoogleChatDCUtil.prototype = {
	initialize: function() {
	},
	sendToDC: function(id, type, url, token) {
		var restMessageClient = new sn_ws.RESTMessageV2();
		restMessageClient.setHttpMethod("post");
		var dcUrl = gs.getProperty("glide.channelproxy.dc_url", "https://chnlpxymapping.service-now.com");
        var dcEndpoint = gs.getProperty("glide.channelproxy.dc_endpoint", "/api/x_snc_collab_proxy/v1/mapping_rule");
        dcUrl += dcEndpoint;
		var username = gs.getProperty('instance_id');
		var password = gs.getProperty('glide.customurl.datacenter.instance.password', null);
		restMessageClient.setEndpoint(dcUrl);
		restMessageClient.setBasicAuth(username, password);
		restMessageClient.setQueryParameter('id', id);
		restMessageClient.setQueryParameter('type', type);
		restMessageClient.setQueryParameter('url', url);
		restMessageClient.setQueryParameter('token', token);
		return restMessageClient.execute();
	},
	getSHA256: function(token) {
		if (!token) {
			return null;
		}
		try {
			var digest = new GlideDigest();
			var hash = digest.getSHA256Hex(token);
			return hash;
		} catch (e) {
			gs.error("Google Prod Bot: Error generating SHA-256 hash for the token" + e.getMessage());
		}
	},
	type: 'VAGoogleChatDCUtil'
};

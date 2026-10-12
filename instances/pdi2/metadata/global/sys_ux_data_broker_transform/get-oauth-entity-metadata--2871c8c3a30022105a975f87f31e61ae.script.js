function transform(input) {
	let dummyOAuthEntity = new GlideRecord('oauth_entity');
	var builder = new SNC.OAuthEntityBuilder(dummyOAuthEntity);
	var length = new GlideBoundedIntProperty("com.glide.oauth.client_secret.auto_generate_length", 32, 10, 4096).getInt();
	builder.autoSetClientSecret(length);
	builder.autoSetClientID();
	
	return {"client_id": dummyOAuthEntity.getValue("client_id"), "client_secret": dummyOAuthEntity.getElement("client_secret").getDecryptedValue(), "cc_enabled": gs.getProperty("glide.oauth.inbound.client.credential.grant_type.enabled", "false"), "clientSecretAutoGenLength" : length, "useraccountScope": gs.getProperty("glide.oauth.token.scope.useraccount", "d67787c4c321011089a7dd5c2840dd6e")};
}

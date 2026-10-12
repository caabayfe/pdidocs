function transform(input) {
	var oauthEntity = new GlideRecord("oauth_entity");
	oauthEntity.get(input.sysId);
	if(!oauthEntity.isValid())
		return {"error": "-1", "error_message": "Failed to find oauth record."};

	var ans = {};

	var mappedScopes = [];
	var gr = new GlideRecord("oauth_entity_auth_scope_mapping");
	gr.addQuery("oauth_entity", input.sysId);
	gr.query();
	while(gr.next()) {
		mappedScopes.push(gr.getValue("auth_scope"));
	}
	ans["mappedScopes"] = mappedScopes;

	var mapping = new GlideRecord("sys_api_access_scope");
	var apis = {};
	mapping.query();
	while(mapping.next()) {
		var temp = [];
		if(apis[mapping.getValue("auth_scope")]) {
			temp = apis[mapping.getValue("auth_scope")];
		}
		temp.push({"id": mapping.getValue("api_path") + "(" + mapping.getValue("api") + ")", "label": mapping.getValue("api")});
		apis[mapping.getValue("auth_scope")] = temp;
	}
	ans["apis"] = apis;
	ans["scope_restriction_status"] = oauthEntity.getValue("scope_restriction_status");
	ans["useraccountScope"] = gs.getProperty("glide.oauth.token.scope.useraccount", "d67787c4c321011089a7dd5c2840dd6e");
	return ans;
}

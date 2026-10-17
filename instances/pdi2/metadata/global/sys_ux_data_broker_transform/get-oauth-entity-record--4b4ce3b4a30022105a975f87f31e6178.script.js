function transform(input) {
	function getInboundIntegrationProviderRegistry(entitySysID) {
		var oobSNEntities = GlideStringUtil.split(gs.getProperty('glide.oauth.integration_registry.oob_clients'));

		let integrationProviderRegistryGR = new GlideRecord("inbound_integration_provider_registry");
		if (integrationProviderRegistryGR.get("oauth_entity", entitySysID))
			return integrationProviderRegistryGR.provider_name;

		if (oobSNEntities.indexOf(entitySysID) != -1)
			return "ServiceNow";

		return undefined;
	}
    var jwtFields = ["access_token_lifespan", "active", "client_id", "client_secret", "clock_skew", "enable_jti_verification", "jti_claim", "jwks_cache_lifespan", "jwks_url", "name", "restricted_binding", "user_field", "inbound_grant_type", "comments", "token_format", "sub_claim", "scope_restriction_status"];
    var ropcFields = ["access_token_lifespan", "active", "client_id", "client_secret", "name", "restricted_binding", "refresh_token_lifespan", "inbound_grant_type", "comments", "token_format", "sub_claim", "scope_restriction_status"];
	var oidcFields = ["name", "client_id", "active", "oidc_provider_configuration", "inbound_grant_type", "comments", "scope_restriction_status"];
	var authzCodeFields = ["access_token_lifespan","refresh_token_lifespan","redirect_url","public_client","logo_url","login_url", "active", "client_id", "client_secret", "name", "restricted_binding", "inbound_grant_type", "comments", "token_format", "sub_claim", "scope_restriction_status"];
	var clientCredentialFields = ["access_token_lifespan", "active", "client_id", "client_secret", "name", "restricted_binding", "user", "inbound_grant_type", "comments", "token_format", "sub_claim", "scope_restriction_status"];

    var record = {};

    var inboundGrantTypeChoicesFieldMap = {
        "jwt": jwtFields,
        "ropc": ropcFields,
		"clientCredential": clientCredentialFields,
		"oidc": oidcFields,
		"authz_code" : authzCodeFields
    };

    if (!inboundGrantTypeChoicesFieldMap[input.inboundGrantType]) {
        record["error"] = gs.getMessage("Invalid Grant Type");
        return record;
    }

    var fieldsToRetrieve = inboundGrantTypeChoicesFieldMap[input.inboundGrantType];

    var gr = new GlideRecordSecure(input.tableName);
    gr.get(input.sysId);
    if (!gr.isValid()) {
        record["error"] = gs.getMessage("Failed to find oauth_entity {0}", input.sysId);
        return record;
    }

    for (var key in gr) {
        if (fieldsToRetrieve.indexOf(key) == -1) continue;

        if (key == "client_secret") {
            record[key] = gr.getElement(key).getDecryptedValue();
            continue;
        }
        record[key] = gr[key];
    }

    var app = new GlideRecord('sys_scope');
    app.get(gs.getCurrentApplicationId());
    var scopeInfo = {};
    scopeInfo["is_same_scope"] = gr.isValidField('sys_scope') ? (app.sys_id == gr.sys_scope.sys_id) : true;
    scopeInfo["curent_application_scope"] = app.name;
    scopeInfo["record_scope"] = gr.sys_scope.name;
    record["scope_info"] = scopeInfo;
    record["cc_enabled"] = gs.getProperty("glide.oauth.inbound.client.credential.grant_type.enabled", "false");
	record["integration_registry_input"] = getInboundIntegrationProviderRegistry(input.sysId);
    return record;
}

(function executeRule(current, previous /*null when async*/) {

	// check if it is unique mapping
	var gr = new GlideRecord('oauth_entity_auth_scope_mapping');
	gr.addQuery('oauth_entity', current.oauth_entity);
	gr.addQuery('auth_scope', current.auth_scope);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: duplicated auth scope found for same oauth application registry.'));
		current.setAbortAction(true);
		return;
	}
	
	// check if oauth entity is OIDC provider
	var oauth_oidc_entity = new GlideRecord('oauth_oidc_entity');
	oauth_oidc_entity.addQuery('sys_id', current.oauth_entity);
	oauth_oidc_entity.query();
	if (oauth_oidc_entity.next())
		return;
	
	// check if oauth entity type is client
	var oauth_entity = new GlideRecord('oauth_entity');
	oauth_entity.addQuery('sys_id', current.oauth_entity);
	oauth_entity.query();
	if (oauth_entity.next()){
		var type = oauth_entity.getValue('type');
		if (type != null && type != 'client' ){
			gs.addErrorMessage(gs.getMessage('Error: OAuth Application Registry type can only be OAuth client.'));
			current.setAbortAction(true);
			return;
		}
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	var dup = new GlideRecord('oauth_protected_resource_idp_mapping');
	dup.addQuery('protected_resource', current.protected_resource);
	dup.addQuery('oidc_provider', current.oidc_provider);
	dup.addQuery('sys_id', '!=', current.sys_id);
	dup.setLimit(1);
	dup.queryNoDomain();
	if (dup.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('A mapping record already exists for ({0}, {1}).', [current.protected_resource.getDisplayValue() + '', current.oidc_provider.getDisplayValue() + '']));
	}
})(current, previous);

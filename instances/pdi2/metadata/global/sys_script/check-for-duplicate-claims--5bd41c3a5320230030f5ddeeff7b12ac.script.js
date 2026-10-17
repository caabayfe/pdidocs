(function executeRule(current, previous /*null when async*/) {
	if(current.oidc_provider.nil() && current.jwt_provider.nil())	{
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Claim has to be associated with a Provider"));
	}
	var match = new GlideRecord('jwt_claim_validation');
	match.addQuery('sys_id', '!=', current.sys_id);
	match.addQuery('name', current.name);
	match.addQuery('sys_scope', current.sys_scope);
	if(!current.oidc_provider.nil())
		match.addQuery('oidc_provider', current.oidc_provider);
	else
		match.addQuery('jwt_provider', current.jwt_provider);
	match.query();
	if (match.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("This claim is already defined in the current scope for the same provider"));	
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if (!current.isNewRecord() && !current.oidc_provider.changes())
		return;

	var idp = new GlideRecord('oidc_provider_configuration');
	if (!idp.isValidField('restrict_to_sso'))
		return;
	if (!idp.get(current.getValue('oidc_provider')))
		return;
	if (idp.getValue('restrict_to_sso') == '1') {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage(
			'IdP "{0}" is configured for SSO only and cannot be mapped to a protected resource.',
			[current.oidc_provider.getDisplayValue() + '']));
	}
})(current, previous);

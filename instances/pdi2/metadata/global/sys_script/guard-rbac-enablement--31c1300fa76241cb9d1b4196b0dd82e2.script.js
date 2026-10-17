(function executeRule(current, previous) {
	// Property name must match RBACConstants.ACCESS_CONTROL_ENABLED_PROPERTY in glide-oauth
	var globalEnabled = gs.getProperty(
		'com.snc.platform.security.oauth.access_control.enabled', 'true');
	if (globalEnabled !== 'true') {
		gs.warn('Guard RBAC enabled on global access control off: '
			+ 'Cannot enable is_rbac_enabled — global access control is disabled. '
			+ 'Aborting save for record: ' + current.getUniqueValue());
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot enable RBAC: global access control is disabled. Set {0} to true first.',
			'com.snc.platform.security.oauth.access_control.enabled'));
	}
})(current, previous);

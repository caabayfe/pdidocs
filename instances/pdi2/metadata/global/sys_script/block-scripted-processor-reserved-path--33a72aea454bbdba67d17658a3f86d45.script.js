(function executeRule(current, previous /*null when async*/) {
	// Keep RESERVED_PATHS in sync with ProcessorRegistry.RESERVED_PATHS (com.glide.processors).
	// That Java-layer check stops a reserved path from ever being loaded into the HTTP dispatch
	// table; this rule stops the record from being saved in the first place. See DEF0821223.
	var RESERVED_PATHS = [
		'login', 'logout', 'login_with_certificate', 'login_cpw', 'login_with_sso',
		'login_redirect', 'hop_authenticator', 'oauth_login',
		'oauth_token', 'oauth_auth', 'oauth_redirect', 'oauth_revoke_token', 'oauth_jwks',
		'oauth_certificate', 'oauth_initiator',
		'.well-known/oauth-authorization-server', '.well-known/oauth-protected-resource',
		'.well-known/openid-configuration',
		'mcp_auth', 'mcp_token', 'mcp_redirect',
		'saml_test_conn_handle'
	];

	if (current.getValue('type') == 'java')
		return;

	// ProcessorDefinition.build() prefers path_endpoint over path when both are set - mirror
	// that precedence here so this rule guards whichever field the registry actually binds.
	var pathField = JSUtil.notNil(current.getValue('path_endpoint')) ? 'path_endpoint' : 'path';
	var paths = String(current.getValue(pathField)).split(',');
	for (var i = 0; i < paths.length; i++) {
		var path = paths[i].trim();
		if (RESERVED_PATHS.indexOf(path) == -1)
			continue;

		gs.addErrorMessage(gs.getMessage('A scripted processor cannot bind the reserved path: {0}', path));
		current.setAbortAction(true);
		return;
	}
})(current, previous);

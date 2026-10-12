(function executeRule(current, previous) {
	var serverResource = current.getValue('resource');
	if (!serverResource) {
		gs.warn('revokeTokensOnRbacDisabled: skipping revocation, resource is empty for record: ' + current.getUniqueValue());
		return;
	}
	// Note: setRbacEnabled(false) via the Java API also triggers revocation directly.
	// If that path is used, revocation will run twice — this is harmless since
	// marking already-revoked tokens as revoked is a no-op.
	gs.info('revokeTokensOnRbacDisabled: RBAC disabled for server: ' + serverResource + '. Revoking tokens.');
	try {
		var rbacClient = new sn_auth.GlideRBACClient();
		var response = rbacClient.revokeTokensForServer(serverResource);
		var responseCode = response.getResponseCode();
		if (responseCode == 200) {
			gs.info('revokeTokensOnRbacDisabled: token revocation succeeded for server: ' + serverResource);
		} else {
			gs.error('revokeTokensOnRbacDisabled: token revocation failed for server: ' + serverResource + '. Response: ' + response.getBody());
		}
	} catch (e) {
		gs.error('revokeTokensOnRbacDisabled: token revocation error for server: ' + serverResource + '. Error: ' + e.message);
	}
})(current, previous);

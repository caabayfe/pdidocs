(function executeRule(current, previous /*null when async*/) {
	current.login_url = current.login_url.trim();
	if (current.login_url.includes('login_with_sso.do')) {
		if (!current.login_url.includes('glide_sso_id')) {
			gs.addErrorMessage(gs.getMessage("Please provide sso id for IDP"));
			current.setAbortAction(true);
		}
		else {
			var builder = new SNC.OAuthEntityBuilder(current);
			var idpSysId = builder.getIDPSysId(current.login_url);
			var isValidIDPSysId = builder.validateIDPSysId(idpSysId);
			if (!isValidIDPSysId) {
				gs.addErrorMessage(gs.getMessage("Invalid IDP SysId '{0}'. Please provide correct SAML or OIDC IDP SysId", idpSysId));
				current.setAbortAction(true);
			}
		}
	}
	else if (!current.login_url.includes('oauth_login.do') && !current.login_url.includes('login_locate_sso.do')){
		var gr = new GlideRecord('sys_ui_page');
		gr.addQuery("name", current.login_url);
		gr.query();
		if (!gr.hasNext()) {
			gs.addErrorMessage(gs.getMessage("Please enter a valid UI Page"));
			current.setAbortAction(true);
		}
	}
})(current, previous);

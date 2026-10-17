(function executeRule(current, previous /*undefined when async or display*/) {
	if (current.oauth_entity != previous.oauth_entity) {
		var profileScopeGR = new GlideRecord("oauth_entity_profile_scope");
		profileScopeGR.addQuery("oauth_entity_profile",current.sys_id);
		profileScopeGR.query();
		if (profileScopeGR.next()) {
			gs.addErrorMessage(gs.getMessage('Invalid update of provider.'));
			current.setAbortAction(true);
		}
	}
})(current, typeof previous != 'undefined' ?  previous : null);

(function executeRule(current, previous /*undefined when async or display*/) {
	if (current.oauth_entity_profile.oauth_entity != current.oauth_entity_scope.oauth_entity) {
		gs.addErrorMessage(gs.getMessage('Invalid scopes. The scopes must be from same provider as in profile.'));
		current.setAbortAction(true);
	}
})(current, typeof previous != 'undefined' ?  previous : null);

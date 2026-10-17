(function executeRule(current, previous /*null when async*/) {

	// Clear FK columns that don't apply to the current authentication_type.
	// basic_auth        -> keep 'user',             clear 'oauth_entity' and 'token_credential'
	// oauth             -> keep 'oauth_entity',     clear 'user' and 'token_credential'
	// token_credential  -> keep 'token_credential', clear 'user' and 'oauth_entity'
	var keep = {
		basic_auth:       'user',
		oauth:            'oauth_entity',
		token_credential: 'token_credential'
	};
	var allFields = ['user', 'oauth_entity', 'token_credential'];
	var keepField = keep[current.getValue('authentication_type')];

	for (var i = 0; i < allFields.length; i++) {
		if (allFields[i] !== keepField) {
			current.setValue(allFields[i], '');
		}
	}
	
})(current, previous);

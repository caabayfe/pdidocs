(function process(env) {
	return !gs.nil(env.getObject().errorType) ? 'TriggerPlaybookError' : 'PlaybookContext';
})(env);
